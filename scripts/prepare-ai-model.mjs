#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import crypto from 'node:crypto';
import dotenv from 'dotenv';

// Load environment variables from .env and .env.local if present
dotenv.config();
if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local', override: true });
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const HF_REPO = 'HuggingFaceTB/SmolLM2-135M-Instruct';
const HF_BASE_URL = `https://huggingface.co/${HF_REPO}/resolve/main`;
const LOCAL_MODEL_DIR = path.join(ROOT_DIR, 'models', 'SmolLM2-135M-Instruct');
const BUCKET_NAME = 'ai-models';
const SUPABASE_MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB Supabase single-file limit
const CHUNK_SIZE_BYTES = 45 * 1024 * 1024; // 45 MB chunks (safely below 50MB)

const METADATA_FILES = [
  'config.json',
  'generation_config.json',
  'tokenizer.json',
  'tokenizer_config.json',
];

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

function getPartSuffix(index) {
  const first = String.fromCharCode(97 + Math.floor(index / 26));
  const second = String.fromCharCode(97 + (index % 26));
  return `part_${first}${second}`;
}

/**
 * Searches for a local pre-downloaded source directory.
 */
function findLocalSourceDir(customPath) {
  if (customPath) {
    const resolved = path.resolve(ROOT_DIR, customPath);
    if (fs.existsSync(resolved)) return resolved;
  }

  const candidates = [
    process.env.SMOL_MODEL_SOURCE_DIR,
    path.resolve(ROOT_DIR, '..', 'llm', 'smol'),
    path.resolve(ROOT_DIR, 'llm', 'smol'),
    path.resolve(ROOT_DIR, '..', 'smol'),
    path.resolve(ROOT_DIR, 'models', 'smol'),
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      const hasOnnx =
        fs.existsSync(path.join(candidate, 'model_q4.onnx')) ||
        fs.existsSync(path.join(candidate, 'onnx', 'model_q4.onnx'));
      if (hasOnnx) {
        return candidate;
      }
    }
  }

  return null;
}

/**
 * Copies metadata files and locates/copies model_q4.onnx from local source directory.
 */
async function importFromLocalSource(sourceDir, force = false) {
  console.log(`[Local Source] Detected valid model directory: ${sourceDir}`);
  await fs.promises.mkdir(LOCAL_MODEL_DIR, { recursive: true });
  await fs.promises.mkdir(path.join(LOCAL_MODEL_DIR, 'onnx'), { recursive: true });

  for (const file of METADATA_FILES) {
    const src = path.join(sourceDir, file);
    const dest = path.join(LOCAL_MODEL_DIR, file);

    if (fs.existsSync(src)) {
      if (!force && fs.existsSync(dest)) {
        const srcStat = await fs.promises.stat(src);
        const destStat = await fs.promises.stat(dest);
        if (srcStat.size === destStat.size) {
          console.log(`[Cached]   ${file.padEnd(24)} (${formatBytes(destStat.size)})`);
          continue;
        }
      }
      await fs.promises.copyFile(src, dest);
      const stat = await fs.promises.stat(dest);
      console.log(`[Copied]   ${file.padEnd(24)} (${formatBytes(stat.size)}) from local source`);
    } else {
      console.warn(`[Warning]  ${file} not found in local source: ${src}`);
    }
  }

  // Find model_q4.onnx in source
  let onnxSrc = path.join(sourceDir, 'model_q4.onnx');
  if (!fs.existsSync(onnxSrc)) {
    onnxSrc = path.join(sourceDir, 'onnx', 'model_q4.onnx');
  }

  if (!fs.existsSync(onnxSrc)) {
    throw new Error(`model_q4.onnx not found in local source directory: ${sourceDir}`);
  }

  const destOnnx = path.join(LOCAL_MODEL_DIR, 'onnx', 'model_q4.onnx');
  const onnxSrcStat = await fs.promises.stat(onnxSrc);

  if (!force && fs.existsSync(destOnnx)) {
    const destStat = await fs.promises.stat(destOnnx);
    if (destStat.size === onnxSrcStat.size) {
      console.log(`[Cached]   onnx/model_q4.onnx       (${formatBytes(destStat.size)})`);
      return destOnnx;
    }
  }

  console.log(`[Copying]  model_q4.onnx (${formatBytes(onnxSrcStat.size)}) to ${destOnnx}...`);
  await fs.promises.copyFile(onnxSrc, destOnnx);
  console.log(`[Copied]   onnx/model_q4.onnx (${formatBytes(onnxSrcStat.size)}) successfully.`);
  return destOnnx;
}

/**
 * Downloads a single file from Hugging Face if not already present.
 */
async function downloadFileFromHF(relPath, force = false) {
  const fileUrl = `${HF_BASE_URL}/${relPath}`;
  const destPath = path.join(LOCAL_MODEL_DIR, relPath);
  const destDir = path.dirname(destPath);

  await fs.promises.mkdir(destDir, { recursive: true });

  if (!force && fs.existsSync(destPath)) {
    const stats = await fs.promises.stat(destPath);
    if (stats.size > 0) {
      console.log(`[Cached]   ${relPath.padEnd(24)} (${formatBytes(stats.size)}) already exists.`);
      return { relPath, size: stats.size, skipped: true };
    }
  }

  console.log(`[Fetching] ${relPath} from Hugging Face...`);
  const response = await fetch(fileUrl, { redirect: 'follow' });

  if (!response.ok) {
    throw new Error(`Failed to download ${fileUrl}: ${response.status} ${response.statusText}`);
  }

  const contentLength = Number(response.headers.get('content-length') || 0);
  const tempPath = `${destPath}.tmp-${Date.now()}`;
  const fileStream = fs.createWriteStream(tempPath);

  let downloadedBytes = 0;
  let lastLoggedTime = 0;

  const reader = Readable.fromWeb(response.body);

  reader.on('data', (chunk) => {
    downloadedBytes += chunk.length;
    const now = Date.now();
    if (now - lastLoggedTime > 500 || downloadedBytes === contentLength) {
      lastLoggedTime = now;
      const progressPercent = contentLength > 0
        ? ` (${((downloadedBytes / contentLength) * 100).toFixed(1)}%)`
        : '';
      process.stdout.write(
        `\r[Progress] ${relPath.padEnd(24)} ${formatBytes(downloadedBytes)} / ${contentLength > 0 ? formatBytes(contentLength) : 'unknown'}${progressPercent}`
      );
    }
  });

  await pipeline(reader, fileStream);
  process.stdout.write('\n');

  await fs.promises.rename(tempPath, destPath);
  const finalStat = await fs.promises.stat(destPath);
  console.log(`[Success]  Downloaded ${relPath} (${formatBytes(finalStat.size)})`);

  return { relPath, size: finalStat.size, skipped: false };
}

/**
 * Splits an ONNX model file into chunks strictly under Supabase's 50MB limit (default 45MB),
 * and generates onnx/manifest.json with parts ordered sequentially.
 */
async function splitOnnxModel(onnxFilePath, chunkSize = CHUNK_SIZE_BYTES, force = false) {
  const onnxDir = path.dirname(onnxFilePath);
  const targetBaseName = path.basename(onnxFilePath);
  const stat = await fs.promises.stat(onnxFilePath);
  const totalSize = stat.size;
  const manifestPath = path.join(onnxDir, 'manifest.json');

  console.log(`\n============================================================`);
  console.log(`  SPLITTING ONNX MODEL INTO CHUNKS (Chunk size: ${formatBytes(chunkSize)})`);
  console.log(`  Source: ${onnxFilePath} (${formatBytes(totalSize)})`);
  console.log(`============================================================`);

  const expectedPartsCount = Math.ceil(totalSize / chunkSize);

  // Check if existing parts and manifest are already valid
  if (!force && fs.existsSync(manifestPath)) {
    try {
      const manifestRaw = await fs.promises.readFile(manifestPath, 'utf-8');
      const manifest = JSON.parse(manifestRaw);
      if (
        manifest.target === targetBaseName &&
        manifest.totalSize === totalSize &&
        Array.isArray(manifest.parts) &&
        manifest.parts.length === expectedPartsCount
      ) {
        let allPartsExist = true;
        for (const part of manifest.parts) {
          if (!fs.existsSync(path.join(onnxDir, part))) {
            allPartsExist = false;
            break;
          }
        }
        if (allPartsExist) {
          console.log(`[Cached]   All ${manifest.parts.length} chunk parts and manifest.json already exist.`);
          for (const part of manifest.parts) {
            const pStat = await fs.promises.stat(path.join(onnxDir, part));
            console.log(`           - ${part.padEnd(26)} (${formatBytes(pStat.size)})`);
          }
          return manifest;
        }
      }
    } catch {
      // Re-split if manifest invalid
    }
  }

  const parts = [];
  const readStream = fs.createReadStream(onnxFilePath, { highWaterMark: 4 * 1024 * 1024 });

  let partIndex = 0;
  let currentPartBytes = 0;
  let currentPartName = `${targetBaseName}.${getPartSuffix(partIndex)}`;
  let currentPartPath = path.join(onnxDir, currentPartName);
  let writeStream = fs.createWriteStream(currentPartPath);
  parts.push(currentPartName);

  for await (const chunk of readStream) {
    let offset = 0;
    while (offset < chunk.length) {
      if (currentPartBytes >= chunkSize) {
        await new Promise((resolve, reject) => {
          writeStream.end((err) => (err ? reject(err) : resolve()));
        });
        const prevStat = await fs.promises.stat(currentPartPath);
        console.log(`[Created]  Part ${partIndex + 1}/${expectedPartsCount}: ${currentPartName.padEnd(26)} (${formatBytes(prevStat.size)})`);

        partIndex++;
        currentPartBytes = 0;
        currentPartName = `${targetBaseName}.${getPartSuffix(partIndex)}`;
        currentPartPath = path.join(onnxDir, currentPartName);
        parts.push(currentPartName);
        writeStream = fs.createWriteStream(currentPartPath);
      }

      const remainingInPart = chunkSize - currentPartBytes;
      const bytesToWrite = Math.min(chunk.length - offset, remainingInPart);
      const slice = chunk.subarray(offset, offset + bytesToWrite);

      if (!writeStream.write(slice)) {
        await new Promise((resolve) => writeStream.once('drain', resolve));
      }

      currentPartBytes += bytesToWrite;
      offset += bytesToWrite;
    }
  }

  await new Promise((resolve, reject) => {
    writeStream.end((err) => (err ? reject(err) : resolve()));
  });

  const lastStat = await fs.promises.stat(currentPartPath);
  console.log(`[Created]  Part ${partIndex + 1}/${expectedPartsCount}: ${currentPartName.padEnd(26)} (${formatBytes(lastStat.size)})`);

  const manifest = {
    target: targetBaseName,
    parts,
    totalSize,
  };

  await fs.promises.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`[Created]  manifest.json generated with ${parts.length} parts (${formatBytes(totalSize)} total).`);

  // Verify byte integrity by computing SHA256 of concatenated parts vs original
  const origHash = crypto.createHash('sha256');
  const origStream = fs.createReadStream(onnxFilePath);
  for await (const chunk of origStream) origHash.update(chunk);
  const origDigest = origHash.digest('hex');

  const splitHash = crypto.createHash('sha256');
  for (const part of parts) {
    const partStream = fs.createReadStream(path.join(onnxDir, part));
    for await (const chunk of partStream) splitHash.update(chunk);
  }
  const splitDigest = splitHash.digest('hex');

  if (origDigest === splitDigest) {
    console.log(`[Verified] SHA-256 integrity match: ${origDigest.slice(0, 16)}... (100% verified)`);
  } else {
    throw new Error(`Integrity mismatch! Original: ${origDigest}, Chunks: ${splitDigest}`);
  }

  return manifest;
}

/**
 * Uploads all model artifacts, chunked parts, and manifest.json to Supabase Storage.
 */
async function uploadToSupabase(supabaseUrl, supabaseKey, options = {}) {
  const { uploadFullMonolith = false } = options;

  console.log('\n============================================================');
  console.log('  UPLOADING MODEL ARTIFACTS TO SUPABASE STORAGE');
  console.log('============================================================');

  let createClient;
  try {
    const supabaseModule = await import('@supabase/supabase-js');
    createClient = supabaseModule.createClient;
  } catch (err) {
    console.error('Failed to import @supabase/supabase-js:', err.message);
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Attempt admin sign in if credentials provided
  if (process.env.SUPABASE_ADMIN_EMAIL && process.env.SUPABASE_ADMIN_PASSWORD) {
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: process.env.SUPABASE_ADMIN_EMAIL,
      password: process.env.SUPABASE_ADMIN_PASSWORD,
    });
    if (authError) {
      console.warn(`[Notice] Admin login failed: ${authError.message}`);
    } else {
      console.log(`[Auth] Authenticated as admin: ${process.env.SUPABASE_ADMIN_EMAIL}`);
    }
  }

  console.log(`Checking bucket '${BUCKET_NAME}' on ${supabaseUrl}...`);
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
  if (bucketError) {
    console.warn(`[Warning] Could not list buckets (${bucketError.message}). Proceeding with upload directly.`);
  } else {
    const bucketExists = buckets?.some((b) => b.name === BUCKET_NAME || b.id === BUCKET_NAME);
    if (!bucketExists) {
      console.log(`Bucket '${BUCKET_NAME}' not found in bucket list. Attempting to create bucket...`);
      const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 524288000,
      });
      if (createError) {
        console.warn(`[Notice] Could not auto-create bucket: ${createError.message}.`);
        console.warn(`Ensure 'supabase/schema.sql' has been run in your Supabase SQL editor.`);
      } else {
        console.log(`[Created] Bucket '${BUCKET_NAME}' created successfully with public access.`);
      }
    } else {
      console.log(`[Verified] Bucket '${BUCKET_NAME}' is present.`);
    }
  }

  // Collect files to upload
  const uploadList = [];

  // Metadata files
  for (const file of METADATA_FILES) {
    uploadList.push({
      relPath: file,
      contentType: 'application/json',
    });
  }

  // Manifest file
  const manifestPath = path.join(LOCAL_MODEL_DIR, 'onnx', 'manifest.json');
  let manifest = null;
  if (fs.existsSync(manifestPath)) {
    uploadList.push({
      relPath: 'onnx/manifest.json',
      contentType: 'application/json',
    });
    try {
      manifest = JSON.parse(await fs.promises.readFile(manifestPath, 'utf-8'));
    } catch {
      // Ignore
    }
  }

  // Chunked parts
  if (manifest?.parts) {
    for (const part of manifest.parts) {
      uploadList.push({
        relPath: `onnx/${part}`,
        contentType: 'application/octet-stream',
      });
    }
  }

  // Monolithic ONNX file (only upload if explicitly requested or under 50MB limit)
  const fullOnnxPath = path.join(LOCAL_MODEL_DIR, 'onnx', 'model_q4.onnx');
  if (fs.existsSync(fullOnnxPath)) {
    const fullStat = await fs.promises.stat(fullOnnxPath);
    if (fullStat.size <= SUPABASE_MAX_FILE_SIZE || uploadFullMonolith) {
      uploadList.push({
        relPath: 'onnx/model_q4.onnx',
        contentType: 'application/octet-stream',
      });
    } else {
      console.log(
        `\n[Notice]  onnx/model_q4.onnx is ${formatBytes(fullStat.size)} (exceeds Supabase 50MB single-file limit).`
      );
      console.log('          Skipping monolithic file upload; client will assemble chunked parts via manifest.json.');
    }
  }

  console.log(`\nUploading ${uploadList.length} artifacts to bucket '${BUCKET_NAME}/SmolLM2-135M-Instruct/'...`);

  let rlsNoticeShown = false;

  for (const item of uploadList) {
    const localFilePath = path.join(LOCAL_MODEL_DIR, item.relPath);
    if (!fs.existsSync(localFilePath)) {
      console.warn(`[Skip] Local file not found: ${localFilePath}`);
      continue;
    }

    const stat = await fs.promises.stat(localFilePath);
    const remotePath = `SmolLM2-135M-Instruct/${item.relPath}`;
    process.stdout.write(`  -> Uploading '${remotePath}' (${formatBytes(stat.size)})... `);

    const fileBuffer = await fs.promises.readFile(localFilePath);
    const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(remotePath, fileBuffer, {
      contentType: item.contentType,
      upsert: true,
      cacheControl: '31536000',
    });

    if (uploadError) {
      console.log(`FAILED (${uploadError.message})`);
      if (uploadError.message.includes('row-level security') && !rlsNoticeShown) {
        rlsNoticeShown = true;
        console.warn('\n[Storage RLS Note] Storage insert requires authentication or SUPABASE_SERVICE_ROLE_KEY.');
        console.warn('Set SUPABASE_SERVICE_ROLE_KEY in .env, or upload artifacts via Supabase Dashboard UI.');
      }
    } else {
      const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(remotePath);
      console.log('DONE');
      console.log(`     Public URL: ${urlData.publicUrl}`);
    }
  }

  console.log('\n[Finished] Supabase Storage upload phase finished.');
}

function printSummary(supabaseUrl) {
  const projectBase = supabaseUrl ? supabaseUrl.replace(/\/$/, '') : 'https://<your-project-ref>.supabase.co';
  console.log('\n============================================================');
  console.log('  MODEL ARTIFACT PREPARATION SUMMARY');
  console.log('============================================================');
  console.log(`  Local Directory: ${LOCAL_MODEL_DIR}`);
  console.log(`  Bucket Target:   ${BUCKET_NAME}/SmolLM2-135M-Instruct/`);
  console.log('');
  console.log('  Artifacts created:');
  console.log('  - config.json');
  console.log('  - generation_config.json');
  console.log('  - tokenizer.json');
  console.log('  - tokenizer_config.json');
  console.log('  - onnx/manifest.json');
  console.log('  - onnx/model_q4.onnx.part_aa (45 MB)');
  console.log('  - onnx/model_q4.onnx.part_ab (45 MB)');
  console.log('  - onnx/model_q4.onnx.part_ac (45 MB)');
  console.log('  - onnx/model_q4.onnx.part_ad (38.6 MB)');
  console.log('');
  console.log('  Public Manifest URL:');
  console.log(`  ${projectBase}/storage/v1/object/public/${BUCKET_NAME}/SmolLM2-135M-Instruct/onnx/manifest.json`);
  console.log('============================================================\n');
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const splitOnly = args.includes('--split-only');
  const uploadOnly = args.includes('--upload-only');
  const explicitUpload = args.includes('--upload');
  const uploadFullMonolith = args.includes('--upload-full');

  // Parse custom source path if provided: --source <path>
  let customSource = null;
  const sourceArgIndex = args.indexOf('--source');
  if (sourceArgIndex !== -1 && args[sourceArgIndex + 1]) {
    customSource = args[sourceArgIndex + 1];
  }

  console.log('============================================================');
  console.log('  SmolLM2-135M-Instruct AI Model Preparation & Chunking');
  console.log(`  Target Dir: ${LOCAL_MODEL_DIR}`);
  console.log('============================================================\n');

  let onnxFilePath = path.join(LOCAL_MODEL_DIR, 'onnx', 'model_q4.onnx');

  if (!uploadOnly) {
    const localSourceDir = findLocalSourceDir(customSource);

    if (localSourceDir) {
      console.log('Step 1: Importing model files from local source directory...\n');
      onnxFilePath = await importFromLocalSource(localSourceDir, force);
    } else {
      console.log('Step 1: Local source not found. Downloading model files from Hugging Face...\n');
      for (const file of METADATA_FILES) {
        await downloadFileFromHF(file, force);
      }
      await downloadFileFromHF('onnx/model_q4.onnx', force);
      onnxFilePath = path.join(LOCAL_MODEL_DIR, 'onnx', 'model_q4.onnx');
    }

    console.log('\nStep 2: Splitting ONNX model into <=45MB chunks & generating manifest.json...\n');
    await splitOnnxModel(onnxFilePath, CHUNK_SIZE_BYTES, force);
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    '';

  const hasCredentials = Boolean(supabaseUrl && supabaseKey);

  if (!splitOnly) {
    if (hasCredentials && (explicitUpload || uploadOnly)) {
      try {
        await uploadToSupabase(supabaseUrl, supabaseKey, { uploadFullMonolith });
      } catch (uploadErr) {
        console.error('[Error] Supabase upload error:', uploadErr.message);
      }
    } else if (!hasCredentials) {
      console.log('\n[Notice] Supabase credentials not found in .env (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).');
      console.log('Skipping automated Supabase upload.');
    } else if (!explicitUpload && !uploadOnly) {
      console.log('\n[Notice] Run with `--upload` to push chunked artifacts to Supabase Storage.');
    }
  }

  printSummary(supabaseUrl);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

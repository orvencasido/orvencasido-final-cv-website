import {
  pipeline,
  TextStreamer,
  InterruptableStoppingCriteria,
  env,
  type TextGenerationPipeline,
} from '@huggingface/transformers';
import { getPortfolioRAGBundle } from './services';
import { supabaseUrl, isSupabaseConfigured } from './supabaseClient';

/**
 * Model identifiers for client-side ONNX inference.
 * - SUPABASE_CDN_MODEL_ID: Fast Supabase Storage CDN model bucket
 * - HUGGINGFACE_FALLBACK_MODEL_ID: Direct Hugging Face Hub fallback
 */
export const SUPABASE_CDN_MODEL_ID = 'SmolLM2-135M-Instruct';
export const HUGGINGFACE_FALLBACK_MODEL_ID = 'HuggingFaceTB/SmolLM2-135M-Instruct';

/**
 * Configures Transformers.js remote host and path template.
 * Routes through Supabase Storage CDN when configured, otherwise falls back to Hugging Face.
 */
export function configureTransformersEnv(useSupabase: boolean): void {
  // Always disable local filesystem model lookups in browser context
  if (typeof window !== 'undefined') {
    env.allowLocalModels = false;
  }

  if (useSupabase && isSupabaseConfigured && supabaseUrl) {
    const cleanUrl = supabaseUrl.replace(/\/+$/, '');
    env.remoteHost = `${cleanUrl}/storage/v1/object/public/ai-models/`;
    env.remotePathTemplate = '{model}/';
  } else {
    env.remoteHost = 'https://huggingface.co/';
    env.remotePathTemplate = '{model}/resolve/{revision}/';
  }
}

// Initial environment configuration based on Supabase credentials
const isInitialSupabaseActive = Boolean(isSupabaseConfigured && supabaseUrl);
configureTransformersEnv(isInitialSupabaseActive);

/**
 * The active default model identifier based on available CDN infrastructure.
 */
export const DEFAULT_MODEL_ID = isInitialSupabaseActive
  ? SUPABASE_CDN_MODEL_ID
  : HUGGINGFACE_FALLBACK_MODEL_ID;
export const FIXED_MODEL_ID = DEFAULT_MODEL_ID;

export interface WebLLMProgressReport {
  text: string;
  progress: number;
  timeElapsed?: number;
}

export type WebLLMProgressCallback = (report: WebLLMProgressReport) => void;

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface StreamChatParams {
  messages: Array<ChatMessage>;
  onDelta: (chunk: string) => void;
  onFinish?: (fullText: string) => void;
  onError?: (error: Error) => void;
  onProgress?: WebLLMProgressCallback;
  signal?: AbortSignal;
}

interface NavigatorWithGPU extends Navigator {
  gpu?: {
    requestAdapter: (options?: unknown) => Promise<unknown | null>;
  };
}

interface TransformersProgressInfo {
  status?: string;
  name?: string;
  file?: string;
  progress?: number;
  loaded?: number;
  total?: number;
  task?: string;
  model?: string;
}

let engineInstance: TextGenerationPipeline | null = null;
let engineInitPromise: Promise<TextGenerationPipeline> | null = null;
let activeDevice: 'webgpu' | 'wasm' | null = null;
let activeStoppingCriteria: InterruptableStoppingCriteria | null = null;

const progressCallbacks = new Set<WebLLMProgressCallback>();
const fileProgressMap = new Map<string, { loaded: number; total: number }>();

/**
 * Detects whether the host browser supports WebGPU.
 * Returns 'webgpu' if hardware acceleration is available, otherwise 'wasm'.
 */
export async function detectDevice(): Promise<'webgpu' | 'wasm'> {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return 'wasm';
  }

  const nav = navigator as NavigatorWithGPU;
  if (!nav.gpu || typeof nav.gpu.requestAdapter !== 'function') {
    return 'wasm';
  }

  try {
    const adapter = await nav.gpu.requestAdapter();
    return adapter ? 'webgpu' : 'wasm';
  } catch (err) {
    console.warn('WebGPU adapter query failed, falling back to wasm:', err);
    return 'wasm';
  }
}

/**
 * Checks whether client-side execution is supported on this device.
 * Always returns true in browser environments because WebAssembly (WASM)
 * fallback guarantees 100% universal compatibility across all devices.
 */
export async function isWebGPUSupported(): Promise<boolean> {
  return typeof window !== 'undefined';
}

/**
 * Checks whether hardware-accelerated WebGPU execution is active.
 */
export async function isHardwareAccelerated(): Promise<boolean> {
  const device = await detectDevice();
  return device === 'webgpu';
}

/**
 * Returns the currently active execution device ('webgpu', 'wasm', or null if uninitialized).
 */
export function getActiveDevice(): 'webgpu' | 'wasm' | null {
  return activeDevice;
}

/**
 * Manifest definition for chunked ONNX model storage on Supabase Storage.
 */
export interface OnnxChunkManifest {
  target?: string;
  parts: string[];
  totalSize?: number;
}

/**
 * Checks whether the SmolLM2-135M model artifacts are cached in browser storage.
 */
export async function isModelCached(): Promise<boolean> {
  if (typeof window === 'undefined' || typeof caches === 'undefined') {
    return false;
  }
  try {
    const hasCache = await caches.has('transformers-cache');
    if (!hasCache) return false;
    const cache = await caches.open('transformers-cache');
    const keys = await cache.keys();
    return keys.some(
      (req) =>
        req.url.includes('model_q4.onnx') ||
        req.url.includes('SmolLM2-135M-Instruct') ||
        req.url.includes(DEFAULT_MODEL_ID) ||
        req.url.includes(SUPABASE_CDN_MODEL_ID) ||
        req.url.includes(HUGGINGFACE_FALLBACK_MODEL_ID)
    );
  } catch (err) {
    console.warn('Failed to check Transformers.js browser cache:', err);
    return false;
  }
}

/**
 * Downloads a single chunk part via stream with real-time byte tracking.
 */
async function fetchChunkPartWithProgress(
  url: string,
  onProgress: (loaded: number, total: number) => void
): Promise<Uint8Array> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download model chunk from ${url} (HTTP ${response.status} ${response.statusText})`);
  }

  const contentLengthHeader = response.headers.get('content-length');
  const expectedTotal = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 0;

  if (!response.body) {
    const arrayBuf = await response.arrayBuffer();
    onProgress(arrayBuf.byteLength, expectedTotal || arrayBuf.byteLength);
    return new Uint8Array(arrayBuf);
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let loaded = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      loaded += value.byteLength;
      onProgress(loaded, expectedTotal || loaded);
    }
  }

  const mergedPart = new Uint8Array(loaded);
  let offset = 0;
  for (const chunk of chunks) {
    mergedPart.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return mergedPart;
}

/**
 * Checks for chunked ONNX model manifest on Supabase Storage CDN, downloads chunk parts in parallel,
 * stitches them in memory into a single complete model file, and populates the browser's CacheStorage.
 *
 * This allows Transformers.js to find `model_q4.onnx` locally in cache, bypassing Supabase Storage's
 * 50MB single-file upload limit without ever attempting to fetch a monolithic 174MB file.
 */
export async function prepareSupabaseChunkedModel(
  onProgress?: WebLLMProgressCallback
): Promise<boolean> {
  if (typeof window === 'undefined' || typeof caches === 'undefined') {
    throw new Error('Browser Cache API is not available in current environment');
  }

  if (!isSupabaseConfigured || !supabaseUrl) {
    throw new Error('Supabase Storage is not configured');
  }

  const cleanUrl = supabaseUrl.replace(/\/+$/, '');
  const modelBaseUrl = `${cleanUrl}/storage/v1/object/public/ai-models/${SUPABASE_CDN_MODEL_ID}`;
  const manifestUrl = `${modelBaseUrl}/onnx/manifest.json`;
  const defaultModelTarget = 'model_q4.onnx';
  const expectedModelUrl = `${modelBaseUrl}/onnx/${defaultModelTarget}`;

  // 1. Check if manifest exists at the Supabase model path
  const manifestResponse = await fetch(manifestUrl);
  if (!manifestResponse.ok) {
    throw new Error(
      `Model manifest.json not found on Supabase Storage: ${manifestUrl} (HTTP ${manifestResponse.status})`
    );
  }

  const manifest = (await manifestResponse.json()) as OnnxChunkManifest;
  if (!manifest || !Array.isArray(manifest.parts) || manifest.parts.length === 0) {
    throw new Error(`Invalid manifest at ${manifestUrl}: parts array is missing or empty`);
  }

  const targetFilename = manifest.target || defaultModelTarget;
  const targetModelUrl = `${modelBaseUrl}/onnx/${targetFilename}`;

  // 2. Open browser CacheStorage and check if already reconstituted
  const cache = await caches.open('transformers-cache');
  const existing = await cache.match(expectedModelUrl);

  if (existing && existing.ok) {
    const existingSize = Number(existing.headers.get('content-length') || 0);
    // If manifest has totalSize and cached response matches, or existing has data, reuse it
    if (!manifest.totalSize || existingSize === manifest.totalSize || existingSize > 0) {
      console.log(`[webLlmService] Reconstituted model is already cached at ${expectedModelUrl}`);
      return true;
    }
  }

  // 3. Fetch all chunk parts in parallel with real-time download progress tracking
  const reportProgress = (text: string, progress: number) => {
    broadcastProgress({ text, progress });
    onProgress?.({ text, progress });
  };

  reportProgress('Initializing chunked model download from Supabase...', 0);

  const partsCount = manifest.parts.length;
  const partProgress = manifest.parts.map(() => ({ loaded: 0, total: 0 }));

  const downloadPromises = manifest.parts.map(async (partName, index) => {
    const partRelPath = partName.replace(/^\/+/, '');
    const partUrl = partRelPath.startsWith('http://') || partRelPath.startsWith('https://')
      ? partRelPath
      : partRelPath.startsWith('onnx/')
      ? `${modelBaseUrl}/${partRelPath}`
      : `${modelBaseUrl}/onnx/${partRelPath}`;

    return fetchChunkPartWithProgress(partUrl, (loaded, total) => {
      partProgress[index].loaded = loaded;
      partProgress[index].total = total;

      const totalLoaded = partProgress.reduce((sum, p) => sum + p.loaded, 0);
      const totalExpected = manifest.totalSize || partProgress.reduce((sum, p) => sum + (p.total || 0), 0);
      const ratio = totalExpected > 0 ? Math.min(0.98, totalLoaded / totalExpected) : 0;

      reportProgress(
        `Downloading SmolLM2 (${partsCount} parts): ${Math.round(ratio * 100)}%`,
        ratio
      );
    });
  });

  const partBuffers = await Promise.all(downloadPromises);

  // 4. Concatenate binary chunks into a single complete Blob in memory
  reportProgress('Stitching model chunks into local cache...', 0.99);
  const completeBlob = new Blob(partBuffers, { type: 'application/octet-stream' });

  // 5. Synthesize standard HTTP 200 Response with Content-Length and Content-Type headers
  const headers = new Headers();
  headers.set('Content-Type', 'application/octet-stream');
  headers.set('Content-Length', completeBlob.size.toString());
  headers.set('X-Reconstituted-Parts', partsCount.toString());

  const synthesizedResponse = new Response(completeBlob, {
    status: 200,
    statusText: 'OK',
    headers,
  });

  // Store reconstituted response under the expected URL
  await cache.put(expectedModelUrl, synthesizedResponse);

  // If manifest target name differs from default, cache under target URL as well
  if (targetModelUrl !== expectedModelUrl) {
    const secondResponse = new Response(completeBlob, {
      status: 200,
      statusText: 'OK',
      headers,
    });
    await cache.put(targetModelUrl, secondResponse);
  }

  console.log(
    `[webLlmService] Reconstituted ${targetFilename} (${completeBlob.size} bytes) saved to transformers-cache under ${expectedModelUrl}`
  );

  reportProgress('Model files assembled and ready', 1);
  return true;
}

/**
 * Internal helper to broadcast normalized progress reports to all registered listeners.
 */
function broadcastProgress(report: WebLLMProgressReport) {
  for (const callback of progressCallbacks) {
    try {
      callback(report);
    } catch (cbErr) {
      console.error('Error in progress listener:', cbErr);
    }
  }
}

/**
 * Normalizes Transformers.js file download progress events into clean 0.0 to 1.0 reports.
 */
function handleProgressInfo(info: TransformersProgressInfo) {
  if (!info) return;

  let text = 'Initializing local AI...';
  let progress = 0;

  if (info.status === 'progress_total' && typeof info.progress === 'number') {
    progress = info.progress / 100;
    text = `Downloading SmolLM2 (${Math.round(info.progress)}%)...`;
  } else if (info.status === 'progress' && typeof info.progress === 'number') {
    if (info.file && typeof info.loaded === 'number' && typeof info.total === 'number') {
      fileProgressMap.set(info.file, { loaded: info.loaded, total: info.total });
      let totalLoaded = 0;
      let totalBytes = 0;
      for (const val of fileProgressMap.values()) {
        totalLoaded += val.loaded;
        totalBytes += val.total;
      }
      if (totalBytes > 0) {
        progress = totalLoaded / totalBytes;
      } else {
        progress = info.progress / 100;
      }
    } else {
      progress = info.progress / 100;
    }

    const fileName = info.file ? info.file.split('/').pop() : 'model file';
    text = `Downloading ${fileName} (${Math.round(progress * 100)}%)...`;
  } else if (info.status === 'initiate' || info.status === 'download') {
    const fileName = info.file ? info.file.split('/').pop() : 'model files';
    text = `Loading ${fileName}...`;
  } else if (info.status === 'done') {
    const fileName = info.file ? info.file.split('/').pop() : 'file';
    text = `Loaded ${fileName}`;
  } else if (info.status === 'ready') {
    progress = 1;
    text = 'Model ready';
  }

  progress = Math.min(1, Math.max(0, progress));
  broadcastProgress({ text, progress });
}

/**
 * Lazy singleton initializer for the Transformers.js TextGenerationPipeline.
 * Auto-detects WebGPU vs WebAssembly (WASM CPU fallback) for 100% universal execution.
 *
 * @param onProgress Optional callback invoked with download/initialization progress (0.0 to 1.0).
 */
export async function getWebLLMEngine(
  onProgress?: WebLLMProgressCallback
): Promise<TextGenerationPipeline> {
  if (engineInstance) {
    if (onProgress) {
      onProgress({ text: 'Model ready', progress: 1 });
    }
    return engineInstance;
  }

  if (onProgress) {
    progressCallbacks.add(onProgress);
  }

  if (engineInitPromise) {
    return engineInitPromise;
  }

  engineInitPromise = (async () => {
    try {
      let targetDevice = await detectDevice();
      let pipelineInstance: TextGenerationPipeline;

      const attemptLoad = async (modelId: string, device: 'webgpu' | 'wasm') => {
        return (await pipeline('text-generation', modelId, {
          dtype: 'q4',
          device,
          progress_callback: (info: unknown) => {
            handleProgressInfo(info as TransformersProgressInfo);
          },
        })) as TextGenerationPipeline;
      };

      const loadWithDeviceFallback = async (
        modelId: string,
        preferredDevice: 'webgpu' | 'wasm'
      ): Promise<{ instance: TextGenerationPipeline; device: 'webgpu' | 'wasm' }> => {
        let dev = preferredDevice;
        try {
          const inst = await attemptLoad(modelId, dev);
          return { instance: inst, device: dev };
        } catch (deviceErr) {
          if (dev === 'webgpu') {
            console.warn('WebGPU pipeline failed, falling back to WebAssembly (WASM):', deviceErr);
            dev = 'wasm';
            const inst = await attemptLoad(modelId, 'wasm');
            return { instance: inst, device: dev };
          }
          throw deviceErr;
        }
      };

      if (isSupabaseConfigured && supabaseUrl) {
        try {
          configureTransformersEnv(true);
          await prepareSupabaseChunkedModel(onProgress);
          const result = await loadWithDeviceFallback(SUPABASE_CDN_MODEL_ID, targetDevice);
          pipelineInstance = result.instance;
          activeDevice = result.device;
        } catch (supabaseErr) {
          console.warn(
            'Supabase Storage CDN model download or manifest assembly failed. Falling back cleanly to Hugging Face CDN:',
            supabaseErr
          );
          configureTransformersEnv(false);
          const result = await loadWithDeviceFallback(HUGGINGFACE_FALLBACK_MODEL_ID, targetDevice);
          pipelineInstance = result.instance;
          activeDevice = result.device;
        }
      } else {
        configureTransformersEnv(false);
        const result = await loadWithDeviceFallback(HUGGINGFACE_FALLBACK_MODEL_ID, targetDevice);
        pipelineInstance = result.instance;
        activeDevice = result.device;
      }

      engineInstance = pipelineInstance;
      broadcastProgress({ text: 'Model ready', progress: 1 });
      return pipelineInstance;
    } catch (err) {
      engineInitPromise = null;
      throw err;
    } finally {
      progressCallbacks.clear();
      fileProgressMap.clear();
    }
  })();

  return engineInitPromise;
}

/**
 * Canonical alias for getWebLLMEngine matching client LLM specification.
 */
export const getClientLLMPipeline = getWebLLMEngine;

/**
 * Builds the canonical system prompt by injecting verified portfolio facts
 * directly from the client-side RAG knowledge retrieval bundle.
 */
export async function buildPortfolioSystemPrompt(): Promise<string> {
  const ragKnowledge = await getPortfolioRAGBundle();

  return `You are the official AI Assistant for Orven Casido's professional portfolio website. You are Orbs.
Your mission is to answer visitor questions accurately, concisely, and warmly based strictly on the verified portfolio facts provided below.

CORE INSTRUCTIONS & ANTI-HALLUCINATION GUARDRAILS:
1. Speak on behalf of Orven Casido's portfolio. Be professional, authentic, polite, and helpful.
2. Rely EXCLUSIVELY on the verified portfolio facts provided in the knowledge base below.
3. If the visitor asks about facts, projects, credentials, or skills NOT in the knowledge base, politely state that you do not have that information and invite them to reach out to Orven directly via the contact form or email.
4. Never invent, extrapolate, or hallucinate credentials, dates, skills, or achievements.
5. If the visitor asks questions completely unrelated to Orven Casido or his portfolio (e.g. general coding tutorials, math problems, trivia, cooking), politely decline and clarify that you are dedicated exclusively to Orven's work and portfolio.
6. Keep responses clean, concise, and well-structured using markdown bullet points when summarizing skills or experiences.

${ragKnowledge}`;
}

/**
 * Streams chat completion tokens directly from the in-browser model using TextStreamer.
 * Injects verified RAG context automatically into the conversation prompt.
 */
export async function streamPortfolioChatResponse(params: StreamChatParams): Promise<string> {
  const { messages, onDelta, onFinish, onError, onProgress, signal } = params;

  if (signal?.aborted) {
    const abortErr = new DOMException('Chat stream aborted before initiation', 'AbortError');
    onError?.(abortErr);
    throw abortErr;
  }

  try {
    const generator = await getWebLLMEngine(onProgress);

    if (signal?.aborted) {
      const abortErr = new DOMException('Chat stream aborted during initialization', 'AbortError');
      onError?.(abortErr);
      throw abortErr;
    }

    const systemPrompt = await buildPortfolioSystemPrompt();
    const nonSystemMessages = messages.filter((m) => m.role !== 'system');
    const customSystem = messages
      .filter((m) => m.role === 'system')
      .map((m) => m.content)
      .join('\n\n');

    const combinedSystemPrompt = customSystem
      ? `${systemPrompt}\n\nAdditional Instructions:\n${customSystem}`
      : systemPrompt;

    const chatInput = [
      { role: 'system', content: combinedSystemPrompt },
      ...nonSystemMessages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const stoppingCriteria = new InterruptableStoppingCriteria();
    activeStoppingCriteria = stoppingCriteria;

    const abortHandler = () => {
      try {
        stoppingCriteria.interrupt();
      } catch (interruptErr) {
        console.warn('Failed to interrupt generation:', interruptErr);
      }
    };

    signal?.addEventListener('abort', abortHandler, { once: true });

    let fullText = '';

    const streamer = new TextStreamer(generator.tokenizer, {
      skip_prompt: true,
      skip_special_tokens: true,
      callback_function: (chunk: string) => {
        if (signal?.aborted) return;
        fullText += chunk;
        onDelta(chunk);
      },
    });

    try {
      const output = await generator(chatInput, {
        max_new_tokens: 512,
        temperature: 0.6,
        do_sample: true,
        top_p: 0.9,
        streamer,
        stopping_criteria: stoppingCriteria,
        return_full_text: false,
      });

      // Fallback extraction if streamer didn't catch output
      if (!fullText && Array.isArray(output) && output[0]) {
        const gen = (output[0] as unknown as { generated_text?: unknown }).generated_text;
        if (Array.isArray(gen)) {
          const lastMsg = gen[gen.length - 1] as { content?: string } | undefined;
          if (lastMsg && typeof lastMsg.content === 'string') {
            fullText = lastMsg.content;
          }
        } else if (typeof gen === 'string') {
          fullText = gen;
        }
      }
    } finally {
      signal?.removeEventListener('abort', abortHandler);
      activeStoppingCriteria = null;
    }

    onFinish?.(fullText);
    return fullText;
  } catch (error: unknown) {
    if (signal?.aborted) {
      const abortErr = new DOMException('Chat stream aborted by user', 'AbortError');
      onError?.(abortErr);
      throw abortErr;
    }
    const err = error instanceof Error ? error : new Error(String(error));
    onError?.(err);
    throw err;
  }
}

/**
 * Flexible wrapper supporting either StreamChatParams object or (messages, onDelta) arguments.
 */
export async function streamPortfolioChat(
  messagesOrParams: Array<ChatMessage> | StreamChatParams,
  onDelta?: (chunk: string) => void
): Promise<string> {
  if (Array.isArray(messagesOrParams)) {
    return streamPortfolioChatResponse({
      messages: messagesOrParams,
      onDelta: onDelta || (() => {}),
    });
  }

  return streamPortfolioChatResponse(messagesOrParams);
}

/**
 * Interrupts any ongoing chat generation.
 */
export function interruptGeneration(): void {
  if (activeStoppingCriteria) {
    try {
      activeStoppingCriteria.interrupt();
    } catch (err) {
      console.warn('Failed to interrupt generation:', err);
    }
  }
}

/**
 * Resets and disposes the Transformers.js pipeline instance to free browser memory.
 */
export async function resetWebLLMEngine(): Promise<void> {
  interruptGeneration();
  if (engineInstance && typeof (engineInstance as unknown as { dispose?: () => Promise<void> }).dispose === 'function') {
    try {
      await (engineInstance as unknown as { dispose: () => Promise<void> }).dispose();
    } catch (err) {
      console.warn('Failed to dispose engine:', err);
    }
  }
  engineInstance = null;
  engineInitPromise = null;
  activeDevice = null;
}

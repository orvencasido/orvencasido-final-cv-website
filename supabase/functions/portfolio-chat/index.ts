import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface ChatMessage {
  role: 'user' | 'assistant' | 'model' | 'system';
  content: string;
}

interface RAGBundle {
  profile?: {
    full_name?: string;
    professional_title?: string;
    introduction?: string;
    biography?: string;
    email?: string;
    location?: string;
    availability_status?: string;
  } | null;
  skills?: Array<{
    name: string;
    category?: string;
    proficiency?: number;
  }>;
  experiences?: Array<{
    company: string;
    position: string;
    employment_type?: string;
    location?: string;
    start_date: string;
    end_date?: string | null;
    is_current?: boolean;
    description?: string;
    responsibilities?: string[];
    achievements?: string[];
    technologies?: string[];
  }>;
  projects?: Array<{
    title: string;
    short_description?: string;
    full_description?: string;
    technologies?: string[];
    github_url?: string;
    live_url?: string;
    status?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuing_organization: string;
    issue_date: string;
    expiration_date?: string | null;
    credential_id?: string;
    credential_url?: string;
    skills?: string[];
  }>;
  education?: Array<{
    school: string;
    degree: string;
    field_of_study: string;
    start_date: string;
    end_date: string;
    description?: string;
  }>;
}

function buildPortfolioSystemPrompt(rag?: RAGBundle | null): string {
  const profile = rag?.profile || {};
  const skills = Array.isArray(rag?.skills) ? rag.skills : [];
  const experiences = Array.isArray(rag?.experiences) ? rag.experiences : [];
  const projects = Array.isArray(rag?.projects) ? rag.projects : [];
  const certifications = Array.isArray(rag?.certifications) ? rag.certifications : [];
  const education = Array.isArray(rag?.education) ? rag.education : [];

  let context = `--- VERIFIED PORTFOLIO FACTS FOR ORVEN CASIDO ---\n\n`;

  // Profile facts
  context += `[PROFILE]\n`;
  context += `- Full Name: ${profile.full_name || 'Orven Casido'}\n`;
  context += `- Professional Title: ${profile.professional_title || 'Senior DevOps & Full-Stack Engineer'}\n`;
  context += `- Contact Email: ${profile.email || 'orvencasidop@gmail.com'}\n`;
  if (profile.location) context += `- Location: ${profile.location}\n`;
  if (profile.availability_status) context += `- Availability Status: ${profile.availability_status}\n`;
  if (profile.introduction) context += `- Intro: ${profile.introduction}\n`;
  if (profile.biography) context += `- Biography: ${profile.biography}\n`;
  context += `\n`;

  // Skills
  if (skills.length > 0) {
    context += `[SKILLS & PROFICIENCIES]\n`;
    for (const s of skills) {
      context += `- ${s.name} (${s.category || 'General'})${s.proficiency ? ` - Proficiency: ${s.proficiency}%` : ''}\n`;
    }
    context += `\n`;
  }

  // Experience
  if (experiences.length > 0) {
    context += `[PROFESSIONAL WORK EXPERIENCE]\n`;
    for (const exp of experiences) {
      context += `• ${exp.position} at ${exp.company} (${exp.start_date} – ${exp.is_current ? 'Present' : exp.end_date || 'Present'})\n`;
      if (exp.location) context += `  Location: ${exp.location} | Type: ${exp.employment_type || 'Full-time'}\n`;
      if (exp.description) context += `  Overview: ${exp.description}\n`;
      if (Array.isArray(exp.responsibilities) && exp.responsibilities.length > 0) {
        context += `  Key Responsibilities:\n` + exp.responsibilities.map((r) => `    - ${r}`).join('\n') + '\n';
      }
      if (Array.isArray(exp.achievements) && exp.achievements.length > 0) {
        context += `  Key Achievements:\n` + exp.achievements.map((a) => `    - ${a}`).join('\n') + '\n';
      }
      if (Array.isArray(exp.technologies) && exp.technologies.length > 0) {
        context += `  Tech Stack: ${exp.technologies.join(', ')}\n`;
      }
      context += `\n`;
    }
  }

  // Projects
  if (projects.length > 0) {
    context += `[PORTFOLIO PROJECTS]\n`;
    for (const p of projects) {
      context += `• ${p.title} (${p.status || 'completed'})\n`;
      if (p.short_description) context += `  Summary: ${p.short_description}\n`;
      if (p.full_description) context += `  Details: ${p.full_description}\n`;
      if (Array.isArray(p.technologies) && p.technologies.length > 0) {
        context += `  Technologies: ${p.technologies.join(', ')}\n`;
      }
      if (p.live_url) context += `  Live Demo: ${p.live_url}\n`;
      if (p.github_url) context += `  Repository: ${p.github_url}\n`;
      context += `\n`;
    }
  }

  // Certifications
  if (certifications.length > 0) {
    context += `[CERTIFICATIONS & CREDENTIALS]\n`;
    for (const c of certifications) {
      context += `• ${c.name} — ${c.issuing_organization} (Issued: ${c.issue_date}${c.expiration_date ? `, Expires: ${c.expiration_date}` : ''})\n`;
      if (c.credential_id) context += `  Credential ID: ${c.credential_id}\n`;
      if (c.credential_url) context += `  Verify URL: ${c.credential_url}\n`;
      if (Array.isArray(c.skills) && c.skills.length > 0) {
        context += `  Skills: ${c.skills.join(', ')}\n`;
      }
      context += `\n`;
    }
  }

  // Education
  if (education.length > 0) {
    context += `[EDUCATION]\n`;
    for (const edu of education) {
      context += `• ${edu.degree} in ${edu.field_of_study} — ${edu.school} (${edu.start_date} – ${edu.end_date})\n`;
      if (edu.description) context += `  ${edu.description}\n`;
      context += `\n`;
    }
  }

  return `You are "Orbs", the official AI assistant representing Orven Casido on his personal developer portfolio website.

MISSION & IDENTITY:
- You help recruiters, hiring managers, engineering leaders, and visitors explore Orven Casido's background, technical capabilities, projects, work history, and credentials.
- Orven Casido is a Senior DevOps and Full-Stack Engineer known for building resilient cloud architecture, automated CI/CD pipelines, Kubernetes platforms, and modern web applications.
- Assistant Persona: Friendly, articulate, concise, professional, and knowledgeable.
- Aesthetic & Tone: Clean Japanese Minimalist Organic style. Calm, thoughtful, respectful, and direct.

STRICT FACTUAL GROUNDING & ANTI-HALLUCINATION RULES:
1. ONLY make claims supported by the verified facts provided in the section below.
2. DO NOT hallucinate, infer, or assume past employers, projects, metrics, certifications, or degrees not listed below.
3. If a visitor asks a question that cannot be answered from the facts below (for instance, asking about unlisted technologies, private salary history, or personal life), politely and clearly explain that Orven has not published that information on this portfolio yet, and invite them to reach out directly to Orven via email (${profile.email || 'orvencasidop@gmail.com'}) or the Contact page.
4. Keep answers focused and avoid unnecessary fluff or verbose disclaimers. Use clean Markdown (bullet points, bold keywords) for readability.

${context}`;
}

async function fetchDirectRAGFromSupabase(): Promise<RAGBundle | null> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');

  if (!supabaseUrl || (!serviceRoleKey && !anonKey)) {
    return null;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey || anonKey, {
    auth: { persistSession: false },
  });

  try {
    const [
      { data: profile },
      { data: skills },
      { data: experiences },
      { data: projects },
      { data: certifications },
      { data: education },
    ] = await Promise.all([
      supabase.from('profiles').select('*').single(),
      supabase.from('skills').select('*').order('sort_order', { ascending: true }),
      supabase.from('experiences').select('*').order('sort_order', { ascending: true }),
      supabase.from('projects').select('*').order('sort_order', { ascending: true }),
      supabase.from('certifications').select('*').order('sort_order', { ascending: true }),
      supabase.from('education').select('*').order('sort_order', { ascending: true }),
    ]);

    return {
      profile: profile || null,
      skills: Array.isArray(skills) ? skills : [],
      experiences: Array.isArray(experiences) ? experiences : [],
      projects: Array.isArray(projects) ? projects : [],
      certifications: Array.isArray(certifications) ? certifications : [],
      education: Array.isArray(education) ? education : [],
    };
  } catch (err) {
    console.warn('Direct Supabase RAG query encountered an error:', err);
    return null;
  }
}

function formatMessagesForGemini(messages: ChatMessage[]) {
  const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  for (const msg of messages) {
    if (!msg.content || typeof msg.content !== 'string') continue;
    // Map assistant to model, ignore pure system role in conversation contents
    if (msg.role === 'system') continue;
    const role: 'user' | 'model' = (msg.role === 'assistant' || msg.role === 'model') ? 'model' : 'user';

    if (contents.length === 0) {
      // Gemini conversation must start with user turn
      if (role === 'model') {
        continue;
      }
      contents.push({ role, parts: [{ text: msg.content }] });
    } else {
      const last = contents[contents.length - 1];
      if (last.role === role) {
        // Merge consecutive messages with the same role
        last.parts[0].text += `\n\n${msg.content}`;
      } else {
        contents.push({ role, parts: [{ text: msg.content }] });
      }
    }
  }

  return contents;
}

Deno.serve(async (req: Request) => {
  // 1. CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // 2. Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 3. Verify Gemini API Key
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: 'GEMINI_API_KEY is not configured in Supabase Edge Function environment secrets.',
        hint: 'Please set the secret using: npx supabase secrets set GEMINI_API_KEY="your-api-key"',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }

  // 4. Parse incoming body
  let body: { messages?: ChatMessage[]; ragContext?: RAGBundle } = {};
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON request payload.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { messages, ragContext } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: 'Missing or empty messages array.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 5. Build RAG Grounding Context (accept client bundle or query Supabase directly)
  let bundle: RAGBundle | null = ragContext || null;
  if (!bundle || !bundle.profile) {
    const directBundle = await fetchDirectRAGFromSupabase();
    if (directBundle) {
      bundle = directBundle;
    }
  }

  const systemPrompt = buildPortfolioSystemPrompt(bundle);
  const geminiContents = formatMessagesForGemini(messages);

  if (geminiContents.length === 0) {
    return new Response(JSON.stringify({ error: 'At least one user message is required.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 6. Invoke Google Gemini API with verified supported models
  const candidateModels = [
    'gemini-2.5-flash',
    'gemini-flash-latest',
    'gemini-2.5-flash-lite',
    'gemini-flash-lite-latest',
  ];

  const geminiPayload = {
    system_instruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: geminiContents,
    generationConfig: {
      temperature: 0.3,
      topP: 0.95,
      maxOutputTokens: 2048,
    },
  };

  try {
    let geminiRes: Response | null = null;
    let lastErrorDetails = '';

    for (const modelName of candidateModels) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:streamGenerateContent?key=${apiKey}&alt=sse`;
      const res = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(geminiPayload),
      });

      if (res.ok) {
        geminiRes = res;
        break;
      }

      lastErrorDetails = await res.text().catch(() => '');
      console.warn(`Gemini model ${modelName} returned status ${res.status}:`, lastErrorDetails);
    }

    if (!geminiRes || !geminiRes.ok) {
      // Diagnostic helper: query available models list from Google
      let availableModelsInfo = '';
      try {
        const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        if (listRes.ok) {
          const listData = await listRes.json();
          const names = (listData.models || []).map((m: any) => m.name.replace('models/', ''));
          availableModelsInfo = ` Available models on your API key: ${names.join(', ')}`;
        }
      } catch (listErr) {
        console.warn('Could not query model list:', listErr);
      }

      return new Response(
        JSON.stringify({
          error: `Google Gemini API error.${availableModelsInfo}`,
          details: lastErrorDetails,
        }),
        {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 7. Pipe SSE stream chunks directly back to the client
    return new Response(geminiRes.body, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  } catch (fetchErr: any) {
    console.error('Failed to communicate with Gemini API:', fetchErr);
    return new Response(
      JSON.stringify({
        error: 'Failed to communicate with Gemini API.',
        message: fetchErr?.message || String(fetchErr),
      }),
      {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

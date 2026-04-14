import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const OLLAMA_URL = Deno.env.get('OLLAMA_URL');
const OLLAMA_MODEL = Deno.env.get('OLLAMA_MODEL') || 'gemma3:4b';
const OLLAMA_AUTH = Deno.env.get('OLLAMA_AUTH') || '';
const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY') || '';
const OPENROUTER_MODEL = Deno.env.get('OPENROUTER_MODEL') || 'meta-llama/llama-3.1-8b-instruct:free';

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  const status: {
    ollama: { configured: boolean; url: string | null; model: string; reachable?: boolean; latency_ms?: number; error?: string };
    openrouter: { configured: boolean; model: string };
    active_provider: string;
    timestamp: string;
  } = {
    ollama: {
      configured: !!OLLAMA_URL,
      url: OLLAMA_URL || null,
      model: OLLAMA_MODEL,
    },
    openrouter: {
      configured: !!OPENROUTER_API_KEY,
      model: OPENROUTER_MODEL,
    },
    active_provider: OLLAMA_URL ? 'ollama' : 'openrouter',
    timestamp: new Date().toISOString(),
  };

  // Ping Ollama if configured
  if (OLLAMA_URL) {
    try {
      const start = Date.now();
      const auth = btoa(OLLAMA_AUTH);
      const res = await fetch(`${OLLAMA_URL}/api/tags`, {
        method: 'GET',
        headers: {
          ...(OLLAMA_AUTH ? { 'Authorization': `Basic ${auth}` } : {}),
        },
        signal: AbortSignal.timeout(10000),
      });
      const latency = Date.now() - start;
      if (res.ok) {
        const data = await res.json();
        const models = (data.models || []).map((m: { name: string }) => m.name);
        status.ollama.reachable = true;
        status.ollama.latency_ms = latency;
        (status.ollama as Record<string, unknown>).available_models = models;
        (status.ollama as Record<string, unknown>).model_loaded = models.includes(OLLAMA_MODEL);
      } else {
        status.ollama.reachable = false;
        status.ollama.error = `HTTP ${res.status}`;
        status.active_provider = 'openrouter';
      }
    } catch (err) {
      status.ollama.reachable = false;
      status.ollama.error = (err as Error).message;
      status.active_provider = 'openrouter';
    }
  }

  return new Response(JSON.stringify(status, null, 2), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});

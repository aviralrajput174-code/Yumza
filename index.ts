// Secure server-side function scaffold. Deploy with Supabase CLI.
// Set AI_IMAGE_API_URL and AI_IMAGE_API_KEY as Supabase Function Secrets.
// Configure this file for the image provider you choose. Never place API keys in app.js.
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", {
    headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" }
  });
  const cors = { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" };
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "POST only" }), { status: 405, headers: cors });

  const auth = req.headers.get("Authorization");
  if (!auth) return new Response(JSON.stringify({ error: "Sign-in required" }), { status: 401, headers: cors });

  const { prompt } = await req.json().catch(() => ({ prompt: "" }));
  if (typeof prompt !== "string" || prompt.trim().length < 3 || prompt.length > 500) {
    return new Response(JSON.stringify({ error: "Prompt must be 3–500 characters" }), { status: 400, headers: cors });
  }

  const apiUrl = Deno.env.get("AI_IMAGE_API_URL");
  const apiKey = Deno.env.get("AI_IMAGE_API_KEY");
  if (!apiUrl || !apiKey) {
    return new Response(JSON.stringify({ error: "AI provider is not configured yet. Set AI_IMAGE_API_URL and AI_IMAGE_API_KEY function secrets." }), { status: 503, headers: cors });
  }

  // Provider-specific request/response formats differ. Adapt this section to the provider's documented API.
  const upstream = await fetch(apiUrl, {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: `Commercial food photography, appetizing realistic food image: ${prompt.trim()}` })
  });
  const payload = await upstream.json().catch(() => ({}));
  if (!upstream.ok) return new Response(JSON.stringify({ error: "Image provider request failed", provider_status: upstream.status }), { status: 502, headers: cors });
  const image_url = payload.image_url || payload.url || payload.data?.[0]?.url;
  if (!image_url) return new Response(JSON.stringify({ error: "Adapt function response parsing to your provider's response format." }), { status: 502, headers: cors });
  return new Response(JSON.stringify({ image_url }), { status: 200, headers: cors });
});

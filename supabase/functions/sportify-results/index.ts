import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-Sportify-Signature",
};

const SUPABASE_URL     = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const WEBHOOK_SECRET   = Deno.env.get("SPORTIFY_WEBHOOK_SECRET") ?? "";

async function verifySignature(body: string, signature: string | null): Promise<boolean> {
  if (!WEBHOOK_SECRET || !signature) return !WEBHOOK_SECRET; // skip if no secret configured
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(WEBHOOK_SECRET),
    { name: "HMAC", hash: "SHA-256" }, false, ["verify"]
  );
  const sigBytes = Uint8Array.from(atob(signature), c => c.charCodeAt(0));
  return crypto.subtle.verify("HMAC", key, sigBytes, new TextEncoder().encode(body));
}

async function computeHash(payload: unknown): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  const hash  = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: corsHeaders });
  }

  const rawBody  = await req.text();
  const sig      = req.headers.get("X-Sportify-Signature");
  const verified = await verifySignature(rawBody, sig);
  if (!verified) {
    return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 401, headers: corsHeaders });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: corsHeaders });
  }

  const {
    external_ref,          // our assessment.id
    session_id,
    sport_recommendations, // [{sport, potential_score, percentile, rationale}]
    physical_metrics,      // {sprint_ms, agility_s, jump_cm, reaction_ms, endurance_vo2}
    overall_potential_score,
    completed_at,
  } = payload as {
    external_ref: string;
    session_id: string;
    sport_recommendations: unknown;
    physical_metrics: unknown;
    overall_potential_score: number;
    completed_at: string;
  };

  if (!external_ref) {
    return new Response(JSON.stringify({ error: "Missing external_ref" }), { status: 400, headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE);

  // Verify the assessment exists
  const { data: existing, error: fetchErr } = await supabase
    .from("assessments")
    .select("id, athlete_id, verified")
    .eq("id", external_ref)
    .single();

  if (fetchErr || !existing) {
    return new Response(JSON.stringify({ error: "Assessment not found" }), { status: 404, headers: corsHeaders });
  }

  if (existing.verified) {
    // Already processed — idempotent
    return new Response(JSON.stringify({ ok: true, message: "Already processed" }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Compute tamper-evident provenance hash over the canonical value payload
  const canonicalPayload = { external_ref, session_id, sport_recommendations, physical_metrics, overall_potential_score, completed_at };
  const provenanceHash   = await computeHash(canonicalPayload);

  const { error: updateErr } = await supabase
    .from("assessments")
    .update({
      status:                  "completed",
      sport_recommendations,
      physical_metrics,
      overall_potential_score,
      taken_at:                completed_at ?? new Date().toISOString(),
      source_ref:              session_id ?? existing.id,
      verified:                true,
      provenance_hash:         provenanceHash,
    })
    .eq("id", external_ref);

  if (updateErr) {
    return new Response(JSON.stringify({ error: updateErr.message }), { status: 500, headers: corsHeaders });
  }

  return new Response(JSON.stringify({ ok: true, assessment_id: external_ref, provenance_hash: provenanceHash }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});

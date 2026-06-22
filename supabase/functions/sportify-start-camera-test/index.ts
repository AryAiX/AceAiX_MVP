import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.224.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SPORTIFY_BASE_URL = Deno.env.get("SPORTIFY_BASE_URL") ?? "https://api.sportifyacademy.com";
const SPORTIFY_API_KEY  = Deno.env.get("SPORTIFY_API_KEY") ?? "";
const SUPABASE_URL      = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE);

  // Verify caller identity from JWT
  const { data: { user }, error: authErr } = await createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!)
    .auth.getUser(authHeader.replace("Bearer ", ""));

  if (authErr || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
  }

  const body = await req.json().catch(() => ({}));
  const { consent_given, is_minor, guardian_approved } = body as {
    consent_given?: boolean;
    is_minor?: boolean;
    guardian_approved?: boolean;
  };

  if (!consent_given) {
    return new Response(JSON.stringify({ error: "Athlete consent is required before starting a camera test." }), {
      status: 400, headers: corsHeaders,
    });
  }

  if (is_minor && !guardian_approved) {
    return new Response(JSON.stringify({ error: "Guardian approval is required for minor athletes." }), {
      status: 400, headers: corsHeaders,
    });
  }

  // Create assessment row (status = in_progress)
  const { data: assessment, error: insertErr } = await supabase
    .from("assessments")
    .insert({
      athlete_id:       user.id,
      source:           "sportify",
      modality:         "camera",
      status:           "in_progress",
      verified:         false,
      guardian_approved: guardian_approved ?? false,
      consent_given_at: new Date().toISOString(),
      visibility:       "private",
    })
    .select()
    .single();

  if (insertErr) {
    return new Response(JSON.stringify({ error: insertErr.message }), { status: 500, headers: corsHeaders });
  }

  // Call Sportify API to get a camera test session URL
  let sportifySession: { session_url: string; session_id: string } | null = null;
  try {
    const sportifyResp = await fetch(`${SPORTIFY_BASE_URL}/v1/assessments/camera/start`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SPORTIFY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        external_ref:     assessment.id,
        athlete_external: user.id,
        consent_given:    true,
        webhook_url:      `${SUPABASE_URL}/functions/v1/sportify-results`,
      }),
    });

    if (sportifyResp.ok) {
      sportifySession = await sportifyResp.json();
      // Store the sportify session ref
      await supabase
        .from("assessments")
        .update({ source_ref: sportifySession?.session_id })
        .eq("id", assessment.id);
    }
  } catch (_err) {
    // Sportify API unavailable — assessment row created, return a mock URL for dev
    sportifySession = {
      session_url: `https://app.sportifyacademy.com/camera-test?session=${assessment.id}`,
      session_id:  assessment.id,
    };
    await supabase
      .from("assessments")
      .update({ source_ref: assessment.id })
      .eq("id", assessment.id);
  }

  return new Response(JSON.stringify({
    assessment_id: assessment.id,
    session_url:   sportifySession?.session_url,
    session_id:    sportifySession?.session_id,
    message:       "Camera test session started. Open session_url to begin.",
  }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});

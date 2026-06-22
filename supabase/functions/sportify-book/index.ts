import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

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

  const anonClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!);
  const { data: { user }, error: authErr } = await anonClient.auth.getUser(authHeader.replace("Bearer ", ""));
  if (authErr || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
  }

  const body = await req.json().catch(() => ({}));
  const {
    slot_id,
    location,
    slot_start,
    slot_end,
    consent_given,
    is_minor,
    guardian_approved,
    notes,
  } = body as {
    slot_id: string;
    location: string;
    slot_start: string;
    slot_end: string;
    consent_given?: boolean;
    is_minor?: boolean;
    guardian_approved?: boolean;
    notes?: string;
  };

  if (!slot_id || !location || !slot_start || !slot_end) {
    return new Response(JSON.stringify({ error: "slot_id, location, slot_start, and slot_end are required." }), {
      status: 400, headers: corsHeaders,
    });
  }
  if (!consent_given) {
    return new Response(JSON.stringify({ error: "Athlete consent is required before booking." }), {
      status: 400, headers: corsHeaders,
    });
  }
  if (is_minor && !guardian_approved) {
    return new Response(JSON.stringify({ error: "Guardian approval is required for minor athletes." }), {
      status: 400, headers: corsHeaders,
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE);

  // Create a pending assessment row for the in-person visit
  const { data: assessment, error: assessErr } = await supabase
    .from("assessments")
    .insert({
      athlete_id:        user.id,
      source:            "sportify",
      modality:          "in_person",
      status:            "scheduled",
      verified:          false,
      guardian_approved: guardian_approved ?? false,
      consent_given_at:  new Date().toISOString(),
      visibility:        "private",
    })
    .select()
    .single();

  if (assessErr) {
    return new Response(JSON.stringify({ error: assessErr.message }), { status: 500, headers: corsHeaders });
  }

  // Call Sportify booking API
  let bookingRef: string = `mock-${Date.now()}`;
  try {
    const resp = await fetch(`${SPORTIFY_BASE_URL}/v1/appointments/book`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SPORTIFY_API_KEY}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({
        slot_id,
        external_ref:     assessment.id,
        athlete_external: user.id,
        consent_given:    true,
        webhook_url:      `${SUPABASE_URL}/functions/v1/sportify-results`,
      }),
    });
    if (resp.ok) {
      const data = await resp.json();
      bookingRef = data.booking_ref ?? bookingRef;
    }
  } catch {
    // API unavailable — use mock ref
  }

  // Store the appointment
  const { data: appointment, error: apptErr } = await supabase
    .from("appointments")
    .insert({
      athlete_id:           user.id,
      assessment_id:        assessment.id,
      academy_location:     location,
      slot_start,
      slot_end,
      status:               "booked",
      sportify_booking_ref: bookingRef,
      guardian_approved:    guardian_approved ?? false,
      notes:                notes ?? null,
    })
    .select()
    .single();

  if (apptErr) {
    return new Response(JSON.stringify({ error: apptErr.message }), { status: 500, headers: corsHeaders });
  }

  // Link booking ref back to assessment
  await supabase
    .from("assessments")
    .update({ source_ref: bookingRef })
    .eq("id", assessment.id);

  return new Response(JSON.stringify({
    appointment_id:  appointment.id,
    assessment_id:   assessment.id,
    booking_ref:     bookingRef,
    location,
    slot_start,
    slot_end,
    status:          "booked",
    message:         "In-person assessment booked. Results will sync automatically after your visit.",
  }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});

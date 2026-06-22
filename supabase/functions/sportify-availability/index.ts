import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SPORTIFY_BASE_URL = Deno.env.get("SPORTIFY_BASE_URL") ?? "https://api.sportifyacademy.com";
const SPORTIFY_API_KEY  = Deno.env.get("SPORTIFY_API_KEY") ?? "";
const SUPABASE_URL      = Deno.env.get("SUPABASE_URL")!;

// Fallback mock slots when Sportify API is unavailable (dev/demo)
function mockSlots() {
  const base = new Date();
  base.setHours(9, 0, 0, 0);
  const locations = ["Dubai Sports City", "Abu Dhabi Academy", "Sharjah Sportify Hub"];
  const slots = [];
  for (let day = 1; day <= 14; day++) {
    const d = new Date(base);
    d.setDate(d.getDate() + day);
    if (d.getDay() === 0) continue; // skip Sundays
    for (const hour of [9, 11, 14, 16]) {
      const start = new Date(d);
      start.setHours(hour, 0, 0, 0);
      const end = new Date(start);
      end.setHours(hour + 1, 30, 0, 0);
      slots.push({
        slot_id:  `mock-${day}-${hour}`,
        location: locations[day % locations.length],
        start:    start.toISOString(),
        end:      end.toISOString(),
        capacity: 4,
        booked:   Math.floor(Math.random() * 3),
      });
    }
  }
  return slots;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
  }

  // Verify caller
  const { data: { user }, error: authErr } = await createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!)
    .auth.getUser(authHeader.replace("Bearer ", ""));
  if (authErr || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
  }

  const url      = new URL(req.url);
  const location = url.searchParams.get("location") ?? "";
  const from     = url.searchParams.get("from") ?? new Date().toISOString();
  const to       = url.searchParams.get("to") ?? "";

  let slots: unknown[] = [];
  try {
    const params = new URLSearchParams({ location, from, to });
    const resp   = await fetch(`${SPORTIFY_BASE_URL}/v1/appointments/availability?${params}`, {
      headers: { "Authorization": `Bearer ${SPORTIFY_API_KEY}` },
    });
    if (resp.ok) {
      const data = await resp.json();
      slots = data.slots ?? data;
    } else {
      slots = mockSlots();
    }
  } catch {
    slots = mockSlots();
  }

  return new Response(JSON.stringify({ slots }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});

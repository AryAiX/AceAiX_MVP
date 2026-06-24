import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const DEMO_USERS = [
  { email: "athlete@aceaix.demo",  password: "demo123456", full_name: "Ahmed Al Mansoori", role: "athlete"         },
  { email: "scout@aceaix.demo",    password: "demo123456", full_name: "Demo Scout",         role: "scout"           },
  { email: "club@aceaix.demo",     password: "demo123456", full_name: "Demo Club",          role: "club"            },
  { email: "medical@aceaix.demo",  password: "demo123456", full_name: "Demo Medical",       role: "medical_partner" },
  { email: "admin@aceaix.demo",    password: "demo123456", full_name: "Demo Admin",         role: "admin"           },
];

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey    = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // Admin client for writing profiles (bypasses RLS)
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const results: Record<string, string> = {};

  for (const demo of DEMO_USERS) {
    // Sign up via GoTrue signup endpoint — creates proper user + identity records
    const resp = await fetch(`${supabaseUrl}/auth/v1/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": anonKey,
      },
      body: JSON.stringify({
        email: demo.email,
        password: demo.password,
        data: { full_name: demo.full_name },
      }),
    });

    const body = await resp.json() as any;

    if (!resp.ok || !body?.user?.id) {
      results[demo.email] = `signup failed (${resp.status}): ${JSON.stringify(body)}`;
      continue;
    }

    const userId = body.user.id as string;

    // Write/update the user_profiles row with correct role
    const { error: profileErr } = await admin.from("user_profiles").upsert({
      id: userId,
      role: demo.role,
      full_name: demo.full_name,
      email: demo.email,
      is_verified: true,
      subscription_tier: "pro",
    });

    if (profileErr) {
      results[demo.email] = `created user (${userId}) but profile failed: ${profileErr.message}`;
      continue;
    }

    // Add athlete_profiles row for the athlete
    if (demo.role === "athlete") {
      await admin.from("athlete_profiles").upsert({
        user_id: userId,
        sport: "Football",
        level: "professional",
        nationality: "UAE",
        current_club: "Al Wasl SC",
        is_open_to_offers: true,
      });
    }

    results[demo.email] = `created (id: ${userId})`;
  }

  return new Response(JSON.stringify({ results }, null, 2), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});

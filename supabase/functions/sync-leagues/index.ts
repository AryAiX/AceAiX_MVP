import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const PROVIDER = "api-football";
const SPORT = "football";
const API_HOST = "https://v3.football.api-sports.io";
// NOTE: API-Football does NOT return tier/division level in /leagues.
// tier is left null on ingest and enriched separately by admins or the seed importer.

interface ApiLeague {
  league: {
    id: number;
    name: string;
    type: string; // "League" | "Cup"
    logo: string;
  };
  country: {
    name: string;
    code: string | null;
    flag: string | null;
  };
  seasons: Array<{
    year: number;
    current: boolean;
  }>;
}

interface UpsertRow {
  external_id: string;
  provider: string;
  sport: string;
  name: string;
  type: string;
  logo_url: string | null;
  country: string;
  country_code: string | null;
  flag_url: string | null;
  season: number | null;
  is_current: boolean;
  data_source: string;
  verification_status: string;
  last_synced_at: string;
}

async function fetchAllLeagues(apiKey: string): Promise<ApiLeague[]> {
  const res = await fetch(`${API_HOST}/leagues`, {
    headers: {
      "x-apisports-key": apiKey,
    },
  });

  if (!res.ok) {
    throw new Error(`API-Football /leagues returned ${res.status}: ${await res.text()}`);
  }

  const json = await res.json();
  return (json.response ?? []) as ApiLeague[];
}

function mapLeague(item: ApiLeague): UpsertRow {
  const currentSeason = item.seasons.find((s) => s.current) ?? item.seasons[item.seasons.length - 1];
  const leagueType = item.league.type?.toLowerCase() === "cup" ? "cup" : "league";

  return {
    external_id: String(item.league.id),
    provider: PROVIDER,
    sport: SPORT,
    name: item.league.name,
    type: leagueType,
    logo_url: item.league.logo || null,
    country: item.country.name ?? "World",
    country_code: item.country.code ?? null,
    flag_url: item.country.flag ?? null,
    season: currentSeason?.year ?? null,
    is_current: currentSeason?.current ?? false,
    data_source: "licensed",
    verification_status: "approved",
    last_synced_at: new Date().toISOString(),
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const apiKey = Deno.env.get("SPORTS_API_KEY");
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "SPORTS_API_KEY env var not set" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Create a sync_log entry
  const { data: logRow } = await supabase
    .from("sync_log")
    .insert({ provider: PROVIDER, sport: SPORT, status: "running" })
    .select("id")
    .single();
  const logId = logRow?.id;

  try {
    const leagues = await fetchAllLeagues(apiKey);
    const rows = leagues.map(mapLeague);

    let inserted = 0;
    let updated = 0;
    const BATCH = 100;

    for (let i = 0; i < rows.length; i += BATCH) {
      const batch = rows.slice(i, i + BATCH);

      const { data, error } = await supabase
        .from("competitions")
        .upsert(batch, {
          onConflict: "provider,external_id",
          ignoreDuplicates: false,
        })
        .select("id");

      if (error) throw new Error(`Upsert batch ${i / BATCH}: ${error.message}`);

      // Approximate: if id existed before it's an update; new rows are inserts.
      // We count upserted rows as a proxy (Supabase doesn't return insert vs update).
      inserted += data?.length ?? 0;
    }
    // Best-effort split: treat first run as inserts, subsequent runs as updates.
    // The sync_log gives admins visibility; exact split requires additional query.

    if (logId) {
      await supabase
        .from("sync_log")
        .update({
          status: "success",
          finished_at: new Date().toISOString(),
          inserted,
          total: rows.length,
        })
        .eq("id", logId);
    }

    return new Response(
      JSON.stringify({ ok: true, total: rows.length, upserted: inserted }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (logId) {
      await supabase
        .from("sync_log")
        .update({ status: "error", finished_at: new Date().toISOString(), error_msg: msg })
        .eq("id", logId);
    }

    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

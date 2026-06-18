import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// ── Shared types ──────────────────────────────────────────────────────────────

export interface CompetitionRow {
  external_id: string;
  provider: string;
  sport: string;
  structure_type: "league" | "cup" | "tour_circuit" | "championship" | "tournament" | "other";
  name: string;
  logo_url: string | null;
  country: string;
  country_code: string | null;
  flag_url: string | null;
  governing_body: string | null;
  season: number | null;
  is_current: boolean;
  gender: string;
  data_source: "licensed" | "community";
  verification_status: "approved" | "pending";
  last_synced_at: string;
}

interface AdapterResult {
  rows: CompetitionRow[];
  providerNote?: string;
}

// ── API-Sports multi-sport adapter ────────────────────────────────────────────
// One key, different hostnames per sport.
// NOTE: API-Sports does NOT return league/division TIER. tier is left null on
// ingest and enriched separately by admins or the seed importer.

const API_SPORTS_HOSTS: Record<string, string> = {
  football:   "https://v3.football.api-sports.io",
  basketball: "https://v1.basketball.api-sports.io",
  volleyball:  "https://v1.volleyball.api-sports.io",
  baseball:   "https://v1.baseball.api-sports.io",
  hockey:     "https://v1.hockey.api-sports.io",
  rugby:      "https://v1.rugby.api-sports.io",
  handball:   "https://v1.handball.api-sports.io",
};

// Formula 1 uses a different endpoint pattern
const F1_HOST = "https://v1.formula-1.api-sports.io";

async function fetchApiSports(
  host: string,
  endpoint: string,
  apiKey: string,
): Promise<unknown[]> {
  const res = await fetch(`${host}${endpoint}`, {
    headers: { "x-apisports-key": apiKey },
  });
  if (!res.ok) throw new Error(`${host}${endpoint} → ${res.status}`);
  const json = await res.json() as { response?: unknown[] };
  return json.response ?? [];
}

interface ApiLeagueItem {
  league: { id: number; name: string; type?: string; logo?: string };
  country: { name: string; code?: string | null; flag?: string | null };
  seasons?: Array<{ year: number; current: boolean }>;
}

function mapApiSportsLeague(
  item: ApiLeagueItem,
  sport: string,
  provider: string,
): CompetitionRow {
  const currentSeason =
    item.seasons?.find((s) => s.current) ??
    item.seasons?.[item.seasons.length - 1];

  const rawType = (item.league.type ?? "league").toLowerCase();
  const structure_type =
    rawType.includes("cup") ? "cup" : "league";

  return {
    external_id: String(item.league.id),
    provider,
    sport,
    structure_type,
    name: item.league.name,
    logo_url: item.league.logo ?? null,
    country: item.country.name ?? "World",
    country_code: item.country.code ?? null,
    flag_url: item.country.flag ?? null,
    governing_body: null,
    season: currentSeason?.year ?? null,
    is_current: currentSeason?.current ?? false,
    gender: "men",
    data_source: "licensed",
    verification_status: "approved",
    last_synced_at: new Date().toISOString(),
  };
}

async function adapterApiSports(
  sport: string,
  apiKey: string,
): Promise<AdapterResult> {
  const host = API_SPORTS_HOSTS[sport];
  if (!host) throw new Error(`No API-Sports host for sport: ${sport}`);

  const items = await fetchApiSports(host, "/leagues", apiKey) as ApiLeagueItem[];
  const rows = items.map((item) => mapApiSportsLeague(item, sport, `api-sports-${sport}`));
  return { rows, providerNote: `api-sports-${sport}` };
}

// ── Formula 1 adapter ─────────────────────────────────────────────────────────

interface F1Season { season: number; url: string }

async function adapterFormula1(apiKey: string): Promise<AdapterResult> {
  const items = await fetchApiSports(F1_HOST, "/seasons", apiKey) as F1Season[];
  const current = items.find((s) => s.season === new Date().getFullYear()) ?? items[items.length - 1];

  const rows: CompetitionRow[] = items.map((s) => ({
    external_id: `f1-${s.season}`,
    provider: "api-sports-formula-1",
    sport: "formula_1",
    structure_type: "championship",
    name: `FIA Formula 1 World Championship ${s.season}`,
    logo_url: "https://media.api-sports.io/formula-1/teams/1.png",
    country: "World",
    country_code: null,
    flag_url: null,
    governing_body: "FIA",
    season: s.season,
    is_current: current?.season === s.season,
    gender: "mixed",
    data_source: "licensed",
    verification_status: "approved",
    last_synced_at: new Date().toISOString(),
  }));

  return { rows };
}

// ── Seed adapters for API-less / individual sports ────────────────────────────
// These sports (tennis tours, golf majors, athletics series, swimming circuits,
// cycling grand tours, polo seasons, etc.) lack a public "leagues" endpoint.
// We seed from the curated AceAiX competition pack. In production, plug in
// provider-specific clients (ATP/WTA API, Golf Channel API, World Athletics
// API, etc.) by replacing the stub with a real fetch.

type SeedRow = Omit<CompetitionRow, "last_synced_at" | "verification_status" | "data_source">;

const SEED_COMPETITIONS: SeedRow[] = [
  // ── Tennis ────────────────────────────────────────────────────────────────
  { external_id: "atp-tour", provider: "seed", sport: "tennis", structure_type: "tour_circuit", name: "ATP Tour", logo_url: null, country: "World", country_code: null, flag_url: null, governing_body: "ATP", season: null, is_current: true, gender: "men" },
  { external_id: "wta-tour", provider: "seed", sport: "tennis", structure_type: "tour_circuit", name: "WTA Tour", logo_url: null, country: "World", country_code: null, flag_url: null, governing_body: "WTA", season: null, is_current: true, gender: "women" },
  { external_id: "atp-1000-miami", provider: "seed", sport: "tennis", structure_type: "tournament", name: "Miami Open", logo_url: null, country: "United States", country_code: "US", flag_url: null, governing_body: "ATP", season: null, is_current: true, gender: "men" },
  { external_id: "atp-1000-rome", provider: "seed", sport: "tennis", structure_type: "tournament", name: "Internazionali BNL d'Italia", logo_url: null, country: "Italy", country_code: "IT", flag_url: null, governing_body: "ATP", season: null, is_current: true, gender: "men" },
  { external_id: "gs-ao", provider: "seed", sport: "tennis", structure_type: "championship", name: "Australian Open", logo_url: null, country: "Australia", country_code: "AU", flag_url: null, governing_body: "Tennis Australia", season: null, is_current: true, gender: "mixed" },
  { external_id: "gs-rg", provider: "seed", sport: "tennis", structure_type: "championship", name: "Roland Garros", logo_url: null, country: "France", country_code: "FR", flag_url: null, governing_body: "FFT", season: null, is_current: true, gender: "mixed" },
  { external_id: "gs-wb", provider: "seed", sport: "tennis", structure_type: "championship", name: "Wimbledon", logo_url: null, country: "United Kingdom", country_code: "GB", flag_url: null, governing_body: "AELTC", season: null, is_current: true, gender: "mixed" },
  { external_id: "gs-uso", provider: "seed", sport: "tennis", structure_type: "championship", name: "US Open", logo_url: null, country: "United States", country_code: "US", flag_url: null, governing_body: "USTA", season: null, is_current: true, gender: "mixed" },

  // ── Golf ──────────────────────────────────────────────────────────────────
  { external_id: "pga-tour", provider: "seed", sport: "golf", structure_type: "tour_circuit", name: "PGA Tour", logo_url: null, country: "United States", country_code: "US", flag_url: null, governing_body: "PGA", season: null, is_current: true, gender: "men" },
  { external_id: "lpga-tour", provider: "seed", sport: "golf", structure_type: "tour_circuit", name: "LPGA Tour", logo_url: null, country: "United States", country_code: "US", flag_url: null, governing_body: "LPGA", season: null, is_current: true, gender: "women" },
  { external_id: "dp-world-tour", provider: "seed", sport: "golf", structure_type: "tour_circuit", name: "DP World Tour", logo_url: null, country: "World", country_code: null, flag_url: null, governing_body: "European Tour", season: null, is_current: true, gender: "men" },
  { external_id: "masters", provider: "seed", sport: "golf", structure_type: "championship", name: "The Masters", logo_url: null, country: "United States", country_code: "US", flag_url: null, governing_body: "Augusta National", season: null, is_current: true, gender: "men" },
  { external_id: "the-open", provider: "seed", sport: "golf", structure_type: "championship", name: "The Open Championship", logo_url: null, country: "United Kingdom", country_code: "GB", flag_url: null, governing_body: "R&A", season: null, is_current: true, gender: "men" },
  { external_id: "us-open-golf", provider: "seed", sport: "golf", structure_type: "championship", name: "US Open (Golf)", logo_url: null, country: "United States", country_code: "US", flag_url: null, governing_body: "USGA", season: null, is_current: true, gender: "men" },
  { external_id: "pga-championship", provider: "seed", sport: "golf", structure_type: "championship", name: "PGA Championship", logo_url: null, country: "United States", country_code: "US", flag_url: null, governing_body: "PGA of America", season: null, is_current: true, gender: "men" },

  // ── Athletics ─────────────────────────────────────────────────────────────
  { external_id: "wa-diamond-league", provider: "seed", sport: "athletics", structure_type: "tour_circuit", name: "World Athletics Diamond League", logo_url: null, country: "World", country_code: null, flag_url: null, governing_body: "World Athletics", season: null, is_current: true, gender: "mixed" },
  { external_id: "wa-world-championships", provider: "seed", sport: "athletics", structure_type: "championship", name: "World Athletics Championships", logo_url: null, country: "World", country_code: null, flag_url: null, governing_body: "World Athletics", season: null, is_current: true, gender: "mixed" },
  { external_id: "wa-continental-tour", provider: "seed", sport: "athletics", structure_type: "tour_circuit", name: "World Athletics Continental Tour", logo_url: null, country: "World", country_code: null, flag_url: null, governing_body: "World Athletics", season: null, is_current: true, gender: "mixed" },
  { external_id: "athletics-olympics", provider: "seed", sport: "athletics", structure_type: "championship", name: "Olympic Athletics", logo_url: null, country: "World", country_code: null, flag_url: null, governing_body: "World Athletics / IOC", season: null, is_current: false, gender: "mixed" },
  { external_id: "marathon-majors", provider: "seed", sport: "athletics", structure_type: "tour_circuit", name: "Abbott World Marathon Majors", logo_url: null, country: "World", country_code: null, flag_url: null, governing_body: "Abbott WMM", season: null, is_current: true, gender: "mixed" },

  // ── Swimming ──────────────────────────────────────────────────────────────
  { external_id: "fina-world-champs", provider: "seed", sport: "swimming", structure_type: "championship", name: "World Aquatics Championships", logo_url: null, country: "World", country_code: null, flag_url: null, governing_body: "World Aquatics", season: null, is_current: true, gender: "mixed" },
  { external_id: "world-cup-swimming", provider: "seed", sport: "swimming", structure_type: "tour_circuit", name: "World Aquatics World Cup", logo_url: null, country: "World", country_code: null, flag_url: null, governing_body: "World Aquatics", season: null, is_current: true, gender: "mixed" },
  { external_id: "ism-pro-swim", provider: "seed", sport: "swimming", structure_type: "tour_circuit", name: "International Swimming League", logo_url: null, country: "World", country_code: null, flag_url: null, governing_body: "ISL", season: null, is_current: false, gender: "mixed" },
  { external_id: "swim-olympics", provider: "seed", sport: "swimming", structure_type: "championship", name: "Olympic Swimming", logo_url: null, country: "World", country_code: null, flag_url: null, governing_body: "World Aquatics / IOC", season: null, is_current: false, gender: "mixed" },

  // ── Cycling ───────────────────────────────────────────────────────────────
  { external_id: "uci-world-tour", provider: "seed", sport: "cycling", structure_type: "tour_circuit", name: "UCI World Tour", logo_url: null, country: "World", country_code: null, flag_url: null, governing_body: "UCI", season: null, is_current: true, gender: "men" },
  { external_id: "uci-women-world-tour", provider: "seed", sport: "cycling", structure_type: "tour_circuit", name: "UCI Women's World Tour", logo_url: null, country: "World", country_code: null, flag_url: null, governing_body: "UCI", season: null, is_current: true, gender: "women" },
  { external_id: "tour-de-france", provider: "seed", sport: "cycling", structure_type: "championship", name: "Tour de France", logo_url: null, country: "France", country_code: "FR", flag_url: null, governing_body: "ASO / UCI", season: null, is_current: true, gender: "men" },
  { external_id: "giro-ditalia", provider: "seed", sport: "cycling", structure_type: "championship", name: "Giro d'Italia", logo_url: null, country: "Italy", country_code: "IT", flag_url: null, governing_body: "RCS Sport / UCI", season: null, is_current: true, gender: "men" },
  { external_id: "vuelta-espana", provider: "seed", sport: "cycling", structure_type: "championship", name: "Vuelta a España", logo_url: null, country: "Spain", country_code: "ES", flag_url: null, governing_body: "Unipublic / UCI", season: null, is_current: true, gender: "men" },

  // ── Polo ──────────────────────────────────────────────────────────────────
  { external_id: "hurlingham-polo", provider: "seed", sport: "polo", structure_type: "championship", name: "Hurlingham Open Polo Championship", logo_url: null, country: "Argentina", country_code: "AR", flag_url: null, governing_body: "Asociación Argentina de Polo", season: null, is_current: true, gender: "men" },
  { external_id: "cowdray-gold-cup", provider: "seed", sport: "polo", structure_type: "championship", name: "Cowdray Gold Cup", logo_url: null, country: "United Kingdom", country_code: "GB", flag_url: null, governing_body: "Hurlingham Polo Association", season: null, is_current: true, gender: "men" },
  { external_id: "us-open-polo", provider: "seed", sport: "polo", structure_type: "championship", name: "US Open Polo Championship", logo_url: null, country: "United States", country_code: "US", flag_url: null, governing_body: "USPA", season: null, is_current: true, gender: "men" },
  { external_id: "dubai-polo-gold-cup", provider: "seed", sport: "polo", structure_type: "championship", name: "Dubai Polo Gold Cup", logo_url: null, country: "United Arab Emirates", country_code: "AE", flag_url: null, governing_body: "Dubai Polo & Equestrian Club", season: null, is_current: true, gender: "men" },

  // ── Motorsport (broader) ───────────────────────────────────────────────────
  { external_id: "motogp-championship", provider: "seed", sport: "motorsport", structure_type: "championship", name: "MotoGP World Championship", logo_url: null, country: "World", country_code: null, flag_url: null, governing_body: "FIM", season: null, is_current: true, gender: "men" },
  { external_id: "wec-championship", provider: "seed", sport: "motorsport", structure_type: "championship", name: "FIA World Endurance Championship", logo_url: null, country: "World", country_code: null, flag_url: null, governing_body: "FIA", season: null, is_current: true, gender: "mixed" },
  { external_id: "nascar-cup", provider: "seed", sport: "motorsport", structure_type: "championship", name: "NASCAR Cup Series", logo_url: null, country: "United States", country_code: "US", flag_url: null, governing_body: "NASCAR", season: null, is_current: true, gender: "men" },
  { external_id: "indycar-series", provider: "seed", sport: "motorsport", structure_type: "championship", name: "IndyCar Series", logo_url: null, country: "United States", country_code: "US", flag_url: null, governing_body: "IndyCar", season: null, is_current: true, gender: "mixed" },

  // ── Boxing ────────────────────────────────────────────────────────────────
  { external_id: "wbc-titles", provider: "seed", sport: "boxing", structure_type: "championship", name: "WBC World Championships", logo_url: null, country: "World", country_code: null, flag_url: null, governing_body: "WBC", season: null, is_current: true, gender: "mixed" },
  { external_id: "wba-titles", provider: "seed", sport: "boxing", structure_type: "championship", name: "WBA World Championships", logo_url: null, country: "World", country_code: null, flag_url: null, governing_body: "WBA", season: null, is_current: true, gender: "mixed" },
  { external_id: "ibf-titles", provider: "seed", sport: "boxing", structure_type: "championship", name: "IBF World Championships", logo_url: null, country: "World", country_code: null, flag_url: null, governing_body: "IBF", season: null, is_current: true, gender: "mixed" },
  { external_id: "wbo-titles", provider: "seed", sport: "boxing", structure_type: "championship", name: "WBO World Championships", logo_url: null, country: "World", country_code: null, flag_url: null, governing_body: "WBO", season: null, is_current: true, gender: "mixed" },

  // ── MMA ───────────────────────────────────────────────────────────────────
  { external_id: "ufc-organization", provider: "seed", sport: "mma", structure_type: "championship", name: "UFC Championships", logo_url: null, country: "United States", country_code: "US", flag_url: null, governing_body: "UFC", season: null, is_current: true, gender: "mixed" },
  { external_id: "bellator-mma", provider: "seed", sport: "mma", structure_type: "championship", name: "Bellator MMA", logo_url: null, country: "United States", country_code: "US", flag_url: null, governing_body: "Bellator", season: null, is_current: true, gender: "mixed" },
  { external_id: "one-championship", provider: "seed", sport: "mma", structure_type: "championship", name: "ONE Championship", logo_url: null, country: "Singapore", country_code: "SG", flag_url: null, governing_body: "ONE", season: null, is_current: true, gender: "mixed" },

  // ── Esports ───────────────────────────────────────────────────────────────
  { external_id: "lol-worlds", provider: "seed", sport: "esports", structure_type: "championship", name: "League of Legends World Championship", logo_url: null, country: "World", country_code: null, flag_url: null, governing_body: "Riot Games", season: null, is_current: true, gender: "mixed" },
  { external_id: "ti-dota", provider: "seed", sport: "esports", structure_type: "championship", name: "The International (Dota 2)", logo_url: null, country: "World", country_code: null, flag_url: null, governing_body: "Valve", season: null, is_current: true, gender: "mixed" },
  { external_id: "cs-major", provider: "seed", sport: "esports", structure_type: "championship", name: "CS:GO / CS2 Major Championships", logo_url: null, country: "World", country_code: null, flag_url: null, governing_body: "Valve", season: null, is_current: true, gender: "mixed" },
];

async function adapterSeed(): Promise<AdapterResult> {
  const rows: CompetitionRow[] = SEED_COMPETITIONS.map((s) => ({
    ...s,
    data_source: "community" as const,
    verification_status: "approved" as const,
    last_synced_at: new Date().toISOString(),
  }));
  return { rows };
}

// ── STUB adapters — wire up a real client when the API key is available ────────

// Tennis (ATP/WTA) — stub
// TODO: Replace with https://api.atptour.com or licensed feed
async function adapterTennis(/* apiKey: string */): Promise<AdapterResult> {
  console.log("Tennis adapter: no live API configured; using seed data");
  return { rows: [], providerNote: "stub — use seed data" };
}

// Golf (PGA/LPGA/DP World) — stub
// TODO: Replace with https://api.sportradar.com/golf
async function adapterGolf(/* apiKey: string */): Promise<AdapterResult> {
  console.log("Golf adapter: no live API configured; using seed data");
  return { rows: [], providerNote: "stub — use seed data" };
}

// Athletics (World Athletics) — stub
// TODO: Replace with https://worldathletics.org/api (requires partnership)
async function adapterAthletics(/* apiKey: string */): Promise<AdapterResult> {
  console.log("Athletics adapter: no live API configured; using seed data");
  return { rows: [], providerNote: "stub — use seed data" };
}

// Swimming (World Aquatics) — stub
// TODO: Replace with World Aquatics official data platform
async function adapterSwimming(/* apiKey: string */): Promise<AdapterResult> {
  console.log("Swimming adapter: no live API configured; using seed data");
  return { rows: [], providerNote: "stub — use seed data" };
}

// ── Sport router ──────────────────────────────────────────────────────────────

const API_SPORTS_SUPPORTED = Object.keys(API_SPORTS_HOSTS);

async function getCompetitions(sport: string, apiKey: string): Promise<AdapterResult> {
  if (sport === "all_seed") return adapterSeed();
  if (sport === "formula_1") return adapterFormula1(apiKey);
  if (API_SPORTS_SUPPORTED.includes(sport)) return adapterApiSports(sport, apiKey);

  // Individual sports — fall back to seed (stubs above could replace these)
  if (sport === "tennis")    return adapterTennis();
  if (sport === "golf")      return adapterGolf();
  if (sport === "athletics") return adapterAthletics();
  if (sport === "swimming")  return adapterSwimming();

  // Unknown sport — return empty with note
  return { rows: [], providerNote: `no adapter for sport: ${sport}` };
}

// ── Upsert ────────────────────────────────────────────────────────────────────

async function upsertRows(
  supabase: ReturnType<typeof createClient>,
  rows: CompetitionRow[],
): Promise<{ upserted: number }> {
  const BATCH = 100;
  let total = 0;

  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase
      .from("competitions")
      .upsert(batch, { onConflict: "provider,external_id", ignoreDuplicates: false });
    if (error) throw new Error(`Upsert batch ${Math.floor(i / BATCH)}: ${error.message}`);
    total += batch.length;
  }
  return { upserted: total };
}

// ── Edge Function entry ───────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const apiKey = Deno.env.get("SPORTS_API_KEY") ?? "";
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const db = createClient(supabaseUrl, supabaseKey);

  // sport param: "football", "basketball", "tennis", "all_seed", etc.
  const url = new URL(req.url);
  const sport = url.searchParams.get("sport") ?? "football";

  // Create sync_log entry
  const { data: logRow } = await db
    .from("sync_log")
    .insert({ provider: `sync-competitions`, sport, status: "running" })
    .select("id")
    .single();
  const logId = logRow?.id as string | undefined;

  try {
    if (!apiKey && API_SPORTS_SUPPORTED.includes(sport)) {
      throw new Error("SPORTS_API_KEY env var not set — required for this sport");
    }

    const { rows, providerNote } = await getCompetitions(sport, apiKey);

    if (rows.length === 0) {
      if (logId) {
        await db.from("sync_log").update({
          status: "success", finished_at: new Date().toISOString(),
          total: 0, error_msg: providerNote ?? null,
        }).eq("id", logId);
      }
      return new Response(
        JSON.stringify({ ok: true, total: 0, note: providerNote }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { upserted } = await upsertRows(db, rows);

    if (logId) {
      await db.from("sync_log").update({
        status: "success",
        finished_at: new Date().toISOString(),
        inserted: upserted,
        total: rows.length,
      }).eq("id", logId);
    }

    return new Response(
      JSON.stringify({ ok: true, sport, total: rows.length, upserted }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (logId) {
      await db.from("sync_log").update({
        status: "error", finished_at: new Date().toISOString(), error_msg: msg,
      }).eq("id", logId);
    }
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

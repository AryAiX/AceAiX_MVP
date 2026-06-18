import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// ============================================================
// live-scores  —  AceAiX Sports Data Proxy
// ============================================================
// CONFIGURATION (set via Supabase Dashboard → Project Settings → Edge Functions → Secrets):
//
//   SPORTS_PROVIDER   "api-football"  (default, recommended — licensed)
//                     "three65"       (optional — see disclaimer below)
//                     "mock"          (development; no API key required)
//
//   SPORTS_API_KEY    Your provider API key. NEVER expose this to the browser.
//
// The frontend receives only the normalized Match[] schema below.
// To swap providers, change SPORTS_PROVIDER — the UI code never changes.
// ============================================================

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// ── Normalized schema ────────────────────────────────────────
interface Team {
  name: string;
  crest?: string;
  score?: number;
}

interface Match {
  id: string;
  sport: string;
  league: string;
  leagueLogo?: string;
  status: "live" | "upcoming" | "finished";
  minute?: number;
  startTime: string;
  home: Team;
  away: Team;
}

// ── In-memory cache (persists across warm requests) ──────────
interface Cache {
  data: Match[];
  timestamp: number;
  provider: string;
}
let _cache: Cache | null = null;
const CACHE_TTL_MS = 25_000; // 25 seconds

// ── Adapter interface ────────────────────────────────────────
interface MatchAdapter {
  getMatches(): Promise<Match[]>;
}

// ─────────────────────────────────────────────────────────────
// ADAPTER 1: API-Football (api-sports.io) — RECOMMENDED
// Docs:  https://www.api-football.com/documentation-v3
// Plan:  Free tier = 100 req/day; Pro = unlimited
// Key:   x-apisports-key header
// ─────────────────────────────────────────────────────────────
class ApiFootballAdapter implements MatchAdapter {
  private readonly baseUrl = "https://v3.football.api-sports.io";
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private statusMap(short: string): "live" | "upcoming" | "finished" {
    const LIVE_STATUSES     = new Set(["1H","HT","2H","ET","BT","P","SUSP","INT","LIVE"]);
    const FINISHED_STATUSES = new Set(["FT","AET","PEN","PST","CANC","ABD","AWD","WO"]);
    if (LIVE_STATUSES.has(short))     return "live";
    if (FINISHED_STATUSES.has(short)) return "finished";
    return "upcoming"; // NS = Not Started
  }

  async getMatches(): Promise<Match[]> {
    const today = new Date().toISOString().slice(0, 10);

    // Fetch today's fixtures + live fixtures in parallel
    const [todayRes, liveRes] = await Promise.all([
      fetch(`${this.baseUrl}/fixtures?date=${today}&timezone=Asia/Dubai`, {
        headers: { "x-apisports-key": this.apiKey },
      }),
      fetch(`${this.baseUrl}/fixtures?live=all`, {
        headers: { "x-apisports-key": this.apiKey },
      }),
    ]);

    const [todayJson, liveJson] = await Promise.all([
      todayRes.json(),
      liveRes.json(),
    ]);

    // Merge, deduplicate by fixture id
    const seen = new Set<number>();
    const raw: unknown[] = [];
    for (const item of [...(liveJson.response ?? []), ...(todayJson.response ?? [])]) {
      const id = (item as { fixture: { id: number } }).fixture.id;
      if (!seen.has(id)) { seen.add(id); raw.push(item); }
    }

    return raw.map((item) => {
      const r = item as {
        fixture: { id: number; date: string; status: { short: string; elapsed: number | null } };
        league: { name: string; logo: string };
        teams: { home: { name: string; logo: string }; away: { name: string; logo: string } };
        goals: { home: number | null; away: number | null };
      };
      const status = this.statusMap(r.fixture.status.short);
      return {
        id: String(r.fixture.id),
        sport: "Football",
        league: r.league.name,
        leagueLogo: r.league.logo,
        status,
        minute: r.fixture.status.elapsed ?? undefined,
        startTime: r.fixture.date,
        home: {
          name: r.teams.home.name,
          crest: r.teams.home.logo,
          score: r.goals.home ?? undefined,
        },
        away: {
          name: r.teams.away.name,
          crest: r.teams.away.logo,
          score: r.goals.away ?? undefined,
        },
      } as Match;
    });
  }
}

// ─────────────────────────────────────────────────────────────
// ADAPTER 2: 365Scores
// ⚠  DISCLAIMER: This adapter targets an UNDOCUMENTED, unofficial
//    endpoint of 365Scores. It is NOT officially licensed.
//    The endpoint may change or break without notice.
//    Use ONLY with a formal 365Scores data partnership agreement.
//    Included here as a reference implementation only.
// ─────────────────────────────────────────────────────────────
class Three65Adapter implements MatchAdapter {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private mapStatus(active: boolean, finished: boolean): "live" | "upcoming" | "finished" {
    if (finished) return "finished";
    if (active)   return "live";
    return "upcoming";
  }

  async getMatches(): Promise<Match[]> {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "/");

    // NOTE: This endpoint is unofficial and undocumented.
    const res = await fetch(
      `https://webws.365scores.com/web/games/?appTypeId=5&langId=1&timezoneName=Asia/Dubai&userCountryId=228&startDate=${today}&endDate=${today}`,
      {
        headers: {
          "x-365scores-api-key": this.apiKey,
          "User-Agent": "AceAiX/1.0",
        },
      }
    );

    if (!res.ok) throw new Error(`365Scores returned ${res.status}`);
    const json = await res.json() as {
      games?: Array<{
        id: number;
        statusText?: string;
        active?: boolean;
        isEnded?: boolean;
        startTime?: string;
        homeCompetitor?: { name: string; imagePath?: string; score?: number };
        awayCompetitor?: { name: string; imagePath?: string; score?: number };
        sport?: { name?: string };
        competition?: { name?: string; imagePath?: string };
        gameTimeDisplay?: string;
      }>;
    };

    return (json.games ?? []).map((g) => {
      const status = this.mapStatus(g.active ?? false, g.isEnded ?? false);
      // gameTimeDisplay is like "45'" or "67'" — parse the number
      const minuteStr = (g.gameTimeDisplay ?? "").replace(/[^0-9]/g, "");
      const minute = minuteStr ? parseInt(minuteStr, 10) : undefined;
      return {
        id: String(g.id),
        sport: g.sport?.name ?? "Sport",
        league: g.competition?.name ?? "League",
        leagueLogo: g.competition?.imagePath,
        status,
        minute,
        startTime: g.startTime ?? new Date().toISOString(),
        home: {
          name: g.homeCompetitor?.name ?? "Home",
          crest: g.homeCompetitor?.imagePath,
          score: g.homeCompetitor?.score,
        },
        away: {
          name: g.awayCompetitor?.name ?? "Away",
          crest: g.awayCompetitor?.imagePath,
          score: g.awayCompetitor?.score,
        },
      } as Match;
    });
  }
}

// ─────────────────────────────────────────────────────────────
// ADAPTER 3: Mock — used when SPORTS_PROVIDER="mock" or no key
// Returns realistic GCC + global football fixtures.
// ─────────────────────────────────────────────────────────────
function todayAt(h: number, m: number): string {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

class MockAdapter implements MatchAdapter {
  async getMatches(): Promise<Match[]> {
    // Minute randomized so it ticks each poll cycle
    const m1 = 55 + Math.floor(Math.random() * 10);
    const m2 = 28 + Math.floor(Math.random() * 10);
    const m3 = 74 + Math.floor(Math.random() * 5);
    const m4 = 12 + Math.floor(Math.random() * 8);
    return [
      {
        id: "mock-live-1",
        sport: "Football",
        league: "UAE Pro League",
        status: "live",
        minute: m1,
        startTime: todayAt(18, 0),
        home: { name: "Al Wasl FC",    score: 2 },
        away: { name: "Al Ain FC",     score: 1 },
      },
      {
        id: "mock-live-2",
        sport: "Football",
        league: "Saudi Pro League",
        status: "live",
        minute: m2,
        startTime: todayAt(18, 30),
        home: { name: "Al Hilal",  score: 1 },
        away: { name: "Al Nassr",  score: 1 },
      },
      {
        id: "mock-live-3",
        sport: "Football",
        league: "UEFA Champions League",
        status: "live",
        minute: m3,
        startTime: todayAt(19, 0),
        home: { name: "Real Madrid",     score: 2 },
        away: { name: "Manchester City", score: 2 },
      },
      {
        id: "mock-live-4",
        sport: "Basketball",
        league: "UAE Basketball League",
        status: "live",
        minute: m4,
        startTime: todayAt(19, 30),
        home: { name: "Dubai Knights",   score: 68 },
        away: { name: "Abu Dhabi Falcons", score: 61 },
      },
      {
        id: "mock-upcoming-1",
        sport: "Football",
        league: "Qatar Stars League",
        status: "upcoming",
        startTime: todayAt(20, 0),
        home: { name: "Al Sadd" },
        away: { name: "Al Duhail" },
      },
      {
        id: "mock-upcoming-2",
        sport: "Football",
        league: "Saudi Pro League",
        status: "upcoming",
        startTime: todayAt(21, 30),
        home: { name: "Al Ittihad" },
        away: { name: "Al Qadsiah" },
      },
      {
        id: "mock-upcoming-3",
        sport: "Football",
        league: "Premier League",
        status: "upcoming",
        startTime: todayAt(22, 0),
        home: { name: "Arsenal" },
        away: { name: "Tottenham" },
      },
      {
        id: "mock-finished-1",
        sport: "Football",
        league: "La Liga",
        status: "finished",
        startTime: todayAt(15, 0),
        home: { name: "Barcelona",        score: 3 },
        away: { name: "Atlético Madrid",  score: 1 },
      },
      {
        id: "mock-finished-2",
        sport: "Football",
        league: "AFC Champions League",
        status: "finished",
        startTime: todayAt(14, 30),
        home: { name: "Al Ahli",   score: 2 },
        away: { name: "Persepolis", score: 0 },
      },
    ];
  }
}

// ── Factory ──────────────────────────────────────────────────
function createAdapter(provider: string, apiKey: string): MatchAdapter {
  switch (provider) {
    case "api-football": return new ApiFootballAdapter(apiKey);
    case "three65":      return new Three65Adapter(apiKey);
    default:             return new MockAdapter();
  }
}

// ── Main handler ─────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const provider = Deno.env.get("SPORTS_PROVIDER") ?? "mock";
    const apiKey   = Deno.env.get("SPORTS_API_KEY")  ?? "";
    const cacheKey = `${provider}:${apiKey.slice(0, 8)}`;

    // Return cached result if fresh
    if (
      _cache &&
      _cache.provider === cacheKey &&
      Date.now() - _cache.timestamp < CACHE_TTL_MS
    ) {
      return new Response(
        JSON.stringify({
          matches: _cache.data,
          cachedAt: new Date(_cache.timestamp).toISOString(),
          provider,
          fromCache: true,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch fresh data
    const adapter = createAdapter(provider, apiKey);
    const matches = await adapter.getMatches();

    // Sort: live first, then upcoming (by time), then finished
    matches.sort((a, b) => {
      const rank = { live: 0, upcoming: 1, finished: 2 } as Record<string, number>;
      if (rank[a.status] !== rank[b.status]) return rank[a.status] - rank[b.status];
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });

    _cache = { data: matches, timestamp: Date.now(), provider: cacheKey };

    return new Response(
      JSON.stringify({
        matches,
        cachedAt: new Date(_cache.timestamp).toISOString(),
        provider,
        fromCache: false,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("live-scores error:", message);

    // Serve stale cache on error rather than a hard failure
    if (_cache) {
      return new Response(
        JSON.stringify({
          matches: _cache.data,
          cachedAt: new Date(_cache.timestamp).toISOString(),
          provider: "stale",
          fromCache: true,
          error: message,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: message, matches: [] }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

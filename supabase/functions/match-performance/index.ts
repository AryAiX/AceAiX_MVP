import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// ============================================================
// match-performance — AceAiX Verified Performance Ingestion
// ============================================================
// CONFIGURATION (Supabase secrets):
//   FOOTBALL_PROVIDER  "api-football" (default) | "opta" | "sportradar"
//   FOOTBALL_API_KEY   API key for the football provider
//
// IMPORTANT:
//   FIFA / UEFA / FIVB / UWW do NOT offer open per-player stats APIs.
//   Football data from api-football (api-sports.io) is the only openly
//   accessible licensed option. Opta and Sportradar require enterprise
//   agreements. Volleyball (FIVB) and Wrestling (UWW) feeds are not
//   publicly available; these sports always fall back to human verification.
//
//   This function NEVER fabricates stats. If no authoritative source
//   returns data for this player+match, it routes to the human-verification
//   fallback. Athletes can NEVER supply their own stats.
// ============================================================

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// ── Normalized performance schema ────────────────────────────
interface Performance {
  athleteId: string;
  participationId: string;
  fixtureId: string | null;
  sport: string;
  competition: string;
  source: string;
  sourceDisplay: string;
  verifiedAt: string;
  verifiedBy: string | null;
  verifierName: string | null;
  stats: Record<string, number | string>;
}

// ── Adapter interface ────────────────────────────────────────
interface PerformanceAdapter {
  getPlayerMatchStats(
    providerPlayerId: string,
    providerFixtureId: string
  ): Promise<Record<string, number | string> | null>;
}

// ─────────────────────────────────────────────────────────────
// ADAPTER: API-Football (api-sports.io)
// Docs:    https://www.api-football.com/documentation-v3
// Free:    100 req/day; Pro: unlimited
// ─────────────────────────────────────────────────────────────
class ApiFootballAdapter implements PerformanceAdapter {
  private readonly baseUrl = "https://v3.football.api-sports.io";
  constructor(private readonly apiKey: string) {}

  async getPlayerMatchStats(
    providerPlayerId: string,
    providerFixtureId: string
  ): Promise<Record<string, number | string> | null> {
    const res = await fetch(
      `${this.baseUrl}/fixtures/players?fixture=${providerFixtureId}&team=0`,
      { headers: { "x-apisports-key": this.apiKey } }
    );
    if (!res.ok) return null;

    const json = await res.json() as {
      response?: Array<{
        players: Array<{
          player: { id: number };
          statistics: Array<{
            games: { minutes: number | null; position: string | null; rating: string | null };
            goals: { total: number | null; assists: number | null };
            shots: { total: number | null; on: number | null };
            passes: { total: number | null; accuracy: string | null };
            tackles: { total: number | null };
            dribbles: { attempts: number | null; success: number | null };
            fouls: { drawn: number | null; committed: number | null };
            cards: { yellow: number | null; red: number | null };
          }>;
        }>;
      }>;
    };

    for (const team of json.response ?? []) {
      for (const p of team.players) {
        if (String(p.player.id) !== providerPlayerId) continue;
        const s = p.statistics[0];
        if (!s) return null;

        return {
          minutes:   s.games.minutes       ?? 0,
          position:  s.games.position      ?? "",
          rating:    parseFloat(s.games.rating ?? "0") || 0,
          goals:     s.goals.total         ?? 0,
          assists:   s.goals.assists       ?? 0,
          shots:     s.shots.total         ?? 0,
          shots_on_target: s.shots.on      ?? 0,
          passes:    s.passes.total        ?? 0,
          pass_accuracy: s.passes.accuracy ?? "0",
          tackles:   s.tackles.total       ?? 0,
          dribbles_attempted: s.dribbles.attempts ?? 0,
          dribbles_success:   s.dribbles.success  ?? 0,
          fouls_drawn:        s.fouls.drawn       ?? 0,
          fouls_committed:    s.fouls.committed   ?? 0,
          yellow_cards:       s.cards.yellow      ?? 0,
          red_cards:          s.cards.red         ?? 0,
        };
      }
    }
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// STUB: Opta (licensed enterprise feed)
// Requires formal Stats Perform / Opta commercial agreement.
// ─────────────────────────────────────────────────────────────
class OptaAdapter implements PerformanceAdapter {
  async getPlayerMatchStats(): Promise<null> {
    // TODO: implement when Opta enterprise license is in place.
    // Opta F9/F24 feed: https://www.statsperform.com/opta/
    console.warn("Opta adapter stub: requires enterprise license.");
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// STUB: Sportradar (licensed enterprise feed)
// Requires Sportradar commercial agreement.
// ─────────────────────────────────────────────────────────────
class SportradarAdapter implements PerformanceAdapter {
  async getPlayerMatchStats(): Promise<null> {
    // TODO: implement when Sportradar license is in place.
    // https://developer.sportradar.com/docs/read/football/Soccer_v4
    console.warn("Sportradar adapter stub: requires enterprise license.");
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// STUB: Volleyball (FIVB)
// FIVB does not offer a public per-player stats API.
// Official data requires a licensed FIVB data partnership.
// Falls through to human verification always.
// ─────────────────────────────────────────────────────────────
class VolleyballAdapter implements PerformanceAdapter {
  async getPlayerMatchStats(): Promise<null> {
    console.warn("Volleyball: FIVB has no open stats API. Routing to human verification.");
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// STUB: Wrestling (UWW)
// UWW does not offer a public per-athlete match stats API.
// ─────────────────────────────────────────────────────────────
class WrestlingAdapter implements PerformanceAdapter {
  async getPlayerMatchStats(): Promise<null> {
    console.warn("Wrestling: UWW has no open stats API. Routing to human verification.");
    return null;
  }
}

// ── Adapter factory ──────────────────────────────────────────
function getAdapter(sport: string): PerformanceAdapter {
  const footballProvider = Deno.env.get("FOOTBALL_PROVIDER") ?? "api-football";
  const footballKey      = Deno.env.get("FOOTBALL_API_KEY")  ?? "";

  if (sport.toLowerCase() === "football") {
    if (footballProvider === "opta")        return new OptaAdapter();
    if (footballProvider === "sportradar")  return new SportradarAdapter();
    return new ApiFootballAdapter(footballKey);
  }
  if (sport.toLowerCase() === "volleyball") return new VolleyballAdapter();
  if (sport.toLowerCase() === "wrestling")  return new WrestlingAdapter();

  // All other sports: no licensed open feed available → human verification
  return {
    async getPlayerMatchStats() {
      console.warn(`No stats adapter for sport: ${sport}. Routing to human verification.`);
      return null;
    },
  };
}

// ── Main handler ─────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl      = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey   = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // Service-role client bypasses RLS — required for writing to performances
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const { participationId } = await req.json() as { participationId: string };
    if (!participationId) throw new Error("participationId is required");

    // 1. Fetch the participation record
    const { data: part, error: partErr } = await admin
      .from("participations")
      .select("id, athlete_id, fixture_id, sport, competition_name")
      .eq("id", participationId)
      .single();
    if (partErr || !part) throw new Error(`Participation not found: ${participationId}`);

    // 2. Look up provider_player_id for this athlete + sport
    const { data: mapping } = await admin
      .from("provider_player_mappings")
      .select("provider_player_id, provider")
      .eq("athlete_id", part.athlete_id)
      .eq("sport", part.sport)
      .maybeSingle();

    // 3. Look up provider_fixture_id for this fixture
    let providerFixtureId: string | null = null;
    if (part.fixture_id) {
      const { data: fix } = await admin
        .from("fixtures")
        .select("external_ids")
        .eq("id", part.fixture_id)
        .maybeSingle();

      if (fix?.external_ids) {
        const provider = mapping?.provider ?? "api-football";
        providerFixtureId = fix.external_ids[provider] ?? null;
      }
    }

    // 4. Attempt automated fetch if both IDs are resolved
    let statsData: Record<string, number | string> | null = null;
    let source = "pending";
    let sourceDisplay = "Awaiting verification";

    if (mapping?.provider_player_id && providerFixtureId) {
      const adapter = getAdapter(part.sport);
      statsData = await adapter.getPlayerMatchStats(
        mapping.provider_player_id,
        providerFixtureId
      );
      if (statsData) {
        source        = mapping.provider ?? "api-football";
        sourceDisplay = `Official — ${mapping.provider ?? "API-Football"}`;
      }
    }

    if (statsData) {
      // 5a. Write verified performance record (service role, bypasses RLS)
      await admin.from("performances").insert({
        participation_id: participationId,
        athlete_id:       part.athlete_id,
        fixture_id:       part.fixture_id,
        sport:            part.sport,
        competition:      part.competition_name,
        source,
        source_display:   sourceDisplay,
        verified_at:      new Date().toISOString(),
        stats:            statsData,
        version:          1,
        is_latest:        true,
      });

      // Update participation status to "verified"
      await admin
        .from("participations")
        .update({ status: "verified", verified_at: new Date().toISOString() })
        .eq("id", participationId);

      return new Response(
        JSON.stringify({ success: true, status: "verified", source }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // 5b. Fallback: create a verification_request for the club/coach
      // Participation remains "pending_verification"
      await admin.from("verification_requests").insert({
        participation_id: participationId,
        athlete_id:       part.athlete_id,
        requested_to:     null, // null = broadcast to any linked club/coach
        status:           "pending",
        notes:            `Automated stats not available for ${part.sport} — awaiting club/coach confirmation.`,
      });

      return new Response(
        JSON.stringify({ success: true, status: "pending_verification", source: "human_required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("match-performance error:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

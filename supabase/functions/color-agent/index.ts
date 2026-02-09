import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ColorValues {
  rgb: { r: number; g: number; b: number };
  hex: string;
  hsl: { h: number; s: number; l: number };
  lab: { l: number; a: number; b: number };
}

interface EngineeringMetrics {
  lightness: number;
  saturation: number;
  temperature: string;
  seasonalTendency: string;
  season12: string;
  seasonMatch?: {
    primaryMatch?: { season: string; confidence: number };
    secondaryMatch?: { season: string; confidence: number };
    reason?: string;
  };
}

interface ColorAgentRequest {
  color: ColorValues;
  metrics: EngineeringMetrics;
  colorSwatchImage?: string;
}

// Canonical 12-season IDs — ONLY these are valid. All AI output must be normalized to this form.
const SEASON12_IDS = [
  "spring-light", "spring-true", "spring-bright",
  "summer-light", "summer-true", "summer-soft",
  "autumn-soft", "autumn-true", "autumn-deep",
  "winter-bright", "winter-true", "winter-deep",
] as const;

const SEASON12_IDS_STR = SEASON12_IDS.join(", ");

const DISPLAY_TO_ID: Record<string, string> = {
  "Light Spring": "spring-light", "True Spring": "spring-true", "Bright Spring": "spring-bright",
  "Light Summer": "summer-light", "True Summer": "summer-true", "Soft Summer": "summer-soft",
  "Soft Autumn": "autumn-soft", "True Autumn": "autumn-true", "Deep Autumn": "autumn-deep",
  "Bright Winter": "winter-bright", "True Winter": "winter-true", "Deep Winter": "winter-deep",
};

function normalizeToSeason12(raw: string | undefined, labL?: number): string {
  if (!raw || typeof raw !== "string") return "winter-deep";
  const trimmed = raw.trim();
  if (SEASON12_IDS.includes(trimmed as any)) return trimmed;
  const fromDisplay = DISPLAY_TO_ID[trimmed];
  if (fromDisplay) return fromDisplay;
  const key = Object.keys(DISPLAY_TO_ID).find((k) => k.toLowerCase() === trimmed.toLowerCase());
  if (key) return DISPLAY_TO_ID[key];
  const L = labL ?? 50;
  const lower = trimmed.toLowerCase();
  if (lower === "spring") return L >= 78 ? "spring-light" : L >= 65 ? "spring-true" : "spring-bright";
  if (lower === "summer") return L >= 78 ? "summer-light" : L >= 55 ? "summer-true" : "summer-soft";
  if (lower === "autumn") return L <= 45 ? "autumn-deep" : L >= 65 ? "autumn-true" : "autumn-soft";
  if (lower === "winter") return L <= 45 ? "winter-deep" : L >= 65 ? "winter-bright" : "winter-true";
  return "winter-deep";
}

function temperatureFromSeason(season: string): "warm" | "cool" | "neutral" | "neutral-warm" | "neutral-cool" {
  const family = season.split("-")[0];
  if (family === "spring" || family === "autumn") return "warm";
  if (family === "summer" || family === "winter") return "cool";
  return "neutral";
}

function ensureCanonicalAgentResult(r: { primarySeason: string; secondarySeason?: string; confidencePct?: number; temperature?: string } | null, labL?: number) {
  if (!r) return r;
  return {
    ...r,
    primarySeason: normalizeToSeason12(r.primarySeason, labL),
    secondarySeason: r.secondarySeason ? normalizeToSeason12(r.secondarySeason, labL) : undefined,
    temperature: r.temperature || temperatureFromSeason(normalizeToSeason12(r.primarySeason, labL)),
  };
}

function ensureCanonicalFirstAiResult(r: { primarySeason: string; similarSeasons?: string[] } | null, labL?: number) {
  if (!r) return r;
  return {
    ...r,
    primarySeason: normalizeToSeason12(r.primarySeason, labL),
    similarSeasons: (r.similarSeasons || []).map((s) => normalizeToSeason12(s, labL)),
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const requestId = crypto.randomUUID();
  const logPrefix = `[${requestId}]`;

  try {
    const { color, metrics, colorSwatchImage } = await req.json() as ColorAgentRequest;
    const cacheKey = "#" + (color?.hex || "").replace(/^#/, "").toUpperCase();
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = (supabaseUrl && supabaseServiceKey)
      ? createClient(supabaseUrl, supabaseServiceKey)
      : null;

    const engineeringResult = metrics ? { season12: normalizeToSeason12(metrics.season12 || "winter-deep", color?.lab?.l), temperature: metrics.temperature || "neutral" } : null;

    let firstAiResult: { primarySeason: string; similarSeasons: string[]; shortExplanation: string } | null = null;
    let agentFinalResult: { primarySeason: string; secondarySeason?: string; confidencePct: number; temperature: string } | null = null;
    let reportToHumanCount = 0;

    if (supabase) {
      const { data: cached } = await supabase
        .from("color_ai_cache")
        .select("first_ai_result, agent_final_result, engineering_result, report_to_human_count")
        .eq("color_hex", cacheKey)
        .maybeSingle();

      if (cached?.agent_final_result) {
        reportToHumanCount = cached.report_to_human_count ?? 0;
        const canonical = ensureCanonicalAgentResult(cached.agent_final_result as any, color?.lab?.l);
        const engRes = cached.engineering_result ?? engineeringResult;
        const engResCanonical = engRes && typeof engRes.season12 === "string"
          ? { ...engRes, season12: normalizeToSeason12(engRes.season12, color?.lab?.l) }
          : engRes;
        return new Response(
          JSON.stringify({
            ...canonical,
            engineeringResult: engResCanonical,
            reportToHumanCount,
            fromCache: true,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const rawFirst = cached?.first_ai_result as any;
      firstAiResult = rawFirst ? ensureCanonicalFirstAiResult(rawFirst, color?.lab?.l) as any : null;
      reportToHumanCount = cached?.report_to_human_count ?? 0;
    }

    // Step 1: First AI (if not cached) — NO engineering result
    if (!firstAiResult) {
      const hasImage = !!(colorSwatchImage && colorSwatchImage.startsWith("data:image"));
      const firstAiPrompt = `You are a professional color analyst. Classify this SINGLE color into the 12-season system.

STRICT RULE: primarySeason12 and each similarSeasons item MUST be exactly one of these 12 IDs (lowercase, hyphenated):
${SEASON12_IDS_STR}

Do NOT use "Deep Winter", "Light Spring", or any display names. Use ONLY the IDs above.

Output JSON only:
{ "primarySeason12": "one-of-the-12-ids", "similarSeasons": ["id1","id2"], "confidence": 0.0, "why": ["..."] }

Color: Hex ${color.hex}, LAB L=${color.lab.l.toFixed(1)} a*=${color.lab.a.toFixed(1)} b*=${color.lab.b.toFixed(1)}`;

      const userContent = hasImage && colorSwatchImage
        ? [{ type: "image_url" as const, image_url: { url: colorSwatchImage } }, { type: "text" as const, text: firstAiPrompt }]
        : firstAiPrompt;

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            { role: "system", content: `Output valid JSON only. primarySeason12 and similarSeasons MUST use EXACTLY these 12 IDs: ${SEASON12_IDS_STR}. No display names like "Deep Winter".` },
            { role: "user", content: userContent },
          ],
          max_tokens: 400,
          temperature: 0.1,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error(`${logPrefix} First AI error:`, res.status, errText);
        return new Response(
          JSON.stringify({ error: `AI error: ${res.status}` }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const aiJson = await res.json();
      const raw = aiJson.choices?.[0]?.message?.content?.trim() || "";
      const cleaned = raw.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
      try {
        const obj = JSON.parse(cleaned);
        const primaryRaw = obj.primarySeason12 ?? obj.primarySeason;
        const primary = normalizeToSeason12(primaryRaw, color?.lab?.l);
        const similar = (Array.isArray(obj.similarSeasons) ? obj.similarSeasons : []).slice(0, 2).map((s: string) => normalizeToSeason12(s, color?.lab?.l));
        const why = Array.isArray(obj.why) ? obj.why : [];
        firstAiResult = {
          primarySeason: primary,
          similarSeasons: similar,
          shortExplanation: why.length ? why.join(" ").trim() : (obj.shortExplanation || "No explanation"),
        };
      } catch {
        firstAiResult = {
          primarySeason: normalizeToSeason12(raw, color?.lab?.l),
          similarSeasons: [],
          shortExplanation: "First AI classification",
        };
      }

      if (supabase) {
        await supabase.from("color_ai_cache").upsert({
          color_hex: cacheKey,
          ai_result: firstAiResult,
          first_ai_result: firstAiResult,
          engineering_result: engineeringResult,
          total_queries_count: 1,
          report_to_human_count: 0,
          ai_api_calls_count: 1,
        }, { onConflict: "color_hex" });
      }
    }

    // Step 2: Arbitrator — receives engineering + first AI + color
    const engPrimary = metrics?.season12 || metrics?.seasonMatch?.primaryMatch?.season || "winter-deep";
    const engSecondary = metrics?.seasonMatch?.secondaryMatch?.season;
    const engSummary = `Engineering algorithm: primary=${engPrimary}${engSecondary ? `, secondary=${engSecondary}` : ""}. Uses LAB lightness, chroma (C*), warmth (b* axis), 2-stage classification (4-season family then 3 subseasons).`;
    const firstAiSummary = `First AI (no engineering): primary=${firstAiResult!.primarySeason}, similar=${firstAiResult!.similarSeasons?.join(", ") || "none"}, explanation: ${firstAiResult!.shortExplanation}`;

    const arbPrompt = `You are a master color analyst. Two sources analyzed this color:
1) ${engSummary}
2) ${firstAiSummary}

Color: Hex ${color.hex}, LAB L=${color.lab.l.toFixed(1)} a*=${color.lab.a.toFixed(1)} b*=${color.lab.b.toFixed(1)}.

Decide the SINGLE final conclusion.

STRICT: primarySeason12 and secondarySeason12 (if not null) MUST be exactly one of: ${SEASON12_IDS_STR}
Do NOT use display names. Use ONLY the hyphenated IDs above.

Output JSON only:
{
  "primarySeason12": "one-of-the-12-ids",
  "secondarySeason12": "id-or-null",
  "confidencePct": 0-100
}`;

    const arbRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: `Output valid JSON only. primarySeason12 and secondarySeason12 MUST be exactly one of: ${SEASON12_IDS_STR}. No other format.` },
          { role: "user", content: arbPrompt },
        ],
        max_tokens: 200,
        temperature: 0.05,
      }),
    });

    if (!arbRes.ok) {
      const errText = await arbRes.text();
      console.error(`${logPrefix} Arbitrator error:`, arbRes.status, errText);
      return new Response(
        JSON.stringify({ error: `Arbitrator error: ${arbRes.status}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const arbJson = await arbRes.json();
    const arbRaw = arbJson.choices?.[0]?.message?.content?.trim() || "";
    const arbCleaned = arbRaw.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
    let primarySeason = engPrimary;
    let secondarySeason: string | undefined;
    let confidencePct = 85;

    try {
      const arbObj = JSON.parse(arbCleaned);
      primarySeason = normalizeToSeason12(arbObj.primarySeason12 ?? arbObj.primarySeason, color?.lab?.l);
      const sec = arbObj.secondarySeason12 ?? arbObj.secondarySeason;
      secondarySeason = sec ? normalizeToSeason12(sec, color?.lab?.l) : undefined;
      if (typeof arbObj.confidencePct === "number") confidencePct = Math.min(100, Math.max(0, arbObj.confidencePct));
    } catch {
      primarySeason = normalizeToSeason12(primarySeason, color?.lab?.l);
    }

    const temperature = temperatureFromSeason(primarySeason);
    agentFinalResult = {
      primarySeason,
      secondarySeason: secondarySeason || undefined,
      confidencePct,
      temperature,
    };

    if (supabase) {
      const { data: existing } = await supabase.from("color_ai_cache").select("color_hex").eq("color_hex", cacheKey).maybeSingle();
      if (existing) {
        await supabase.from("color_ai_cache").update({
          agent_final_result: agentFinalResult,
          ai_result: agentFinalResult,
          engineering_result: engineeringResult,
        }).eq("color_hex", cacheKey);
      } else {
        await supabase.from("color_ai_cache").upsert({
          color_hex: cacheKey,
          first_ai_result: firstAiResult,
          agent_final_result: agentFinalResult,
          engineering_result: engineeringResult,
          ai_result: agentFinalResult,
          total_queries_count: 1,
          report_to_human_count: reportToHumanCount,
          ai_api_calls_count: 1,
        }, { onConflict: "color_hex" });
      }
    }

    return new Response(
      JSON.stringify({
        ...agentFinalResult,
        engineeringResult: engineeringResult ?? { season12: engPrimary, temperature: metrics?.temperature || "neutral" },
        reportToHumanCount,
        fromCache: false,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(`${logPrefix} color-agent error:`, error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

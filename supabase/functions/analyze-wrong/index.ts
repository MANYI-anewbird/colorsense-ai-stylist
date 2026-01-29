import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface ColorValues {
  rgb: { r: number; g: number; b: number };
  hex: string;
  hsl: { h: number; s: number; l: number };
  lab: { l: number; a: number; b: number };
}

interface ColorMetrics {
  lightness: number;
  saturation: number;
  temperature: 'warm' | 'cool' | 'neutral' | 'neutral-warm' | 'neutral-cool';
  seasonalTendency: 'spring' | 'summer' | 'autumn' | 'winter';
  season12?: string;
  confidence?: number;
}

interface AnalyzeWrongRequest {
  color: ColorValues;
  metrics: ColorMetrics;
  userConcern?: string; // Optional user feedback about what seems wrong
  /** Optional: data URL of a solid color swatch image (e.g. data:image/png;base64,...) for vision-based analysis */
  colorSwatchImage?: string;
}

const seasonDescriptions = {
  spring: 'Spring colors are warm, light, and fresh with high clarity',
  summer: 'Summer colors are cool, soft, and muted with gentle undertones',
  autumn: 'Autumn colors are warm, deep, and rich with earthy undertones',
  winter: 'Winter colors are cool, deep, and high-contrast with clarity',
};

const temperatureDescriptions: Record<string, string> = {
  warm: 'warm undertones with red, orange, or yellow influences',
  cool: 'cool undertones with blue or purple influences',
  neutral: 'balanced undertones without strong warm or cool bias',
  'neutral-warm': 'neutral undertones with a slight warm lean toward red, orange, or yellow',
  'neutral-cool': 'neutral undertones with a slight cool lean toward blue or purple',
};

serve(async (req) => {
  // Log function invocation immediately with more details
  const requestId = crypto.randomUUID();
  console.log(`[${new Date().toISOString()}] [${requestId}] Function invoked: ${req.method} ${req.url}`);
  console.log(`[${requestId}] Request headers:`, Object.fromEntries(req.headers.entries()));
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`[${requestId}] Handling OPTIONS preflight request`);
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }
  
  // Add request ID to all subsequent logs for tracing
  const logPrefix = `[${requestId}]`;

  try {
    console.log(`${logPrefix} Parsing request body...`);
    const { color, metrics, userConcern, colorSwatchImage } = await req.json() as AnalyzeWrongRequest;
    console.log(`${logPrefix} Request parsed successfully, color:`, color.hex, "hasImage:", !!colorSwatchImage);

    const hasImage = !!(colorSwatchImage && colorSwatchImage.startsWith("data:image"));

    const cacheKey = "#" + (color.hex || "").replace(/^#/, "").toUpperCase();
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { data: cached, error: cacheErr } = await supabase
        .from("color_ai_cache")
        .select("ai_result, total_queries_count, report_to_human_count, ai_api_calls_count")
        .eq("color_hex", cacheKey)
        .maybeSingle();
      if (!cacheErr && cached?.ai_result) {
        const { data: updated } = await supabase
          .from("color_ai_cache")
          .update({
            total_queries_count: (cached.total_queries_count ?? 0) + 1,
          })
          .eq("color_hex", cacheKey)
          .select("total_queries_count, report_to_human_count, ai_api_calls_count")
          .single();
        const totalQueries = updated?.total_queries_count ?? (cached.total_queries_count ?? 0) + 1;
        const reportToHuman = updated?.report_to_human_count ?? cached.report_to_human_count ?? 0;
        const aiApiCalls = updated?.ai_api_calls_count ?? cached.ai_api_calls_count ?? 0;
        console.log(`${logPrefix} Cache hit for ${cacheKey}, returning stored result`);
        return new Response(
          JSON.stringify({
            color,
            metrics,
            correctedAnalysis: null,
            aiReanalysis: cached.ai_result as { primarySeason: string; similarSeasons: string[]; shortExplanation: string },
            fromCache: true,
            totalQueriesCount: totalQueries,
            reportToHumanCount: reportToHuman,
            aiApiCallsCount: aiApiCalls,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      console.error(`${logPrefix} OPENAI_API_KEY is not configured in Supabase Secrets`);
      throw new Error("OPENAI_API_KEY is not configured");
    }
    console.log(`${logPrefix} OPENAI_API_KEY is configured:`, OPENAI_API_KEY ? `sk-...${OPENAI_API_KEY.slice(-4)}` : "NOT FOUND");

    // Build the prompt for AI re-analysis — image-first, no algorithm metrics, low temperature
    const systemPrompt = `You are a professional color analyst using the STRICT 12-season system.

Scope: classify ONLY a SINGLE color swatch. Not a person analysis.

You MUST choose exactly ONE primary season from this exact list (use exact spelling):
Light Spring, True Spring, Bright Spring,
Light Summer, True Summer, Soft Summer,
Soft Autumn, True Autumn, Deep Autumn,
Deep Winter, True Winter, Bright Winter.

Do NOT output only Spring/Summer/Autumn/Winter.
Do NOT use numeric thresholds or formulas.
Rely primarily on the swatch image. Hex/RGB/LAB are reference only.

Think like a human expert: decide based on the visual impression of
(1) light vs deep, (2) muted vs clear, (3) warm vs cool.

Before answering, internally verify that your primarySeason12 is exactly one of the 12 allowed labels.

Output JSON only:
{
  "primarySeason12": "...",
  "similarSeasons": ["...", "..."],
  "confidence": 0.0,
  "why": ["...", "...", "..."]
}`;

    const userPrompt = hasImage
      ? `Classify this SINGLE color swatch into the 12-season system. Return JSON only.

Hex (reference only): ${color.hex}
RGB: (${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})
LAB: L=${color.lab.l.toFixed(1)}, a*=${color.lab.a.toFixed(1)}, b*=${color.lab.b.toFixed(1)}
${userConcern ? `\nUser note: ${userConcern}` : ''}`
      : `No image is available; use hex as best-effort. Classify this SINGLE color swatch into the 12-season system. Return JSON only.

Hex (reference only): ${color.hex}
RGB: (${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})
LAB: L=${color.lab.l.toFixed(1)}, a*=${color.lab.a.toFixed(1)}, b*=${color.lab.b.toFixed(1)}
${userConcern ? `\nUser note: ${userConcern}` : ''}`;

    const userContent: string | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }> =
      hasImage && colorSwatchImage
        ? [
            { type: "image_url" as const, image_url: { url: colorSwatchImage } },
            { type: "text" as const, text: userPrompt },
          ]
        : userPrompt;

    // Retry logic with exponential backoff for rate limits
    const MAX_RETRIES = 2;
    const INITIAL_DELAY = 5000; // 5 seconds - increased for OpenAI rate limits
    let response: Response | null = null;
    let lastError: any = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      try {
        console.log(`${logPrefix} [Attempt ${attempt + 1}/${MAX_RETRIES + 1}] Calling OpenAI API...`);
        response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userContent },
            ],
            max_tokens: 800,
            temperature: 0.1,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        console.log(`${logPrefix} [Attempt ${attempt + 1}] OpenAI API response status: ${response.status}`);

        // If successful or non-retryable error, break the loop
        if (response.ok || (response.status !== 429 && response.status !== 500 && response.status !== 502 && response.status !== 503)) {
          break;
        }

        // If rate limited and we have retries left, wait and retry
        if (response.status === 429 && attempt < MAX_RETRIES) {
          const delay = INITIAL_DELAY * Math.pow(2, attempt); // Exponential backoff: 5s, 10s
          const retryAfter = response.headers.get('retry-after');
          // Use retry-after if provided, otherwise use exponential backoff with minimum 10 seconds
          const waitTime = retryAfter 
            ? Math.max(parseInt(retryAfter) * 1000, 10000) // At least 10 seconds if retry-after is provided
            : Math.max(delay, 10000); // At least 10 seconds for exponential backoff
          
          console.log(`${logPrefix} Rate limited, retrying after ${waitTime}ms (attempt ${attempt + 1}/${MAX_RETRIES + 1})`);
          console.log(`${logPrefix} Retry-After header: ${retryAfter || 'not provided'}`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }

        // If server error and we have retries left, wait and retry
        if ((response.status === 500 || response.status === 502 || response.status === 503) && attempt < MAX_RETRIES) {
          const delay = INITIAL_DELAY * Math.pow(2, attempt);
          console.log(`Server error, retrying after ${delay}ms (attempt ${attempt + 1}/${MAX_RETRIES + 1})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        break; // No more retries or non-retryable error
      } catch (fetchError) {
        clearTimeout(timeoutId);
        lastError = fetchError;
        
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          console.error("OpenAI API request timeout after 15 seconds");
          return new Response(
            JSON.stringify({ error: "Request timeout. The AI service is taking too long to respond. Please try again." }),
            { status: 504, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // If network error and we have retries left, wait and retry
        if (attempt < MAX_RETRIES) {
          const delay = INITIAL_DELAY * Math.pow(2, attempt);
          console.log(`Network error, retrying after ${delay}ms (attempt ${attempt + 1}/${MAX_RETRIES + 1})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        throw fetchError;
      }
    }

    if (!response || !response.ok) {
      const errorText = response ? await response.text() : (lastError?.message || "Unknown error");
      console.error("AI gateway error:", {
        status: response?.status || "no response",
        statusText: response?.statusText,
        errorText: errorText.substring(0, 500), // Limit log size
        headers: response ? Object.fromEntries(response.headers.entries()) : null,
        attempt: MAX_RETRIES + 1
      });
      
      if (response?.status === 429) {
        // Try to parse OpenAI's error response for more details
        let errorDetails = "Rate limit exceeded";
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.error?.message) {
            errorDetails = errorJson.error.message;
          }
          if (errorJson.error?.type) {
            errorDetails += ` (${errorJson.error.type})`;
          }
        } catch (e) {
          // If parsing fails, use the raw error text
          errorDetails = errorText.substring(0, 200);
        }
        
        const retryAfter = response.headers.get('retry-after');
        console.error("OpenAI rate limit details:", {
          errorDetails,
          retryAfter,
          rateLimitType: response.headers.get('x-ratelimit-limit'),
          rateLimitRemaining: response.headers.get('x-ratelimit-remaining'),
          rateLimitReset: response.headers.get('x-ratelimit-reset'),
        });
        
        return new Response(
          JSON.stringify({ 
            error: `OpenAI API rate limit exceeded: ${errorDetails}. Please wait ${retryAfter || 'a few'} seconds and try again.`,
            retryAfter: retryAfter || null,
            details: errorDetails
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response?.status === 401) {
        return new Response(
          JSON.stringify({ error: "Invalid API key. Please check your OpenAI API key." }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response?.status === 402 || response?.status === 403) {
        return new Response(
          JSON.stringify({ error: "API access denied. Please check your OpenAI account and billing." }),
          { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error("AI gateway error");
    }

    const aiResponse = await response.json();
    const rawContent = aiResponse.choices?.[0]?.message?.content?.trim() || "";

    // Try to parse structured JSON (primarySeason12 + why, or legacy primarySeason + shortExplanation)
    let parsed: { primarySeason?: string; similarSeasons?: string[]; shortExplanation?: string } | null = null;
    try {
      const cleaned = rawContent.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
      const obj = JSON.parse(cleaned);
      const primary = (obj.primarySeason12 ?? obj.primarySeason) as string | undefined;
      if (obj && typeof primary === "string") {
        const similar = Array.isArray(obj.similarSeasons) ? obj.similarSeasons.slice(0, 2) : [];
        const whyArr = Array.isArray(obj.why) ? obj.why : [];
        const shortExplanation =
          whyArr.length > 0
            ? whyArr.join(" ").trim()
            : (typeof obj.shortExplanation === "string" ? obj.shortExplanation : "");
        parsed = {
          primarySeason: primary,
          similarSeasons: similar,
          shortExplanation: shortExplanation || "No explanation provided.",
        };
      }
    } catch (_e) {
      // Keep parsed null, fall back to raw text
    }

    const totalQueriesCount = 1;
    const reportToHumanCount = 0;
    const aiApiCallsCount = 1;
    if (parsed && supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      await supabase.from("color_ai_cache").upsert(
        { color_hex: cacheKey, ai_result: parsed, total_queries_count: totalQueriesCount, report_to_human_count: reportToHumanCount, ai_api_calls_count: aiApiCallsCount },
        { onConflict: "color_hex" }
      );
      console.log(`${logPrefix} Cached AI result for ${cacheKey}`);
    }

    return new Response(
      JSON.stringify({
        color,
        metrics,
        correctedAnalysis: parsed ? null : rawContent,
        aiReanalysis: parsed,
        fromCache: false,
        totalQueriesCount,
        reportToHumanCount,
        aiApiCallsCount,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("analyze-wrong error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    // Log detailed error for debugging
    console.error("Error details:", {
      message: errorMessage,
      stack: errorStack,
      timestamp: new Date().toISOString(),
    });
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        correctedAnalysis: "We couldn't generate an AI re-analysis at this time. Please try again later or contact support."
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

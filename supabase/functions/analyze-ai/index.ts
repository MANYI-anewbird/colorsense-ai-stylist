import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyzeAIRequest {
  user_season: string; // e.g., "Light Spring", "Cool Summer", etc.
  color_hex: string;
  color_hsl: { h: number; s: number; l: number };
  rule_score: number;
  breakdown: {
    temperature: number;
    season: number;
    brightness: number;
    saturation: number;
  };
}

interface AIResponse {
  delta: number;
  insight: string;
  advice: string;
}

// In-memory rate limiting (simple per-IP tracking)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests per minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
}

function getClientIP(req: Request): string {
  // Try to get real IP from headers (if behind proxy)
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIP = req.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  // Fallback to a default (not ideal but works)
  return 'unknown';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Rate limiting
    const clientIP = getClientIP(req);
    if (!checkRateLimit(clientIP)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again in a minute.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: AnalyzeAIRequest = await req.json();

    // Validate input
    if (!body.user_season || !body.color_hex || !body.color_hsl || typeof body.rule_score !== 'number') {
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not configured");
      return new Response(
        JSON.stringify({ 
          error: "AI service unavailable",
          fallback: true,
          delta: 0,
          insight: "AI analysis is currently unavailable. Showing base score.",
          advice: "Consider the rule-based score as a general guideline."
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build the system prompt - strict JSON output requirement
    const systemPrompt = `You are an expert color stylist analyzing color compatibility with skin tones using the 12-season color theory.

CRITICAL RULES:
1. You MUST output ONLY valid JSON with this exact structure: {"delta": number, "insight": string, "advice": string}
2. "delta" is a conservative adjustment to the rule-based score, typically in range [-8, +8]
3. Only use larger adjustments (-15 to +15) if the rule score is clearly wrong
4. "insight" should be 1-2 sentences explaining your adjustment reasoning
5. "advice" should be 1 sentence with styling guidance
6. Do NOT output a final score - only the delta adjustment
7. Be conservative - prefer small adjustments unless there's a clear reason

The rule-based score already considers temperature, season, brightness, and saturation compatibility. Your role is to add subtle stylist perspective.`;

    const userPrompt = `Analyze this color match:

**User's Color Season:** ${body.user_season}
**Color:** ${body.color_hex} (HSL: ${body.color_hsl.h}°, ${body.color_hsl.s}%, ${body.color_hsl.l}%)

**Rule-Based Score:** ${body.rule_score}/100
**Score Breakdown:**
- Temperature match: ${body.breakdown.temperature} points
- Season match: ${body.breakdown.season} points
- Brightness match: ${body.breakdown.brightness} points
- Saturation match: ${body.breakdown.saturation} points

Provide a conservative delta adjustment and brief insight/advice. Output ONLY valid JSON.`;

    // Call OpenAI API with JSON mode
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    let response: Response;
    try {
      response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini", // Supports JSON mode and is cost-effective
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" }, // Force JSON output
          max_tokens: 200,
          temperature: 0.3, // Lower temperature for more deterministic output
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      
      // Return fallback response
      return new Response(
        JSON.stringify({
          error: "AI service temporarily unavailable",
          fallback: true,
          delta: 0,
          insight: "AI analysis is currently unavailable. Showing base score.",
          advice: "Consider the rule-based score as a general guideline.",
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse JSON response
    let aiData: AIResponse;
    try {
      aiData = JSON.parse(content);
    } catch (parseError) {
      console.error("Failed to parse AI JSON response:", parseError, content);
      // Return safe default
      aiData = {
        delta: 0,
        insight: "Unable to parse AI response. Showing base score.",
        advice: "Consider the rule-based score as a general guideline.",
      };
    }

    // Validate and clamp delta
    let delta = typeof aiData.delta === 'number' ? aiData.delta : 0;
    delta = Math.max(-15, Math.min(15, Math.round(delta))); // Clamp to [-15, 15]

    // Ensure strings exist
    const insight = typeof aiData.insight === 'string' && aiData.insight.trim()
      ? aiData.insight.trim()
      : "AI analysis completed.";
    const advice = typeof aiData.advice === 'string' && aiData.advice.trim()
      ? aiData.advice.trim()
      : "Consider this color for your wardrobe.";

    return new Response(
      JSON.stringify({
        delta,
        insight,
        advice,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error("analyze-ai error:", error);
    
    // Return fallback on any error
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        fallback: true,
        delta: 0,
        insight: "AI analysis is currently unavailable. Showing base score.",
        advice: "Consider the rule-based score as a general guideline.",
      }),
      {
        status: 200, // Return 200 with fallback data
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

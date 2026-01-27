import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
}

interface AnalyzeRequest {
  color: ColorValues;
  metrics: ColorMetrics;
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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { color, metrics } = await req.json() as AnalyzeRequest;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build the prompt for AI explanation
    const systemPrompt = `You are an expert fashion color consultant and stylist. Your role is to analyze clothing colors and provide friendly, professional advice about how colors work in fashion.

Be warm, encouraging, and use language that feels like a personal stylist speaking to their client. Keep responses concise but insightful (2-3 paragraphs max). 

Include:
1. A natural description of the color and its visual character
2. How this color feels emotionally and what it conveys in fashion
3. Specific styling suggestions - what colors pair well, what occasions suit this color, and any fashion tips

Never use overly technical jargon. Make it accessible and actionable.`;

    const userPrompt = `Analyze this clothing color:

**Color Values:**
- HEX: ${color.hex}
- RGB: (${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})
- HSL: ${color.hsl.h}°, ${color.hsl.s}%, ${color.hsl.l}%

**Analysis:**
- Lightness: ${metrics.lightness}% (0=darkest, 100=lightest)
- Saturation: ${metrics.saturation}% (0=grayest, 100=most vivid)
- Temperature: ${metrics.temperature} - ${temperatureDescriptions[metrics.temperature]}
- Seasonal tendency: ${metrics.seasonalTendency} - ${seasonDescriptions[metrics.seasonalTendency]}

Please provide a friendly, stylist-like explanation of this color, including what it conveys and how to style it in outfits.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted, please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error("AI gateway error");
    }

    const aiResponse = await response.json();
    const explanation = aiResponse.choices?.[0]?.message?.content || 
      "This is a beautiful color that would work well in many fashion contexts. Consider pairing it with neutral tones for a classic look, or with complementary colors for a bolder statement.";

    return new Response(
      JSON.stringify({
        color,
        metrics,
        explanation,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("analyze-color error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        explanation: "We couldn't generate an AI explanation at this time, but your color analysis is complete. This color has interesting properties that could work well in various fashion contexts."
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

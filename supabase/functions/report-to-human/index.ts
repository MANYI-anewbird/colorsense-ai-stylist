import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function normalizeHex(hex: string): string {
  return "#" + (hex || "").replace(/^#/, "").toUpperCase();
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

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response(
      JSON.stringify({ error: "Server configuration error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();
    const hex = body?.color?.hex ?? body?.hex;
    if (!hex) {
      return new Response(
        JSON.stringify({ error: "Missing color.hex or hex in body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cacheKey = normalizeHex(hex);
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: row, error: selectErr } = await supabase
      .from("color_ai_cache")
      .select("report_to_human_count")
      .eq("color_hex", cacheKey)
      .maybeSingle();

    if (selectErr) {
      return new Response(
        JSON.stringify({ error: selectErr.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let newCount: number;
    if (!row) {
      // No cache row (e.g. analyze-wrong upsert failed, or edge case). Insert a "report-only" row
      // so we never lose a "still wrong" click; ai_result is NOT NULL so use a placeholder.
      const placeholderResult = {
        primarySeason: "Pending",
        similarSeasons: [] as string[],
        shortExplanation: "Flagged for human review; no AI result cached yet.",
      };
      const { error: insertErr } = await supabase.from("color_ai_cache").insert({
        color_hex: cacheKey,
        ai_result: placeholderResult,
        report_to_human_count: 1,
      });
      if (insertErr) {
        return new Response(
          JSON.stringify({ error: insertErr.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      newCount = 1;
    } else {
      newCount = (row.report_to_human_count ?? 0) + 1;
      const { error: updateErr } = await supabase
        .from("color_ai_cache")
        .update({ report_to_human_count: newCount })
        .eq("color_hex", cacheKey);

      if (updateErr) {
        return new Response(
          JSON.stringify({ error: updateErr.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({ ok: true, reportToHumanCount: newCount }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

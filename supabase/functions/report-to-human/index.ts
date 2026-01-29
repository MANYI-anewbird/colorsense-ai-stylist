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

    const newCount = (row?.report_to_human_count ?? 0) + 1;
    await supabase
      .from("color_ai_cache")
      .update({ report_to_human_count: newCount })
      .eq("color_hex", cacheKey);

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

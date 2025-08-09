// PayOS Webhook handler - marks transactions as approved when payment is completed
// NOTE: For production, implement signature verification using PAYOS_CHECKSUM_KEY

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json", ...corsHeaders },
    ...init,
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    console.log("PayOS webhook payload:", body);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const orderCode = body?.data?.orderCode || body?.orderCode || body?.code;
    const status = body?.data?.status || body?.status;

    if (!orderCode) {
      return jsonResponse({ error: "Missing orderCode" }, { status: 400 });
    }

    // TODO: verify signature using PAYOS_CHECKSUM_KEY

    if (String(status).toUpperCase() === "PAID" || String(status).toUpperCase() === "SUCCESS") {
      // Update the corresponding transaction using orderCode stored in admin_note
      const { error } = await supabaseAdmin
        .from("transactions")
        .update({ status: "approved", approved_at: new Date().toISOString() })
        .ilike("admin_note", `%orderCode=${orderCode}%`);

      if (error) {
        console.error("Failed to update transaction:", error);
        return jsonResponse({ ok: false });
      }

      return jsonResponse({ ok: true });
    }

    // Non-success status; ignore or mark rejected if needed
    return jsonResponse({ ok: true, message: "Ignored status" });
  } catch (e) {
    console.error("Webhook error:", e);
    return jsonResponse({ error: "Internal Server Error" }, { status: 500 });
  }
});

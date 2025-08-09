// Create PayOS deposit order and corresponding transaction
// Note: Requires secrets PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY
// Optionally, you can set RECEIVER_BANK_CODE, RECEIVER_ACCOUNT_NUMBER, RECEIVER_ACCOUNT_NAME to build VietQR if PayOS response is unavailable

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

function randomOrderCode() {
  // PayOS orderCode is typically numeric
  const now = Date.now();
  const rand = Math.floor(Math.random() * 1000);
  return Number(`${now}${rand}`.slice(-12)); // 12-digit code
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: { Authorization: req.headers.get("Authorization") || "" },
      },
    });

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) {
      return jsonResponse({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, promotionCode } = await req.json();
    if (!amount || amount <= 0) {
      return jsonResponse({ error: "Số tiền không hợp lệ" }, { status: 400 });
    }

    const orderCode = randomOrderCode();
    const username = user.user_metadata?.username || user.email?.split("@")[0] || user.id.substring(0, 6);
    const description = `NAP ${orderCode} ${username}`;

    // Create pending transaction first (RLS ensures user_id matches auth uid)
    const adminNote = promotionCode
      ? `method=vietqr/payos; orderCode=${orderCode}; promo=${promotionCode}`
      : `method=vietqr/payos; orderCode=${orderCode}`;

    console.log("Creating transaction for user:", user.id, "amount:", amount);
    
    const { data: inserted, error: insertErr } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        type: "deposit",
        amount: amount,
        status: "pending",
        admin_note: adminNote,
      })
      .select("id")
      .maybeSingle();

    console.log("Transaction insert result:", { inserted, insertErr });

    if (insertErr || !inserted) {
      console.error("Transaction insert failed:", insertErr);
      return jsonResponse({ error: "Không thể tạo giao dịch", details: insertErr?.message }, { status: 500 });
    }

    const clientId = Deno.env.get("PAYOS_CLIENT_ID");
    const apiKey = Deno.env.get("PAYOS_API_KEY");
    const checksumKey = Deno.env.get("PAYOS_CHECKSUM_KEY");

    let bankCode = Deno.env.get("RECEIVER_BANK_CODE");
    let accountNumber = Deno.env.get("RECEIVER_ACCOUNT_NUMBER");
    let accountName = Deno.env.get("RECEIVER_ACCOUNT_NAME");

    // If PayOS keys are configured, attempt to create an order and prefer returned receiving info
    if (clientId && apiKey && checksumKey) {
      try {
        // NOTE: This is a minimal placeholder call structure. You may need to adapt to PayOS API specifics.
        const body = {
          orderCode,
          amount,
          description,
          returnUrl: `${SUPABASE_URL}/functions/v1/payos-webhook?type=return&orderCode=${orderCode}`,
          cancelUrl: `${SUPABASE_URL}/functions/v1/payos-webhook?type=cancel&orderCode=${orderCode}`,
        };

        const resp = await fetch("https://api.payos.com/v1/payment-requests", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-client-id": clientId,
            "x-api-key": apiKey,
          },
          body: JSON.stringify(body),
        });

        if (resp.ok) {
          const data = await resp.json();
          // Try to map PayOS response to receiving account info if available
          bankCode = data?.data?.bankCode || bankCode || undefined;
          accountNumber = data?.data?.accountNumber || accountNumber || undefined;
          accountName = data?.data?.accountName || accountName || undefined;
        } else {
          const errText = await resp.text();
          console.warn("PayOS create order failed:", errText);
        }
      } catch (e) {
        console.warn("PayOS request error:", e);
      }
    }

    return jsonResponse({
      ok: true,
      transactionId: inserted.id,
      orderCode,
      description,
      bankCode,
      accountNumber,
      accountName,
    });
  } catch (e) {
    console.error(e);
    return jsonResponse({ error: "Internal Server Error" }, { status: 500 });
  }
});

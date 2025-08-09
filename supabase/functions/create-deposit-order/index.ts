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
  console.log("=== CREATE DEPOSIT ORDER START ===");
  console.log("Method:", req.method);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    
    console.log("Environment check:", { 
      hasUrl: !!SUPABASE_URL, 
      hasKey: !!SUPABASE_ANON_KEY 
    });

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error("Missing environment variables");
      return jsonResponse({ error: "Server configuration error" }, { status: 500 });
    }

    const authHeader = req.headers.get("Authorization");
    console.log("Auth header present:", !!authHeader);

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: { Authorization: authHeader || "" },
      },
    });

    console.log("Getting user...");
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    
    console.log("User result:", { user: !!user, error: userErr });
    
    if (userErr || !user) {
      console.error("Auth error:", userErr);
      return jsonResponse({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Parsing request body...");
    let bodyData;
    try {
      bodyData = await req.json();
      console.log("Request body:", bodyData);
    } catch (e) {
      console.error("Failed to parse JSON:", e);
      return jsonResponse({ error: "Invalid JSON" }, { status: 400 });
    }

    const { amount, promotionCode } = bodyData;
    console.log("Extracted data:", { amount, promotionCode });
    
    if (!amount || amount <= 0) {
      console.error("Invalid amount:", amount);
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
    console.error("=== UNHANDLED ERROR ===");
    console.error("Error type:", e.constructor.name);
    console.error("Error message:", e.message);
    console.error("Error stack:", e.stack);
    console.error("=== END ERROR ===");
    return jsonResponse({ 
      error: "Internal Server Error", 
      details: e.message,
      type: e.constructor.name 
    }, { status: 500 });
  }
});

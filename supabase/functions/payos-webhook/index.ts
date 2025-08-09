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
    const PAYOS_CHECKSUM_KEY = Deno.env.get("PAYOS_CHECKSUM_KEY");
    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Verify PayOS signature for security
    if (PAYOS_CHECKSUM_KEY) {
      const signature = req.headers.get("x-payos-signature");
      if (signature) {
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
          "raw",
          encoder.encode(PAYOS_CHECKSUM_KEY),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign", "verify"]
        );
        
        const expectedSignature = await crypto.subtle.sign(
          "HMAC",
          key,
          encoder.encode(JSON.stringify(body))
        );
        
        const expectedSignatureHex = Array.from(new Uint8Array(expectedSignature))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
        
        if (signature !== expectedSignatureHex) {
          console.error("Invalid PayOS signature");
          return jsonResponse({ error: "Invalid signature" }, { status: 401 });
        }
        console.log("PayOS signature verified successfully");
      } else {
        console.warn("No PayOS signature provided");
      }
    } else {
      console.warn("PAYOS_CHECKSUM_KEY not configured - signature verification skipped");
    }

    const orderCode = body?.data?.orderCode || body?.orderCode || body?.code;
    const status = body?.data?.status || body?.status;

    if (!orderCode) {
      return jsonResponse({ error: "Missing orderCode" }, { status: 400 });
    }

    if (String(status).toUpperCase() === "PAID" || String(status).toUpperCase() === "SUCCESS") {
      console.log(`Processing successful payment for orderCode: ${orderCode}`);
      
      // First, get the transaction details
      const { data: transaction, error: fetchError } = await supabaseAdmin
        .from("transactions")
        .select("id, user_id, amount, status")
        .ilike("admin_note", `%orderCode=${orderCode}%`)
        .eq("status", "pending")
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching transaction:", fetchError);
        return jsonResponse({ ok: false, error: "Database error" }, { status: 500 });
      }

      if (!transaction) {
        console.log(`No pending transaction found for orderCode: ${orderCode}`);
        return jsonResponse({ ok: true, message: "Transaction not found or already processed" });
      }

      console.log(`Found pending transaction: ${transaction.id} for user: ${transaction.user_id}, amount: ${transaction.amount}`);

      // Update transaction status to approved - this will trigger existing database functions
      // The handle_deposit_approval trigger will automatically:
      // 1. Update user balance 
      // 2. Handle agent commissions
      // 3. Process referral bonuses
      const { error: updateError } = await supabaseAdmin
        .from("transactions")
        .update({ 
          status: "approved", 
          approved_at: new Date().toISOString() 
        })
        .eq("id", transaction.id);

      if (updateError) {
        console.error("Failed to update transaction status:", updateError);
        return jsonResponse({ ok: false, error: "Failed to update transaction" }, { status: 500 });
      }

      console.log(`✅ Successfully processed PayOS callback:`);
      console.log(`- Transaction ID: ${transaction.id}`);
      console.log(`- User ID: ${transaction.user_id}`);
      console.log(`- Amount: ${transaction.amount.toLocaleString()} VND`);
      console.log(`- OrderCode: ${orderCode}`);
      console.log(`- Status updated to: approved`);
      console.log(`- Database triggers will handle balance update and notifications`);

      return jsonResponse({ 
        ok: true, 
        message: "Payment processed successfully",
        transactionId: transaction.id,
        amount: transaction.amount,
        orderCode: orderCode,
        status: "approved"
      });
    }

    // Non-success status; ignore or mark rejected if needed
    return jsonResponse({ ok: true, message: "Ignored status" });
  } catch (e) {
    console.error("Webhook error:", e);
    return jsonResponse({ error: "Internal Server Error" }, { status: 500 });
  }
});

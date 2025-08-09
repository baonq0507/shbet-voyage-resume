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

async function verifyPayOSSignature(rawBody: string, signature: string, checksumKey: string): Promise<boolean> {
  try {
    // Verify PayOS webhook signature
    const encoder = new TextEncoder();
    const keyData = encoder.encode(checksumKey);
    const messageData = encoder.encode(rawBody);
    
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    
    const signatureBytes = new Uint8Array(
      signature.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
    );
    
    return await crypto.subtle.verify('HMAC', key, signatureBytes, messageData);
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

Deno.serve(async (req) => {
  console.log("=== PAYOS WEBHOOK START ===");
  console.log("Method:", req.method);
  console.log("URL:", req.url);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const PAYOS_CHECKSUM_KEY = Deno.env.get("PAYOS_CHECKSUM_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !PAYOS_CHECKSUM_KEY) {
      console.error("Missing environment variables");
      return jsonResponse({ error: "Server configuration error" }, { status: 500 });
    }

    // Create Supabase client with service role key for admin operations
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get raw body for signature verification
    const rawBody = await req.text();
    console.log("Raw webhook body:", rawBody);

    // Parse JSON
    let webhookData;
    try {
      webhookData = JSON.parse(rawBody);
    } catch (e) {
      console.error("Failed to parse webhook JSON:", e.message);
      return jsonResponse({ error: "Invalid JSON" }, { status: 400 });
    }

    console.log("Parsed webhook data:", webhookData);

    // Verify signature if provided
    const signature = req.headers.get("x-payos-signature");
    if (signature) {
      console.log("Verifying PayOS signature...");
      const isValid = await verifyPayOSSignature(rawBody, signature, PAYOS_CHECKSUM_KEY);
      if (!isValid) {
        console.error("Invalid PayOS signature");
        return jsonResponse({ error: "Invalid signature" }, { status: 401 });
      }
      console.log("Signature verified successfully");
    } else {
      console.warn("No signature provided in webhook");
    }

    // Extract payment information
    const { code, desc, data: paymentData } = webhookData;
    
    if (code === "00" && paymentData) {
      // Payment successful
      const { orderCode, amount, description, status } = paymentData;
      
      console.log("Processing successful payment:", {
        orderCode,
        amount,
        description,
        status
      });

      // Find transaction by orderCode in admin_note
      const { data: transactions, error: findError } = await supabase
        .from('transactions')
        .select('id, user_id, amount, status')
        .like('admin_note', `%orderCode=${orderCode}%`)
        .eq('type', 'deposit')
        .eq('status', 'awaiting_payment'); // Tìm giao dịch đang chờ thanh toán

      console.log("Found transactions:", transactions);
      console.log("Find error:", findError);

      if (findError) {
        console.error("Error finding transaction:", findError);
        return jsonResponse({ error: "Database error" }, { status: 500 });
      }

      if (!transactions || transactions.length === 0) {
        console.warn("No pending transaction found for orderCode:", orderCode);
        return jsonResponse({ 
          message: "No pending transaction found", 
          orderCode 
        }, { status: 404 });
      }

      const transaction = transactions[0];
      
      // Verify amount matches
      if (transaction.amount !== amount) {
        console.error("Amount mismatch:", {
          dbAmount: transaction.amount,
          payosAmount: amount
        });
        return jsonResponse({ error: "Amount mismatch" }, { status: 400 });
      }

      // Update transaction status to approved
      const { error: updateError } = await supabase
        .from('transactions')
        .update({ 
          status: 'approved',
          admin_note: `${transaction.admin_note || ''} | PayOS confirmed: ${new Date().toISOString()}`
        })
        .eq('id', transaction.id);

      if (updateError) {
        console.error("Error updating transaction:", updateError);
        return jsonResponse({ error: "Failed to update transaction" }, { status: 500 });
      }

      console.log("✅ Transaction updated successfully:", transaction.id);
      
      return jsonResponse({ 
        message: "Webhook processed successfully",
        transactionId: transaction.id,
        orderCode
      });

    } else {
      console.log("Payment not successful or missing data:", { code, desc, paymentData });
      
      // Handle failed payments if needed
      if (paymentData?.orderCode) {
        const { data: transactions } = await supabase
          .from('transactions')
          .select('id')
          .like('admin_note', `%orderCode=${paymentData.orderCode}%`)
          .eq('type', 'deposit')
          .eq('status', 'awaiting_payment'); // Tìm giao dịch đang chờ thanh toán

        if (transactions && transactions.length > 0) {
          await supabase
            .from('transactions')
            .update({ 
              status: 'rejected',
              admin_note: `PayOS failed: ${desc} | ${new Date().toISOString()}`
            })
            .eq('id', transactions[0].id);
          
          console.log("Transaction marked as failed:", transactions[0].id);
        }
      }
      
      return jsonResponse({ 
        message: "Payment not successful",
        code,
        desc
      });
    }

  } catch (error) {
    console.error("=== WEBHOOK ERROR ===");
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("=== END ERROR ===");
    
    return jsonResponse({ 
      error: "Internal Server Error", 
      details: error.message,
      type: error.constructor.name 
    }, { status: 500 });
  }
});
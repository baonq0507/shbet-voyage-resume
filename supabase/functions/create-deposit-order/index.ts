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

function generateVietQRUrl(bankCode: string, accountNumber: string, accountName: string, amount: number, description: string) {
  // Generate VietQR URL using vietqr.io service
  const encodedDescription = encodeURIComponent(description);
  const encodedAccountName = encodeURIComponent(accountName);
  
  return `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact2.png?amount=${amount}&addInfo=${encodedDescription}&accountName=${encodedAccountName}`;
}

function createPayOSSignature(orderCode: number, amount: number, description: string, cancelUrl: string, returnUrl: string, checksumKey: string) {
  // Create signature string according to PayOS requirements
  const data = `amount=${amount}&cancelUrl=${cancelUrl}&description=${description}&orderCode=${orderCode}&returnUrl=${returnUrl}`;
  
  // Create HMAC SHA256 signature
  const encoder = new TextEncoder();
  const keyData = encoder.encode(checksumKey);
  const messageData = encoder.encode(data);
  
  return crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  ).then(key => 
    crypto.subtle.sign('HMAC', key, messageData)
  ).then(signature => 
    Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  );
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
      const text = await req.text();
      console.log("Raw request body:", text);
      
      if (!text || text.trim() === '') {
        console.error("Empty request body");
        return jsonResponse({ error: "Request body is empty" }, { status: 400 });
      }
      
      bodyData = JSON.parse(text);
      console.log("Parsed body:", bodyData);
    } catch (e) {
      console.error("Failed to parse JSON:", e.message);
      return jsonResponse({ error: "Invalid JSON format" }, { status: 400 });
    }

    const { amount, promotionCode } = bodyData;
    console.log("Extracted data:", { amount, promotionCode });
    
    if (!amount || amount <= 0) {
      console.error("Invalid amount:", amount);
      return jsonResponse({ error: "Số tiền không hợp lệ" }, { status: 400 });
    }

    // Check for eligible promotions
    console.log("Checking for eligible promotions...");
    let applicablePromotion = null;
    let bonusAmount = 0;

    // First check if user provided a promotion code
    if (promotionCode) {
      const { data: codePromotion } = await supabase
        .from('promotions')
        .select('*')
        .eq('promotion_code', promotionCode.trim())
        .eq('is_active', true)
        .lte('start_date', new Date().toISOString())
        .gte('end_date', new Date().toISOString())
        .maybeSingle();

      if (codePromotion && codePromotion.min_deposit && amount >= codePromotion.min_deposit) {
        applicablePromotion = codePromotion;
        console.log("Applied user-provided promotion code:", promotionCode);
      }
    }

    // If no code provided or invalid, check for automatic promotions
    if (!applicablePromotion) {
      // Check for first deposit promotion
      const { data: isFirstDeposit } = await supabase
        .rpc('is_first_deposit', { user_id_param: user.id });

      if (isFirstDeposit) {
        const { data: firstDepositPromo } = await supabase
          .from('promotions')
          .select('*')
          .eq('promotion_type', 'first_deposit')
          .eq('is_active', true)
          .lte('start_date', new Date().toISOString())
          .gte('end_date', new Date().toISOString())
          .lte('min_deposit', amount)
          .order('bonus_amount', { ascending: false })
          .maybeSingle();

        if (firstDepositPromo) {
          applicablePromotion = firstDepositPromo;
          console.log("Applied first deposit promotion:", firstDepositPromo.title);
        }
      }

      // If no first deposit promo, check for general time-based promotions
      if (!applicablePromotion) {
        const { data: timeBasedPromo } = await supabase
          .from('promotions')
          .select('*')
          .eq('promotion_type', 'time_based')
          .eq('is_active', true)
          .lte('start_date', new Date().toISOString())
          .gte('end_date', new Date().toISOString())
          .lte('min_deposit', amount)
          .order('bonus_amount', { ascending: false })
          .maybeSingle();

        if (timeBasedPromo) {
          applicablePromotion = timeBasedPromo;
          console.log("Applied time-based promotion:", timeBasedPromo.title);
        }
      }
    }

    // Calculate bonus amount if promotion is applicable
    if (applicablePromotion) {
      if (applicablePromotion.bonus_amount) {
        bonusAmount = applicablePromotion.bonus_amount;
      } else if (applicablePromotion.bonus_percentage) {
        bonusAmount = Math.floor((amount * applicablePromotion.bonus_percentage) / 100);
      }
      console.log("Calculated bonus amount:", bonusAmount);
    }

    const orderCode = randomOrderCode();
    const username = user.user_metadata?.username || user.email?.split("@")[0] || user.id.substring(0, 6);
    const description = `NAP ${orderCode.toString().slice(-6)}`;

    // Create pending transaction first (RLS ensures user_id matches auth uid)
    const adminNote = applicablePromotion
      ? `method=vietqr/payos; orderCode=${orderCode}; promo=${applicablePromotion.promotion_code || applicablePromotion.title}; bonus=${bonusAmount}`
      : `method=vietqr/payos; orderCode=${orderCode}`;

    console.log("Creating transaction for user:", user.id, "amount:", amount, "bonus:", bonusAmount);
    
    const { data: inserted, error: insertErr } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        type: "deposit",
        amount: amount,
        status: "awaiting_payment", // Chờ thanh toán
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

    console.log("PayOS config check:", {
      hasClientId: !!clientId,
      hasApiKey: !!apiKey,
      hasChecksumKey: !!checksumKey,
      clientIdLength: clientId?.length || 0,
      apiKeyLength: apiKey?.length || 0
    });

    // If PayOS keys are configured, create payment order
    if (clientId && apiKey && checksumKey) {
      try {
        console.log("Creating PayOS payment order with HTTP request...");
        
        const baseUrl = req.url.split('/functions')[0];
        const cancelUrl = `${baseUrl}/`;
        const returnUrl = `${baseUrl}/`;
        
        // Generate signature
        const signature = await createPayOSSignature(orderCode, amount, description, cancelUrl, returnUrl, checksumKey);
        
        const payosBody = {
          orderCode: orderCode,
          amount: amount,
          description: description,
          buyerName: username,
          buyerEmail: user.email || "",
          buyerPhone: "",
          buyerAddress: "",
          items: [
            {
              name: "Nạp tiền tài khoản",
              quantity: 1,
              price: amount
            }
          ],
          cancelUrl: cancelUrl,
          returnUrl: returnUrl,
          expiredAt: Math.floor(Date.now() / 1000) + 3600,
          signature: signature
        };

        console.log("PayOS request body:", payosBody);
        console.log("Making PayOS API request to: https://api-merchant.payos.vn/v2/payment-requests");
        
        const response = await fetch("https://api-merchant.payos.vn/v2/payment-requests", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-client-id": clientId,
            "x-api-key": apiKey,
          },
          body: JSON.stringify(payosBody),
        });

        console.log("PayOS response status:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("PayOS response data:", data);

          const paymentLinkUrl = data?.data?.checkoutUrl || data?.data?.paymentUrl;
          
          if (paymentLinkUrl) {
            console.log("✅ PayOS payment link created successfully:", paymentLinkUrl);
            
            return jsonResponse({
              ok: true,
              transactionId: inserted.id,
              orderCode,
              description,
              paymentUrl: paymentLinkUrl,
              qrCode: data?.data?.qrCode,
              promotion: applicablePromotion ? {
                title: applicablePromotion.title,
                bonusAmount: bonusAmount,
                description: applicablePromotion.description
              } : null,
              message: applicablePromotion 
                ? `Link thanh toán PayOS được tạo thành công. Khuyến mãi: +${bonusAmount.toLocaleString()} VND`
                : "Link thanh toán PayOS được tạo thành công"
            });
          } else {
            console.warn("PayOS response missing payment URL:", data);
          }
        } else {
          const errorText = await response.text();
          console.error("PayOS API error:", response.status, errorText);
        }
      } catch (e) {
        console.error("PayOS request error:", e.message);
        console.error("PayOS request error details:", e);
      }
    }

    // Fallback: Create VietQR if bank details are configured
    console.log("Falling back to VietQR generation...");
    
    const receiverBankCode = Deno.env.get("RECEIVER_BANK_CODE");
    const receiverAccountNumber = Deno.env.get("RECEIVER_ACCOUNT_NUMBER");
    const receiverAccountName = Deno.env.get("RECEIVER_ACCOUNT_NAME");
    
    if (receiverBankCode && receiverAccountNumber && receiverAccountName) {
      console.log("Generating VietQR with bank details");
      
      const qrCodeUrl = generateVietQRUrl(
        receiverBankCode,
        receiverAccountNumber,
        receiverAccountName,
        amount,
        description
      );
      
      return jsonResponse({
        ok: true,
        transactionId: inserted.id,
        orderCode,
        description,
        qrCode: qrCodeUrl,
        bankInfo: {
          bankCode: receiverBankCode,
          accountNumber: receiverAccountNumber,
          accountName: receiverAccountName,
          amount: amount,
          content: description
        },
        message: "QR Code được tạo thành công"
      });
    }
    
    // Final fallback: return basic info
    console.log("No bank details configured, returning basic response");
    
    return jsonResponse({
      ok: true,
      transactionId: inserted.id,
      orderCode,
      description,
      error: "Cần cấu hình thông tin ngân hàng hoặc PayOS để tạo QR Code",
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

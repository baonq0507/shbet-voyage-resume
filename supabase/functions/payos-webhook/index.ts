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
  console.log("Headers:", Object.fromEntries(req.headers.entries()));
  return jsonResponse({ })
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Handle GET request for PayOS webhook validation
  if (req.method === "GET") {
    console.log("GET request - PayOS webhook validation");
    return jsonResponse({ 
      message: "PayOS webhook endpoint is active",
      status: "ok",
      timestamp: new Date().toISOString()
    });
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
        .select('id, user_id, amount, status, admin_note')
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

      // CHECK FIRST DEPOSIT STATUS BEFORE UPDATING TRANSACTION
      console.log("🎯 Checking if first deposit BEFORE transaction approval");
      const { data: isFirstDepositResult, error: firstDepositError } = await supabase
        .rpc('is_first_deposit', { user_id_param: transaction.user_id });

      if (firstDepositError) {
        console.error("❌ Error checking first deposit:", firstDepositError);
      }
      
      const isFirstDeposit = isFirstDepositResult || false;
      console.log("🎯 Is first deposit (BEFORE approval):", isFirstDeposit);

      // Preserve original admin_note and append PayOS confirmation
      const originalAdminNote = transaction.admin_note || '';
      const payosConfirmation = `PayOS confirmed: ${new Date().toISOString()}`;
      const updatedAdminNote = originalAdminNote ? 
        `${originalAdminNote} | ${payosConfirmation}` : 
        payosConfirmation;

      // Update transaction status to approved
      const { error: updateError } = await supabase
        .from('transactions')
        .update({ 
          status: 'approved',
          admin_note: updatedAdminNote,
          approved_at: new Date().toISOString()
        })
        .eq('id', transaction.id);

      if (updateError) {
        console.error("Error updating transaction:", updateError);
        return jsonResponse({ error: "Failed to update transaction" }, { status: 500 });
      }

      console.log("✅ Transaction updated successfully:", transaction.id);
      console.log("✅ Balance update will be handled by database trigger");
      
      // Apply promotion bonus when payment is confirmed
      console.log("🎯 Starting promotion check for user:", transaction.user_id);
      console.log("🎯 Original admin note:", originalAdminNote);
      
      // Use original admin_note to find promotion info
      const promoMatch = originalAdminNote.match(/promo=([^;]+)/);
      console.log("🎯 Promo match result:", promoMatch);
      
      if (promoMatch) {
        const promotionCode = promoMatch[1];
        console.log("Found promotion code in transaction:", promotionCode);
      } else {
        console.log("No promotion code found in admin_note. Checking for automatic promotions...");
      }
      
      // Always check for promotions (both code-based and automatic)
      const promotionCode = promoMatch ? promoMatch[1] : undefined;
      console.log("🎯 Final promotion code to check:", promotionCode);
      
      try {
        // Use the isFirstDeposit value checked BEFORE transaction approval
        console.log("🎯 Using first deposit status checked before approval:", isFirstDeposit);

        // Fetch active promotions
        console.log("🎯 Fetching active promotions...");
        const { data: promotions, error: promotionError } = await supabase
          .from('promotions')
          .select('*')
          .eq('is_active', true)
          .lte('start_date', new Date().toISOString())
          .gte('end_date', new Date().toISOString())
          .order('created_at', { ascending: false });

        if (promotionError) {
          console.error("❌ Error fetching promotions:", promotionError);
        } else {
          console.log("🎯 Active promotions found:", promotions?.length || 0);
          console.log("🎯 Promotions details:", promotions);
            
          // Find applicable promotion
          let applicablePromotion = null;

          if (promotionCode) {
            // Find promotion by code
            console.log("🎯 Looking for code-based promotion:", promotionCode);
            applicablePromotion = promotions?.find((promo: any) => {
              const matchesCode = promo.promotion_type === 'code_based' && promo.promotion_code === promotionCode;
              const hasUses = !promo.max_uses || promo.current_uses < promo.max_uses;
              const meetsMinDeposit = !promo.min_deposit || transaction.amount >= (promo.min_deposit || 0);
              console.log(`🎯 Checking promo ${promo.title}: code=${matchesCode}, uses=${hasUses}, deposit=${meetsMinDeposit}`);
              return matchesCode && hasUses && meetsMinDeposit;
            }) || null;
          }

          // If no code-based promotion found, check for automatic promotions
          if (!applicablePromotion) {
            console.log("🎯 No code-based promotion found, checking automatic promotions...");
            for (const promo of promotions || []) {
              const hasRemainingUses = !promo.max_uses || promo.current_uses < promo.max_uses;
              const meetsMinDeposit = !promo.min_deposit || transaction.amount >= (promo.min_deposit || 0);
              
              console.log(`🎯 Checking auto promo "${promo.title}":`, {
                type: promo.promotion_type,
                hasUses: hasRemainingUses,
                meetsDeposit: meetsMinDeposit,
                isFirstDepositOnly: promo.is_first_deposit_only,
                userIsFirstDeposit: isFirstDeposit
              });
              
              if (!hasRemainingUses || !meetsMinDeposit) {
                console.log(`🎯 Skipping promo "${promo.title}" - requirements not met`);
                continue;
              }
              
              if (promo.promotion_type === 'first_deposit' && isFirstDeposit) {
                console.log(`🎯 Found first deposit promotion: ${promo.title}`);
                applicablePromotion = promo;
                break;
              } else if (promo.promotion_type === 'time_based' && !promo.is_first_deposit_only) {
                console.log(`🎯 Found time-based promotion: ${promo.title}`);
                applicablePromotion = promo;
                break;
              } else if (promo.promotion_type === 'time_based' && promo.is_first_deposit_only && isFirstDeposit) {
                console.log(`🎯 Found first-deposit time-based promotion: ${promo.title}`);
                applicablePromotion = promo;
                break;
              }
            }
          }

          console.log("🎯 Final applicable promotion:", applicablePromotion?.title || "None");

          if (applicablePromotion) {
            // Calculate bonus amount
            let bonusAmount = 0;
            if (applicablePromotion.bonus_percentage) {
              bonusAmount = (transaction.amount * applicablePromotion.bonus_percentage) / 100;
            } else if (applicablePromotion.bonus_amount) {
              bonusAmount = applicablePromotion.bonus_amount;
            }

            console.log("🎯 Calculated bonus amount:", bonusAmount);

            if (bonusAmount > 0) {
              console.log("🎯 Applying bonus:", bonusAmount, "for promotion:", applicablePromotion.title);
              
              // Create bonus transaction
              const { error: bonusError } = await supabase
                .from('transactions')
                .insert({
                  user_id: transaction.user_id,
                  amount: bonusAmount,
                  type: 'bonus',
                  status: 'approved',
                  admin_note: `Khuyến mãi "${applicablePromotion.title}" - ${
                    applicablePromotion.bonus_percentage 
                      ? `${applicablePromotion.bonus_percentage}%` 
                      : `${applicablePromotion.bonus_amount?.toLocaleString()} VND`
                  } ${applicablePromotion.promotion_type === 'first_deposit' ? '(Nạp đầu)' : 
                      applicablePromotion.promotion_type === 'code_based' ? `(Mã: ${promotionCode})` : ''}`,
                  approved_at: new Date().toISOString()
                });

              if (bonusError) {
                console.error("❌ Error creating bonus transaction:", bonusError);
              } else {
                console.log("✅ Bonus transaction created successfully:", bonusAmount);
                
                // Update promotion usage count
                await supabase
                  .from('promotions')
                  .update({
                    current_uses: applicablePromotion.current_uses + 1
                  })
                  .eq('id', applicablePromotion.id);

                // If promotion code was used, mark it as used
                if (promotionCode && applicablePromotion.promotion_type === 'code_based') {
                  await supabase
                    .from('promotion_codes')
                    .update({
                      is_used: true,
                      used_by: transaction.user_id,
                      used_at: new Date().toISOString()
                    })
                    .eq('code', promotionCode)
                    .eq('promotion_id', applicablePromotion.id);
                }
              }
            } else {
              console.log("🎯 Bonus amount is 0, not creating bonus transaction");
            }
          } else {
            console.log("🎯 No applicable promotion found");
            console.log("🎯 Summary - User:", transaction.user_id, "Amount:", transaction.amount, "IsFirstDeposit:", isFirstDeposit, "PromoCode:", promotionCode);
          }
        }
      } catch (error) {
        console.error("❌ Error processing promotion:", error);
      }
      
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
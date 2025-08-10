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
  console.log("=== APPLY PROMOTION START ===");
  console.log("Method:", req.method);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing environment variables");
      return jsonResponse({ error: "Server configuration error" }, { status: 500 });
    }

    // Use service role key for admin operations
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { userId, depositAmount, promotionCode } = await req.json();
    
    console.log("Apply promotion request:", { userId, depositAmount, promotionCode });

    // Check if this is user's first deposit
    const { data: isFirstDepositResult, error: firstDepositError } = await supabase
      .rpc('is_first_deposit', { user_id_param: userId });

    if (firstDepositError) throw firstDepositError;
    const isFirstDeposit = isFirstDepositResult;
    console.log("Is first deposit:", isFirstDeposit);

    // Fetch active promotions
    const { data: promotions, error: promotionError } = await supabase
      .from('promotions')
      .select('*')
      .eq('is_active', true)
      .lte('start_date', new Date().toISOString())
      .gte('end_date', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (promotionError) throw promotionError;

    // Find applicable promotion
    let applicablePromotion = null;

    if (promotionCode) {
      // Find promotion by code
      applicablePromotion = promotions?.find((promo: any) => {
        return promo.promotion_type === 'code_based' && 
               promo.promotion_code === promotionCode &&
               (!promo.max_uses || promo.current_uses < promo.max_uses) &&
               (!promo.min_deposit || depositAmount >= (promo.min_deposit || 0));
      }) || null;
    } else {
      // Find automatic promotions
      for (const promo of (promotions as any[]) || []) {
        const hasRemainingUses = !promo.max_uses || promo.current_uses < promo.max_uses;
        const meetsMinDeposit = !promo.min_deposit || depositAmount >= (promo.min_deposit || 0);
        
        if (!hasRemainingUses || !meetsMinDeposit) continue;
        
        if (promo.promotion_type === 'first_deposit' && isFirstDeposit) {
          applicablePromotion = promo;
          break;
        } else if (promo.promotion_type === 'time_based' && !promo.is_first_deposit_only) {
          applicablePromotion = promo;
          break;
        } else if (promo.promotion_type === 'time_based' && promo.is_first_deposit_only && isFirstDeposit) {
          applicablePromotion = promo;
          break;
        }
      }
    }

    if (!applicablePromotion) {
      console.log("No applicable promotion found");
      return jsonResponse({ success: true, bonusAmount: 0, promotion: null });
    }

    // Calculate bonus amount
    let bonusAmount = 0;
    if (applicablePromotion.bonus_percentage) {
      bonusAmount = (depositAmount * applicablePromotion.bonus_percentage) / 100;
    } else if (applicablePromotion.bonus_amount) {
      bonusAmount = applicablePromotion.bonus_amount;
    }

    if (bonusAmount <= 0) {
      return jsonResponse({ success: true, bonusAmount: 0, promotion: null });
    }

    console.log("Applying bonus:", bonusAmount, "for promotion:", applicablePromotion.title);

    // Add bonus to user balance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('balance')
      .eq('user_id', userId)
      .single();

    if (profileError) throw profileError;

    const { error: balanceError } = await supabase
      .from('profiles')
      .update({
        balance: (profile?.balance || 0) + bonusAmount
      })
      .eq('user_id', userId);

    if (balanceError) throw balanceError;

    // Create bonus transaction record
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'bonus',
        amount: bonusAmount,
        status: 'approved',
        admin_note: `Khuyến mãi "${applicablePromotion.title}" - ${
          applicablePromotion.bonus_percentage 
            ? `${applicablePromotion.bonus_percentage}%` 
            : `${applicablePromotion.bonus_amount?.toLocaleString()} VND`
        } ${applicablePromotion.promotion_type === 'first_deposit' ? '(Nạp đầu)' : 
            applicablePromotion.promotion_type === 'code_based' ? `(Mã: ${promotionCode})` : ''}`,
        approved_at: new Date().toISOString()
      });

    if (transactionError) throw transactionError;

    // Update promotion usage count
    const { error: promotionUpdateError } = await supabase
      .from('promotions')
      .update({
        current_uses: applicablePromotion.current_uses + 1
      })
      .eq('id', applicablePromotion.id);

    if (promotionUpdateError) throw promotionUpdateError;

    // If promotion code was used, mark it as used
    if (promotionCode && applicablePromotion.promotion_type === 'code_based') {
      const { error: codeUpdateError } = await supabase
        .from('promotion_codes')
        .update({
          is_used: true,
          used_by: userId,
          used_at: new Date().toISOString()
        })
        .eq('code', promotionCode)
        .eq('promotion_id', applicablePromotion.id);

      if (codeUpdateError) console.error("Error marking code as used:", codeUpdateError);
    }

    console.log("✅ Promotion applied successfully:", bonusAmount);

    return jsonResponse({ 
      success: true, 
      bonusAmount, 
      promotion: applicablePromotion 
    });

  } catch (error) {
    console.error("=== PROMOTION ERROR ===");
    console.error("Error:", error);
    
    return jsonResponse({ 
      error: "Internal Server Error", 
      details: error.message 
    }, { status: 500 });
  }
});
import express from 'express';
import crypto from 'crypto';
import Transaction from '../models/Transaction.js';
import Profile from '../models/Profile.js';
import Promotion from '../models/Promotion.js';
import PromotionCode from '../models/PromotionCode.js';

const router = express.Router();

// PayOS webhook
router.post('/payos', async (req, res) => {
  try {
    console.log("=== PAYOS WEBHOOK START ===");
    console.log("Method:", req.method);
    console.log("URL:", req.url);
    console.log("Headers:", Object.fromEntries(req.headers.entries()));

    // Handle GET request for PayOS webhook validation
    if (req.method === "GET") {
      console.log("GET request - PayOS webhook validation");
      return res.json({ 
        message: "PayOS webhook endpoint is active",
        status: "ok",
        timestamp: new Date().toISOString()
      });
    }

    // Get raw body for signature verification
    const rawBody = JSON.stringify(req.body);
    console.log("Raw webhook body:", rawBody);

    // Verify signature if provided
    const signature = req.headers['x-payos-signature'];
    if (signature && process.env.PAYOS_CHECKSUM_KEY) {
      console.log("Verifying PayOS signature...");
      const isValid = await verifyPayOSSignature(rawBody, signature, process.env.PAYOS_CHECKSUM_KEY);
      if (!isValid) {
        console.error("Invalid PayOS signature");
        return res.status(401).json({ error: "Invalid signature" });
      }
      console.log("Signature verified successfully");
    } else {
      console.warn("No signature provided in webhook");
    }

    // Extract payment information
    const { code, desc, data: paymentData } = req.body;
    
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
      const transactions = await Transaction.find({
        admin_note: { $regex: `orderCode=${orderCode}` },
        type: 'deposit',
        status: 'pending'
      });

      console.log("Found transactions:", transactions);

      if (!transactions || transactions.length === 0) {
        console.warn("No pending transaction found for orderCode:", orderCode);
        return res.json({ 
          message: "No pending transaction found", 
          orderCode 
        });
      }

      const transaction = transactions[0];
      
      // Verify amount matches
      if (transaction.amount !== amount) {
        console.error("Amount mismatch:", {
          dbAmount: transaction.amount,
          payosAmount: amount
        });
        return res.status(400).json({ error: "Amount mismatch" });
      }

      // Check if this is first deposit
      console.log("🎯 Checking if first deposit BEFORE transaction approval");
      const firstDepositCount = await Transaction.countDocuments({
        userId: transaction.userId,
        type: 'deposit',
        status: 'approved'
      });
      const isFirstDeposit = firstDepositCount === 0;
      console.log("🎯 Is first deposit (BEFORE approval):", isFirstDeposit);

      // Preserve original admin_note and append PayOS confirmation
      const originalAdminNote = transaction.admin_note || '';
      const payosConfirmation = `PayOS confirmed: ${new Date().toISOString()}`;
      const updatedAdminNote = originalAdminNote ? 
        `${originalAdminNote} | ${payosConfirmation}` : 
        payosConfirmation;

      // Update transaction status to approved
      await transaction.updateStatus('approved');
      transaction.admin_note = updatedAdminNote;
      await transaction.save();

      console.log("✅ Transaction updated successfully:", transaction._id);

      // Update user balance
      const profile = await Profile.findOne({ userId: transaction.userId });
      if (profile) {
        await profile.updateBalance(transaction.amount, 'add');
        console.log("✅ User balance updated");
      }

      // Apply promotion bonus when payment is confirmed
      console.log("🎯 Starting promotion check for user:", transaction.userId);
      console.log("🎯 Original admin note:", originalAdminNote);
      
      // Use original admin_note to find promotion info
      const promoMatch = originalAdminNote.match(/promo=([^;]+)/);
      console.log("🎯 Promo match result:", promoMatch);
      
      const promotionCode = promoMatch ? promoMatch[1] : undefined;
      console.log("🎯 Final promotion code to check:", promotionCode);
      
      try {
        // Fetch active promotions
        console.log("🎯 Fetching active promotions...");
        const promotions = await Promotion.find({
          is_active: true,
          start_date: { $lte: new Date() },
          end_date: { $gte: new Date() }
        }).sort({ created_at: -1 });

        console.log("🎯 Active promotions found:", promotions?.length || 0);
        console.log("🎯 Promotions details:", promotions);
          
        // Find applicable promotion
        let applicablePromotion = null;

        if (promotionCode) {
          // Find promotion by code
          console.log("🎯 Looking for code-based promotion:", promotionCode);
          applicablePromotion = promotions?.find((promo) => {
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
            const bonusTransaction = new Transaction({
              user_id: transaction.userId,
              amount: bonusAmount,
              type: 'bonus',
              status: 'approved',
              admin_note: `Khuyến mãi "${applicablePromotion.title}" - ${
                applicablePromotion.bonus_percentage 
                  ? `${applicablePromotion.bonus_percentage}%` 
                  : `${applicablePromotion.bonus_amount?.toLocaleString()} VND`
              } ${applicablePromotion.promotion_type === 'first_deposit' ? '(Nạp đầu)' : 
                  applicablePromotion.promotion_type === 'code_based' ? `(Mã: ${promotionCode})` : ''}`,
              approved_at: new Date()
            });

            await bonusTransaction.save();

            // Update user balance
            if (profile) {
              await profile.updateBalance(bonusAmount, 'add');
            }

            // Update promotion usage count
            await Promotion.findByIdAndUpdate(applicablePromotion._id, {
              $inc: { current_uses: 1 }
            });

            // If promotion code was used, mark it as used
            if (promotionCode && applicablePromotion.promotion_type === 'code_based') {
              await PromotionCode.findOneAndUpdate(
                { code: promotionCode, promotion_id: applicablePromotion._id },
                {
                  is_used: true,
                  used_by: transaction.userId,
                  used_at: new Date()
                }
              );
            }

            console.log("✅ Bonus transaction created successfully:", bonusAmount);
          } else {
            console.log("🎯 Bonus amount is 0, not creating bonus transaction");
          }
        } else {
          console.log("🎯 No applicable promotion found");
          console.log("🎯 Summary - User:", transaction.userId, "Amount:", transaction.amount, "IsFirstDeposit:", isFirstDeposit, "PromoCode:", promotionCode);
        }
      } catch (error) {
        console.error("❌ Error processing promotion:", error);
      }
      
      return res.json({ 
        message: "Webhook processed successfully",
        transactionId: transaction._id,
        orderCode
      });

    } else {
      console.log("Payment not successful or missing data:", { code, desc, paymentData });
      
      // Handle failed payments if needed
      if (paymentData?.orderCode) {
        const transactions = await Transaction.find({
          admin_note: { $regex: `orderCode=${paymentData.orderCode}` },
          type: 'deposit',
          status: 'pending'
        });

        if (transactions && transactions.length > 0) {
          await Transaction.findByIdAndUpdate(transactions[0]._id, {
            status: 'rejected',
            admin_note: `PayOS failed: ${desc} | ${new Date().toISOString()}`
          });
          
          console.log("Transaction marked as failed:", transactions[0]._id);
        }
      }
      
      return res.json({ 
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
    
    return res.status(500).json({ 
      error: "Internal Server Error", 
      details: error.message,
      type: error.constructor.name 
    });
  }
});

// Helper function to verify PayOS signature
async function verifyPayOSSignature(rawBody, signature, checksumKey) {
  try {
    const hmac = crypto.createHmac('sha256', checksumKey);
    hmac.update(rawBody);
    const computedSignature = hmac.digest('hex');
    
    return computedSignature === signature;
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

export default router;

import Transaction from '../models/Transaction.js';
import Profile from '../models/Profile.js';
import Bank from '../models/Bank.js';
import Promotion from '../models/Promotion.js';
import PromotionCode from '../models/PromotionCode.js';
import User from '../models/User.js';
import axios from 'axios';
import crypto from 'crypto';

// Create deposit order
export const createDepositOrder = async (req, res) => {
  try {
    const { amount, promotionCode } = req.body;
    const userId = req.user._id;

    console.log('=== CREATE DEPOSIT ORDER START ===');
    console.log('User:', userId, 'Amount:', amount, 'PromoCode:', promotionCode);

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Số tiền không hợp lệ'
      });
    }

    // Generate order code
    const orderCode = generateOrderCode();
    const username = req.user.username || req.user.email?.split('@')[0] || userId.toString().substring(0, 6);
    const description = `NAP ${orderCode.toString().slice(-6)}`;

    // Store promotion code in admin note
    const promotionNote = promotionCode ? `; promo=${promotionCode}` : '';
    const adminNote = `method=vietqr/payos; orderCode=${orderCode}${promotionNote}`;

    // Create transaction
    const transaction = new Transaction({
      userId,
      type: 'deposit',
      amount,
      status: 'pending',
      adminNote
    });

    await transaction.save();
    console.log('✅ Transaction created:', transaction._id);

    // Try to create PayOS payment order
    if (process.env.PAYOS_CLIENT_ID && process.env.PAYOS_API_KEY && process.env.PAYOS_CHECKSUM_KEY) {
      try {
        console.log('Creating PayOS payment order...');
        
        const baseUrl = process.env.CORS_ORIGIN || 'http://localhost:5173';
        const cancelUrl = `${baseUrl}/tai-khoan?tab=transactions&status=cancelled`;
        const returnUrl = `${baseUrl}/tai-khoan?tab=transactions&status=success`;
        
        // Generate signature
        const signature = await createPayOSSignature(orderCode, amount, description, cancelUrl, returnUrl);
        
        const payosBody = {
          orderCode: orderCode,
          amount: amount,
          description: description,
          buyerName: username,
          buyerEmail: req.user.email || "",
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

        console.log('PayOS request body:', payosBody);
        
        const response = await axios.post("https://api-merchant.payos.vn/v2/payment-requests", payosBody, {
          headers: {
            "Content-Type": "application/json",
            "x-client-id": process.env.PAYOS_CLIENT_ID,
            "x-api-key": process.env.PAYOS_API_KEY,
          },
        });

        console.log("PayOS response status:", response.status);

        if (response.ok) {
          const data = response.data;
          console.log("PayOS response data:", data);

          const paymentLinkUrl = data?.data?.checkoutUrl || data?.data?.paymentUrl;
          
          if (paymentLinkUrl) {
            console.log("✅ PayOS payment link created successfully:", paymentLinkUrl);
            
            return res.json({
              success: true,
              data: {
                transactionId: transaction._id,
                orderCode,
                description,
                paymentUrl: paymentLinkUrl,
                qrCode: data?.data?.qrCode,
                message: "Link thanh toán PayOS được tạo thành công"
              }
            });
          }
        }
      } catch (payosError) {
        console.error("PayOS request error:", payosError.response?.data || payosError.message);
      }
    }

    // Fallback: Create VietQR if bank details are configured
    console.log("Falling back to VietQR generation...");
    
    if (process.env.RECEIVER_BANK_CODE && process.env.RECEIVER_ACCOUNT_NUMBER && process.env.RECEIVER_ACCOUNT_NAME) {
      console.log("Generating VietQR with bank details");
      
      const qrCodeUrl = generateVietQRUrl(
        process.env.RECEIVER_BANK_CODE,
        process.env.RECEIVER_ACCOUNT_NUMBER,
        process.env.RECEIVER_ACCOUNT_NAME,
        amount,
        description
      );
      
      return res.json({
        success: true,
        data: {
          transactionId: transaction._id,
          orderCode,
          description,
          qrCode: qrCodeUrl,
          bankInfo: {
            bankCode: process.env.RECEIVER_BANK_CODE,
            accountNumber: process.env.RECEIVER_ACCOUNT_NUMBER,
            accountName: process.env.RECEIVER_ACCOUNT_NAME,
            amount: amount,
            content: description
          },
          message: "QR Code được tạo thành công"
        }
      });
    }
    
    // Final fallback: return basic info
    console.log("No bank details configured, returning basic response");
    
    res.json({
      success: true,
      data: {
        transactionId: transaction._id,
        orderCode,
        description,
        error: "Cần cấu hình thông tin ngân hàng hoặc PayOS để tạo QR Code",
      }
    });

  } catch (error) {
    console.error("=== CREATE DEPOSIT ORDER ERROR ===");
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      error: "Lỗi server nội bộ",
      details: error.message
    });
  }
};

// Get user transactions
export const getUserTransactions = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, type, status } = req.query;

    const query = { userId };
    if (type) query.type = type;
    if (status) query.status = status;

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('bankId', 'bankName accountNumber accountHolder')
      .populate('approvedBy', 'email');

    const total = await Transaction.countDocuments(query);

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('💥 Get transactions error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server nội bộ',
      details: error.message
    });
  }
};

// Get transaction by ID
export const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const transaction = await Transaction.findOne({ _id: id, userId })
      .populate('bankId', 'bankName accountNumber accountHolder')
      .populate('approvedBy', 'email');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Giao dịch không tồn tại'
      });
    }

    res.json({
      success: true,
      data: transaction
    });

  } catch (error) {
    console.error('💥 Get transaction error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server nội bộ',
      details: error.message
    });
  }
};

// Helper functions
function generateOrderCode() {
  const now = Date.now();
  const rand = Math.floor(Math.random() * 1000);
  return Number(`${now}${rand}`.slice(-12));
}

function generateVietQRUrl(bankCode, accountNumber, accountName, amount, description) {
  const encodedDescription = encodeURIComponent(description);
  const encodedAccountName = encodeURIComponent(accountName);
  
  return `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact2.png?amount=${amount}&addInfo=${encodedDescription}&accountName=${encodedAccountName}`;
}

async function createPayOSSignature(orderCode, amount, description, cancelUrl, returnUrl) {
  const data = `amount=${amount}&cancelUrl=${cancelUrl}&description=${description}&orderCode=${orderCode}&returnUrl=${returnUrl}`;
  
  return crypto
    .createHmac('sha256', process.env.PAYOS_CHECKSUM_KEY)
    .update(data)
    .digest('hex');
}

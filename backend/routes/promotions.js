import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validatePagination } from '../middleware/validation.js';
import Promotion from '../models/Promotion.js';
import PromotionCode from '../models/PromotionCode.js';

const router = express.Router();

// Public routes - Get active promotions
router.get('/active', async (req, res) => {
  try {
    const promotions = await Promotion.find({
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: promotions
    });
  } catch (error) {
    console.error('💥 Get active promotions error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server nội bộ',
      details: error.message
    });
  }
});

// Check promotion code
router.post('/check-code', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Mã khuyến mãi là bắt buộc'
      });
    }

    const promotionCode = await PromotionCode.findOne({
      code,
      isUsed: false
    }).populate('promotionId');

    if (!promotionCode || !promotionCode.promotionId) {
      return res.status(404).json({
        success: false,
        error: 'Mã khuyến mãi không hợp lệ hoặc đã được sử dụng'
      });
    }

    const promotion = promotionCode.promotionId;

    // Check if promotion is still active
    if (!promotion.isActive || 
        promotion.startDate > new Date() || 
        promotion.endDate < new Date()) {
      return res.status(400).json({
        success: false,
        error: 'Mã khuyến mãi đã hết hạn'
      });
    }

    res.json({
      success: true,
      data: {
        promotion,
        code: promotionCode.code,
        isValid: true
      }
    });
  } catch (error) {
    console.error('💥 Check promotion code error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server nội bộ',
      details: error.message
    });
  }
});

// Apply promotion code
router.post('/apply-code', authenticateToken, async (req, res) => {
  try {
    const { code, amount } = req.body;
    const userId = req.user._id;

    if (!code || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Mã khuyến mãi và số tiền là bắt buộc'
      });
    }

    const promotionCode = await PromotionCode.findOne({
      code,
      isUsed: false
    }).populate('promotionId');

    if (!promotionCode || !promotionCode.promotionId) {
      return res.status(404).json({
        success: false,
        error: 'Mã khuyến mãi không hợp lệ hoặc đã được sử dụng'
      });
    }

    const promotion = promotionCode.promotionId;

    // Check if promotion is still active
    if (!promotion.isActive || 
        promotion.startDate > new Date() || 
        promotion.endDate < new Date()) {
      return res.status(400).json({
        success: false,
        error: 'Mã khuyến mãi đã hết hạn'
      });
    }

    // Check minimum deposit amount
    if (promotion.minDeposit && amount < promotion.minDeposit) {
      return res.status(400).json({
        success: false,
        error: `Số tiền nạp tối thiểu là ${promotion.minDeposit.toLocaleString()} VND`
      });
    }

    // Calculate bonus
    let bonusAmount = 0;
    if (promotion.bonusPercentage) {
      bonusAmount = (amount * promotion.bonusPercentage) / 100;
    } else if (promotion.bonusAmount) {
      bonusAmount = promotion.bonusAmount;
    }

    res.json({
      success: true,
      data: {
        promotion,
        bonusAmount,
        message: 'Mã khuyến mãi hợp lệ'
      }
    });
  } catch (error) {
    console.error('💥 Apply promotion code error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server nội bộ',
      details: error.message
    });
  }
});

// Admin routes
router.use(authenticateToken);
router.use(requireRole(['admin']));

// Get all promotions
router.get('/', validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10, isActive } = req.query;

    const query = {};
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const promotions = await Promotion.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Promotion.countDocuments(query);

    res.json({
      success: true,
      data: {
        promotions,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('💥 Get promotions error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server nội bộ',
      details: error.message
    });
  }
});

// Create promotion
router.post('/', async (req, res) => {
  try {
    const promotionData = req.body;

    const promotion = new Promotion(promotionData);
    await promotion.save();

    res.status(201).json({
      success: true,
      message: 'Tạo khuyến mãi thành công',
      data: promotion
    });
  } catch (error) {
    console.error('💥 Create promotion error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server nội bộ',
      details: error.message
    });
  }
});

// Update promotion
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const promotion = await Promotion.findByIdAndUpdate(id, updateData, { new: true });
    if (!promotion) {
      return res.status(404).json({
        success: false,
        error: 'Khuyến mãi không tồn tại'
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật khuyến mãi thành công',
      data: promotion
    });
  } catch (error) {
    console.error('💥 Update promotion error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server nội bộ',
      details: error.message
    });
  }
});

// Delete promotion
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const promotion = await Promotion.findByIdAndDelete(id);
    if (!promotion) {
      return res.status(404).json({
        success: false,
        error: 'Khuyến mãi không tồn tại'
      });
    }

    res.json({
      success: true,
      message: 'Xóa khuyến mãi thành công'
    });
  } catch (error) {
    console.error('💥 Delete promotion error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server nội bộ',
      details: error.message
    });
  }
});

// Get promotion codes
router.get('/:id/codes', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const codes = await PromotionCode.find({ promotionId: id })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await PromotionCode.countDocuments({ promotionId: id });

    res.json({
      success: true,
      data: {
        codes,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('💥 Get promotion codes error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server nội bộ',
      details: error.message
    });
  }
});

// Generate promotion codes
router.post('/:id/generate-codes', async (req, res) => {
  try {
    const { id } = req.params;
    const { count = 1, prefix = '' } = req.body;

    const promotion = await Promotion.findById(id);
    if (!promotion) {
      return res.status(404).json({
        success: false,
        error: 'Khuyến mãi không tồn tại'
      });
    }

    const codes = [];
    for (let i = 0; i < count; i++) {
      const code = prefix + Math.random().toString(36).substring(2, 8).toUpperCase();
      codes.push({
        code,
        promotionId: id,
        isUsed: false
      });
    }

    await PromotionCode.insertMany(codes);

    res.json({
      success: true,
      message: `Tạo ${count} mã khuyến mãi thành công`,
      data: codes
    });
  } catch (error) {
    console.error('💥 Generate promotion codes error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server nội bộ',
      details: error.message
    });
  }
});

export default router;

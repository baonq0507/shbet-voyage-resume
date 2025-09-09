import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validatePagination } from '../middleware/validation.js';
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import Transaction from '../models/Transaction.js';
import Game from '../models/Game.js';
import Bank from '../models/Bank.js';
import Promotion from '../models/Promotion.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// All routes require admin authentication
router.use(authenticateToken);
router.use(requireRole(['admin']));

// Get all users with pagination
router.get('/users', validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { 'profiles.username': { $regex: search, $options: 'i' } },
        { 'profiles.fullName': { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .populate({
        path: 'profiles',
        match: role ? { role } : {}
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-password');

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('💥 Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server nội bộ',
      details: error.message
    });
  }
});

// Get all transactions with pagination
router.get('/transactions', validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status, userId } = req.query;

    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (userId) query.userId = userId;

    const transactions = await Transaction.find(query)
      .populate('userId', 'email')
      .populate('bankId', 'bankName accountNumber accountHolder')
      .populate('approvedBy', 'email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

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
});

// Update transaction status
router.put('/transactions/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Giao dịch không tồn tại'
      });
    }

    // Update transaction status
    await transaction.updateStatus(status, req.user._id);
    
    if (adminNote) {
      transaction.adminNote = adminNote;
      await transaction.save();
    }

    // If approved, update user balance
    if (status === 'approved' && transaction.type === 'deposit') {
      const profile = await Profile.findOne({ userId: transaction.userId });
      if (profile) {
        await profile.updateBalance(transaction.amount, 'add');
      }
    }

    res.json({
      success: true,
      message: 'Cập nhật trạng thái giao dịch thành công',
      data: transaction
    });
  } catch (error) {
    console.error('💥 Update transaction status error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server nội bộ',
      details: error.message
    });
  }
});

// Get all games
router.get('/games', validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 20, category, provider, search } = req.query;

    const query = {};
    if (category) query.category = category;
    if (provider) query.provider = provider;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { provider: { $regex: search, $options: 'i' } }
      ];
    }

    const games = await Game.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Game.countDocuments(query);

    res.json({
      success: true,
      data: {
        games,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('💥 Get games error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server nội bộ',
      details: error.message
    });
  }
});

// Update game status
router.put('/games/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, isEnabled, isMaintain } = req.body;

    const game = await Game.findById(id);
    if (!game) {
      return res.status(404).json({
        success: false,
        error: 'Game không tồn tại'
      });
    }

    if (isActive !== undefined) game.isActive = isActive;
    if (isEnabled !== undefined) game.isEnabled = isEnabled;
    if (isMaintain !== undefined) game.isMaintain = isMaintain;

    await game.save();

    res.json({
      success: true,
      message: 'Cập nhật trạng thái game thành công',
      data: game
    });
  } catch (error) {
    console.error('💥 Update game status error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server nội bộ',
      details: error.message
    });
  }
});

// Get all banks
router.get('/banks', async (req, res) => {
  try {
    const banks = await Bank.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      data: banks
    });
  } catch (error) {
    console.error('💥 Get banks error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server nội bộ',
      details: error.message
    });
  }
});

// Add bank
router.post('/banks', async (req, res) => {
  try {
    const { bankName, accountNumber, accountHolder, qrCodeUrl } = req.body;

    const bank = new Bank({
      bankName,
      accountNumber,
      accountHolder,
      qrCodeUrl
    });

    await bank.save();

    res.status(201).json({
      success: true,
      message: 'Thêm ngân hàng thành công',
      data: bank
    });
  } catch (error) {
    console.error('💥 Add bank error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server nội bộ',
      details: error.message
    });
  }
});

// Update bank
router.put('/banks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { bankName, accountNumber, accountHolder, qrCodeUrl, isActive } = req.body;

    const bank = await Bank.findById(id);
    if (!bank) {
      return res.status(404).json({
        success: false,
        error: 'Ngân hàng không tồn tại'
      });
    }

    if (bankName) bank.bankName = bankName;
    if (accountNumber) bank.accountNumber = accountNumber;
    if (accountHolder) bank.accountHolder = accountHolder;
    if (qrCodeUrl !== undefined) bank.qrCodeUrl = qrCodeUrl;
    if (isActive !== undefined) bank.isActive = isActive;

    await bank.save();

    res.json({
      success: true,
      message: 'Cập nhật ngân hàng thành công',
      data: bank
    });
  } catch (error) {
    console.error('💥 Update bank error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server nội bộ',
      details: error.message
    });
  }
});

// Get all promotions
router.get('/promotions', validatePagination, async (req, res) => {
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
router.post('/promotions', async (req, res) => {
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
router.put('/promotions/:id', async (req, res) => {
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

// Get dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalUsers,
      totalTransactions,
      totalDeposits,
      totalWithdrawals,
      pendingTransactions,
      activeGames
    ] = await Promise.all([
      User.countDocuments(),
      Transaction.countDocuments(),
      Transaction.aggregate([
        { $match: { type: 'deposit', status: 'approved' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Transaction.aggregate([
        { $match: { type: 'withdraw', status: 'approved' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Transaction.countDocuments({ status: 'pending' }),
      Game.countDocuments({ isActive: true, isEnabled: true })
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalTransactions,
        totalDeposits: totalDeposits[0]?.total || 0,
        totalWithdrawals: totalWithdrawals[0]?.total || 0,
        pendingTransactions,
        activeGames
      }
    });
  } catch (error) {
    console.error('💥 Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server nội bộ',
      details: error.message
    });
  }
});

export default router;

import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Profile from '../models/Profile.js';
import UserBankAccount from '../models/UserBankAccount.js';
import { validateBankAccount } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user._id });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy thông tin người dùng'
      });
    }

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('💥 Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server nội bộ',
      details: error.message
    });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const { fullName, phoneNumber, avatarUrl } = req.body;
    const userId = req.user._id;

    const profile = await Profile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy thông tin người dùng'
      });
    }

    // Update profile fields
    if (fullName) profile.fullName = fullName;
    if (phoneNumber) profile.phoneNumber = phoneNumber;
    if (avatarUrl) profile.avatarUrl = avatarUrl;

    await profile.save();

    res.json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      data: profile
    });
  } catch (error) {
    console.error('💥 Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server nội bộ',
      details: error.message
    });
  }
});

// Get user bank accounts
router.get('/bank-accounts', async (req, res) => {
  try {
    const bankAccounts = await UserBankAccount.find({ 
      userId: req.user._id,
      isActive: true 
    });

    res.json({
      success: true,
      data: bankAccounts
    });
  } catch (error) {
    console.error('💥 Get bank accounts error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server nội bộ',
      details: error.message
    });
  }
});

// Add bank account
router.post('/bank-accounts', validateBankAccount, async (req, res) => {
  try {
    const { bankName, accountNumber, accountHolder } = req.body;
    const userId = req.user._id;

    // Check if account number already exists for this user
    const existingAccount = await UserBankAccount.findOne({
      userId,
      accountNumber,
      isActive: true
    });

    if (existingAccount) {
      return res.status(400).json({
        success: false,
        error: 'Số tài khoản đã tồn tại'
      });
    }

    const bankAccount = new UserBankAccount({
      userId,
      bankName,
      accountNumber,
      accountHolder
    });

    await bankAccount.save();

    res.status(201).json({
      success: true,
      message: 'Thêm tài khoản ngân hàng thành công',
      data: bankAccount
    });
  } catch (error) {
    console.error('💥 Add bank account error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server nội bộ',
      details: error.message
    });
  }
});

// Update bank account
router.put('/bank-accounts/:id', validateBankAccount, async (req, res) => {
  try {
    const { id } = req.params;
    const { bankName, accountNumber, accountHolder } = req.body;
    const userId = req.user._id;

    const bankAccount = await UserBankAccount.findOne({
      _id: id,
      userId,
      isActive: true
    });

    if (!bankAccount) {
      return res.status(404).json({
        success: false,
        error: 'Tài khoản ngân hàng không tồn tại'
      });
    }

    // Check if new account number already exists for this user
    if (accountNumber && accountNumber !== bankAccount.accountNumber) {
      const existingAccount = await UserBankAccount.findOne({
        userId,
        accountNumber,
        isActive: true,
        _id: { $ne: id }
      });

      if (existingAccount) {
        return res.status(400).json({
          success: false,
          error: 'Số tài khoản đã tồn tại'
        });
      }
    }

    // Update fields
    if (bankName) bankAccount.bankName = bankName;
    if (accountNumber) bankAccount.accountNumber = accountNumber;
    if (accountHolder) bankAccount.accountHolder = accountHolder;

    await bankAccount.save();

    res.json({
      success: true,
      message: 'Cập nhật tài khoản ngân hàng thành công',
      data: bankAccount
    });
  } catch (error) {
    console.error('💥 Update bank account error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server nội bộ',
      details: error.message
    });
  }
});

// Delete bank account
router.delete('/bank-accounts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const bankAccount = await UserBankAccount.findOne({
      _id: id,
      userId,
      isActive: true
    });

    if (!bankAccount) {
      return res.status(404).json({
        success: false,
        error: 'Tài khoản ngân hàng không tồn tại'
      });
    }

    bankAccount.isActive = false;
    await bankAccount.save();

    res.json({
      success: true,
      message: 'Xóa tài khoản ngân hàng thành công'
    });
  } catch (error) {
    console.error('💥 Delete bank account error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server nội bộ',
      details: error.message
    });
  }
});

export default router;

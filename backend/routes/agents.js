import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validatePagination } from '../middleware/validation.js';
import Agent from '../models/Agent.js';
import AgentReferral from '../models/AgentReferral.js';
import Profile from '../models/Profile.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get agent info
router.get('/info', async (req, res) => {
  try {
    const userId = req.user._id;

    const agent = await Agent.findOne({ userId });
    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Bạn không phải là đại lý'
      });
    }

    // Get referral statistics
    const referrals = await AgentReferral.find({ agentId: agent._id });
    const activeReferrals = referrals.filter(r => r.status === 'active');
    const totalCommission = referrals.reduce((sum, r) => sum + (r.commissionEarned || 0), 0);

    res.json({
      success: true,
      data: {
        agent,
        stats: {
          totalReferrals: referrals.length,
          activeReferrals: activeReferrals.length,
          totalCommission
        }
      }
    });
  } catch (error) {
    console.error('💥 Get agent info error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server nội bộ',
      details: error.message
    });
  }
});

// Get agent referrals
router.get('/referrals', validatePagination, async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, status } = req.query;

    const agent = await Agent.findOne({ userId });
    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Bạn không phải là đại lý'
      });
    }

    const query = { agentId: agent._id };
    if (status) query.status = status;

    const referrals = await AgentReferral.find(query)
      .populate('referredUserId', 'email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await AgentReferral.countDocuments(query);

    res.json({
      success: true,
      data: {
        referrals,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('💥 Get agent referrals error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server nội bộ',
      details: error.message
    });
  }
});

// Admin routes
router.use(requireRole(['admin']));

// Get all agents
router.get('/admin/all', validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, level } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { referralCode: { $regex: search, $options: 'i' } },
        { 'profiles.fullName': { $regex: search, $options: 'i' } }
      ];
    }
    if (level) query.level = level;

    const agents = await Agent.find(query)
      .populate('userId', 'email')
      .populate('levelId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Agent.countDocuments(query);

    res.json({
      success: true,
      data: {
        agents,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('💥 Get all agents error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server nội bộ',
      details: error.message
    });
  }
});

// Create agent
router.post('/admin/create', async (req, res) => {
  try {
    const { userId, levelId, referralCode, commissionRate } = req.body;

    if (!userId || !referralCode) {
      return res.status(400).json({
        success: false,
        error: 'userId và referralCode là bắt buộc'
      });
    }

    // Check if user exists
    const user = await Profile.findOne({ userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Người dùng không tồn tại'
      });
    }

    // Check if referral code already exists
    const existingAgent = await Agent.findOne({ referralCode });
    if (existingAgent) {
      return res.status(400).json({
        success: false,
        error: 'Mã giới thiệu đã tồn tại'
      });
    }

    const agent = new Agent({
      userId,
      levelId,
      referralCode,
      commissionRate: commissionRate || 0
    });

    await agent.save();

    res.status(201).json({
      success: true,
      message: 'Tạo đại lý thành công',
      data: agent
    });
  } catch (error) {
    console.error('💥 Create agent error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server nội bộ',
      details: error.message
    });
  }
});

// Update agent
router.put('/admin/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const agent = await Agent.findByIdAndUpdate(id, updateData, { new: true });
    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Đại lý không tồn tại'
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật đại lý thành công',
      data: agent
    });
  } catch (error) {
    console.error('💥 Update agent error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server nội bộ',
      details: error.message
    });
  }
});

// Delete agent
router.delete('/admin/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const agent = await Agent.findByIdAndDelete(id);
    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Đại lý không tồn tại'
      });
    }

    res.json({
      success: true,
      message: 'Xóa đại lý thành công'
    });
  } catch (error) {
    console.error('💥 Delete agent error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server nội bộ',
      details: error.message
    });
  }
});

// Get agent referrals (admin)
router.get('/admin/:id/referrals', validatePagination, async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, status } = req.query;

    const query = { agentId: id };
    if (status) query.status = status;

    const referrals = await AgentReferral.find(query)
      .populate('referredUserId', 'email')
      .populate('agentId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await AgentReferral.countDocuments(query);

    res.json({
      success: true,
      data: {
        referrals,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('💥 Get agent referrals error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server nội bộ',
      details: error.message
    });
  }
});

export default router;

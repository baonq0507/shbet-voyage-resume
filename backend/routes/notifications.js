import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validatePagination } from '../middleware/validation.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get user notifications
router.get('/', validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 20, isRead } = req.query;
    const userId = req.user._id;

    const query = { userId };
    if (isRead !== undefined) query.isRead = isRead === 'true';

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(query);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('💥 Get notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server nội bộ',
      details: error.message
    });
  }
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOne({
      _id: id,
      userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Thông báo không tồn tại'
      });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.json({
      success: true,
      message: 'Đã đánh dấu thông báo là đã đọc',
      data: notification
    });
  } catch (error) {
    console.error('💥 Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server nội bộ',
      details: error.message
    });
  }
});

// Mark all notifications as read
router.put('/read-all', async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany(
      { userId, isRead: false },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );

    res.json({
      success: true,
      message: 'Đã đánh dấu tất cả thông báo là đã đọc'
    });
  } catch (error) {
    console.error('💥 Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server nội bộ',
      details: error.message
    });
  }
});

// Get unread count
router.get('/unread-count', async (req, res) => {
  try {
    const userId = req.user._id;

    const count = await Notification.countDocuments({
      userId,
      isRead: false
    });

    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('💥 Get unread count error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server nội bộ',
      details: error.message
    });
  }
});

// Admin routes
router.use(requireRole(['admin']));

// Get all notifications (admin)
router.get('/admin/all', validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 20, userId, type, isRead } = req.query;

    const query = {};
    if (userId) query.userId = userId;
    if (type) query.type = type;
    if (isRead !== undefined) query.isRead = isRead === 'true';

    const notifications = await Notification.find(query)
      .populate('userId', 'email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(query);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('💥 Get all notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server nội bộ',
      details: error.message
    });
  }
});

// Create notification (admin)
router.post('/admin/create', async (req, res) => {
  try {
    const { userId, title, message, type = 'info', data } = req.body;

    if (!userId || !title || !message) {
      return res.status(400).json({
        success: false,
        error: 'userId, title và message là bắt buộc'
      });
    }

    const notification = new Notification({
      userId,
      title,
      message,
      type,
      data
    });

    await notification.save();

    res.status(201).json({
      success: true,
      message: 'Tạo thông báo thành công',
      data: notification
    });
  } catch (error) {
    console.error('💥 Create notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server nội bộ',
      details: error.message
    });
  }
});

// Send notification to all users (admin)
router.post('/admin/broadcast', async (req, res) => {
  try {
    const { title, message, type = 'info', data } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        error: 'title và message là bắt buộc'
      });
    }

    // Get all user IDs
    const User = (await import('../models/User.js')).default;
    const users = await User.find({}, '_id');

    const notifications = users.map(user => ({
      userId: user._id,
      title,
      message,
      type,
      data
    }));

    await Notification.insertMany(notifications);

    res.json({
      success: true,
      message: `Đã gửi thông báo đến ${users.length} người dùng`,
      data: { count: users.length }
    });
  } catch (error) {
    console.error('💥 Broadcast notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server nội bộ',
      details: error.message
    });
  }
});

// Delete notification (admin)
router.delete('/admin/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndDelete(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Thông báo không tồn tại'
      });
    }

    res.json({
      success: true,
      message: 'Xóa thông báo thành công'
    });
  } catch (error) {
    console.error('💥 Delete notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server nội bộ',
      details: error.message
    });
  }
});

export default router;

import Game from '../models/Game.js';
import axios from 'axios';

// Get games by category
export const getGamesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const query = { 
      isActive: true, 
      isEnabled: true,
      isProviderOnline: true 
    };
    
    if (category && category !== 'all') {
      query.category = category;
    }

    const games = await Game.find(query)
      .sort({ rank: 1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

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
    console.error('💥 Get games by category error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server nội bộ',
      details: error.message
    });
  }
};

// Get all games
export const getAllGames = async (req, res) => {
  try {
    const { page = 1, limit = 50, search, provider, type } = req.query;

    const query = { 
      isActive: true, 
      isEnabled: true,
      isProviderOnline: true 
    };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { provider: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (provider) {
      query.provider = provider;
    }
    
    if (type) {
      query.type = type;
    }

    const games = await Game.find(query)
      .sort({ rank: 1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

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
    console.error('💥 Get all games error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server nội bộ',
      details: error.message
    });
  }
};

// Get game by ID
export const getGameById = async (req, res) => {
  try {
    const { id } = req.params;

    const game = await Game.findOne({ 
      $or: [
        { _id: id },
        { gameId: id },
        { gpid: parseInt(id) }
      ],
      isActive: true,
      isEnabled: true
    }).select('-__v');

    if (!game) {
      return res.status(404).json({
        success: false,
        error: 'Game không tồn tại hoặc đã bị vô hiệu hóa'
      });
    }

    res.json({
      success: true,
      data: game
    });

  } catch (error) {
    console.error('💥 Get game by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server nội bộ',
      details: error.message
    });
  }
};

// Get game categories
export const getGameCategories = async (req, res) => {
  try {
    const categories = await Game.distinct('category', { 
      isActive: true, 
      isEnabled: true,
      category: { $ne: null }
    });

    res.json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('💥 Get game categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server nội bộ',
      details: error.message
    });
  }
};

// Get game providers
export const getGameProviders = async (req, res) => {
  try {
    const providers = await Game.distinct('provider', { 
      isActive: true, 
      isEnabled: true,
      provider: { $ne: null }
    });

    res.json({
      success: true,
      data: providers
    });

  } catch (error) {
    console.error('💥 Get game providers error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server nội bộ',
      details: error.message
    });
  }
};

// Game login
export const gameLogin = async (req, res) => {
  try {
    const { gameId } = req.params;
    const userId = req.user._id;
    const username = req.user.username;

    console.log(`🎮 Game login request - User: ${username}, Game: ${gameId}`);

    // Find game
    const game = await Game.findOne({ 
      $or: [
        { _id: gameId },
        { gameId: gameId },
        { gpid: parseInt(gameId) }
      ],
      isActive: true,
      isEnabled: true
    });

    if (!game) {
      return res.status(404).json({
        success: false,
        error: 'Game không tồn tại hoặc đã bị vô hiệu hóa'
      });
    }

    // Call external game login API
    const loginData = {
      Username: username,
      GameId: game.gameId,
      CompanyKey: process.env.GAME_COMPANY_KEY || 'C6012BA39EB643FEA4F5CD49AF138B02',
      ServerId: process.env.GAME_SERVER_ID || '206.206.126.141',
    };

    console.log('📤 Calling external game login API:', loginData);

    try {
      const response = await axios.post(
        `${process.env.GAME_API_URL}/player/game-login.aspx`,
        loginData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log(`📥 Game login response status: ${response.status}`);
      console.log('📥 Game login response data:', response.data);

      if (response.status === 200 && response.data?.error?.msg === 'No Error') {
        res.json({
          success: true,
          data: {
            gameUrl: response.data.data?.GameUrl || response.data.data?.gameUrl,
            gameId: game.gameId,
            gameName: game.name,
            message: 'Đăng nhập game thành công'
          }
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Không thể đăng nhập game',
          details: response.data?.error?.msg || 'Unknown error'
        });
      }
    } catch (apiError) {
      console.error('❌ Game login API error:', apiError.response?.data || apiError.message);
      res.status(500).json({
        success: false,
        error: 'Lỗi kết nối với hệ thống game',
        details: apiError.response?.data?.error?.msg || apiError.message
      });
    }

  } catch (error) {
    console.error('💥 Game login error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server nội bộ',
      details: error.message
    });
  }
};

// Deposit to game
export const depositToGame = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user._id;
    const username = req.user.username;

    console.log(`💰 Game deposit request - User: ${username}, Amount: ${amount}`);

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Số tiền không hợp lệ'
      });
    }

    // Check user balance
    const profile = await Profile.findOne({ userId });
    if (!profile || profile.balance < amount) {
      return res.status(400).json({
        success: false,
        error: 'Số dư không đủ'
      });
    }

    // Call external deposit API
    const depositData = {
      Username: username,
      Amount: amount,
      CompanyKey: process.env.GAME_COMPANY_KEY || 'C6012BA39EB643FEA4F5CD49AF138B02',
      ServerId: process.env.GAME_SERVER_ID || '206.206.126.141',
    };

    console.log('📤 Calling external deposit API:', depositData);

    try {
      const response = await axios.post(
        `${process.env.GAME_API_URL}/player/deposit.aspx`,
        depositData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log(`📥 Deposit response status: ${response.status}`);
      console.log('📥 Deposit response data:', response.data);

      if (response.status === 200 && response.data?.error?.msg === 'No Error') {
        // Update user balance
        await profile.updateBalance(amount, 'subtract');

        // Create transaction record
        const Transaction = (await import('../models/Transaction.js')).default;
        const transaction = new Transaction({
          userId,
          type: 'deposit',
          amount: -amount, // Negative for game deposit
          status: 'approved',
          adminNote: `Game deposit - ${new Date().toISOString()}`
        });
        await transaction.save();

        res.json({
          success: true,
          data: {
            newBalance: profile.balance - amount,
            message: 'Nạp tiền vào game thành công'
          }
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Không thể nạp tiền vào game',
          details: response.data?.error?.msg || 'Unknown error'
        });
      }
    } catch (apiError) {
      console.error('❌ Game deposit API error:', apiError.response?.data || apiError.message);
      res.status(500).json({
        success: false,
        error: 'Lỗi kết nối với hệ thống game',
        details: apiError.response?.data?.error?.msg || apiError.message
      });
    }

  } catch (error) {
    console.error('💥 Game deposit error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server nội bộ',
      details: error.message
    });
  }
};

// Withdraw from game
export const withdrawFromGame = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user._id;
    const username = req.user.username;

    console.log(`💸 Game withdraw request - User: ${username}, Amount: ${amount}`);

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Số tiền không hợp lệ'
      });
    }

    // Call external withdraw API
    const withdrawData = {
      Username: username,
      Amount: amount,
      CompanyKey: process.env.GAME_COMPANY_KEY || 'C6012BA39EB643FEA4F5CD49AF138B02',
      ServerId: process.env.GAME_SERVER_ID || '206.206.126.141',
    };

    console.log('📤 Calling external withdraw API:', withdrawData);

    try {
      const response = await axios.post(
        `${process.env.GAME_API_URL}/player/withdraw.aspx`,
        withdrawData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log(`📥 Withdraw response status: ${response.status}`);
      console.log('📥 Withdraw response data:', response.data);

      if (response.status === 200 && response.data?.error?.msg === 'No Error') {
        // Update user balance
        const profile = await Profile.findOne({ userId });
        if (profile) {
          await profile.updateBalance(amount, 'add');

          // Create transaction record
          const Transaction = (await import('../models/Transaction.js')).default;
          const transaction = new Transaction({
            userId,
            type: 'withdraw',
            amount: amount,
            status: 'approved',
            adminNote: `Game withdraw - ${new Date().toISOString()}`
          });
          await transaction.save();

          res.json({
            success: true,
            data: {
              newBalance: profile.balance + amount,
              message: 'Rút tiền từ game thành công'
            }
          });
        } else {
          res.status(404).json({
            success: false,
            error: 'Không tìm thấy thông tin người dùng'
          });
        }
      } else {
        res.status(400).json({
          success: false,
          error: 'Không thể rút tiền từ game',
          details: response.data?.error?.msg || 'Unknown error'
        });
      }
    } catch (apiError) {
      console.error('❌ Game withdraw API error:', apiError.response?.data || apiError.message);
      res.status(500).json({
        success: false,
        error: 'Lỗi kết nối với hệ thống game',
        details: apiError.response?.data?.error?.msg || apiError.message
      });
    }

  } catch (error) {
    console.error('💥 Game withdraw error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server nội bộ',
      details: error.message
    });
  }
};

import User from '../models/User.js';
import Profile from '../models/Profile.js';
import Agent from '../models/Agent.js';
import AgentReferral from '../models/AgentReferral.js';
import UserRole from '../models/UserRole.js';
import { generateToken, generateRefreshToken } from '../config/jwt.js';
import axios from 'axios';

// Register user
export const register = async (req, res) => {
  try {
    const { fullName, username, email, password, phoneNumber, referralCode } = req.body;

    console.log('🚀 User registration process started');

    // Check if username already exists
    const existingProfile = await Profile.findOne({ username });
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        error: 'Tên người dùng đã tồn tại'
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email đã tồn tại'
      });
    }

    // Register with external game API
    console.log(`📝 Registering player externally - ${username}, ${fullName}`);
    const externalRequestData = {
      Username: username,
      DisplayName: fullName,
      Agent: process.env.GAME_AGENT || 'VND1_dimonbet',
      CompanyKey: process.env.GAME_COMPANY_KEY || 'C6012BA39EB643FEA4F5CD49AF138B02',
      ServerId: process.env.GAME_SERVER_ID || '206.206.126.141',
    };

    console.log('📤 Calling external register API:', externalRequestData);

    try {
      const externalResponse = await axios.post(
        `${process.env.GAME_API_URL}/player/register-player.aspx`,
        externalRequestData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log(`📥 External API response status: ${externalResponse.status}`);
      console.log('📥 External API response data:', externalResponse.data);

      const externalSuccess = externalResponse.status === 200 && externalResponse.data?.error?.msg === 'No Error';
      
      if (!externalSuccess) {
        console.log('❌ External player registration failed:', externalResponse.data?.error?.msg || 'Unknown error');
        return res.status(400).json({
          success: false,
          error: 'Tên người dùng đã tồn tại',
          details: externalResponse.data?.error?.msg || 'Registration failed'
        });
      }

      console.log('✅ External player registration successful');
    } catch (externalError) {
      console.error('❌ External API error:', externalError.response?.data || externalError.message);
      return res.status(400).json({
        success: false,
        error: 'Không thể đăng ký với hệ thống game',
        details: externalError.response?.data?.error?.msg || externalError.message
      });
    }

    // Create user in database
    console.log('📝 Creating user in database');
    const user = new User({
      email,
      password,
      emailConfirmed: true
    });

    await user.save();
    console.log('✅ User created successfully in database');

    // Create user profile
    const profile = new Profile({
      userId: user._id,
      username,
      fullName,
      phoneNumber,
      balance: 0
    });

    await profile.save();
    console.log('✅ Profile created successfully');

    // Create user role
    const userRole = new UserRole({
      userId: user._id,
      role: 'user'
    });

    await userRole.save();
    console.log('✅ User role created successfully');

    // Handle referral if provided
    if (referralCode) {
      console.log('🔗 Referral code provided:', referralCode);
      try {
        const agent = await Agent.findOne({ referralCode });
        
        if (agent) {
          // Update profile with referral
          profile.referredBy = agent._id;
          await profile.save();

          // Create referral record
          const agentReferral = new AgentReferral({
            agentId: agent._id,
            referredUserId: user._id,
            status: 'active',
            commissionEarned: 0
          });

          await agentReferral.save();

          // Update agent referral count
          await agent.incrementReferralCount();

          console.log('✅ Referral processed successfully');
        } else {
          console.log('ℹ️ Referral code not found or no matching agent');
        }
      } catch (referralError) {
        console.error('⚠️ Referral processing error:', referralError);
      }
    }

    // Generate tokens
    const token = generateToken({ userId: user._id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user._id });

    console.log('✅ Registration process completed successfully');

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      data: {
        user: {
          id: user._id,
          email: user.email,
          username: username,
          fullName: fullName
        },
        token,
        refreshToken
      }
    });

  } catch (error) {
    console.error('💥 Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server nội bộ',
      details: error.message
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const clientIp = req.ip || req.connection.remoteAddress;

    console.log(`👤 Processing login for username: ${username}`);

    // Find user profile by username
    const profile = await Profile.findOne({ username }).populate('userId');
    if (!profile || !profile.userId) {
      return res.status(400).json({
        success: false,
        error: 'Tên người dùng không tồn tại'
      });
    }

    const user = profile.userId;

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Mật khẩu không chính xác'
      });
    }

    // Update last login
    await user.updateLastLogin(clientIp);

    // Get user role
    const userRole = await UserRole.findOne({ userId: user._id });

    // Generate tokens
    const token = generateToken({ userId: user._id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user._id });

    console.log(`✅ Login successful for user: ${username}`);

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        user: {
          id: user._id,
          email: user.email,
          username: profile.username,
          fullName: profile.fullName,
          balance: profile.balance,
          role: userRole?.role || 'user'
        },
        token,
        refreshToken
      }
    });

  } catch (error) {
    console.error('💥 Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server nội bộ',
      details: error.message
    });
  }
};

// Check username availability
export const checkUsername = async (req, res) => {
  try {
    const { username } = req.body;

    // Validate username format
    if (!username || username.length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Tên người dùng phải có ít nhất 3 ký tự'
      });
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        success: false,
        error: 'Tên người dùng chỉ được chứa chữ cái, số và dấu gạch dưới'
      });
    }

    // Check if username already exists
    const existingProfile = await Profile.findOne({ username });
    
    res.json({
      success: true,
      data: {
        isAvailable: !existingProfile,
        username: username
      }
    });

  } catch (error) {
    console.error('💥 Check username error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server nội bộ',
      details: error.message
    });
  }
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    const profile = await Profile.findOne({ userId: req.user._id });
    const userRole = await UserRole.findOne({ userId: req.user._id });

    if (!user || !profile) {
      return res.status(404).json({
        success: false,
        error: 'Người dùng không tồn tại'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          username: profile.username,
          fullName: profile.fullName,
          phoneNumber: profile.phoneNumber,
          avatarUrl: profile.avatarUrl,
          balance: profile.balance,
          role: userRole?.role || 'user',
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt
        }
      }
    });

  } catch (error) {
    console.error('💥 Get current user error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server nội bộ',
      details: error.message
    });
  }
};

// Refresh token
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token là bắt buộc'
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token không hợp lệ'
      });
    }

    const newToken = generateToken({ userId: user._id, email: user.email });
    const newRefreshToken = generateRefreshToken({ userId: user._id });

    res.json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });

  } catch (error) {
    console.error('💥 Refresh token error:', error);
    res.status(401).json({
      success: false,
      error: 'Refresh token không hợp lệ'
    });
  }
};

// Logout
export const logout = async (req, res) => {
  try {
    // In a more sophisticated implementation, you might want to blacklist the token
    res.json({
      success: true,
      message: 'Đăng xuất thành công'
    });
  } catch (error) {
    console.error('💥 Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server nội bộ'
    });
  }
};

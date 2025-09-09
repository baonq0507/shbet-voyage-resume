// Script khởi tạo database với dữ liệu mẫu
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/database.js';

// Import models
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import UserRole from '../models/UserRole.js';
import Agent from '../models/Agent.js';
import AgentLevel from '../models/AgentLevel.js';
import Game from '../models/Game.js';
import Bank from '../models/Bank.js';
import Promotion from '../models/Promotion.js';
import Notification from '../models/Notification.js';

// Load environment variables
dotenv.config();

// Sample data
const sampleGames = [
  {
    gameId: 'game_001',
    gpid: 1001,
    name: 'Baccarat Classic',
    provider: 'Evolution',
    category: 'baccarat',
    type: 'live',
    image: '/images/baccarat.jpg',
    isActive: true,
    isEnabled: true,
    isMaintain: false,
    isProviderOnline: true,
    rank: 1,
    rtp: 98.5
  },
  {
    gameId: 'game_002',
    gpid: 1002,
    name: 'Blackjack VIP',
    provider: 'Evolution',
    category: 'blackjack',
    type: 'live',
    image: '/images/blackjack.jpg',
    isActive: true,
    isEnabled: true,
    isMaintain: false,
    isProviderOnline: true,
    rank: 2,
    rtp: 99.2
  },
  {
    gameId: 'game_003',
    gpid: 1003,
    name: 'Roulette European',
    provider: 'Evolution',
    category: 'roulette',
    type: 'live',
    image: '/images/roulette.jpg',
    isActive: true,
    isEnabled: true,
    isMaintain: false,
    isProviderOnline: true,
    rank: 3,
    rtp: 97.3
  },
  {
    gameId: 'game_004',
    gpid: 2001,
    name: 'Sweet Bonanza',
    provider: 'Pragmatic Play',
    category: 'slot',
    type: 'slot',
    image: '/images/sweet-bonanza.jpg',
    isActive: true,
    isEnabled: true,
    isMaintain: false,
    isProviderOnline: true,
    rank: 4,
    rtp: 96.5,
    lines: 20,
    reels: 6,
    rows: 5
  },
  {
    gameId: 'game_005',
    gpid: 2002,
    name: 'Gates of Olympus',
    provider: 'Pragmatic Play',
    category: 'slot',
    type: 'slot',
    image: '/images/gates-olympus.jpg',
    isActive: true,
    isEnabled: true,
    isMaintain: false,
    isProviderOnline: true,
    rank: 5,
    rtp: 96.5,
    lines: 20,
    reels: 6,
    rows: 5
  }
];

const sampleBanks = [
  {
    bankName: 'Vietcombank',
    accountNumber: '1234567890',
    accountHolder: 'DIAMONBET68',
    qrCodeUrl: 'https://img.vietqr.io/image/970415-1234567890-compact2.png',
    isActive: true
  },
  {
    bankName: 'Techcombank',
    accountNumber: '0987654321',
    accountHolder: 'DIAMONBET68',
    qrCodeUrl: 'https://img.vietqr.io/image/970407-0987654321-compact2.png',
    isActive: true
  },
  {
    bankName: 'BIDV',
    accountNumber: '1122334455',
    accountHolder: 'DIAMONBET68',
    qrCodeUrl: 'https://img.vietqr.io/image/970418-1122334455-compact2.png',
    isActive: true
  }
];

const samplePromotions = [
  {
    title: 'Khuyến mãi nạp đầu 100%',
    description: 'Nhận ngay 100% tiền thưởng cho lần nạp đầu tiên',
    promotionType: 'first_deposit',
    bonusPercentage: 100,
    minDeposit: 50000,
    maxUses: 1000,
    currentUses: 0,
    isFirstDepositOnly: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    isActive: true
  },
  {
    title: 'Khuyến mãi nạp tiền hàng ngày',
    description: 'Nhận 50% tiền thưởng cho mỗi lần nạp tiền',
    promotionType: 'time_based',
    bonusPercentage: 50,
    minDeposit: 100000,
    maxUses: 500,
    currentUses: 0,
    isFirstDepositOnly: false,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    isActive: true
  }
];

const sampleNotifications = [
  {
    title: 'Chào mừng đến với DiamonBet68!',
    message: 'Cảm ơn bạn đã đăng ký tài khoản. Chúc bạn chơi game vui vẻ!',
    type: 'info',
    isRead: false
  },
  {
    title: 'Khuyến mãi nạp đầu 100%',
    message: 'Nhận ngay 100% tiền thưởng cho lần nạp đầu tiên. Hạn sử dụng đến hết tháng!',
    type: 'promotion',
    isRead: false
  }
];

async function initDatabase() {
  try {
    console.log('🚀 Initializing database...');
    
    // Connect to MongoDB
    await connectDB();
    
    // Clear existing data (optional)
    console.log('🧹 Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Profile.deleteMany({}),
      UserRole.deleteMany({}),
      Agent.deleteMany({}),
      AgentLevel.deleteMany({}),
      Game.deleteMany({}),
      Bank.deleteMany({}),
      Promotion.deleteMany({}),
      Notification.deleteMany({})
    ]);

    // Create admin user
    console.log('👤 Creating admin user...');
    const adminUser = new User({
      email: 'admin@diamonbet68.com',
      password: 'admin123456',
      emailConfirmed: true
    });
    await adminUser.save();

    const adminProfile = new Profile({
      userId: adminUser._id,
      username: 'admin',
      fullName: 'Administrator',
      balance: 0
    });
    await adminProfile.save();

    const adminRole = new UserRole({
      userId: adminUser._id,
      role: 'admin'
    });
    await adminRole.save();

    // Create test user
    console.log('👤 Creating test user...');
    const testUser = new User({
      email: 'test@example.com',
      password: 'password123',
      emailConfirmed: true
    });
    await testUser.save();

    const testProfile = new Profile({
      userId: testUser._id,
      username: 'testuser',
      fullName: 'Test User',
      balance: 1000000
    });
    await testProfile.save();

    const testRole = new UserRole({
      userId: testUser._id,
      role: 'user'
    });
    await testRole.save();

    // Create agent levels
    console.log('🏆 Creating agent levels...');
    const agentLevels = [
      {
        name: 'Bronze Agent',
        code: 'BRONZE',
        commissionPercentage: 5
      },
      {
        name: 'Silver Agent',
        code: 'SILVER',
        commissionPercentage: 10
      },
      {
        name: 'Gold Agent',
        code: 'GOLD',
        commissionPercentage: 15
      },
      {
        name: 'Diamond Agent',
        code: 'DIAMOND',
        commissionPercentage: 20
      }
    ];

    for (const levelData of agentLevels) {
      const agentLevel = new AgentLevel(levelData);
      await agentLevel.save();
    }

    // Create sample games
    console.log('🎮 Creating sample games...');
    for (const gameData of sampleGames) {
      const game = new Game(gameData);
      await game.save();
    }

    // Create sample banks
    console.log('🏦 Creating sample banks...');
    for (const bankData of sampleBanks) {
      const bank = new Bank(bankData);
      await bank.save();
    }

    // Create sample promotions
    console.log('🎁 Creating sample promotions...');
    for (const promoData of samplePromotions) {
      const promotion = new Promotion(promoData);
      await promotion.save();
    }

    // Create sample notifications
    console.log('📢 Creating sample notifications...');
    for (const notifData of sampleNotifications) {
      const notification = new Notification(notifData);
      await notification.save();
    }

    console.log('✅ Database initialization completed successfully!');
    console.log('\n📋 Created:');
    console.log('- 1 Admin user (admin@diamonbet68.com / admin123456)');
    console.log('- 1 Test user (test@example.com / password123)');
    console.log('- 4 Agent levels');
    console.log('- 5 Sample games');
    console.log('- 3 Sample banks');
    console.log('- 2 Sample promotions');
    console.log('- 2 Sample notifications');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run initialization if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initDatabase().catch(console.error);
}

export { initDatabase };

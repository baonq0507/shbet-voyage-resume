import mongoose from 'mongoose';

const agentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  levelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AgentLevel',
    default: null
  },
  commissionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  totalCommission: {
    type: Number,
    default: 0,
    min: 0
  },
  referralCount: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
agentSchema.index({ referralCode: 1 });
agentSchema.index({ userId: 1 });
agentSchema.index({ isActive: 1 });

// Generate referral code
agentSchema.methods.generateReferralCode = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  this.referralCode = result;
  return result;
};

// Update commission
agentSchema.methods.updateCommission = function(amount) {
  this.totalCommission += amount;
  return this.save();
};

// Increment referral count
agentSchema.methods.incrementReferralCount = function() {
  this.referralCount += 1;
  return this.save();
};

export default mongoose.model('Agent', agentSchema);

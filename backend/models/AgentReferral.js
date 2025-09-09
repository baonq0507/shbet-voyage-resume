import mongoose from 'mongoose';

const agentReferralSchema = new mongoose.Schema({
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: true
  },
  referredUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  referralDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  commissionEarned: {
    type: Number,
    default: 0,
    min: 0
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
agentReferralSchema.index({ agentId: 1 });
agentReferralSchema.index({ referredUserId: 1 });
agentReferralSchema.index({ status: 1 });

// Ensure unique referral per agent-user pair
agentReferralSchema.index({ agentId: 1, referredUserId: 1 }, { unique: true });

export default mongoose.model('AgentReferral', agentReferralSchema);

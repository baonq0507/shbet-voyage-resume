import mongoose from 'mongoose';

const promotionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: null
  },
  promotionType: {
    type: String,
    enum: ['first_deposit', 'code_based', 'time_based'],
    required: true
  },
  promotionCode: {
    type: String,
    trim: true,
    default: null,
    sparse: true
  },
  bonusAmount: {
    type: Number,
    default: null,
    min: 0
  },
  bonusPercentage: {
    type: Number,
    default: null,
    min: 0,
    max: 100
  },
  minDeposit: {
    type: Number,
    default: null,
    min: 0
  },
  maxUses: {
    type: Number,
    default: null,
    min: 1
  },
  currentUses: {
    type: Number,
    default: 0,
    min: 0
  },
  isFirstDepositOnly: {
    type: Boolean,
    default: false
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  imageUrl: {
    type: String,
    default: null
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

// Indexes for faster queries
promotionSchema.index({ promotionType: 1 });
promotionSchema.index({ promotionCode: 1 });
promotionSchema.index({ isActive: 1 });
promotionSchema.index({ startDate: 1, endDate: 1 });
promotionSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

// Check if promotion is currently active
promotionSchema.methods.isCurrentlyActive = function() {
  const now = new Date();
  return this.isActive && 
         this.startDate <= now && 
         this.endDate >= now &&
         (!this.maxUses || this.currentUses < this.maxUses);
};

// Increment usage count
promotionSchema.methods.incrementUsage = function() {
  this.currentUses += 1;
  return this.save();
};

export default mongoose.model('Promotion', promotionSchema);

import mongoose from 'mongoose';

const promotionCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  promotionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Promotion',
    required: true
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  usedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  usedAt: {
    type: Date,
    default: null
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
promotionCodeSchema.index({ code: 1 });
promotionCodeSchema.index({ promotionId: 1 });
promotionCodeSchema.index({ isUsed: 1 });
promotionCodeSchema.index({ usedBy: 1 });

// Mark as used
promotionCodeSchema.methods.markAsUsed = function(userId) {
  this.isUsed = true;
  this.usedBy = userId;
  this.usedAt = new Date();
  return this.save();
};

export default mongoose.model('PromotionCode', promotionCodeSchema);

import mongoose from 'mongoose';

const bankSchema = new mongoose.Schema({
  bankName: {
    type: String,
    required: true,
    trim: true
  },
  accountNumber: {
    type: String,
    required: true,
    trim: true
  },
  accountHolder: {
    type: String,
    required: true,
    trim: true
  },
  qrCodeUrl: {
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

// Index for faster queries
bankSchema.index({ isActive: 1 });

export default mongoose.model('Bank', bankSchema);

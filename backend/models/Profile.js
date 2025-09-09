import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: /^[a-zA-Z0-9_]+$/
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true,
    default: null
  },
  avatarUrl: {
    type: String,
    default: null
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
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

// Index for faster queries
profileSchema.index({ username: 1 });
profileSchema.index({ userId: 1 });
profileSchema.index({ referredBy: 1 });

// Update balance method
profileSchema.methods.updateBalance = function(amount, type = 'add') {
  if (type === 'add') {
    this.balance += amount;
  } else if (type === 'subtract') {
    this.balance = Math.max(0, this.balance - amount);
  }
  return this.save();
};

export default mongoose.model('Profile', profileSchema);

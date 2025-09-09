import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
  gameId: {
    type: String,
    required: true,
    unique: true
  },
  gpid: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  provider: {
    type: String,
    trim: true,
    default: null
  },
  category: {
    type: String,
    trim: true,
    default: null
  },
  type: {
    type: String,
    trim: true,
    default: null
  },
  image: {
    type: String,
    default: null
  },
  gameProviderId: {
    type: Number,
    default: null
  },
  gameType: {
    type: Number,
    default: null
  },
  newGameType: {
    type: Number,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEnabled: {
    type: Boolean,
    default: true
  },
  isMaintain: {
    type: Boolean,
    default: false
  },
  isProviderOnline: {
    type: Boolean,
    default: true
  },
  rank: {
    type: Number,
    default: 0
  },
  rtp: {
    type: Number,
    default: null
  },
  lines: {
    type: Number,
    default: null
  },
  reels: {
    type: Number,
    default: null
  },
  rows: {
    type: Number,
    default: null
  },
  supportedCurrencies: [{
    type: String,
    trim: true
  }],
  blockCountries: [{
    type: String,
    trim: true
  }],
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
gameSchema.index({ gpid: 1 });
gameSchema.index({ gameId: 1 });
gameSchema.index({ category: 1 });
gameSchema.index({ provider: 1 });
gameSchema.index({ isActive: 1, isEnabled: 1 });
gameSchema.index({ rank: 1 });

export default mongoose.model('Game', gameSchema);

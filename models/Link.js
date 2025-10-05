import mongoose from 'mongoose';

const LinkSchema = new mongoose.Schema({
  userId: {
    type: String,
    default: null, // null for anonymous users
  },
  fingerprint: {
    type: String,
    default: null, // browser fingerprint for anonymous users
  },
  originalUrl: {
    type: String,
    required: true,
  },
  shortCode: {
    type: String,
    required: true,
    unique: true,
  },
  customAlias: {
    type: String,
    default: null,
  },
  clicks: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: null,
  },
  userPlan: {
    type: String,
    enum: ['free', 'premium', 'premium_plus'],
    default: 'free',
  },
});

LinkSchema.index({ userId: 1 });

export default mongoose.models.Link || mongoose.model('Link', LinkSchema);
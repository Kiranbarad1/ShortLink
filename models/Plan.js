import mongoose from 'mongoose';

const PlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  displayName: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  linkExpiryDays: {
    type: Number,
    default: null, // null = no expiry
  },
  customAliasAllowed: {
    type: Boolean,
    default: false,
  },
  features: [{
    type: String,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Plan || mongoose.model('Plan', PlanSchema);
const mongoose = require('mongoose');

const SpinRewardSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['CREDITS','ITEM','TOKEN','COUPON'], default: 'CREDITS' },
    value: { type: mongoose.Schema.Types.Mixed, default: null },

    weight: { type: Number, required: true, default: 1 },

    wheel_position: { type: Number, default: 0 },

    daily_limit: { type: Number, default: 0 }, // 0 = unlimited
    monthly_limit: { type: Number, default: 0 }, // 0 = unlimited

    daily_claimed: { type: Number, default: 0 },
    monthly_claimed: { type: Number, default: 0 },

    is_active: { type: Boolean, default: true },

    icon_url: { type: String, default: '' },

    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

SpinRewardSchema.index({ wheel_position: 1 });
SpinRewardSchema.index({ is_active: 1 });

module.exports = mongoose.model('SpinReward', SpinRewardSchema);

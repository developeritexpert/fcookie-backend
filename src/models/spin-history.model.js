const mongoose = require('mongoose');

const SpinHistorySchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reward_id: { type: mongoose.Schema.Types.ObjectId, ref: 'SpinReward', required: true },
    reward_snapshot: { type: mongoose.Schema.Types.Mixed, required: true },
    credits_awarded: { type: Number, default: 0 },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
    ip: { type: String, default: '' },
    user_agent: { type: String, default: '' },
  },
  { timestamps: true }
);

SpinHistorySchema.index({ user_id: 1, createdAt: -1 });

module.exports = mongoose.model('SpinHistory', SpinHistorySchema);

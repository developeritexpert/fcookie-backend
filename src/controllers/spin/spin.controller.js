const { wrapAsync } = require('../../utils/wrap-async');
const { sendResponse } = require('../../utils/response');
const spinService = require('../../services/spin/spin.service');
const SpinReward = require('../../models/spin-reward.model');
const SpinHistory = require('../../models/spin-history.model');

const { ErrorHandler } = require('../../utils/error-handler');
const CONSTANT_ENUM = require('../../helper/constant-enums');

const createReward = wrapAsync(async (req, res) => {
  const count = await SpinReward.countDocuments();
  if (count >= CONSTANT_ENUM.MAX_SPIN_REWARDS) {
    throw new ErrorHandler(400, `spin.max_rewards_limit_reached`);
  }
  const payload = req.body;
  const created = await SpinReward.create(payload);
  sendResponse(res, created, 'spin.reward_create_success', 201);
});

const updateReward = wrapAsync(async (req, res) => {
  const updated = await SpinReward.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!updated) throw new ErrorHandler(404, 'spin.reward_not_found');
  sendResponse(res, updated, 'spin.reward_update_success', 200);
});

const listRewards = wrapAsync(async (req, res) => {
  const rewards = await SpinReward.find().sort({ wheel_position: 1 });
  const count = await SpinReward.countDocuments();
  sendResponse(res, rewards, 'spin.rewards_fetch_success', 200, {
    existingRewardsCount: count,
    maxRewards: CONSTANT_ENUM.MAX_SPIN_REWARDS
  });
});

const deleteReward = wrapAsync(async (req, res) => {
  await SpinReward.findByIdAndDelete(req.params.id);
  sendResponse(res, null, 'spin.reward_delete_success', 200);
});

const spinNow = wrapAsync(async (req, res) => {
  const userId = req.user.id;
  const meta = {
    ip: req.ip || req.headers['x-forwarded-for'] || '',
    user_agent: req.get('user-agent') || ''
  };

  const result = await spinService.spinForUser(userId, meta);

  const response = {
    reward_id: result.reward._id,
    wheel_position: result.reward.wheel_position,
    reward: result.reward,
    credits_awarded: result.credits_awarded,
    history: result.history
  };

  sendResponse(res, response, 'spin.spin_success', 200);
});

const getSpinHistory = wrapAsync(async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 20 } = req.query;

  const skip = (page - 1) * limit;

  const history = await SpinHistory.find({ user_id: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  const total = await SpinHistory.countDocuments({ user_id: userId });

  sendResponse(res, {
    data: history,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  }, 'spin.history_fetch_success', 200);
});
module.exports = {
  createReward,
  updateReward,
  listRewards,
  deleteReward,
  spinNow,
  getSpinHistory
};

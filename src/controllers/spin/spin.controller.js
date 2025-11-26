const { wrapAsync } = require('../../utils/wrap-async');
const { sendResponse } = require('../../utils/response');
const spinService = require('../../services/spin/spin.service');
const SpinReward = require('../../models/spin-reward.model');
const { ErrorHandler } = require('../../utils/error-handler');

const createReward = wrapAsync(async (req, res) => {
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
  sendResponse(res, rewards, 'spin.rewards_fetch_success', 200);
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

module.exports = {
  createReward,
  updateReward,
  listRewards,
  deleteReward,
  spinNow
};

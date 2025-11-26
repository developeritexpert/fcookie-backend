const mongoose = require('mongoose');
const SpinReward = require('../../models/spin-reward.model');
const SpinHistory = require('../../models/spin-history.model');
const { User } = require('../../models/user.model');
const { ErrorHandler } = require('../../utils/error-handler');
const { pickWeighted } = require('../../utils/utils');
const CONSTANT_ENUM = require('../../helper/constant-enums');

function isSameDay(d1, d2) {
  return d1.getUTCFullYear() === d2.getUTCFullYear() &&
    d1.getUTCMonth() === d2.getUTCMonth() &&
    d1.getUTCDate() === d2.getUTCDate();
}

async function refreshRewardCountersIfNeeded(reward) {
  // optional: if you want automatic reset you can add a last_reset date on reward
  // For simplicity here we rely on separate cron job to reset daily_claimed / monthly_claimed
  return reward;
}


async function chooseReward() {
  let rewards = await SpinReward.find({ is_active: true }).lean();
  if (!rewards || !rewards.length) throw new ErrorHandler(404, 'spin.no_rewards');

  const now = new Date();
  rewards = rewards.filter(r => {
    if (r.daily_limit && r.daily_limit > 0 && r.daily_claimed >= r.daily_limit) return false;
    if (r.monthly_limit && r.monthly_limit > 0 && r.monthly_claimed >= r.monthly_limit) return false;
    return true;
  });

  if (!rewards.length) throw new ErrorHandler(410, 'spin.no_rewards_available');

  const picked = pickWeighted(rewards);
  if (!picked) throw new ErrorHandler(500, 'spin.selection_failed');
  return picked;
}

async function spinForUser(userId, meta = {}) {
  if (!mongoose.Types.ObjectId.isValid(userId)) throw new ErrorHandler(400, 'spin.invalid_user');

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId).session(session);
    if (!user) throw new ErrorHandler(404, 'user.not_found');

    // if (!user.spin_tokens || user.spin_tokens < 1) {
    //   throw new ErrorHandler(403, 'spin.insufficient_tokens');
    // }

    const chosen = await chooseReward();

    let credits_awarded = 0;
    const details = { reward_id: chosen._id, reward_name: chosen.name };

    if (String(chosen.type) === CONSTANT_ENUM.SPIN_REWARD_TYPE.CREDITS) {
      credits_awarded = Number(chosen.value) || 0;
      user.credits = (user.credits || 0) + credits_awarded;
      details.credits_awarded = credits_awarded;
    } else if (String(chosen.type) === CONSTANT_ENUM.SPIN_REWARD_TYPE.TOKEN) {
      user.tokens = (user.tokens || 0) + (Number(chosen.value) || 0);
      details.tokens_awarded = Number(chosen.value) || 0;
    } else {
      details.payload = chosen.value;
    }

    user.spin_tokens = (user.spin_tokens || 0) - 1;
    await user.save({ session });

    await SpinReward.findByIdAndUpdate(chosen._id, {
      $inc: { daily_claimed: 1, monthly_claimed: 1 }
    }, { session });

    const history = await SpinHistory.create([{
      user_id: user._id,
      reward_id: chosen._id,
      reward_snapshot: chosen,
      credits_awarded,
      details,
      ip: meta.ip || '',
      user_agent: meta.user_agent || ''
    }], { session });

    await session.commitTransaction();
    session.endSession();

    return {
      reward: chosen,
      credits_awarded,
      history: history[0]
    };

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}

module.exports = {
  chooseReward,
  spinForUser
};

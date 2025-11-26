const mongoose = require('mongoose');
const SpinReward = require('../../models/spin-reward.model');
const SpinHistory = require('../../models/spin-history.model');
const { User } = require('../../models/user.model');
const { ErrorHandler } = require('../../utils/error-handler');
const { pickWeighted } = require('../../utils/utils');
const CONSTANT_ENUM = require('../../helper/constant-enums');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const config = require('../../config/config');

dayjs.extend(utc);
dayjs.extend(timezone);

function isSameDay(d1, d2) {
  const tz = config.server.appTimezone;
  const date1 = dayjs(d1).tz(tz);
  const date2 = dayjs(d2).tz(tz);
  return date1.isSame(date2, 'day');
}

async function refreshRewardCountersIfNeeded(reward) {
  return reward;
}

async function chooseReward(session) {
  let rewards = await SpinReward.find({ is_active: true }).session(session).lean();
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

    if (!user.spinStats) {
      user.spinStats = {
        totalPurchases: 0,
        totalSpinsAvailable: 0,
        spinsUsedToday: 0,
        lastSpinDate: null
      };
    }

    const now = new Date();
    const lastSpin = user.spinStats.lastSpinDate ? new Date(user.spinStats.lastSpinDate) : null;

    if (!lastSpin || !isSameDay(lastSpin, now)) {
      user.spinStats.spinsUsedToday = 0;
    }

    const isFreeSpin = user.spinStats.spinsUsedToday < 1;

    if (!isFreeSpin) {
      if (!user.spinStats.totalSpinsAvailable || user.spinStats.totalSpinsAvailable < 1) {
        throw new ErrorHandler(403, 'spin.insufficient_tokens');
      }
      user.spinStats.totalSpinsAvailable -= 1;
    }

    const chosen = await chooseReward(session);

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

    user.spinStats.spinsUsedToday += 1;
    user.spinStats.lastSpinDate = now;

    if (user.spin_tokens !== undefined) {
      user.spin_tokens = undefined;
    }

    await user.save({ session });

    const updateQuery = {
      _id: chosen._id,
      $and: [
        {
          $or: [
            { daily_limit: 0 },
            { $expr: { $lt: ['$daily_claimed', '$daily_limit'] } }
          ]
        },
        {
          $or: [
            { monthly_limit: 0 },
            { $expr: { $lt: ['$monthly_claimed', '$monthly_limit'] } }
          ]
        }
      ]
    };

    const updatedReward = await SpinReward.findOneAndUpdate(
      updateQuery,
      { $inc: { daily_claimed: 1, monthly_claimed: 1 } },
      { session, new: true }
    );

    if (!updatedReward) {
      throw new ErrorHandler(409, 'spin.reward_limit_reached_try_again');
    }

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

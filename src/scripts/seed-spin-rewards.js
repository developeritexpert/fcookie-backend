const mongoose = require('mongoose');
const SpinReward = require('../models/spin-reward.model');
const CONSTANT_ENUM = require('../helper/constant-enums');
require('dotenv').config();

async function seed() {
  await mongoose.connect(process.env.MONGO_URI, {});

  const items = [
    {
      name: '10 Credits',
      type: CONSTANT_ENUM.SPIN_REWARD_TYPE.CREDITS,
      value: 10,
      weight: 40,
      wheel_position: 0,
      icon_url: '/mnt/data/dcba665d-d172-4455-985c-c69529f87026.png',
      daily_limit: 0
    },
    {
      name: '50 Credits',
      type: CONSTANT_ENUM.SPIN_REWARD_TYPE.CREDITS,
      value: 50,
      weight: 15,
      wheel_position: 1,
      icon_url: '/mnt/data/dcba665d-d172-4455-985c-c69529f87026.png',
      daily_limit: 0
    },
    {
      name: 'Mystery Item',
      type: CONSTANT_ENUM.SPIN_REWARD_TYPE.ITEM,
      value: { sku: 'mystery-1' },
      weight: 10,
      wheel_position: 2,
      icon_url: '/mnt/data/dcba665d-d172-4455-985c-c69529f87026.png',
      daily_limit: 5
    },
    {
      name: 'Jackpot',
      type: CONSTANT_ENUM.SPIN_REWARD_TYPE.CREDITS,
      value: 1000,
      weight: 0.1,
      wheel_position: 3,
      icon_url: '/mnt/data/dcba665d-d172-4455-985c-c69529f87026.png',
      daily_limit: 1
    },
  ];

  for (const it of items) {
    await SpinReward.findOneAndUpdate({ name: it.name }, it, { upsert: true, new: true });
  }

  console.log('Seed complete');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});

const { Joi, Segments } = require('celebrate');
const mongoose = require('mongoose');
const CONSTANT_ENUM = require('../helper/constant-enums');

const objectId = Joi.string().custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) return helpers.error('any.invalid');
  return value;
}, 'ObjectId validation');

const createReward = {
  [Segments.BODY]: Joi.object().keys({
    name: Joi.string().min(1).max(200).required(),
    type: Joi.string().valid(...Object.values(CONSTANT_ENUM.SPIN_REWARD_TYPE)).required(),
    value: Joi.any().optional().allow(null),
    weight: Joi.number().positive().required(),
    wheel_position: Joi.number().integer().optional(),
    daily_limit: Joi.number().integer().min(0).optional(),
    monthly_limit: Joi.number().integer().min(0).optional(),
    icon_url: Joi.string().allow('').optional(),
    is_active: Joi.boolean().optional()
  }).unknown(true),
};

const updateReward = {
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.string().required()
  }),
  [Segments.BODY]: Joi.object().keys({
    name: Joi.string().min(1).max(200).optional(),
    type: Joi.string().valid(...Object.values(CONSTANT_ENUM.SPIN_REWARD_TYPE)).optional(),
    value: Joi.any().optional().allow(null),
    weight: Joi.number().positive().optional(),
    wheel_position: Joi.number().integer().optional(),
    daily_limit: Joi.number().integer().min(0).optional(),
    monthly_limit: Joi.number().integer().min(0).optional(),
    icon_url: Joi.string().allow('').optional(),
    is_active: Joi.boolean().optional()
  }).min(1).unknown(true)
};

const spinNow = {
  [Segments.BODY]: Joi.object().keys({}).unknown(true)
};

module.exports = {
  createReward,
  updateReward,
  spinNow
};

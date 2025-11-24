const { Joi, Segments } = require('celebrate');
const mongoose = require('mongoose');
const CONSTANT_ENUM = require('../helper/constant-enums');

const objectId = Joi.string().custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
}, 'ObjectId validation');

const createAsset = {
  [Segments.BODY]: Joi.object()
    .keys({
      name: Joi.string().min(2).max(255).required(),
      description: Joi.string().allow('').optional(),
      details: Joi.string().allow('').optional(),

      meta_title: Joi.string().max(60).optional().allow(''),
      meta_description: Joi.string().max(160).optional().allow(''),

      categoryId: objectId.required(),

      filters: Joi.array()
        .items(
          Joi.object({
            groupId: objectId.required(),
            valueId: objectId.required(),
          })
        )
        .optional(),

      price: Joi.number().positive().required(),
      listing_price: Joi.number().positive().optional(),
      listing_time: Joi.date().optional(),

      currency: Joi.string().valid(...Object.values(CONSTANT_ENUM.CURRENCY)).optional(),

      quantity: Joi.number().integer().min(0).optional(),

      images: Joi.array().items(Joi.string().uri()).optional(),
      thumbnail_url: Joi.string().uri().optional().allow(''),
      video_url: Joi.string().uri().optional().allow(''),

      status: Joi.string().valid(...Object.values(CONSTANT_ENUM.STATUS)).optional(),
      visibility: Joi.string().valid(...Object.values(CONSTANT_ENUM.VISIBILITY)).optional(),

      reseller_id: objectId.optional().allow(null),
      resell_price: Joi.number().positive().optional(),
      resell_time: Joi.date().optional(),
      reseller_users: Joi.array().items(objectId).optional(),

    //   owner_id: objectId.required(),
    })
    .unknown(true), 
};

const updateAsset = {
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.string().required().messages({
      'any.required': 'Asset ID is required',
    }),
  }),
  [Segments.BODY]: Joi.object()
    .keys({
      name: Joi.string().min(2).max(255).optional(),
      slug: Joi.string()
        .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .min(2)
        .max(255)
        .optional(),

      description: Joi.string().allow('').optional(),
      details: Joi.string().allow('').optional(),

      meta_title: Joi.string().max(60).optional().allow(''),
      meta_description: Joi.string().max(160).optional().allow(''),

      categoryId: objectId.optional(),

      filters: Joi.array()
        .items(
          Joi.object({
            groupId: objectId.required(),
            valueId: objectId.required(),
          })
        )
        .optional(),

      price: Joi.number().positive().optional(),
      listing_price: Joi.number().positive().optional(),
      listing_time: Joi.date().optional(),

      currency: Joi.string().valid(...Object.values(CONSTANT_ENUM.CURRENCY)).optional(),

      quantity: Joi.number().integer().min(0).optional(),

      images: Joi.array().items(Joi.string().uri()).optional(),
      thumbnail_url: Joi.string().uri().optional().allow(''),
      video_url: Joi.string().uri().optional().allow(''),

      status: Joi.string().valid(...Object.values(CONSTANT_ENUM.STATUS)).optional(),
      visibility: Joi.string().valid(...Object.values(CONSTANT_ENUM.VISIBILITY)).optional(),

      reseller_id: objectId.optional().allow(null),
      resell_price: Joi.number().positive().optional(),
      resell_time: Joi.date().optional(),
      reseller_users: Joi.array().items(objectId).optional(),

    //   owner_id: objectId.optional(),
    })
    .min(1)
    .messages({
      'object.min': 'At least one field must be updated',
    })
    .unknown(true),
};

const deleteAsset = {
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.string().required(),
  }),
};

const getAsset = {
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.string().required(),
  }),
};

const listAssets = {
  [Segments.QUERY]: Joi.object().keys({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(200).default(20),
    search: Joi.string().allow('').optional(),
    categoryId: Joi.string().optional().allow(''),
    minPrice: Joi.number().optional(),
    maxPrice: Joi.number().optional(),
    status: Joi.string().valid(...Object.values(CONSTANT_ENUM.STATUS)).optional(),
    visibility: Joi.string().valid(...Object.values(CONSTANT_ENUM.VISIBILITY)).optional(),
    sortBy: Joi.string().optional(),
    order: Joi.string().valid('asc', 'desc').optional(),
  }),
};

module.exports = {
  createAsset,
  updateAsset,
  deleteAsset,
  getAsset,
  listAssets,
};

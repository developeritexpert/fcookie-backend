// validations/asset.schema.js
const { Joi, Segments } = require('celebrate');
const mongoose = require('mongoose');
const CONSTANT_ENUM = require('../helper/constant-enums');

const objectId = Joi.string().custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
}, 'ObjectId Validation');

/* CREATE ASSET */
const createAsset = {
  [Segments.BODY]: Joi.object()
    .keys({
      name: Joi.string().min(2).max(255).required(),
      description: Joi.string().allow('').optional(),
      details: Joi.string().allow('').optional(),

      meta_title: Joi.string().max(60).allow('').optional(),
      meta_description: Joi.string().max(160).allow('').optional(),

      categoryId: objectId.required(),

    filters: Joi.alternatives()
      .try(
        Joi.array().items(
          Joi.object({
            groupId: objectId.required(),
            valueId: objectId.required(),
          })
        ),

        // Handle FormData string → parse to array
        Joi.string().custom((value, helpers) => {
          try {
            const parsed = JSON.parse(value);
            if (!Array.isArray(parsed)) {
              return helpers.error("any.invalid");
            }
            return parsed; // return parsed array to Joi
          } catch (e) {
            return helpers.error("any.invalid");
          }
        })
      )
      .optional(),


      price: Joi.number().positive().required(),
      listing_price: Joi.number().positive().optional(),
      listing_time: Joi.date().optional(),

      currency: Joi.string()
        .valid(...Object.values(CONSTANT_ENUM.CURRENCY))
        .optional(),

      quantity: Joi.number().integer().min(0).optional(),

      images: Joi.array().items(Joi.string().uri()).optional(),
      thumbnail_url: Joi.string().uri().allow('').optional(),
      video_url: Joi.string().uri().allow('').optional(),

      status: Joi.string().valid(...Object.values(CONSTANT_ENUM.STATUS)).optional(),
      visibility: Joi.string().valid(...Object.values(CONSTANT_ENUM.VISIBILITY)).optional(),

      reseller_id: objectId.allow(null).optional(),
      resell_price: Joi.number().positive().optional(),
      resell_time: Joi.date().optional(),
      reseller_users: Joi.array().items(objectId).optional(),
    })
    .unknown(true),
};

/* UPDATE ASSET */
const updateAsset = {
  [Segments.PARAMS]: Joi.object().keys({
    id: objectId.required(),
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

      meta_title: Joi.string().max(60).allow('').optional(),
      meta_description: Joi.string().max(160).allow('').optional(),

      categoryId: objectId.optional(),

    filters: Joi.alternatives()
      .try(
        Joi.array().items(
          Joi.object({
            groupId: objectId.required(),
            valueId: objectId.required(),
          })
        ),

        // Handle FormData string → parse to array
        Joi.string().custom((value, helpers) => {
          try {
            const parsed = JSON.parse(value);
            if (!Array.isArray(parsed)) {
              return helpers.error("any.invalid");
            }
            return parsed; // return parsed array to Joi
          } catch (e) {
            return helpers.error("any.invalid");
          }
        })
      )
      .optional(),

      price: Joi.number().positive().optional(),
      listing_price: Joi.number().positive().optional(),
      listing_time: Joi.date().optional(),

      currency: Joi.string()
        .valid(...Object.values(CONSTANT_ENUM.CURRENCY))
        .optional(),

      quantity: Joi.number().integer().min(0).optional(),

      images: Joi.array().items(Joi.string().uri()).optional(),
      existingImages: Joi.alternatives()
        .try(
          Joi.array().items(Joi.string()).optional(),
          Joi.string().optional() // allow JSON string
        )
        .optional(),


      thumbnail_url: Joi.string().uri().allow('').optional(),
      video_url: Joi.string().uri().allow('').optional(),

      status: Joi.string().valid(...Object.values(CONSTANT_ENUM.STATUS)).optional(),
      visibility: Joi.string().valid(...Object.values(CONSTANT_ENUM.VISIBILITY)).optional(),

      reseller_id: objectId.allow(null).optional(),
      resell_price: Joi.number().positive().optional(),
      resell_time: Joi.date().optional(),
      reseller_users: Joi.array().items(objectId).optional(),
    })
    .min(1)
    .messages({
      'object.min': 'At least one field must be updated',
    })
    .unknown(true),
};

const deleteAsset = {
  [Segments.PARAMS]: Joi.object().keys({
    id: objectId.required(),
  }),
};

const getAsset = {
  [Segments.PARAMS]: Joi.object().keys({
    id: objectId.required(),
  }),
};

const listAssets = {
  [Segments.QUERY]: Joi.object().keys({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(200).default(20),
    search: Joi.string().allow('').optional(),
    categoryId: objectId.optional().allow(''),
    minPrice: Joi.number().optional(),
    maxPrice: Joi.number().optional(),
    status: Joi.string().valid(...Object.values(CONSTANT_ENUM.STATUS)).optional(),
    visibility: Joi.string().valid(...Object.values(CONSTANT_ENUM.VISIBILITY)).optional(),
    sortBy: Joi.string().optional(),
    order: Joi.string().valid('asc', 'desc').optional(),
    filters: Joi.alternatives()
    .try(
      Joi.array().items(
        Joi.object({
          groupId: objectId.required(),
          valueId: objectId.required(),
        })
      ),

      // allow JSON string version for query
      Joi.string().custom((value, helpers) => {
        try {
          const parsed = JSON.parse(value);
          if (!Array.isArray(parsed)) return helpers.error("any.invalid");
          return parsed;
        } catch (e) {
          return helpers.error("any.invalid");
        }
      })
    )
    .optional(),

  }),
};

module.exports = {
  createAsset,
  updateAsset,
  deleteAsset,
  getAsset,
  listAssets,
};

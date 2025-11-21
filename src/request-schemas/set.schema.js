const { Joi, Segments } = require('celebrate');
const CONSTANT_ENUM = require('../helper/constant-enums');

const createSet = {
  [Segments.BODY]: Joi.object().keys({
    categoryId: Joi.string().length(24).hex().required().messages({
      'string.length': 'Invalid category ID',
      'string.hex': 'Invalid category ID',
      'any.required': 'Category ID is required',
    }),

    name: Joi.string().min(2).max(100).required(),

    status: Joi.string()
      .valid(...Object.values(CONSTANT_ENUM.STATUS))
      .optional(),
  }),
};

const updateSet = {
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.string().required(),
  }),

  [Segments.BODY]: Joi.object()
    .keys({
      name: Joi.string().min(2).max(100).optional(),
      categoryId: Joi.string().length(24).hex().optional().messages({
        'string.length': 'Invalid category ID',
        'string.hex': 'Invalid category ID',
      }),

      slug: Joi.string()
        .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .optional(),

      status: Joi.string()
        .valid(...Object.values(CONSTANT_ENUM.STATUS))
        .optional(),
    })
    .min(1),
};

const deleteSet = {
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.string().required(),
  }),
};

const getSet = {
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.string().required(),
  }),
};

const listSets = {
  [Segments.QUERY]: Joi.object().keys({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(200).default(20),
    search: Joi.string().allow('').optional(),
    name: Joi.string().allow('').optional(),
    status: Joi.string()
      .valid(...Object.values(CONSTANT_ENUM.STATUS))
      .optional(),
  }),
};

module.exports = {
  createSet,
  updateSet,
  deleteSet,
  getSet,
  listSets,
};

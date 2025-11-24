const { Joi, Segments } = require('celebrate');
const CONSTANT_ENUM = require('../helper/constant-enums');

const createFilterGroup = {
  [Segments.BODY]: Joi.object().keys({
    name: Joi.string().min(2).max(100).required().messages({
      'string.base': 'Name must be a string',
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters',
      'any.required': 'Name is required',
    }),

    slug: Joi.string()
      .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .min(2)
      .max(100)
      .optional()
      .messages({
        'string.pattern.base': 'Slug must contain only lowercase letters, numbers, and hyphens',
        'any.required': 'Slug is required',
      }),

    type: Joi.string()
      .valid(...Object.values(CONSTANT_ENUM.FILTER_TYPE))
      .optional(),

    required: Joi.boolean().optional(),
    archived: Joi.boolean().optional(),

    status: Joi.string()
      .valid(...Object.values(CONSTANT_ENUM.STATUS))
      .optional(),

    protected: Joi.boolean().optional(),
    order: Joi.number().integer().optional(),
  }),
};

const updateFilterGroup = {
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.string().required().messages({
      'any.required': 'FilterGroup ID is required',
    }),
  }),

  [Segments.BODY]: Joi.object()
    .keys({
      name: Joi.string().min(2).max(100).optional(),

      slug: Joi.string()
        .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .min(2)
        .max(100)
        .optional()
        .messages({
          'string.pattern.base': 'Slug must contain only lowercase letters, numbers, and hyphens',
        }),

      type: Joi.string()
        .valid(...Object.values(CONSTANT_ENUM.FILTER_TYPE))
        .optional(),

      required: Joi.boolean().optional(),
      archived: Joi.boolean().optional(),

      status: Joi.string()
        .valid(...Object.values(CONSTANT_ENUM.STATUS))
        .optional(),

      protected: Joi.boolean().optional(),
      order: Joi.number().integer().optional(),
    })
    .min(1)
    .messages({
      'object.min': 'At least one field must be updated',
    }),
};

const deleteFilterGroup = {
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.string().required().messages({
      'any.required': 'FilterGroup ID is required',
    }),
  }),
};

const getFilterGroup = {
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.string().required().messages({
      'any.required': 'FilterGroup ID is required',
    }),
  }),
};

const listFilterGroups = {
  [Segments.QUERY]: Joi.object().keys({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(200).default(20),
    search: Joi.string().allow('').optional(),
    name: Joi.string().allow('').optional(),
    slug: Joi.string().allow('').optional(),
    type: Joi.string()
      .valid(...Object.values(CONSTANT_ENUM.FILTER_TYPE))
      .optional(),
    status: Joi.string()
      .valid(...Object.values(CONSTANT_ENUM.STATUS))
      .optional(),
    archived: Joi.boolean().optional(),
    required: Joi.boolean().optional(),
    protected: Joi.boolean().optional(),
    sortBy: Joi.string().valid('name', 'slug', 'order', 'createdAt', 'updatedAt').optional(),
    order: Joi.string().valid('asc', 'desc').optional(),
  }),
};

module.exports = {
  createFilterGroup,
  updateFilterGroup,
  deleteFilterGroup,
  getFilterGroup,
  listFilterGroups,
};

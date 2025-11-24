const { Joi, Segments } = require('celebrate');
const CONSTANT_ENUM = require('../helper/constant-enums');

const createFilterValue = {
  [Segments.BODY]: Joi.object().keys({
    groupId: Joi.string().required().messages({
      'string.empty': 'Group ID is required',
      'any.required': 'Group ID is required',
    }),

    label: Joi.string().min(1).max(100).required().messages({
      'string.base': 'Label must be a string',
      'string.empty': 'Label is required',
      'any.required': 'Label is required',
    }),

    valueKey: Joi.string().min(1).max(100).required().messages({
      'string.empty': 'Value key is required',
      'any.required': 'Value key is required',
    }),

    archived: Joi.boolean().optional(),

    status: Joi.string()
      .valid(...Object.values(CONSTANT_ENUM.STATUS))
      .optional(),

    order: Joi.number().integer().optional(),
  }),
};

const updateFilterValue = {
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.string().required().messages({
      'any.required': 'FilterValue ID is required',
    }),
  }),

  [Segments.BODY]: Joi.object()
    .keys({
      groupId: Joi.string().optional(),

      label: Joi.string().min(1).max(100).optional(),

      valueKey: Joi.string().min(1).max(100).optional(),

      archived: Joi.boolean().optional(),

      status: Joi.string()
        .valid(...Object.values(CONSTANT_ENUM.STATUS))
        .optional(),

      order: Joi.number().integer().optional(),
    })
    .min(1)
    .messages({
      'object.min': 'At least one field must be updated',
    }),
};

const deleteFilterValue = {
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.string().required().messages({
      'any.required': 'FilterValue ID is required',
    }),
  }),
};

const getFilterValue = {
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.string().required().messages({
      'any.required': 'FilterValue ID is required',
    }),
  }),
};

const listFilterValues = {
  [Segments.QUERY]: Joi.object().keys({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(200).default(20),
    search: Joi.string().allow('').optional(),
    groupId: Joi.string().optional(),
    label: Joi.string().allow('').optional(),
    valueKey: Joi.string().allow('').optional(),
    status: Joi.string()
      .valid(...Object.values(CONSTANT_ENUM.STATUS))
      .optional(),
    archived: Joi.boolean().optional(),
    sortBy: Joi.string().valid('label', 'valueKey', 'order', 'createdAt', 'updatedAt').optional(),
    order: Joi.string().valid('asc', 'desc').optional(),
  }),
};

module.exports = {
  createFilterValue,
  updateFilterValue,
  deleteFilterValue,
  getFilterValue,
  listFilterValues,
};

const { Joi, Segments } = require('celebrate');

const createCategory = {
  [Segments.BODY]: Joi.object().keys({
    name: Joi.string().min(2).max(100).required().messages({
      'string.empty': 'Category name is required',
      'string.min': 'Category name must be at least 2 characters',
      'string.max': 'Category name must be less than 100 characters',
      'any.required': 'Category name is required',
    }),
    description: Joi.string().max(500).allow('', null, '').optional().messages({
      'string.max': 'Description must be less than 500 characters',
    }),
    status: Joi.string().valid('ACTIVE', 'INACTIVE').default('ACTIVE').optional().messages({
      'any.only': 'Status must be either ACTIVE or INACTIVE',
    }),
  }).unknown(true), // Allow unknown fields (for file handling)
};

const updateCategory = {
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.string().required().messages({
      'string.empty': 'Category ID is required',
      'any.required': 'Category ID is required',
    }),
  }),
  [Segments.BODY]: Joi.object().keys({
    name: Joi.string().min(2).max(100).optional().messages({
      'string.min': 'Category name must be at least 2 characters',
      'string.max': 'Category name must be less than 100 characters',
    }),
    description: Joi.string().max(500).allow('', null, '').optional().messages({
      'string.max': 'Description must be less than 500 characters',
    }),
    status: Joi.string().valid('ACTIVE', 'INACTIVE').optional().messages({
      'any.only': 'Status must be either ACTIVE or INACTIVE',
    }),
    removeIcon: Joi.alternatives()
      .try(Joi.boolean(), Joi.string().valid('true', 'false'))
      .optional(),
  }).unknown(true), // Allow unknown fields (for file handling)
};

const getCategory = {
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.string().required().messages({
      'string.empty': 'Category ID is required',
      'any.required': 'Category ID is required',
    }),
  }),
};

const deleteCategory = {
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.string().required().messages({
      'string.empty': 'Category ID is required',
      'any.required': 'Category ID is required',
    }),
  }),
};

const listCategories = {
  [Segments.QUERY]: Joi.object().keys({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().allow('', null),
    status: Joi.string().valid('ACTIVE', 'INACTIVE').allow('', null),
    sortBy: Joi.string().valid('name', 'createdAt', 'updatedAt', 'status').default('createdAt'),
    order: Joi.string().valid('asc', 'desc').default('desc'),
  }),
};

module.exports = {
  createCategory,
  updateCategory,
  getCategory,
  deleteCategory,
  listCategories,
};
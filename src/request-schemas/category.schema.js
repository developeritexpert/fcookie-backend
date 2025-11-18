const { Joi, Segments } = require("celebrate");
const CONSTANT_ENUM = require("../helper/constant-enums");

const createCategory = {
  [Segments.BODY]: Joi.object().keys({
    name: Joi.string().min(2).max(100).required().messages({
      "string.base": "Name must be a string",
      "string.empty": "Name is required",
      "string.min": "Name must be at least 2 characters",
      "any.required": "Name is required",
    }),

    description: Joi.string().allow("").optional(),
    icon: Joi.string().allow("").optional(),
    
    status: Joi.string()
      .valid(...Object.values(CONSTANT_ENUM.STATUS))
      .optional(),
  }),
};

const updateCategory = {
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.string().required().messages({
      "any.required": "Category ID is required",
    }),
  }),

  [Segments.BODY]: Joi.object()
    .keys({
      name: Joi.string().min(2).max(100).optional(),

      description: Joi.string().allow("").optional(),
      icon: Joi.string().allow("").optional(),

      status: Joi.string()
        .valid(...Object.values(CONSTANT_ENUM.STATUS))
        .optional(),
    })
    .min(1)
    .messages({
      "object.min": "At least one field must be updated",
    }),
};

const deleteCategory = {
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.string().required().messages({
      "any.required": "Category ID is required",
    }),
  }),
};

const getCategory = {
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.string().required().messages({
      "any.required": "Category ID is required",
    }),
  }),
};

const listCategories = {
  [Segments.QUERY]: Joi.object().keys({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(200).default(20),
    search: Joi.string().allow("").optional(),
    status: Joi.string()
      .valid(...Object.values(CONSTANT_ENUM.STATUS))
      .optional(),
    isActive: Joi.boolean().optional(),
  }),
};

module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  listCategories,
};

const { Joi, Segments } = require('celebrate');
const CONSTANT_ENUM = require('../helper/constant-enums.js');

const objectIdValidator = Joi.string().hex().length(24).messages({
  'string.hex': 'Invalid ID format',
  'string.length': 'Invalid ID length',
  'any.required': 'ID is required',
});

const createUserByAdmin = {
  [Segments.BODY]: Joi.object({
    email: Joi.string().email().lowercase().trim().required().messages({
      'string.email': 'Email must be a valid email address',
      'any.required': 'Email is required',
    }),

    name: Joi.string().min(2).max(50).trim().required().messages({
      'string.base': 'Name must be a string',
      'any.required': 'Name is required',
    }),

    password: Joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters',
      'any.required': 'Password is required',
    }),

    confirmPassword: Joi.string()
      .required()
      .valid(Joi.ref('password'))
      .messages({
        'any.only': 'Confirm password does not match password',
        'any.required': 'Confirm password is required',
      }),

    phoneNumber: Joi.string().trim().optional().allow(''),

    avatar: Joi.string().optional().allow(''),

    role: Joi.string()
      .valid(...Object.values(CONSTANT_ENUM.USER_ROLE))
      .default(CONSTANT_ENUM.USER_ROLE.USER),
  }).unknown(true), // 🔥 IMPORTANT for multipart/form-data
};

const getUserById = {
  [Segments.PARAMS]: Joi.object().keys({
    userId: objectIdValidator.required(),
  }),
};

const updateUser = {
  [Segments.BODY]: Joi.object({
    name: Joi.string().min(2).max(50).trim().optional(),

    email: Joi.string().email().lowercase().trim().optional(),

    phoneNumber: Joi.string().trim().optional().allow(''),

    password: Joi.string().min(6).optional(),

    confirmPassword: Joi.string()
      .optional()
      .valid(Joi.ref('password'))
      .messages({
        'any.only': 'Confirm password does not match password',
      }),

    avatar: Joi.string().optional().allow(''),

    role: Joi.string() // ✅ ADD THIS
      .valid(...Object.values(CONSTANT_ENUM.USER_ROLE))
      .optional(),

    isActive: Joi.boolean().optional(),
  }).unknown(true), // ✅ important for multipart
};





module.exports = {
  createUserByAdmin,
  getUserById,
  updateUser,
};
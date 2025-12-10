const { Joi, Segments } = require('celebrate');
const CONSTANT_ENUM = require('../helper/constant-enums.js');

const objectIdValidator = Joi.string().hex().length(24).messages({
  'string.hex': 'Invalid ID format',
  'string.length': 'Invalid ID length',
  'any.required': 'ID is required',
});

const createUserByAdmin = {
  [Segments.BODY]: Joi.object().keys({
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

    confirmPassword: Joi.string().valid(Joi.ref('password')).messages({
      'any.only': 'Confirm password does not match password',
      'any.required': 'Confirm password is required',
    }),

    phoneNumber: Joi.string().trim().optional().allow('').messages({
      'string.base': 'Phone number must be a string',
    }),

    avatar: Joi.string().optional().allow(''),

    role: Joi.string()
      .valid(...Object.values(CONSTANT_ENUM.USER_ROLE))
      .default(CONSTANT_ENUM.USER_ROLE.USER),
  }),
};

const getUserById = {
  [Segments.PARAMS]: Joi.object().keys({
    userId: objectIdValidator.required(),
  }),
};

const updateUser = {
  [Segments.BODY]: Joi.object().keys({
    email: Joi.string().email().lowercase().trim().optional(),
    name: Joi.string().min(2).max(50).trim().optional(),
    phoneNumber: Joi.string().trim().optional().allow(''),
    avatar: Joi.string().optional().allow(''),

    password: Joi.string().min(6).optional(),
    confirmPassword: Joi.when('password', {
      is: Joi.exist(),
      then: Joi.string().valid(Joi.ref('password')).required().messages({
        'any.only': 'Confirm password does not match password',
        'any.required': 'Confirm password is required',
      }),
      otherwise: Joi.forbidden(),
    }),


  }).min(1),
};




module.exports = {
  createUserByAdmin,
  getUserById,
  updateUser,
};
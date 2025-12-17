const express = require('express');
const userRouter = express.Router();
const UserController = require('../controllers/user.controllers.js');
const checkAuth = require('../middleware/check-auth.js');
const authorizedRoles = require('../middleware/authorized-roles.js');
const CONSTANT_ENUM = require('../helper/constant-enums.js');
const UserSchema = require('../request-schemas/user.schema.js');
const { celebrate } = require('celebrate');
const upload = require('../middleware/multer');
const uploadToCloudinary = require('../middleware/cloudinary-uploader');

const API = {
  GET_ALL_USERS: '/',
  ADD_USER: '/',
  GET_USER_BY_ID: '/:userId',
  UPDATE_USER: '/:userId',
  DELETE_USER_BY_ID: '/:userId',
};

userRouter.use(checkAuth);

userRouter.get(
  API.GET_ALL_USERS,
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN]),
  UserController.getAll
);

userRouter.get(
  API.GET_USER_BY_ID,
  celebrate(UserSchema.getUserById),
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN, CONSTANT_ENUM.USER_ROLE.USER]),
  UserController.getOne
);

userRouter.put(
  API.UPDATE_USER,
  upload.single('avatar'),
  uploadToCloudinary('avatar', 'users'),
  celebrate(UserSchema.updateUser),
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.USER, CONSTANT_ENUM.USER_ROLE.ADMIN]),
  UserController.update
);

userRouter.delete(
  API.DELETE_USER_BY_ID,
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN, CONSTANT_ENUM.USER_ROLE.USER]),
  UserController.remove
);
userRouter.post(
  API.ADD_USER,
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN]),
  upload.single('avatar'),
  uploadToCloudinary('avatar', 'users'),
  celebrate(UserSchema.createUserByAdmin),
  UserController.create
);

module.exports = userRouter;

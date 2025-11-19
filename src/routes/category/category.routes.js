const express = require('express');
const categoryRouter = express.Router();

const categoryController = require('../../controllers/category/category.controller');
const CategorySchema = require('../../request-schemas/category.schema');
const { celebrate } = require('celebrate');
const checkAuth = require('../../middleware/check-auth');
const authorizedRoles = require('../../middleware/authorized-roles');
const CONSTANT_ENUM = require('../../helper/constant-enums');

const API = {
  CREATE: '/',
  GET_ALL: '/',
  GET_BY_ID: '/:id',
  UPDATE_BY_ID: '/:id',
  DELETE_BY_ID: '/:id',
};

categoryRouter.use(checkAuth);

categoryRouter.post(
  API.CREATE,
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN]),
  celebrate(CategorySchema.createCategory),
  categoryController.createCategory
);

categoryRouter.get(
  API.GET_ALL,
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN, CONSTANT_ENUM.USER_ROLE.USER]),
  celebrate(CategorySchema.listCategories),
  categoryController.getAllCategories
);

categoryRouter.get(
  API.GET_BY_ID,
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN, CONSTANT_ENUM.USER_ROLE.USER]),
  celebrate(CategorySchema.getCategory),
  categoryController.getCategoryById
);

categoryRouter.put(
  API.UPDATE_BY_ID,
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN]),
  celebrate(CategorySchema.updateCategory),
  categoryController.updateCategory
);

categoryRouter.delete(
  API.DELETE_BY_ID,
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN]),
  celebrate(CategorySchema.deleteCategory),
  categoryController.deleteCategory
);

module.exports = categoryRouter;

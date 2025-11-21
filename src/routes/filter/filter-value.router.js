const express = require('express');
const filterValueRouter = express.Router();

const filterValueController = require('../../controllers/filter/filter-value.controller');
const FilterValueSchema = require('../../request-schemas/filter-value.schema');
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

filterValueRouter.use(checkAuth);

filterValueRouter.post(
  API.CREATE,
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN]),
  celebrate(FilterValueSchema.createFilterValue),
  filterValueController.createFilterValue
);

filterValueRouter.get(
  API.GET_ALL,
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN, CONSTANT_ENUM.USER_ROLE.USER]),
  celebrate(FilterValueSchema.listFilterValues),
  filterValueController.getAllFilterValues
);

filterValueRouter.get(
  API.GET_BY_ID,
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN, CONSTANT_ENUM.USER_ROLE.USER]),
  celebrate(FilterValueSchema.getFilterValue),
  filterValueController.getFilterValueById
);

filterValueRouter.put(
  API.UPDATE_BY_ID,
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN]),
  celebrate(FilterValueSchema.updateFilterValue),
  filterValueController.updateFilterValue
);

filterValueRouter.delete(
  API.DELETE_BY_ID,
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN]),
  celebrate(FilterValueSchema.deleteFilterValue),
  filterValueController.deleteFilterValue
);

module.exports = filterValueRouter;

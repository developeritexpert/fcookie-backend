const express = require('express');
const filterGroupRouter = express.Router();

const filterGroupController = require('../../controllers/filter/filter-group.controller');
const FilterGroupSchema = require('../../request-schemas/filter-group.schema');
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

filterGroupRouter.use(checkAuth);

filterGroupRouter.post(
  API.CREATE,
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN]),
  celebrate(FilterGroupSchema.createFilterGroup),
  filterGroupController.createFilterGroup
);

filterGroupRouter.get(
  API.GET_ALL,
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN, CONSTANT_ENUM.USER_ROLE.USER]),
  celebrate(FilterGroupSchema.listFilterGroups),
  filterGroupController.getAllFilterGroups
);

filterGroupRouter.get(
  API.GET_BY_ID,
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN, CONSTANT_ENUM.USER_ROLE.USER]),
  celebrate(FilterGroupSchema.getFilterGroup),
  filterGroupController.getFilterGroupById
);

filterGroupRouter.put(
  API.UPDATE_BY_ID,
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN]),
  celebrate(FilterGroupSchema.updateFilterGroup),
  filterGroupController.updateFilterGroup
);

filterGroupRouter.delete(
  API.DELETE_BY_ID,
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN]),
  celebrate(FilterGroupSchema.deleteFilterGroup),
  filterGroupController.deleteFilterGroup
);

module.exports = filterGroupRouter;

const express = require('express');
const SetRouter = express.Router();

const setController = require('../../controllers/set/set.controller');
const SetSchema = require('../../request-schemas/set.schema');
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

SetRouter.use(checkAuth);

SetRouter.post(
  API.CREATE,
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN]),
  celebrate(SetSchema.createSet),
  setController.createSet
);

SetRouter.get(API.GET_ALL, celebrate(SetSchema.listSets), setController.getAllSets);

SetRouter.get(API.GET_BY_ID, celebrate(SetSchema.getSet), setController.getSetById);

SetRouter.put(
  API.UPDATE_BY_ID,
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN]),
  celebrate(SetSchema.updateSet),
  setController.updateSet
);

SetRouter.delete(
  API.DELETE_BY_ID,
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN]),
  celebrate(SetSchema.deleteSet),
  setController.deleteSet
);

module.exports = SetRouter;

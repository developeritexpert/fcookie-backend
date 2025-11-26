const express = require('express');
const router = express.Router();
const spinController = require('../../controllers/spin/spin.controller');
const { celebrate } = require('celebrate');
const SpinSchema = require('../../request-schemas/spin.schema');
const checkAuth = require('../../middleware/check-auth');
const authorizedRoles = require('../../middleware/authorized-roles');
const CONSTANT_ENUM = require('../../helper/constant-enums');

router.use(checkAuth);
const API = {
  CREATE: '/',
  GET_ALL: '/',
  GET_BY_ID: '/:id',
  UPDATE_BY_ID: '/:id',
  DELETE_BY_ID: '/:id',
  SPIN: '/spin-wheel',
};
router.post(
  API.CREATE,
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN]),
  celebrate(SpinSchema.createReward),
  spinController.createReward
);

router.put(
  API.UPDATE_BY_ID,
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN]),
  celebrate(SpinSchema.updateReward),
  spinController.updateReward
);

router.get(
  API.GET_ALL,
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN, CONSTANT_ENUM.USER_ROLE.USER]),
  spinController.listRewards
);

router.delete(
  API.DELETE_BY_ID,
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN]),
  spinController.deleteReward
);

router.post(
  API.SPIN,
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN, CONSTANT_ENUM.USER_ROLE.USER]),
  celebrate(SpinSchema.spinNow),
  spinController.spinNow
);

module.exports = router;

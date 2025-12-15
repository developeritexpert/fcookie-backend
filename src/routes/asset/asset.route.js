const express = require('express');
const assetRouter = express.Router();

const assetController = require('../../controllers/asset/asset.controller');
const AssetSchema = require('../../request-schemas/asset.schema');

const { celebrate } = require('celebrate');
const checkAuth = require('../../middleware/check-auth');
const authorizedRoles = require('../../middleware/authorized-roles');
const CONSTANT_ENUM = require('../../helper/constant-enums');
const upload = require('../../middleware/multer');

const API = {
  CREATE: '/',
  GET_ALL: '/',
  GET_BY_ID: '/:id',
  UPDATE_BY_ID: '/:id',
  DELETE_BY_ID: '/:id',
  GET_AVAILABLE_FILTERS: '/filters',
};

// 🔐 Authentication required for all asset routes
assetRouter.use(checkAuth);



assetRouter.get(
  API.GET_AVAILABLE_FILTERS,
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN, CONSTANT_ENUM.USER_ROLE.USER]),
  assetController.getAvailableFilters
);


/**
 * @route POST /assets
 * @desc Create new asset
 */
assetRouter.post(
  API.CREATE,
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN, CONSTANT_ENUM.USER_ROLE.USER]),
  upload.fields([
    { name: 'images', maxCount: 12 },
    { name: 'thumbnail', maxCount: 1 },
    { name: 'video', maxCount: 1 },
  ]),
  celebrate(AssetSchema.createAsset),
  assetController.createAsset
);

/**
 * @route GET /assets
 * @desc Get all assets with filters
 */
assetRouter.get(
  API.GET_ALL,
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN, CONSTANT_ENUM.USER_ROLE.USER]),
  celebrate(AssetSchema.listAssets),
  assetController.getAllAssets
);

/**
 * @route GET /assets/:id
 * @desc Get asset by ID
 */
assetRouter.get(
  API.GET_BY_ID,
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN, CONSTANT_ENUM.USER_ROLE.USER]),
  celebrate(AssetSchema.getAsset),
  assetController.getAssetById
);

/**
 * @route PUT /assets/:id
 * @desc Update asset
 */
assetRouter.put(
  API.UPDATE_BY_ID,
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN, CONSTANT_ENUM.USER_ROLE.USER]),
  upload.fields([
    { name: 'images', maxCount: 12 },
    { name: 'thumbnail', maxCount: 1 },
    { name: 'video', maxCount: 1 },
  ]),
  celebrate(AssetSchema.updateAsset),
  assetController.updateAsset
);

/**
 * @route DELETE /assets/:id
 * @desc Delete asset
 */
assetRouter.delete(
  API.DELETE_BY_ID,
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN]),
  celebrate(AssetSchema.deleteAsset),
  assetController.deleteAsset
);




module.exports = assetRouter;

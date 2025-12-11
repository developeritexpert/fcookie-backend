// controllers/asset.controller.js
const { wrapAsync } = require('../../utils/wrap-async');
const { sendResponse } = require('../../utils/response');
const assetService = require('../../services/asset/asset.service');

const createAsset = wrapAsync(async (req, res) => {
  req.body.owner_id = req.user.id;

  const data = await assetService.createAsset(req.body, req.files || {});
  sendResponse(res, data, 'asset.create_success', 201);
});

const getAllAssets = wrapAsync(async (req, res) => {
  const result = await assetService.getAllAssets(req.query);
  sendResponse(res, result, 'asset.fetch_success', 200);
});

const getAssetById = wrapAsync(async (req, res) => {
  const data = await assetService.getAssetById(req.params.id);
  sendResponse(res, data, 'asset.fetch_success', 200);
});

const updateAsset = wrapAsync(async (req, res) => {
  const data = await assetService.updateAsset(req.params.id, req.body, req.files || {});
  sendResponse(res, data, 'asset.update_success', 200);
});

const deleteAsset = wrapAsync(async (req, res) => {
  await assetService.deleteAsset(req.params.id);
  sendResponse(res, null, 'asset.delete_success', 200);
});

module.exports = {
  createAsset,
  getAllAssets,
  getAssetById,
  updateAsset,
  deleteAsset,
};

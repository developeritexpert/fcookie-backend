const { wrapAsync } = require('../../utils/wrap-async');
const { sendResponse } = require('../../utils/response');
const setService = require('../../services/set/set.service');
const { getPaginationParams, buildSetFilters } = require('../../utils/pagination');

const createSet = wrapAsync(async (req, res) => {
  const data = await setService.createSet(req.body);
  sendResponse(res, data, 'set.create_success', 201);
});

const getAllSets = wrapAsync(async (req, res) => {
  const { page, limit } = getPaginationParams(req.query);
  const filters = buildSetFilters(req.query);
  const sortBy = req.query.sortBy || 'createdAt';
  const order = req.query.order || 'desc';

  const result = await setService.getAllSets(page, limit, filters, sortBy, order);
  sendResponse(res, result, 'set.fetch_success', 200);
});

const getSetById = wrapAsync(async (req, res) => {
  const data = await setService.getSetById(req.params.id);
  sendResponse(res, data, 'set.fetch_success', 200);
});

const updateSet = wrapAsync(async (req, res) => {
  const data = await setService.updateSet(req.params.id, req.body);
  sendResponse(res, data, 'set.update_success', 200);
});

const deleteSet = wrapAsync(async (req, res) => {
  await setService.deleteSet(req.params.id);
  sendResponse(res, null, 'set.delete_success', 200);
});

module.exports = {
  createSet,
  getAllSets,
  getSetById,
  updateSet,
  deleteSet,
};

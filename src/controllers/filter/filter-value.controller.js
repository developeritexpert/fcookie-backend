const { wrapAsync } = require('../../utils/wrap-async');
const { sendResponse } = require('../../utils/response');
const filterValueService = require('../../services/filter/filter-value.service');
const { getPaginationParams, buildFilterValueFilters } = require('../../utils/pagination');

const createFilterValue = wrapAsync(async (req, res) => {
  const data = await filterValueService.createFilterValue(req.body);
  sendResponse(res, data, 'filter_value.create_success', 201);
});

const getAllFilterValues = wrapAsync(async (req, res) => {
  const { page, limit } = getPaginationParams(req.query);
  const filters = buildFilterValueFilters(req.query);
  const sortBy = req.query.sortBy || 'createdAt';
  const order = req.query.order || 'desc';

  const result = await filterValueService.getAllFilterValues(page, limit, filters, sortBy, order);
  sendResponse(res, result, 'filter_value.fetch_success', 200);
});

const getFilterValueById = wrapAsync(async (req, res) => {
  const data = await filterValueService.getFilterValueById(req.params.id);
  sendResponse(res, data, 'filter_value.fetch_success', 200);
});

const updateFilterValue = wrapAsync(async (req, res) => {
  const data = await filterValueService.updateFilterValue(req.params.id, req.body);
  sendResponse(res, data, 'filter_value.update_success', 200);
});

const deleteFilterValue = wrapAsync(async (req, res) => {
  await filterValueService.deleteFilterValue(req.params.id);
  sendResponse(res, null, 'filter_value.delete_success', 200);
});

module.exports = {
  createFilterValue,
  getAllFilterValues,
  getFilterValueById,
  updateFilterValue,
  deleteFilterValue,
};

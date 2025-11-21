const { wrapAsync } = require('../../utils/wrap-async');
const { sendResponse } = require('../../utils/response');
const filterGroupService = require('../../services/filter/filter-group.service');
const { getPaginationParams, buildFilterGroupFilters } = require('../../utils/pagination');

const createFilterGroup = wrapAsync(async (req, res) => {
  const data = await filterGroupService.createFilterGroup(req.body);
  sendResponse(res, data, 'filter_group.create_success', 201);
});

const getAllFilterGroups = wrapAsync(async (req, res) => {
  const { page, limit } = getPaginationParams(req.query);
  const filters = buildFilterGroupFilters(req.query);
  const sortBy = req.query.sortBy || 'createdAt';
  const order = req.query.order || 'desc';

  const result = await filterGroupService.getAllFilterGroups(page, limit, filters, sortBy, order);
  sendResponse(res, result, 'filter_group.fetch_success', 200);
});

const getFilterGroupById = wrapAsync(async (req, res) => {
  const data = await filterGroupService.getFilterGroupById(req.params.id);
  sendResponse(res, data, 'filter_group.fetch_success', 200);
});

const updateFilterGroup = wrapAsync(async (req, res) => {
  const data = await filterGroupService.updateFilterGroup(req.params.id, req.body);
  sendResponse(res, data, 'filter_group.update_success', 200);
});

const deleteFilterGroup = wrapAsync(async (req, res) => {
  await filterGroupService.deleteFilterGroup(req.params.id);
  sendResponse(res, null, 'filter_group.delete_success', 200);
});

module.exports = {
  createFilterGroup,
  getAllFilterGroups,
  getFilterGroupById,
  updateFilterGroup,
  deleteFilterGroup,
};

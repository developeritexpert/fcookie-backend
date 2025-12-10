const { wrapAsync } = require('../../utils/wrap-async');
const { sendResponse } = require('../../utils/response');
const categoryService = require('../../services/category/category.service');
const { getPaginationParams, buildCategoryFilters } = require('../../utils/pagination');

const createCategory = wrapAsync(async (req, res) => {
  // Debug logging
  console.log('=== CREATE CATEGORY DEBUG ===');
  console.log('Body:', req.body);
  console.log('File:', req.file);
  console.log('=============================');

  const file = req.file || null;
  const payload = req.body || {};

  const data = await categoryService.createCategory(payload, file);
  sendResponse(res, data, 'category.create_success', 201);
});

const getAllCategories = wrapAsync(async (req, res) => {
  const { page, limit } = getPaginationParams(req.query);
  console.log("query",req.query);
  const filters = buildCategoryFilters(req.query);
  const sortBy = req.query.sortBy || 'createdAt';
  const order = req.query.order || 'desc';

  const result = await categoryService.getAllCategories(page, limit, filters, sortBy, order);
  sendResponse(res, result, 'category.fetch_success', 200);
});

const getCategoryById = wrapAsync(async (req, res) => {
  const data = await categoryService.getCategoryById(req.params.id);
  sendResponse(res, data, 'category.fetch_success', 200);
});

const updateCategory = wrapAsync(async (req, res) => {
  // Debug logging
  console.log('=== UPDATE CATEGORY DEBUG ===');
  console.log('Params:', req.params);
  console.log('Body:', req.body);
  console.log('File:', req.file);
  console.log('=============================');

  const file = req.file || null;
  const payload = req.body || {};

  const data = await categoryService.updateCategory(req.params.id, payload, file);
  sendResponse(res, data, 'category.update_success', 200);
});

const deleteCategory = wrapAsync(async (req, res) => {
  await categoryService.deleteCategory(req.params.id);
  sendResponse(res, null, 'category.delete_success', 200);
});

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
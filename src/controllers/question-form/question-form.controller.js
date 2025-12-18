const { wrapAsync } = require('../../utils/wrap-async');
const { sendResponse } = require('../../utils/response');
const questionFormService = require('../../services/question-form/question-form.service');
const { getPaginationParams ,buildQuestionFormFilters} = require('../../utils/pagination');
// const { buildQuestionFormFilters } = require('../../utils/pagination');

const createQuestionForm = wrapAsync(async (req, res) => {
  console.log('=== CREATE QUESTION FORM DEBUG ===');
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('Files:', req.files);
  console.log('===================================');

  const files = {
    icon: req.files?.icon?.[0] || null,
    coverImage: req.files?.coverImage?.[0] || null,
  };
  const userId = req.user?._id || null;

  const data = await questionFormService.createQuestionForm(req.body, files, userId);
  sendResponse(res, data, 'question_form.create_success', 201);
});

const getAllQuestionForms = wrapAsync(async (req, res) => {
  const { page, limit } = getPaginationParams(req.query);
  const filters = buildQuestionFormFilters(req.query);
  const sortBy = req.query.sortBy || 'createdAt';
  const order = req.query.order || 'desc';

  const result = await questionFormService.getAllQuestionForms(page, limit, filters, sortBy, order);
  sendResponse(res, result, 'question_form.fetch_success', 200);
});

const getQuestionFormById = wrapAsync(async (req, res) => {
  const data = await questionFormService.getQuestionFormById(req.params.id);
  sendResponse(res, data, 'question_form.fetch_success', 200);
});

const getQuestionFormBySlug = wrapAsync(async (req, res) => {
  const data = await questionFormService.getQuestionFormBySlug(req.params.slug);
  sendResponse(res, data, 'question_form.fetch_success', 200);
});

const updateQuestionForm = wrapAsync(async (req, res) => {
  console.log('=== UPDATE QUESTION FORM DEBUG ===');
  console.log('Params:', req.params);
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('Files:', req.files);
  console.log('===================================');

  const files = {
    icon: req.files?.icon?.[0] || null,
    coverImage: req.files?.coverImage?.[0] || null,
  };
  const userId = req.user?._id || null;

  const data = await questionFormService.updateQuestionForm(req.params.id, req.body, files, userId);
  sendResponse(res, data, 'question_form.update_success', 200);
});

const deleteQuestionForm = wrapAsync(async (req, res) => {
  await questionFormService.deleteQuestionForm(req.params.id);
  sendResponse(res, null, 'question_form.delete_success', 200);
});

// Field Management
const addField = wrapAsync(async (req, res) => {
  const data = await questionFormService.addFieldToForm(req.params.id, req.body);
  sendResponse(res, data, 'question_form.field_added', 200);
});

const updateField = wrapAsync(async (req, res) => {
  const data = await questionFormService.updateFieldInForm(req.params.id, req.params.fieldId, req.body);
  sendResponse(res, data, 'question_form.field_updated', 200);
});

const removeField = wrapAsync(async (req, res) => {
  const data = await questionFormService.removeFieldFromForm(req.params.id, req.params.fieldId);
  sendResponse(res, data, 'question_form.field_removed', 200);
});

// Step Management
const addStep = wrapAsync(async (req, res) => {
  const data = await questionFormService.addStepToForm(req.params.id, req.body);
  sendResponse(res, data, 'question_form.step_added', 200);
});

const updateStep = wrapAsync(async (req, res) => {
  const data = await questionFormService.updateStepInForm(req.params.id, parseInt(req.params.stepNumber), req.body);
  sendResponse(res, data, 'question_form.step_updated', 200);
});

const removeStep = wrapAsync(async (req, res) => {
  const data = await questionFormService.removeStepFromForm(req.params.id, parseInt(req.params.stepNumber));
  sendResponse(res, data, 'question_form.step_removed', 200);
});

// Content Section Management
const addContentSection = wrapAsync(async (req, res) => {
  const data = await questionFormService.addContentSectionToForm(req.params.id, req.body);
  sendResponse(res, data, 'question_form.section_added', 200);
});

const updateContentSection = wrapAsync(async (req, res) => {
  const data = await questionFormService.updateContentSectionInForm(req.params.id, req.params.sectionId, req.body);
  sendResponse(res, data, 'question_form.section_updated', 200);
});

const removeContentSection = wrapAsync(async (req, res) => {
  const data = await questionFormService.removeContentSectionFromForm(req.params.id, req.params.sectionId);
  sendResponse(res, data, 'question_form.section_removed', 200);
});

// Reorder
const reorderItems = wrapAsync(async (req, res) => {
  const data = await questionFormService.reorderItems(req.params.id, req.body.type, req.body.items);
  sendResponse(res, data, 'question_form.reorder_success', 200);
});

// Statistics
const getFormStatistics = wrapAsync(async (req, res) => {
  const data = await questionFormService.getFormStatistics(req.params.id);
  sendResponse(res, data, 'question_form.statistics_success', 200);
});

module.exports = {
  createQuestionForm,
  getAllQuestionForms,
  getQuestionFormById,
  getQuestionFormBySlug,
  updateQuestionForm,
  deleteQuestionForm,
  addField,
  updateField,
  removeField,
  addStep,
  updateStep,
  removeStep,
  addContentSection,
  updateContentSection,
  removeContentSection,
  reorderItems,
  getFormStatistics,
};
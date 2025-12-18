const { wrapAsync } = require('../../utils/wrap-async');
const { sendResponse } = require('../../utils/response');
const submissionService = require('../../services/question-submission/question-submission.service');
const { getPaginationParams ,buildSubmissionFilters} = require('../../utils/pagination');
// const { buildSubmissionFilters } = require('../../utils/question-form.filter');

const createSubmission = wrapAsync(async (req, res) => {
  console.log('=== CREATE SUBMISSION DEBUG ===');
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('Files:', req.files);
  console.log('================================');

  const files = req.files || [];
  const userId = req.user?._id || null;
  const requestInfo = {
    ip: req.ip || req.connection?.remoteAddress,
    userAgent: req.get('User-Agent'),
  };

  const data = await submissionService.createSubmission(req.body, files, userId, requestInfo);
  sendResponse(res, data, 'submission.create_success', 201);
});

const getAllSubmissions = wrapAsync(async (req, res) => {
  const { page, limit } = getPaginationParams(req.query);
  const filters = buildSubmissionFilters(req.query);
  const sortBy = req.query.sortBy || 'createdAt';
  const order = req.query.order || 'desc';

  const result = await submissionService.getAllSubmissions(page, limit, filters, sortBy, order);
  sendResponse(res, result, 'submission.fetch_success', 200);
});

const getSubmissionById = wrapAsync(async (req, res) => {
  const data = await submissionService.getSubmissionById(req.params.id);
  sendResponse(res, data, 'submission.fetch_success', 200);
});

const updateSubmission = wrapAsync(async (req, res) => {
  console.log('=== UPDATE SUBMISSION DEBUG ===');
  console.log('Params:', req.params);
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('================================');

  const files = req.files || [];
  const userId = req.user?._id || null;

  const data = await submissionService.updateSubmission(req.params.id, req.body, files, userId);
  sendResponse(res, data, 'submission.update_success', 200);
});

const saveStepProgress = wrapAsync(async (req, res) => {
  const { id, stepNumber } = req.params;
  const data = await submissionService.saveStepProgress(id, parseInt(stepNumber), req.body.responses);
  sendResponse(res, data, 'submission.step_saved', 200);
});

const deleteSubmission = wrapAsync(async (req, res) => {
  await submissionService.deleteSubmission(req.params.id);
  sendResponse(res, null, 'submission.delete_success', 200);
});

const reviewSubmission = wrapAsync(async (req, res) => {
  const reviewerId = req.user?._id;
  const data = await submissionService.reviewSubmission(
    req.params.id,
    req.body.status,
    req.body.adminNotes,
    reviewerId
  );
  sendResponse(res, data, 'submission.review_success', 200);
});

const getSubmissionsByForm = wrapAsync(async (req, res) => {
  const { page, limit } = getPaginationParams(req.query);
  const filters = {};
  if (req.query.status) filters.status = req.query.status;

  const sortBy = req.query.sortBy || 'createdAt';
  const order = req.query.order || 'desc';

  const result = await submissionService.getSubmissionsByForm(req.params.formId, page, limit, filters, sortBy, order);
  sendResponse(res, result, 'submission.fetch_success', 200);
});

const getUserSubmissions = wrapAsync(async (req, res) => {
  const userId = req.user._id;
  const { page, limit } = getPaginationParams(req.query);
  const filters = buildSubmissionFilters(req.query);
  const sortBy = req.query.sortBy || 'createdAt';
  const order = req.query.order || 'desc';

  const result = await submissionService.getUserSubmissions(userId, page, limit, filters, sortBy, order);
  sendResponse(res, result, 'submission.fetch_success', 200);
});

const getSubmissionStatistics = wrapAsync(async (req, res) => {
  const filters = {};
  if (req.query.questionForm) filters.questionForm = req.query.questionForm;

  const data = await submissionService.getSubmissionStatistics(filters);
  sendResponse(res, data, 'submission.statistics_success', 200);
});

module.exports = {
  createSubmission,
  getAllSubmissions,
  getSubmissionById,
  updateSubmission,
  saveStepProgress,
  deleteSubmission,
  reviewSubmission,
  getSubmissionsByForm,
  getUserSubmissions,
  getSubmissionStatistics,
};
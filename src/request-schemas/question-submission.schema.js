const { Joi, Segments } = require('celebrate');

// Field response validation
const fieldResponseSchema = Joi.object({
  fieldId: Joi.string().required().messages({
    'string.empty': 'Field ID is required',
    'any.required': 'Field ID is required',
  }),
  fieldLabel: Joi.string().required(),
  fieldType: Joi.string().required(),
  value: Joi.any().required().messages({
    'any.required': 'Field value is required',
  }),
  displayValue: Joi.string().allow('', null).default(''),
});

// Step response validation
const stepResponseSchema = Joi.object({
  stepNumber: Joi.number().integer().min(1).required(),
  stepTitle: Joi.string().required(),
  responses: Joi.array().items(fieldResponseSchema).required(),
  completedAt: Joi.date().allow(null),
});

// Guest info validation
const guestInfoSchema = Joi.object({
  name: Joi.string().allow('', null).default(''),
  email: Joi.string().email().allow('', null).default(''),
  phone: Joi.string().allow('', null).default(''),
});

// Create Submission
const createSubmission = {
  [Segments.BODY]: Joi.object()
    .keys({
      questionForm: Joi.string().required().messages({
        'string.empty': 'Question form ID is required',
        'any.required': 'Question form ID is required',
      }),
      guestInfo: guestInfoSchema.optional(),
      stepResponses: Joi.array().items(stepResponseSchema).default([]),
      responses: Joi.array().items(fieldResponseSchema).default([]),
      submissionType: Joi.string().valid('complete', 'partial', 'draft').default('complete'),
      currentStep: Joi.number().integer().min(1).default(1),
      completedSteps: Joi.array().items(Joi.number().integer().min(1)).default([]),
      startedAt: Joi.date().optional(),
      timeSpentSeconds: Joi.number().integer().min(0).default(0),
    })
    .unknown(true),
};

// Update Submission (for drafts or admin updates)
const updateSubmission = {
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.string().required().messages({
      'string.empty': 'Submission ID is required',
      'any.required': 'Submission ID is required',
    }),
  }),
  [Segments.BODY]: Joi.object()
    .keys({
      guestInfo: guestInfoSchema.optional(),
      stepResponses: Joi.array().items(stepResponseSchema).optional(),
      responses: Joi.array().items(fieldResponseSchema).optional(),
      status: Joi.string().valid('draft', 'submitted', 'reviewed', 'approved', 'rejected', 'archived').optional(),
      submissionType: Joi.string().valid('complete', 'partial', 'draft').optional(),
      currentStep: Joi.number().integer().min(1).optional(),
      completedSteps: Joi.array().items(Joi.number().integer().min(1)).optional(),
      adminNotes: Joi.string().allow('', null).optional(),
      timeSpentSeconds: Joi.number().integer().min(0).optional(),
    })
    .unknown(true),
};

// Save Step (for multi-step forms)
const saveStep = {
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.string().required(),
    stepNumber: Joi.number().integer().min(1).required(),
  }),
  [Segments.BODY]: Joi.object().keys({
    responses: Joi.array().items(fieldResponseSchema).required(),
  }),
};

// Get Submission
const getSubmission = {
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.string().required().messages({
      'string.empty': 'Submission ID is required',
      'any.required': 'Submission ID is required',
    }),
  }),
};

// Delete Submission
const deleteSubmission = {
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.string().required().messages({
      'string.empty': 'Submission ID is required',
      'any.required': 'Submission ID is required',
    }),
  }),
};

// List Submissions
const listSubmissions = {
  [Segments.QUERY]: Joi.object().keys({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().allow('', null),
    questionForm: Joi.string().allow('', null),
    status: Joi.string().valid('draft', 'submitted', 'reviewed', 'approved', 'rejected', 'archived').allow('', null),
    submissionType: Joi.string().valid('complete', 'partial', 'draft').allow('', null),
    submittedBy: Joi.string().allow('', null),
    startDate: Joi.date().allow('', null),
    endDate: Joi.date().allow('', null),
    sortBy: Joi.string().valid('createdAt', 'updatedAt', 'completedAt', 'status').default('createdAt'),
    order: Joi.string().valid('asc', 'desc').default('desc'),
  }),
};

// Review Submission
const reviewSubmission = {
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.string().required(),
  }),
  [Segments.BODY]: Joi.object().keys({
    status: Joi.string().valid('reviewed', 'approved', 'rejected').required(),
    adminNotes: Joi.string().allow('', null).optional(),
  }),
};

// Get Submissions by Form
const getSubmissionsByForm = {
  [Segments.PARAMS]: Joi.object().keys({
    formId: Joi.string().required(),
  }),
  [Segments.QUERY]: Joi.object().keys({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    status: Joi.string().valid('draft', 'submitted', 'reviewed', 'approved', 'rejected', 'archived').allow('', null),
    sortBy: Joi.string().valid('createdAt', 'updatedAt', 'completedAt').default('createdAt'),
    order: Joi.string().valid('asc', 'desc').default('desc'),
  }),
};

module.exports = {
  createSubmission,
  updateSubmission,
  saveStep,
  getSubmission,
  deleteSubmission,
  listSubmissions,
  reviewSubmission,
  getSubmissionsByForm,
};
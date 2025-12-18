const express = require('express');
const questionFormRouter = express.Router();

const questionFormController = require('../../controllers/question-form/question-form.controller');
const QuestionFormSchema = require('../../request-schemas/question-form.schema');
const { celebrate } = require('celebrate');
const checkAuth = require('../../middleware/check-auth');
const optionalAuth = require('../../middleware/optionalAuth');
const authorizedRoles = require('../../middleware/authorized-roles');
const CONSTANT_ENUM = require('../../helper/constant-enums');
const upload = require('../../middleware/multer');
const parseJsonFormData = require('../../middleware/json-formdata-parser');
const API = {
  // Main CRUD
  CREATE: '/',
  GET_ALL: '/',
  GET_BY_ID: '/:id',
  GET_BY_SLUG: '/slug/:slug',
  UPDATE_BY_ID: '/:id',
  DELETE_BY_ID: '/:id',

  // Field management
  ADD_FIELD: '/:id/fields',
  UPDATE_FIELD: '/:id/fields/:fieldId',
  REMOVE_FIELD: '/:id/fields/:fieldId',

  // Step management
  ADD_STEP: '/:id/steps',
  UPDATE_STEP: '/:id/steps/:stepNumber',
  REMOVE_STEP: '/:id/steps/:stepNumber',

  // Content section management
  ADD_CONTENT_SECTION: '/:id/content-sections',
  UPDATE_CONTENT_SECTION: '/:id/content-sections/:sectionId',
  REMOVE_CONTENT_SECTION: '/:id/content-sections/:sectionId',

  // Reorder
  REORDER: '/:id/reorder',

  // Statistics
  STATISTICS: '/:id/statistics',
};

// Public routes
questionFormRouter.get(
  API.GET_ALL,
  optionalAuth,
  celebrate(QuestionFormSchema.listQuestionForms),
  questionFormController.getAllQuestionForms
);

questionFormRouter.get(
  API.GET_BY_SLUG,
  optionalAuth,
  celebrate(QuestionFormSchema.getQuestionFormBySlug),
  questionFormController.getQuestionFormBySlug
);

// Protected routes
questionFormRouter.use(checkAuth);

// Get by ID (authenticated users)
questionFormRouter.get(
  API.GET_BY_ID,
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN, CONSTANT_ENUM.USER_ROLE.USER]),
  celebrate(QuestionFormSchema.getQuestionForm),
  questionFormController.getQuestionFormById
);

// Admin only routes
// Create form
questionFormRouter.post(
  API.CREATE,
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN]),
  upload.fields([
    { name: 'icon', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
  ]),
  parseJsonFormData, 
  celebrate(QuestionFormSchema.createQuestionForm, { abortEarly: false }),
  questionFormController.createQuestionForm
);

// Update form
questionFormRouter.put(
  API.UPDATE_BY_ID,
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN]),
  upload.fields([
    { name: 'icon', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
  ]),
  parseJsonFormData,
  celebrate(QuestionFormSchema.updateQuestionForm, { abortEarly: false }),
  questionFormController.updateQuestionForm
);

// Delete form
questionFormRouter.delete(
  API.DELETE_BY_ID,
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN]),
  celebrate(QuestionFormSchema.deleteQuestionForm),
  questionFormController.deleteQuestionForm
);

// Field management routes
questionFormRouter.post(
  API.ADD_FIELD,
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN]),
  celebrate(QuestionFormSchema.addField),
  questionFormController.addField
);

questionFormRouter.put(
  API.UPDATE_FIELD,
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN]),
  questionFormController.updateField
);

questionFormRouter.delete(
  API.REMOVE_FIELD,
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN]),
  questionFormController.removeField
);

// Step management routes
questionFormRouter.post(
  API.ADD_STEP,
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN]),
  celebrate(QuestionFormSchema.addStep),
  questionFormController.addStep
);

questionFormRouter.put(
  API.UPDATE_STEP,
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN]),
  questionFormController.updateStep
);

questionFormRouter.delete(
  API.REMOVE_STEP,
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN]),
  questionFormController.removeStep
);

// Content section management routes
questionFormRouter.post(
  API.ADD_CONTENT_SECTION,
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN]),
  celebrate(QuestionFormSchema.addContentSection),
  questionFormController.addContentSection
);

questionFormRouter.put(
  API.UPDATE_CONTENT_SECTION,
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN]),
  questionFormController.updateContentSection
);

questionFormRouter.delete(
  API.REMOVE_CONTENT_SECTION,
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN]),
  questionFormController.removeContentSection
);

// Reorder route
questionFormRouter.post(
  API.REORDER,
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN]),
  celebrate(QuestionFormSchema.reorder),
  questionFormController.reorderItems
);

// Statistics route
questionFormRouter.get(
  API.STATISTICS,
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN]),
  questionFormController.getFormStatistics
);

module.exports = questionFormRouter;
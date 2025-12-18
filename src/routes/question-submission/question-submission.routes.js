const express = require('express');
const submissionRouter = express.Router();

const submissionController = require('../../controllers/question-submission/question-submission.controller');
const SubmissionSchema = require('../../request-schemas/question-submission.schema');
const { celebrate } = require('celebrate');
const checkAuth = require('../../middleware/check-auth');
const optionalAuth = require('../../middleware/optionalAuth');
const authorizedRoles = require('../../middleware/authorized-roles');
const CONSTANT_ENUM = require('../../helper/constant-enums');
const upload = require('../../middleware/multer');

const API = {
  // Main CRUD
  CREATE: '/',
  GET_ALL: '/',
  GET_BY_ID: '/:id',
  UPDATE_BY_ID: '/:id',
  DELETE_BY_ID: '/:id',

  // Step progress (for multi-step forms)
  SAVE_STEP: '/:id/steps/:stepNumber',

  // Review
  REVIEW: '/:id/review',

  // Get by form
  BY_FORM: '/form/:formId',

  // User submissions
  MY_SUBMISSIONS: '/my-submissions',

  // Statistics
  STATISTICS: '/statistics',
};

// Public submission (with optional auth for guest submissions)
submissionRouter.post(
  API.CREATE,
  optionalAuth,
  upload.array('attachments', 10),
  celebrate(SubmissionSchema.createSubmission, { abortEarly: false }),
  submissionController.createSubmission
);

// Protected routes
submissionRouter.use(checkAuth);

// User routes
submissionRouter.get(
  API.MY_SUBMISSIONS,
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.USER, CONSTANT_ENUM.USER_ROLE.ADMIN]),
  submissionController.getUserSubmissions
);

// Get submission by ID
submissionRouter.get(
  API.GET_BY_ID,
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.USER, CONSTANT_ENUM.USER_ROLE.ADMIN]),
  celebrate(SubmissionSchema.getSubmission),
  submissionController.getSubmissionById
);

// Update submission (for drafts)
submissionRouter.put(
  API.UPDATE_BY_ID,
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.USER, CONSTANT_ENUM.USER_ROLE.ADMIN]),
  upload.array('attachments', 10),
  celebrate(SubmissionSchema.updateSubmission, { abortEarly: false }),
  submissionController.updateSubmission
);

// Save step progress
submissionRouter.post(
  API.SAVE_STEP,
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.USER, CONSTANT_ENUM.USER_ROLE.ADMIN]),
  celebrate(SubmissionSchema.saveStep),
  submissionController.saveStepProgress
);

// Admin only routes
// Get all submissions
submissionRouter.get(
  API.GET_ALL,
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN]),
  celebrate(SubmissionSchema.listSubmissions),
  submissionController.getAllSubmissions
);

// Get submissions by form
submissionRouter.get(
  API.BY_FORM,
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN]),
  celebrate(SubmissionSchema.getSubmissionsByForm),
  submissionController.getSubmissionsByForm
);

// Review submission
submissionRouter.post(
  API.REVIEW,
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN]),
  celebrate(SubmissionSchema.reviewSubmission),
  submissionController.reviewSubmission
);

// Delete submission
submissionRouter.delete(
  API.DELETE_BY_ID,
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN]),
  celebrate(SubmissionSchema.deleteSubmission),
  submissionController.deleteSubmission
);

// Statistics
submissionRouter.get(
  API.STATISTICS,
  authorizedRoles([CONSTANT_ENUM.USER_ROLE.ADMIN]),
  submissionController.getSubmissionStatistics
);

module.exports = submissionRouter;
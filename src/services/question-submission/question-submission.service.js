const QuestionSubmission = require('../../models/question-submission.model');
const QuestionForm = require('../../models/question-form.model');
const { ErrorHandler } = require('../../utils/error-handler');
const { uploadBuffer, deleteFromCloudinary } = require('../../utils/cloudinary');
const { buildFieldResponse } = require('../../builders/question-form.builder');

/**
 * Create a new submission
 */
const createSubmission = async (payload, files = [], userId = null, requestInfo = {}) => {
  try {
    // Verify form exists
    const form = await QuestionForm.findById(payload.questionForm);
    if (!form) {
      throw new ErrorHandler(404, 'question_form.not_found');
    }

    if (form.status !== 'ACTIVE') {
      throw new ErrorHandler(400, 'submission.form_inactive');
    }

    // Check visibility and authentication
    if (form.visibility === 'authenticated' && !userId) {
      throw new ErrorHandler(401, 'submission.authentication_required');
    }

    // Process responses
    const processedResponses = (payload.responses || []).map((response) => buildFieldResponse(response));

    // Process step responses
    const processedStepResponses = (payload.stepResponses || []).map((step) => ({
      stepNumber: step.stepNumber,
      stepTitle: step.stepTitle,
      responses: (step.responses || []).map((response) => buildFieldResponse(response)),
      completedAt: step.completedAt || new Date(),
    }));

    // Build submission data
    const submissionData = {
      questionForm: payload.questionForm,
      submittedBy: userId || null,
      guestInfo: payload.guestInfo || {},
      stepResponses: processedStepResponses,
      responses: processedResponses,
      status: payload.submissionType === 'draft' ? 'draft' : 'submitted',
      submissionType: payload.submissionType || 'complete',
      currentStep: payload.currentStep || 1,
      completedSteps: payload.completedSteps || [],
      ipAddress: requestInfo.ip || null,
      userAgent: requestInfo.userAgent || null,
      startedAt: payload.startedAt || new Date(),
      completedAt: payload.submissionType === 'complete' ? new Date() : null,
      timeSpentSeconds: payload.timeSpentSeconds || 0,
    };

    // Handle file uploads
    if (files && files.length > 0) {
      submissionData.attachments = [];
      for (const file of files) {
        const uploadResult = await uploadBuffer(file.buffer, {
          folder: 'submissions/attachments',
          resource_type: 'auto',
        });
        submissionData.attachments.push({
          fieldId: file.fieldname,
          fileName: file.originalname,
          fileUrl: uploadResult.secure_url,
          fileType: file.mimetype,
          fileSize: file.size,
        });
      }
    }

    const submission = await QuestionSubmission.create(submissionData);

    // Update form submission count
    await QuestionForm.findByIdAndUpdate(payload.questionForm, {
      $inc: { totalSubmissions: 1 },
    });

    return await QuestionSubmission.findById(submission._id)
      .populate('questionForm', 'title slug')
      .populate('submittedBy', 'name email');
  } catch (err) {
    if (err instanceof ErrorHandler) throw err;
    throw new ErrorHandler(500, err.message);
  }
};

/**
 * Get all submissions with pagination and filters
 */
const getAllSubmissions = async (page, limit, filters, sortBy = 'createdAt', order = 'desc') => {
  const skip = (page - 1) * limit;
  const sortOrder = order === 'asc' ? 1 : -1;
  const sort = { [sortBy]: sortOrder };

  const [submissions, total] = await Promise.all([
    QuestionSubmission.find(filters)
      .populate('questionForm', 'title slug')
      .populate('submittedBy', 'name email')
      .populate('reviewedBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    QuestionSubmission.countDocuments(filters),
  ]);

  return {
    data: submissions,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get submission by ID
 */
const getSubmissionById = async (id) => {
  const submission = await QuestionSubmission.findById(id)
    .populate('questionForm', 'title slug category formConfig')
    .populate('submittedBy', 'name email')
    .populate('reviewedBy', 'name email');

  if (!submission) throw new ErrorHandler(404, 'submission.not_found');
  return submission;
};

/**
 * Update submission (for drafts or admin updates)
 */
const updateSubmission = async (id, payload, files = [], userId = null) => {
  try {
    const submission = await QuestionSubmission.findById(id);
    if (!submission) {
      throw new ErrorHandler(404, 'submission.not_found');
    }

    // Only drafts can be updated by users, admins can update any
    if (submission.status !== 'draft' && !userId) {
      throw new ErrorHandler(403, 'submission.cannot_update');
    }

    const updateData = {};

    // Handle updatable fields
    if (payload.guestInfo) updateData.guestInfo = payload.guestInfo;
    if (payload.responses) {
      updateData.responses = payload.responses.map((r) => buildFieldResponse(r));
    }
    if (payload.stepResponses) {
      updateData.stepResponses = payload.stepResponses.map((step) => ({
        stepNumber: step.stepNumber,
        stepTitle: step.stepTitle,
        responses: step.responses.map((r) => buildFieldResponse(r)),
        completedAt: step.completedAt || new Date(),
      }));
    }
    if (payload.status) updateData.status = payload.status;
    if (payload.submissionType) updateData.submissionType = payload.submissionType;
    if (payload.currentStep) updateData.currentStep = payload.currentStep;
    if (payload.completedSteps) updateData.completedSteps = payload.completedSteps;
    if (payload.adminNotes !== undefined) updateData.adminNotes = payload.adminNotes;
    if (payload.timeSpentSeconds !== undefined) {
      updateData.timeSpentSeconds = (submission.timeSpentSeconds || 0) + payload.timeSpentSeconds;
    }

    // Handle completion
    if (payload.submissionType === 'complete' && submission.submissionType !== 'complete') {
      updateData.completedAt = new Date();
      updateData.status = 'submitted';
    }

    // Handle new file uploads
    if (files && files.length > 0) {
      const newAttachments = [];
      for (const file of files) {
        const uploadResult = await uploadBuffer(file.buffer, {
          folder: 'submissions/attachments',
          resource_type: 'auto',
        });
        newAttachments.push({
          fieldId: file.fieldname,
          fileName: file.originalname,
          fileUrl: uploadResult.secure_url,
          fileType: file.mimetype,
          fileSize: file.size,
        });
      }
      updateData.attachments = [...(submission.attachments || []), ...newAttachments];
    }

    const updated = await QuestionSubmission.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('questionForm', 'title slug')
      .populate('submittedBy', 'name email');

    return updated;
  } catch (err) {
    if (err instanceof ErrorHandler) throw err;
    throw new ErrorHandler(500, err.message);
  }
};

/**
 * Save step progress (for multi-step forms)
 */
const saveStepProgress = async (submissionId, stepNumber, responses) => {
  const submission = await QuestionSubmission.findById(submissionId);
  if (!submission) {
    throw new ErrorHandler(404, 'submission.not_found');
  }

  const form = await QuestionForm.findById(submission.questionForm);
  if (!form || !form.formConfig.isMultiStep) {
    throw new ErrorHandler(400, 'submission.not_multistep_form');
  }

  const step = form.steps.find((s) => s.stepNumber === stepNumber);
  if (!step) {
    throw new ErrorHandler(404, 'question_form.step_not_found');
  }

  // Find or create step response
  const stepResponseIndex = submission.stepResponses.findIndex((sr) => sr.stepNumber === stepNumber);

  const stepResponse = {
    stepNumber,
    stepTitle: step.title,
    responses: responses.map((r) => buildFieldResponse(r)),
    completedAt: new Date(),
  };

  if (stepResponseIndex !== -1) {
    submission.stepResponses[stepResponseIndex] = stepResponse;
  } else {
    submission.stepResponses.push(stepResponse);
  }

  // Update completed steps
  if (!submission.completedSteps.includes(stepNumber)) {
    submission.completedSteps.push(stepNumber);
  }

  // Update current step
  submission.currentStep = Math.max(submission.currentStep, stepNumber + 1);

  await submission.save();
  return submission;
};

/**
 * Delete submission
 */
const deleteSubmission = async (id) => {
  const submission = await QuestionSubmission.findById(id);
  if (!submission) throw new ErrorHandler(404, 'submission.not_found');

  // Delete attachments from cloud storage
  if (submission.attachments && submission.attachments.length > 0) {
    for (const attachment of submission.attachments) {
      try {
        await deleteFromCloudinary(attachment.fileUrl);
      } catch (e) {
        console.error('Failed to delete attachment:', e);
      }
    }
  }

  // Decrement form submission count
  await QuestionForm.findByIdAndUpdate(submission.questionForm, {
    $inc: { totalSubmissions: -1 },
  });

  await QuestionSubmission.findByIdAndDelete(id);
  return true;
};

/**
 * Review submission (approve/reject)
 */
const reviewSubmission = async (id, status, adminNotes, reviewerId) => {
  const submission = await QuestionSubmission.findById(id);
  if (!submission) throw new ErrorHandler(404, 'submission.not_found');

  const validStatuses = ['reviewed', 'approved', 'rejected'];
  if (!validStatuses.includes(status)) {
    throw new ErrorHandler(400, 'submission.invalid_status');
  }

  const updated = await QuestionSubmission.findByIdAndUpdate(
    id,
    {
      status,
      adminNotes: adminNotes || submission.adminNotes,
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
    },
    { new: true }
  )
    .populate('questionForm', 'title slug')
    .populate('submittedBy', 'name email')
    .populate('reviewedBy', 'name email');

  return updated;
};

/**
 * Get submissions by form ID
 */
const getSubmissionsByForm = async (formId, page, limit, filters = {}, sortBy = 'createdAt', order = 'desc') => {
  const form = await QuestionForm.findById(formId);
  if (!form) throw new ErrorHandler(404, 'question_form.not_found');

  const queryFilters = { ...filters, questionForm: formId };

  return getAllSubmissions(page, limit, queryFilters, sortBy, order);
};

/**
 * Get user's submissions
 */
const getUserSubmissions = async (userId, page, limit, filters = {}, sortBy = 'createdAt', order = 'desc') => {
  const queryFilters = { ...filters, submittedBy: userId };
  return getAllSubmissions(page, limit, queryFilters, sortBy, order);
};

/**
 * Get submission statistics
 */
const getSubmissionStatistics = async (filters = {}) => {
  const stats = await QuestionSubmission.aggregate([
    { $match: filters },
    {
      $group: {
        _id: {
          status: '$status',
          submissionType: '$submissionType',
        },
        count: { $sum: 1 },
        avgTimeSpent: { $avg: '$timeSpentSeconds' },
      },
    },
  ]);

  const totalSubmissions = await QuestionSubmission.countDocuments(filters);
  const recentSubmissions = await QuestionSubmission.countDocuments({
    ...filters,
    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  });

  return {
    total: totalSubmissions,
    lastWeek: recentSubmissions,
    breakdown: stats,
  };
};

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
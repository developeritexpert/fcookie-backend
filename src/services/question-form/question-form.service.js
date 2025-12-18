const QuestionForm = require('../../models/question-form.model');
const QuestionSubmission = require('../../models/question-submission.model');
const { ErrorHandler } = require('../../utils/error-handler');
const { uploadBuffer, deleteFromCloudinary } = require('../../utils/cloudinary');
const {
  buildQuestionFormPayload,
  buildFormField,
  buildFormStep,
  buildContentSection,
} = require('../../builders/question-form.builder');

/**
 * Create a new question form
 */
const createQuestionForm = async (payload, files = {}, userId = null) => {
  try {
    // Process payload with builder
    const formData = buildQuestionFormPayload(payload);

    // Upload icon if provided
    if (files.icon) {
      const uploadResult = await uploadBuffer(files.icon.buffer, {
        folder: 'question-forms/icons',
        resource_type: 'image',
      });
      formData.icon = uploadResult.secure_url;
    }

    // Upload cover image if provided
    if (files.coverImage) {
      const uploadResult = await uploadBuffer(files.coverImage.buffer, {
        folder: 'question-forms/covers',
        resource_type: 'image',
      });
      formData.coverImage = uploadResult.secure_url;
    }

    // Set created by
    if (userId) {
      formData.createdBy = userId;
    }

    const questionForm = await QuestionForm.create(formData);
    return await QuestionForm.findById(questionForm._id).populate('category', 'name slug');
  } catch (err) {
    if (err.code === 11000) {
      throw new ErrorHandler(409, 'question_form.title_exists');
    }
    if (err instanceof ErrorHandler) throw err;
    throw new ErrorHandler(500, err.message);
  }
};

/**
 * Get all question forms with pagination and filters
 */
const getAllQuestionForms = async (page, limit, filters, sortBy = 'createdAt', order = 'desc') => {
  const skip = (page - 1) * limit;
  const sortOrder = order === 'asc' ? 1 : -1;
  const sort = { [sortBy]: sortOrder };

  const [forms, total] = await Promise.all([
    QuestionForm.find(filters).populate('category', 'name slug icon').sort(sort).skip(skip).limit(limit).lean(),
    QuestionForm.countDocuments(filters),
  ]);

  return {
    data: forms,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get question form by ID
 */
const getQuestionFormById = async (id) => {
  const form = await QuestionForm.findById(id)
    .populate('category', 'name slug icon')
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

  if (!form) throw new ErrorHandler(404, 'question_form.not_found');
  return form;
};

/**
 * Get question form by slug
 */
const getQuestionFormBySlug = async (slug) => {
  const form = await QuestionForm.findOne({ slug, status: 'ACTIVE' })
    .populate('category', 'name slug icon')
    .lean();

  if (!form) throw new ErrorHandler(404, 'question_form.not_found');
  return form;
};

/**
 * Update question form
 */
const updateQuestionForm = async (id, payload, files = {}, userId = null) => {
  try {
    const existingForm = await QuestionForm.findById(id);
    if (!existingForm) {
      throw new ErrorHandler(404, 'question_form.not_found');
    }

    // Process payload
    const updateData = {};

    // Handle simple fields
    const simpleFields = [
      'title',
      'description',
      'category',
      'order',
      'status',
      'visibility',
      'metaTitle',
      'metaDescription',
    ];
    simpleFields.forEach((field) => {
      if (payload[field] !== undefined) {
        updateData[field] = payload[field];
      }
    });

    // Handle form config
    if (payload.formConfig) {
      updateData.formConfig = {
        ...existingForm.formConfig.toObject(),
        ...payload.formConfig,
      };
    }

    // Handle content sections
    if (payload.contentSections) {
      updateData.contentSections = payload.contentSections.map((section, index) =>
        buildContentSection({ ...section, order: section.order !== undefined ? section.order : index })
      );
    }

    // Handle steps and fields based on isMultiStep
    const isMultiStep = payload.formConfig?.isMultiStep ?? existingForm.formConfig?.isMultiStep;
    if (isMultiStep && payload.steps) {
      updateData.steps = payload.steps.map((step, index) =>
        buildFormStep({ ...step, stepNumber: step.stepNumber || index + 1 })
      );
      updateData.fields = [];
    } else if (!isMultiStep && payload.fields) {
      updateData.fields = payload.fields.map((field, index) =>
        buildFormField({ ...field, order: field.order !== undefined ? field.order : index })
      );
      updateData.steps = [];
    }

    // Handle icon upload
    if (files.icon) {
      const uploadResult = await uploadBuffer(files.icon.buffer, {
        folder: 'question-forms/icons',
        resource_type: 'image',
      });
      updateData.icon = uploadResult.secure_url;

      // Delete old icon
      if (existingForm.icon) {
        try {
          await deleteFromCloudinary(existingForm.icon);
        } catch (e) {
          console.error('Failed to delete old icon:', e);
        }
      }
    }

    // Handle cover image upload
    if (files.coverImage) {
      const uploadResult = await uploadBuffer(files.coverImage.buffer, {
        folder: 'question-forms/covers',
        resource_type: 'image',
      });
      updateData.coverImage = uploadResult.secure_url;

      // Delete old cover image
      if (existingForm.coverImage) {
        try {
          await deleteFromCloudinary(existingForm.coverImage);
        } catch (e) {
          console.error('Failed to delete old cover:', e);
        }
      }
    }

    // Handle icon removal
    if (payload.removeIcon === 'true' || payload.removeIcon === true) {
      if (existingForm.icon) {
        try {
          await deleteFromCloudinary(existingForm.icon);
        } catch (e) {
          console.error('Failed to delete icon:', e);
        }
      }
      updateData.icon = null;
    }

    // Handle cover image removal
    if (payload.removeCoverImage === 'true' || payload.removeCoverImage === true) {
      if (existingForm.coverImage) {
        try {
          await deleteFromCloudinary(existingForm.coverImage);
        } catch (e) {
          console.error('Failed to delete cover:', e);
        }
      }
      updateData.coverImage = null;
    }

    // Set updated by
    if (userId) {
      updateData.updatedBy = userId;
    }

    const updated = await QuestionForm.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate('category', 'name slug');

    return updated;
  } catch (err) {
    if (err.code === 11000) {
      throw new ErrorHandler(409, 'question_form.title_exists');
    }
    if (err instanceof ErrorHandler) throw err;
    throw new ErrorHandler(500, err.message);
  }
};

/**
 * Delete question form
 */
const deleteQuestionForm = async (id) => {
  const form = await QuestionForm.findById(id);
  if (!form) throw new ErrorHandler(404, 'question_form.not_found');

  // Delete associated images
  if (form.icon) {
    try {
      await deleteFromCloudinary(form.icon);
    } catch (e) {
      console.error('Failed to delete icon:', e);
    }
  }

  if (form.coverImage) {
    try {
      await deleteFromCloudinary(form.coverImage);
    } catch (e) {
      console.error('Failed to delete cover:', e);
    }
  }

  // Optionally: Delete all submissions for this form
  // await QuestionSubmission.deleteMany({ questionForm: id });

  await QuestionForm.findByIdAndDelete(id);
  return true;
};

/**
 * Add a field to the form
 */
const addFieldToForm = async (formId, fieldData) => {
  const form = await QuestionForm.findById(formId);
  if (!form) throw new ErrorHandler(404, 'question_form.not_found');

  const newField = buildFormField(fieldData);

  // If multi-step, add to specified step
  if (form.formConfig.isMultiStep && fieldData.stepNumber) {
    const stepIndex = form.steps.findIndex((s) => s.stepNumber === fieldData.stepNumber);
    if (stepIndex === -1) {
      throw new ErrorHandler(404, 'question_form.step_not_found');
    }
    form.steps[stepIndex].fields.push(newField);
  } else {
    form.fields.push(newField);
  }

  await form.save();
  return form;
};

/**
 * Update a field in the form
 */
const updateFieldInForm = async (formId, fieldId, fieldData) => {
  const form = await QuestionForm.findById(formId);
  if (!form) throw new ErrorHandler(404, 'question_form.not_found');

  let fieldFound = false;

  // Check in direct fields
  const fieldIndex = form.fields.findIndex((f) => f.fieldId === fieldId);
  if (fieldIndex !== -1) {
    form.fields[fieldIndex] = { ...form.fields[fieldIndex].toObject(), ...fieldData };
    fieldFound = true;
  }

  // Check in steps
  if (!fieldFound && form.steps.length > 0) {
    for (const step of form.steps) {
      const stepFieldIndex = step.fields.findIndex((f) => f.fieldId === fieldId);
      if (stepFieldIndex !== -1) {
        step.fields[stepFieldIndex] = { ...step.fields[stepFieldIndex].toObject(), ...fieldData };
        fieldFound = true;
        break;
      }
    }
  }

  if (!fieldFound) {
    throw new ErrorHandler(404, 'question_form.field_not_found');
  }

  await form.save();
  return form;
};

/**
 * Remove a field from the form
 */
const removeFieldFromForm = async (formId, fieldId) => {
  const form = await QuestionForm.findById(formId);
  if (!form) throw new ErrorHandler(404, 'question_form.not_found');

  let fieldFound = false;

  // Check in direct fields
  const fieldIndex = form.fields.findIndex((f) => f.fieldId === fieldId);
  if (fieldIndex !== -1) {
    form.fields.splice(fieldIndex, 1);
    fieldFound = true;
  }

  // Check in steps
  if (!fieldFound && form.steps.length > 0) {
    for (const step of form.steps) {
      const stepFieldIndex = step.fields.findIndex((f) => f.fieldId === fieldId);
      if (stepFieldIndex !== -1) {
        step.fields.splice(stepFieldIndex, 1);
        fieldFound = true;
        break;
      }
    }
  }

  if (!fieldFound) {
    throw new ErrorHandler(404, 'question_form.field_not_found');
  }

  await form.save();
  return form;
};

/**
 * Add a step to the form
 */
const addStepToForm = async (formId, stepData) => {
  const form = await QuestionForm.findById(formId);
  if (!form) throw new ErrorHandler(404, 'question_form.not_found');

  if (!form.formConfig.isMultiStep) {
    form.formConfig.isMultiStep = true;
    // Move existing fields to first step if any
    if (form.fields.length > 0) {
      form.steps.push(
        buildFormStep({
          stepNumber: 1,
          title: 'Step 1',
          fields: form.fields,
        })
      );
      form.fields = [];
    }
  }

  const newStep = buildFormStep({
    ...stepData,
    stepNumber: stepData.stepNumber || form.steps.length + 1,
  });

  form.steps.push(newStep);
  await form.save();
  return form;
};

/**
 * Update a step in the form
 */
const updateStepInForm = async (formId, stepNumber, stepData) => {
  const form = await QuestionForm.findById(formId);
  if (!form) throw new ErrorHandler(404, 'question_form.not_found');

  const stepIndex = form.steps.findIndex((s) => s.stepNumber === stepNumber);
  if (stepIndex === -1) {
    throw new ErrorHandler(404, 'question_form.step_not_found');
  }

  form.steps[stepIndex] = {
    ...form.steps[stepIndex].toObject(),
    ...stepData,
    stepNumber,
  };

  await form.save();
  return form;
};

/**
 * Remove a step from the form
 */
const removeStepFromForm = async (formId, stepNumber) => {
  const form = await QuestionForm.findById(formId);
  if (!form) throw new ErrorHandler(404, 'question_form.not_found');

  const stepIndex = form.steps.findIndex((s) => s.stepNumber === stepNumber);
  if (stepIndex === -1) {
    throw new ErrorHandler(404, 'question_form.step_not_found');
  }

  form.steps.splice(stepIndex, 1);

  // Renumber remaining steps
  form.steps.forEach((step, index) => {
    step.stepNumber = index + 1;
  });

  // If no steps left, convert back to single-step form
  if (form.steps.length === 0) {
    form.formConfig.isMultiStep = false;
  }

  await form.save();
  return form;
};

/**
 * Add content section to form
 */
const addContentSectionToForm = async (formId, sectionData) => {
  const form = await QuestionForm.findById(formId);
  if (!form) throw new ErrorHandler(404, 'question_form.not_found');

  const newSection = buildContentSection({
    ...sectionData,
    order: sectionData.order !== undefined ? sectionData.order : form.contentSections.length,
  });

  form.contentSections.push(newSection);
  await form.save();
  return form;
};

/**
 * Update content section in form
 */
const updateContentSectionInForm = async (formId, sectionId, sectionData) => {
  const form = await QuestionForm.findById(formId);
  if (!form) throw new ErrorHandler(404, 'question_form.not_found');

  const sectionIndex = form.contentSections.findIndex((s) => s._id.toString() === sectionId);
  if (sectionIndex === -1) {
    throw new ErrorHandler(404, 'question_form.section_not_found');
  }

  form.contentSections[sectionIndex] = {
    ...form.contentSections[sectionIndex].toObject(),
    ...sectionData,
  };

  await form.save();
  return form;
};

/**
 * Remove content section from form
 */
const removeContentSectionFromForm = async (formId, sectionId) => {
  const form = await QuestionForm.findById(formId);
  if (!form) throw new ErrorHandler(404, 'question_form.not_found');

  const sectionIndex = form.contentSections.findIndex((s) => s._id.toString() === sectionId);
  if (sectionIndex === -1) {
    throw new ErrorHandler(404, 'question_form.section_not_found');
  }

  form.contentSections.splice(sectionIndex, 1);
  await form.save();
  return form;
};

/**
 * Reorder items (fields, steps, or content sections)
 */
const reorderItems = async (formId, type, items) => {
  const form = await QuestionForm.findById(formId);
  if (!form) throw new ErrorHandler(404, 'question_form.not_found');

  switch (type) {
    case 'fields':
      items.forEach(({ id, order }) => {
        const field = form.fields.find((f) => f.fieldId === id || f._id.toString() === id);
        if (field) field.order = order;
      });
      form.fields.sort((a, b) => a.order - b.order);
      break;

    case 'steps':
      items.forEach(({ id, order }) => {
        const step = form.steps.find((s) => s._id.toString() === id);
        if (step) {
          step.order = order;
          step.stepNumber = order + 1;
        }
      });
      form.steps.sort((a, b) => a.order - b.order);
      break;

    case 'contentSections':
      items.forEach(({ id, order }) => {
        const section = form.contentSections.find((s) => s._id.toString() === id);
        if (section) section.order = order;
      });
      form.contentSections.sort((a, b) => a.order - b.order);
      break;

    default:
      throw new ErrorHandler(400, 'Invalid reorder type');
  }

  await form.save();
  return form;
};

/**
 * Get form statistics
 */
const getFormStatistics = async (formId) => {
  const form = await QuestionForm.findById(formId);
  if (!form) throw new ErrorHandler(404, 'question_form.not_found');

  const stats = await QuestionSubmission.aggregate([
    { $match: { questionForm: form._id } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const totalSubmissions = await QuestionSubmission.countDocuments({ questionForm: formId });
  const avgTimeSpent = await QuestionSubmission.aggregate([
    { $match: { questionForm: form._id, timeSpentSeconds: { $gt: 0 } } },
    {
      $group: {
        _id: null,
        avgTime: { $avg: '$timeSpentSeconds' },
      },
    },
  ]);

  return {
    formId,
    formTitle: form.title,
    totalSubmissions,
    statusBreakdown: stats.reduce((acc, s) => {
      acc[s._id] = s.count;
      return acc;
    }, {}),
    averageTimeSpentSeconds: avgTimeSpent[0]?.avgTime || 0,
  };
};

module.exports = {
  createQuestionForm,
  getAllQuestionForms,
  getQuestionFormById,
  getQuestionFormBySlug,
  updateQuestionForm,
  deleteQuestionForm,
  addFieldToForm,
  updateFieldInForm,
  removeFieldFromForm,
  addStepToForm,
  updateStepInForm,
  removeStepFromForm,
  addContentSectionToForm,
  updateContentSectionInForm,
  removeContentSectionFromForm,
  reorderItems,
  getFormStatistics,
};
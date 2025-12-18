const { Joi, Segments } = require('celebrate');

// Field option validation
const fieldOptionSchema = Joi.object({
  label: Joi.string().required().messages({
    'string.empty': 'Option label is required',
    'any.required': 'Option label is required',
  }),
  value: Joi.string().required().messages({
    'string.empty': 'Option value is required',
    'any.required': 'Option value is required',
  }),
  order: Joi.number().integer().min(0).default(0),
  isDefault: Joi.boolean().default(false),
});

// Validation rules schema
const validationRuleSchema = Joi.object({
  required: Joi.boolean().default(false),
  minLength: Joi.number().integer().min(0).allow(null),
  maxLength: Joi.number().integer().min(0).allow(null),
  min: Joi.number().allow(null),
  max: Joi.number().allow(null),
  pattern: Joi.string().allow(null, ''),
  customMessage: Joi.string().allow(null, ''),
});

// Conditional logic schema
const conditionalLogicSchema = Joi.object({
  enabled: Joi.boolean().default(false),
  rules: Joi.array().items(
    Joi.object({
      fieldId: Joi.string().required(),
      operator: Joi.string()
        .valid('equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than')
        .required(),
      value: Joi.any().required(),
    })
  ),
  action: Joi.string().valid('show', 'hide').default('show'),
});

// Form field schema
const formFieldSchema = Joi.object({
  fieldId: Joi.string().required().messages({
    'string.empty': 'Field ID is required',
    'any.required': 'Field ID is required',
  }),
  type: Joi.string()
    .valid(
      'text',
      'textarea',
      'number',
      'email',
      'phone',
      'date',
      'time',
      'datetime',
      'checkbox',
      'radio',
      'select',
      'multiselect',
      'file',
      'image',
      'url',
      'password',
      'hidden',
      'rating',
      'range',
      'color'
    )
    .required()
    .messages({
      'any.only': 'Invalid field type',
      'any.required': 'Field type is required',
    }),
  label: Joi.string().required().messages({
    'string.empty': 'Field label is required',
    'any.required': 'Field label is required',
  }),
  placeholder: Joi.string().allow('', null).default(''),
  helpText: Joi.string().allow('', null).default(''),
  defaultValue: Joi.any().allow(null),
  options: Joi.array().items(fieldOptionSchema).default([]),
  validation: validationRuleSchema.default({}),
  order: Joi.number().integer().min(0).default(0),
  isVisible: Joi.boolean().default(true),
  conditionalLogic: conditionalLogicSchema.default({ enabled: false }),
  gridColumn: Joi.string().valid('full', 'half', 'third', 'quarter').default('full'),
});

// Form step schema
const formStepSchema = Joi.object({
  stepNumber: Joi.number().integer().min(1).required().messages({
    'number.base': 'Step number must be a number',
    'any.required': 'Step number is required',
  }),
  title: Joi.string().required().messages({
    'string.empty': 'Step title is required',
    'any.required': 'Step title is required',
  }),
  description: Joi.string().allow('', null).default(''),
  fields: Joi.array().items(formFieldSchema).default([]),
  order: Joi.number().integer().min(0).default(0),
  isOptional: Joi.boolean().default(false),
});

// Content section schema
const contentSectionSchema = Joi.object({
  type: Joi.string()
    .valid('heading', 'paragraph', 'list', 'note', 'warning', 'info', 'image', 'video', 'divider')
    .required()
    .messages({
      'any.only': 'Invalid content section type',
      'any.required': 'Content section type is required',
    }),
  content: Joi.string().allow('', null).default(''),
  heading: Joi.string().allow('', null).default(''),
  subHeading: Joi.string().allow('', null).default(''),
  listItems: Joi.array()
    .items(
      Joi.object({
        text: Joi.string().required(),
        order: Joi.number().integer().min(0).default(0),
      })
    )
    .default([]),
  mediaUrl: Joi.string().uri().allow(null, ''),
  order: Joi.number().integer().min(0).default(0),
  style: Joi.object({
    backgroundColor: Joi.string().allow('', null),
    textColor: Joi.string().allow('', null),
    borderColor: Joi.string().allow('', null),
    icon: Joi.string().allow('', null),
  }).default({}),
});

// Form config schema
const formConfigSchema = Joi.object({
  isMultiStep: Joi.boolean().default(false),
  showProgressBar: Joi.boolean().default(true),
  allowSaveDraft: Joi.boolean().default(false),
  submitButtonText: Joi.string().default('Submit'),
  successMessage: Joi.string().default('Your response has been submitted successfully!'),
  redirectUrl: Joi.string().uri().allow(null, ''),
});

// Create Question Form
const createQuestionForm = {
  [Segments.BODY]: Joi.object()
    .keys({
      title: Joi.string().min(2).max(200).required().messages({
        'string.empty': 'Form title is required',
        'string.min': 'Title must be at least 2 characters',
        'string.max': 'Title must be less than 200 characters',
        'any.required': 'Form title is required',
      }),
      description: Joi.string().max(1000).allow('', null).optional().messages({
        'string.max': 'Description must be less than 1000 characters',
      }),
      category: Joi.string().required().messages({
        'string.empty': 'Category is required',
        'any.required': 'Category is required',
      }),
      contentSections: Joi.array().items(contentSectionSchema).default([]),
      formConfig: formConfigSchema.default({}),
      steps: Joi.array().items(formStepSchema).default([]),
      fields: Joi.array().items(formFieldSchema).default([]),
      order: Joi.number().integer().min(0).default(0),
      status: Joi.string().valid('ACTIVE', 'INACTIVE').default('ACTIVE'),
      visibility: Joi.string().valid('public', 'private', 'authenticated').default('public'),
      metaTitle: Joi.string().allow('', null).default(''),
      metaDescription: Joi.string().allow('', null).default(''),
    })
    .unknown(true),
};

// Update Question Form
const updateQuestionForm = {
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.string().required().messages({
      'string.empty': 'Question form ID is required',
      'any.required': 'Question form ID is required',
    }),
  }),
  [Segments.BODY]: Joi.object()
    .keys({
      title: Joi.string().min(2).max(200).optional(),
      description: Joi.string().max(1000).allow('', null).optional(),
      category: Joi.string().optional(),
      contentSections: Joi.array().items(contentSectionSchema).optional(),
      formConfig: formConfigSchema.optional(),
      steps: Joi.array().items(formStepSchema).optional(),
      fields: Joi.array().items(formFieldSchema).optional(),
      order: Joi.number().integer().min(0).optional(),
      status: Joi.string().valid('ACTIVE', 'INACTIVE').optional(),
      visibility: Joi.string().valid('public', 'private', 'authenticated').optional(),
      metaTitle: Joi.string().allow('', null).optional(),
      metaDescription: Joi.string().allow('', null).optional(),
      removeIcon: Joi.alternatives().try(Joi.boolean(), Joi.string().valid('true', 'false')).optional(),
      removeCoverImage: Joi.alternatives().try(Joi.boolean(), Joi.string().valid('true', 'false')).optional(),
    })
    .unknown(true),
};

// Get Question Form
const getQuestionForm = {
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.string().required().messages({
      'string.empty': 'Question form ID is required',
      'any.required': 'Question form ID is required',
    }),
  }),
};

// Get Question Form by Slug
const getQuestionFormBySlug = {
  [Segments.PARAMS]: Joi.object().keys({
    slug: Joi.string().required().messages({
      'string.empty': 'Slug is required',
      'any.required': 'Slug is required',
    }),
  }),
};

// Delete Question Form
const deleteQuestionForm = {
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.string().required().messages({
      'string.empty': 'Question form ID is required',
      'any.required': 'Question form ID is required',
    }),
  }),
};

// List Question Forms
const listQuestionForms = {
  [Segments.QUERY]: Joi.object().keys({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().allow('', null),
    status: Joi.string().valid('ACTIVE', 'INACTIVE').allow('', null),
    category: Joi.string().allow('', null),
    visibility: Joi.string().valid('public', 'private', 'authenticated').allow('', null),
    sortBy: Joi.string().valid('title', 'createdAt', 'updatedAt', 'order', 'totalSubmissions').default('createdAt'),
    order: Joi.string().valid('asc', 'desc').default('desc'),
  }),
};

// Add/Update Field
const addField = {
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.string().required(),
  }),
  [Segments.BODY]: formFieldSchema,
};

// Add/Update Step
const addStep = {
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.string().required(),
  }),
  [Segments.BODY]: formStepSchema,
};

// Add Content Section
const addContentSection = {
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.string().required(),
  }),
  [Segments.BODY]: contentSectionSchema,
};

// Reorder Fields/Steps
const reorder = {
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.string().required(),
  }),
  [Segments.BODY]: Joi.object().keys({
    type: Joi.string().valid('fields', 'steps', 'contentSections').required(),
    items: Joi.array()
      .items(
        Joi.object({
          id: Joi.string().required(),
          order: Joi.number().integer().min(0).required(),
        })
      )
      .required(),
  }),
};

module.exports = {
  createQuestionForm,
  updateQuestionForm,
  getQuestionForm,
  getQuestionFormBySlug,
  deleteQuestionForm,
  listQuestionForms,
  addField,
  addStep,
  addContentSection,
  reorder,
};
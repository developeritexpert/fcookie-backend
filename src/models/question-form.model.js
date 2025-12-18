const mongoose = require('mongoose');
const slugify = require('slugify');
const CONSTANT_ENUM = require('../helper/constant-enums');

// Schema for individual form field options (for radio, checkbox, select)
const FieldOptionSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: String,
      required: true,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

// Schema for validation rules
const ValidationRuleSchema = new mongoose.Schema(
  {
    required: {
      type: Boolean,
      default: false,
    },
    minLength: {
      type: Number,
      default: null,
    },
    maxLength: {
      type: Number,
      default: null,
    },
    min: {
      type: Number,
      default: null,
    },
    max: {
      type: Number,
      default: null,
    },
    pattern: {
      type: String,
      default: null,
    },
    customMessage: {
      type: String,
      default: null,
    },
  },
  { _id: false }
);

// Schema for individual form fields
const FormFieldSchema = new mongoose.Schema(
  {
    fieldId: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
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
        'color',
      ],
      required: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    placeholder: {
      type: String,
      default: '',
    },
    helpText: {
      type: String,
      default: '',
    },
    defaultValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    options: [FieldOptionSchema],
    validation: ValidationRuleSchema,
    order: {
      type: Number,
      default: 0,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    conditionalLogic: {
      enabled: {
        type: Boolean,
        default: false,
      },
      rules: [
        {
          fieldId: String,
          operator: {
            type: String,
            enum: ['equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than'],
          },
          value: mongoose.Schema.Types.Mixed,
        },
      ],
      action: {
        type: String,
        enum: ['show', 'hide'],
        default: 'show',
      },
    },
    gridColumn: {
      type: String,
      enum: ['full', 'half', 'third', 'quarter'],
      default: 'full',
    },
  },
  { _id: true }
);

// Schema for form steps
const FormStepSchema = new mongoose.Schema(
  {
    stepNumber: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    fields: [FormFieldSchema],
    order: {
      type: Number,
      default: 0,
    },
    isOptional: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

// Schema for content section (notes/information displayed before form)
const ContentSectionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['heading', 'paragraph', 'list', 'note', 'warning', 'info', 'image', 'video', 'divider'],
      required: true,
    },
    content: {
      type: String,
      default: '',
    },
    heading: {
      type: String,
      default: '',
    },
    subHeading: {
      type: String,
      default: '',
    },
    listItems: [
      {
        text: String,
        order: Number,
      },
    ],
    mediaUrl: {
      type: String,
      default: null,
    },
    order: {
      type: Number,
      default: 0,
    },
    style: {
      backgroundColor: String,
      textColor: String,
      borderColor: String,
      icon: String,
    },
  },
  { _id: true }
);

// Main Question Form Schema
const QuestionFormSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Form title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [200, 'Title must be less than 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      maxlength: [1000, 'Description must be less than 1000 characters'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    icon: {
      type: String,
      default: null,
    },
    coverImage: {
      type: String,
      default: null,
    },
    // Content sections displayed before the form (notes, information, etc.)
    contentSections: [ContentSectionSchema],
    // Form configuration
    formConfig: {
      isMultiStep: {
        type: Boolean,
        default: false,
      },
      showProgressBar: {
        type: Boolean,
        default: true,
      },
      allowSaveDraft: {
        type: Boolean,
        default: false,
      },
      submitButtonText: {
        type: String,
        default: 'Submit',
      },
      successMessage: {
        type: String,
        default: 'Your response has been submitted successfully!',
      },
      redirectUrl: {
        type: String,
        default: null,
      },
    },
    // Form steps (for multi-step forms) or single step with all fields
    steps: [FormStepSchema],
    // For single-step forms, direct fields array
    fields: [FormFieldSchema],
    // Metadata
    order: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(CONSTANT_ENUM.STATUS),
      default: CONSTANT_ENUM.STATUS.ACTIVE,
    },
    visibility: {
      type: String,
      enum: ['public', 'private', 'authenticated'],
      default: 'public',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // Statistics
    totalSubmissions: {
      type: Number,
      default: 0,
    },
    // SEO
    metaTitle: {
      type: String,
      default: '',
    },
    metaDescription: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
QuestionFormSchema.index({ category: 1, status: 1 });
QuestionFormSchema.index({ title: 'text', description: 'text' });
QuestionFormSchema.index({ order: 1 });

// Generate slug before saving
QuestionFormSchema.pre('save', function (next) {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + Date.now();
  }
  next();
});

// Generate slug on update if title changes
QuestionFormSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  if (update.title && !update.slug) {
    update.slug = slugify(update.title, { lower: true, strict: true }) + '-' + Date.now();
  }
  next();
});

// Virtual for getting all fields (from steps or direct fields)
QuestionFormSchema.virtual('allFields').get(function () {
  if (this.formConfig?.isMultiStep && this.steps?.length > 0) {
    return this.steps.flatMap((step) => step.fields || []);
  }
  return this.fields || [];
});

module.exports = mongoose.model('QuestionForm', QuestionFormSchema);
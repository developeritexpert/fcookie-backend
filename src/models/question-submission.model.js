const mongoose = require('mongoose');
const CONSTANT_ENUM = require('../helper/constant-enums');

// Schema for individual field responses
const FieldResponseSchema = new mongoose.Schema(
  {
    fieldId: {
      type: String,
      required: true,
    },
    fieldLabel: {
      type: String,
      required: true,
    },
    fieldType: {
      type: String,
      required: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    displayValue: {
      type: String,
      default: '',
    },
  },
  { _id: true }
);

// Schema for step responses (for multi-step forms)
const StepResponseSchema = new mongoose.Schema(
  {
    stepNumber: {
      type: Number,
      required: true,
    },
    stepTitle: {
      type: String,
      required: true,
    },
    responses: [FieldResponseSchema],
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: true }
);

// Main Submission Schema
const QuestionSubmissionSchema = new mongoose.Schema(
  {
    questionForm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuestionForm',
      required: [true, 'Question form reference is required'],
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Guest information (if not logged in)
    guestInfo: {
      name: {
        type: String,
        default: '',
      },
      email: {
        type: String,
        default: '',
      },
      phone: {
        type: String,
        default: '',
      },
    },
    // For multi-step forms
    stepResponses: [StepResponseSchema],
    // For single-step forms or flat responses
    responses: [FieldResponseSchema],
    // Submission metadata
    status: {
      type: String,
      enum: ['draft', 'submitted', 'reviewed', 'approved', 'rejected', 'archived'],
      default: 'submitted',
    },
    submissionType: {
      type: String,
      enum: ['complete', 'partial', 'draft'],
      default: 'complete',
    },
    // Progress tracking for multi-step forms
    currentStep: {
      type: Number,
      default: 1,
    },
    completedSteps: [
      {
        type: Number,
      },
    ],
    // File attachments
    attachments: [
      {
        fieldId: String,
        fileName: String,
        fileUrl: String,
        fileType: String,
        fileSize: Number,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // IP and device info
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    // Timing
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    timeSpentSeconds: {
      type: Number,
      default: 0,
    },
    // Admin notes
    adminNotes: {
      type: String,
      default: '',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
QuestionSubmissionSchema.index({ questionForm: 1, status: 1 });
QuestionSubmissionSchema.index({ submittedBy: 1 });
QuestionSubmissionSchema.index({ createdAt: -1 });
QuestionSubmissionSchema.index({ 'guestInfo.email': 1 });

// Virtual for submission reference number
QuestionSubmissionSchema.virtual('referenceNumber').get(function () {
  return `SUB-${this._id.toString().slice(-8).toUpperCase()}`;
});

// Ensure virtuals are included in JSON
QuestionSubmissionSchema.set('toJSON', { virtuals: true });
QuestionSubmissionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('QuestionSubmission', QuestionSubmissionSchema);
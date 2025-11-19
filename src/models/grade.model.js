const mongoose = require('mongoose');
const CONSTANT_ENUM = require('../helper/constant-enums');

const GradeSchema = new mongoose.Schema({
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
  label: { type: String, required: true },
  value: { type: Number },
  description: { type: String },
  status: {
    type: String,
    enum: Object.values(CONSTANT_ENUM.STATUS),
    default: CONSTANT_ENUM.STATUS.ACTIVE,
  }
  },
  { timestamps: true }
);
GradeSchema.index({ categoryId: 1, label: 1 }, { unique: true });

module.exports = mongoose.model('Grade', GradeSchema);

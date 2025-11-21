const mongoose = require('mongoose');
const CONSTANT_ENUM = require('../helper/constant-enums');

const FilterValueSchema = new mongoose.Schema(
  {
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'FilterGroup', required: true },

    label: { type: String, required: true },
    valueKey: { type: String, required: true },

    archived: { type: Boolean, default: false },

    status: {
      type: String,
      enum: Object.values(CONSTANT_ENUM.STATUS),
      default: CONSTANT_ENUM.STATUS.ACTIVE,
    },

    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

FilterValueSchema.index({ groupId: 1, valueKey: 1 }, { unique: true });

module.exports = mongoose.model('FilterValue', FilterValueSchema);

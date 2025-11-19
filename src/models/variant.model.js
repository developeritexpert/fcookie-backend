const mongoose = require('mongoose');
const slugify = require('slugify');
const CONSTANT_ENUM = require('../helper/constant-enums');

const VariantSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true
    },

    name: { type: String, required: true },

    slug: { type: String, index: true },

    status: {
      type: String,
      enum: Object.values(CONSTANT_ENUM.STATUS),
      default: CONSTANT_ENUM.STATUS.ACTIVE,
    }
  },
  { timestamps: true }
);

VariantSchema.index({ categoryId: 1, slug: 1 }, { unique: true });

VariantSchema.pre('save', function (next) {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model('Variant', VariantSchema);

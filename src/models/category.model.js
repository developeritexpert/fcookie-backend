const mongoose = require('mongoose');
const slugify = require('slugify');

const CONSTANT_ENUM = require("../helper/constant-enums");

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true, index: true },
    description: { type: String },
    icon: { type: String },
    status: {
        type: String,
        enum: Object.values(CONSTANT_ENUM.STATUS),
        default: CONSTANT_ENUM.STATUS.ACTIVE,
    }

  },
  {
    timestamps: true
  }
);

CategorySchema.pre('save', function (next) {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model('Category', CategorySchema);

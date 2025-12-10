const mongoose = require('mongoose');
const CONSTANT_ENUM = require('../helper/constant-enums');
const slugify = require('slugify');

const FilterGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
    },

    type: {
      type: String,
      enum: Object.values(CONSTANT_ENUM.FILTER_TYPE),
      default: CONSTANT_ENUM.FILTER_TYPE.SINGLE,
    },

    required: { type: Boolean, default: false },

    archived: { type: Boolean, default: false },

    status: {
      type: String,
      enum: Object.values(CONSTANT_ENUM.STATUS),
      default: CONSTANT_ENUM.STATUS.ACTIVE,
    },

    protected: { type: Boolean, default: false },

    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

FilterGroupSchema.index({ name: 1 }, { unique: true });
FilterGroupSchema.index({ slug: 1 }, { unique: true });

FilterGroupSchema.pre('validate', function (next) {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
    });
  }

  next();
});

FilterGroupSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate() || {};

  if (update.name) {
    update.slug = slugify(update.name, {
      lower: true,
      strict: true,
    });
  }

  next();
});


// Delete related filter values when a group is removed
FilterGroupSchema.pre('findOneAndDelete', async function (next) {
  try {
    const group = await this.model.findOne(this.getQuery());

    if (group) {
      await mongoose.model('FilterValue').deleteMany({ groupId: group._id });
    }

    next();
  } catch (err) {
    next(err);
  }
});



module.exports = mongoose.model('FilterGroup', FilterGroupSchema);

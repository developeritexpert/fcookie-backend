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
// Delete related filter values AND remove them from Asset filters
FilterGroupSchema.pre('findOneAndDelete', async function (next) {
  try {
    const group = await this.model.findOne(this.getQuery());

    if (!group) return next();

    const FilterValue = mongoose.model("FilterValue");
    const Asset = mongoose.model("Asset");

    // Delete all values in this group
    await FilterValue.deleteMany({ groupId: group._id });

    // Remove all product filter entries for this group
    await Asset.updateMany(
      {},
      { $pull: { filters: { groupId: group._id } } }
    );

    next();
  } catch (err) {
    next(err);
  }
});



module.exports = mongoose.model('FilterGroup', FilterGroupSchema);

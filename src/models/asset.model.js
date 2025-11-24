const mongoose = require('mongoose');
const slugify = require('slugify');
const CONSTANT_ENUM = require('../helper/constant-enums');

const AssetSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },

    description: { type: String },
    details: { type: String },

    meta_title: { type: String },
    meta_description: { type: String },

    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },

    filters: [
      {
        groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'FilterGroup', required: true },
        valueId: { type: mongoose.Schema.Types.ObjectId, ref: 'FilterValue', required: true },
      }
    ],

    price: { type: Number, required: true },
    listing_price: { type: Number },
    listing_time: { type: Date },

    currency: {
        type: String,
        enum: Object.values(CONSTANT_ENUM.CURRENCY),
        default: CONSTANT_ENUM.STATUS.USD,
    },

    quantity: { type: Number, default: 1 },

    images: [{ type: String }],
    thumbnail_url: { type: String },
    video_url: { type: String },

    status: {
        type: String,
        enum: Object.values(CONSTANT_ENUM.STATUS),
        default: CONSTANT_ENUM.STATUS.ACTIVE,
    },
    visibility: {
        type: String,
        enum: Object.values(CONSTANT_ENUM.VISIBILITY),
        default: CONSTANT_ENUM.VISIBILITY.PUBLIC,
    },

    owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    reseller_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resell_price: { type: Number },
    resell_time: { type: Date },
    reseller_users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    highest_offer_price: { type: Number, default: 0 },
    offer_count: { type: Number, default: 0 },

    views_count: { type: Number, default: 0 },
    likes_count: { type: Number, default: 0 },
    saved_count: { type: Number, default: 0 },
    saved_count: { type: Number, default: 0 },
  },
  { timestamps: true }
);


AssetSchema.index({ slug: 1 }, { unique: true });
AssetSchema.index({ name: 'text', description: 'text' }); 
AssetSchema.index({ categoryId: 1 });
AssetSchema.index({ 'filters.groupId': 1 });
AssetSchema.index({ 'filters.valueId': 1 });


AssetSchema.pre('validate', function (next) {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true
    });
  }
  next();
});


AssetSchema.pre('save', function (next) {
  if (!this.meta_title && this.name) {
    this.meta_title = this.name.substring(0, 60);
  }

  if (!this.meta_description && this.description) {
    this.meta_description = this.description.substring(0, 160);
  }

  next();
});


AssetSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();

  if (update.name && !update.slug) {
    update.slug = slugify(update.name, {
      lower: true,
      strict: true,
    });
  }

  if (!update.meta_title && update.name) {
    update.meta_title = update.name.substring(0, 60);
  }

  if (!update.meta_description && update.description) {
    update.meta_description = update.description.substring(0, 160);
  }

  this.setUpdate(update);
  next();
});

module.exports = mongoose.model('Asset', AssetSchema);

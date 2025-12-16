// services/asset/asset.service.js - ENHANCED VERSION (PRESERVES ALL EXISTING FUNCTIONS)
const Asset = require('../../models/asset.model');
const FilterGroup = require('../../models/filter-group.model');
const FilterValue = require('../../models/filter-value.model');
const mongoose = require('mongoose');
const { ErrorHandler } = require('../../utils/error-handler');
const { uploadMultiple, uploadBuffer } = require('../../utils/cloudinary');
const { getPaginationParams, buildAssetFilters } = require('../../utils/pagination');
const { mergeImages } = require('../../utils/merge-images');
const { validateFiltersArray } = require('../filter/filter-validator.service');


const { getFilterCache, clearFilterCache } = require('../../utils/filter-cache');
const filterCache = getFilterCache();


const parseJSON = (value) => {
  try { return JSON.parse(value); }
  catch { return value; }
};

const uploadImages = async (files) => {
  let uploaded = [];
  if (files?.images?.length) {
    const res = await uploadMultiple(files.images, 'assets/images');
    uploaded = res.map(r => r.secure_url);
  }
  return uploaded;
};

const uploadOptionalMedia = async (payload, files) => {
  if (files?.thumbnail?.length) {
    const r = await uploadBuffer(files.thumbnail[0].buffer, {
      folder: 'assets/thumbnails',
      resource_type: 'image',
    });
    payload.thumbnail_url = r.secure_url;
  }
  if (files?.video?.length) {
    const r = await uploadBuffer(files.video[0].buffer, {
      folder: 'assets/videos',
      resource_type: 'video',
    });
    payload.video_url = r.secure_url;
  }
};

// ============================================
// EXISTING FUNCTIONS (UNCHANGED)
// ============================================

const createAsset = async (payload, files = {}) => {
  if (payload.filters) {
    if (typeof payload.filters === "string") {
      try {
        payload.filters = JSON.parse(payload.filters);
      } catch {
        payload.filters = [];
      }
    }
  } else {
    payload.filters = [];
  }

  try {
    const jsonFields = [
      "filters", "attributes", "grading", "existingImages", "images", "reseller_users"
    ];

    jsonFields.forEach((field) => {
      if (payload[field] && typeof payload[field] === "string") {
        try {
          payload[field] = JSON.parse(payload[field]);
        } catch {}
      }
    });

    if (!Array.isArray(payload.attributes)) {
      payload.attributes = [];
    }

    if (typeof payload.filters === "string") {
      payload.filters = JSON.parse(payload.filters);
    }

    if (!Array.isArray(payload.filters)) {
      payload.filters = [];
    }

    if (Array.isArray(payload.filters)) {
      await validateFiltersArray(payload.filters);
    }

    const uploaded = await uploadImages(files);
    await uploadOptionalMedia(payload, files);

    if (typeof payload.images === 'string') {
      payload.images = parseJSON(payload.images) || [];
    }

    if (!Array.isArray(payload.images)) payload.images = [];
    payload.images = [...payload.images, ...uploaded];

    if (payload.owner_id && !mongoose.Types.ObjectId.isValid(payload.owner_id)) {
      throw new ErrorHandler(400, 'asset.invalid_owner_id');
    }

    const asset = await Asset.create(payload);
    
    // Clear cache after creating new asset
    clearFilterCache();

    
    return asset;

  } catch (err) {
    if (err.code === 11000) throw new ErrorHandler(409, 'asset.duplicate');
    if (err instanceof ErrorHandler) throw err;
    throw new ErrorHandler(500, err.message);
  }

};

const getAllAssets = async (query) => {
  const { page, limit } = getPaginationParams(query);
  const filters = buildAssetFilters(query);

  const sort = {
    [query.sortBy || 'createdAt']: query.order === 'asc' ? 1 : -1,
  };

  const skip = (page - 1) * limit;

  // Use lean() for better performance (returns plain JS objects)
  const [data, total] = await Promise.all([
    Asset.find(filters)
      .select('name slug price listing_price images quantity thumbnail_url filters categoryId status visibility createdAt description attributes grading views_count likes_count offer_count')
      .populate('categoryId', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Asset.countDocuments(filters),
  ]);

  // Populate filter names for each asset
  const populatedData = await Promise.all(
    data.map(async (asset) => {
      if (asset.filters && asset.filters.length > 0) {
        const populatedFilters = await Promise.all(
          asset.filters.map(async (filter) => {
            const [group, value] = await Promise.all([
              FilterGroup.findById(filter.groupId).select('name slug').lean(),
              FilterValue.findById(filter.valueId).select('label valueKey').lean(),
            ]);

            return {
              ...filter,
              groupName: group?.name || null,
              groupSlug: group?.slug || null,
              valueName: value?.label || null,
              valueKey: value?.valueKey || null,
            };
          })
        );
        return { ...asset, filters: populatedFilters };
      }
      return asset;
    })
  );

  return {
    data: populatedData,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getAssetById = async (id) => {
  const asset = await Asset.findById(id);
  if (!asset) throw new ErrorHandler(404, 'asset.not_found');
  return asset;
};
const getAssetBySlug = async (slug) => {
  const asset = await Asset.findOne({ slug })
    .populate({
      path: 'categoryId',
      select: 'name slug description',
    })
    .populate({
      path: 'owner_id',
      select: 'username displayName email avatar',
    })
    .lean();

  if (!asset) {
    return null;
  }

  // Increment views count (fire and forget)
  Asset.findByIdAndUpdate(asset._id, { $inc: { views_count: 1 } }).exec();

  // Populate filter details
  if (asset.filters && asset.filters.length > 0) {
    const populatedFilters = await Promise.all(
      asset.filters.map(async (filter) => {
        const [group, value] = await Promise.all([
          FilterGroup.findById(filter.groupId).select('name slug type').lean(),
          FilterValue.findById(filter.valueId).select('label valueKey').lean(),
        ]);

        return {
          ...filter,
          groupName: group?.name || null,
          groupSlug: group?.slug || null,
          groupType: group?.type || null,
          valueName: value?.label || null,
          valueKey: value?.valueKey || null,
        };
      })
    );

    asset.filters = populatedFilters;
  }

  return asset;
};

const updateAsset = async (id, payload, files = {}) => {
  console.log('Update Payload Before Parsing:', payload);
  
  if (payload.filters) {
    if (typeof payload.filters === "string") {
      try {
        payload.filters = JSON.parse(payload.filters);
      } catch {
        payload.filters = [];
      }
    }
  } else {
    payload.filters = [];
  }

  try {
    const jsonFields = [
      "filters", "attributes", "grading", "existingImages", "images", "reseller_users"
    ];

    jsonFields.forEach((field) => {
      if (payload[field] && typeof payload[field] === "string") {
        try {
          payload[field] = JSON.parse(payload[field]);
        } catch {}
      }
    });

    if (!Array.isArray(payload.existingImages)) {
      payload.existingImages = [];
    }

    await uploadOptionalMedia(payload, files);
    const uploaded = await uploadImages(files);
    payload.images = mergeImages(payload.existingImages, uploaded);
    delete payload.existingImages;
    
    console.log('Updated Payload:', payload);

    const updated = await Asset.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    if (!updated) throw new ErrorHandler(404, 'asset.not_found');

    // Clear cache after update
    clearFilterCache();


    return updated;

  } catch (err) {
    if (err.code === 11000) throw new ErrorHandler(409, 'asset.duplicate');
    if (err instanceof ErrorHandler) throw err;
    throw new ErrorHandler(500, err.message);
  }
};

const deleteAsset = async (id) => {
  const deleted = await Asset.findByIdAndDelete(id);
  if (!deleted) throw new ErrorHandler(404, 'asset.not_found');
  
  // Clear cache after delete
  clearFilterCache();

  
  return true;
};

// ============================================
// NEW FUNCTIONS (FOR DYNAMIC FILTERS)
// ============================================

/**
 * Get available filters with counts - WITH CACHING
 */
const getAvailableFilters = async (categoryId = null) => {
  const cacheKey = `filters_${categoryId || 'all'}`;

  if (filterCache) {
    const cached = filterCache.get(cacheKey);
    if (cached) return cached;
  }

  const matchStage = categoryId
    ? { categoryId: new mongoose.Types.ObjectId(categoryId), status: 'ACTIVE', visibility: 'PUBLIC' }
    : { status: 'ACTIVE', visibility: 'PUBLIC' };

  const pipeline = [
    { $match: matchStage },
    { $unwind: '$filters' },

    {
      $group: {
        _id: {
          groupId: '$filters.groupId',
          valueId: '$filters.valueId'
        },
        count: { $sum: 1 }
      }
    },

    {
      $lookup: {
        from: 'filtergroups',
        localField: '_id.groupId',
        foreignField: '_id',
        as: 'group'
      }
    },
    { $unwind: '$group' },

    {
      $lookup: {
        from: 'filtervalues',
        localField: '_id.valueId',
        foreignField: '_id',
        as: 'value'
      }
    },
    { $unwind: '$value' },

    // ✅ CRITICAL SORT — NOW VALUE ORDER EXISTS
    {
      $sort: {
        'group.order': 1,
        'value.order': 1
      }
    },

    {
      $group: {
        _id: '$group._id',
        groupName: { $first: '$group.name' },
        groupSlug: { $first: '$group.slug' },
        groupType: { $first: '$group.type' },
        groupOrder: { $first: '$group.order' },

        values: {
          $push: {
            valueId: '$value._id',
            label: '$value.label',
            valueKey: '$value.valueKey',
            count: '$count',
            valueOrder: '$value.order'
          }
        }
      }
    },

    // ✅ FINAL GROUP SORT
    { $sort: { groupOrder: 1 } }
  ];


  const filters = await Asset.aggregate(pipeline);

  if (filterCache) filterCache.set(cacheKey, filters);

  return filters;
};




/**
 * Get price range - WITH CACHING
 */
const getPriceRange = async (categoryId = null) => {
  const cacheKey = `priceRange_${categoryId || 'all'}`;

  if (filterCache) {
    const cached = filterCache.get(cacheKey);
    if (cached) return cached;
  }

  const matchStage = categoryId 
    ? { categoryId: new mongoose.Types.ObjectId(categoryId), status: 'ACTIVE', visibility: 'PUBLIC' }
    : { status: 'ACTIVE', visibility: 'PUBLIC' };

  const result = await Asset.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        minPrice: { $min: '$listing_price' },
        maxPrice: { $max: '$listing_price' }
      }
    }
  ]);

  const priceRange = result[0] || { minPrice: 0, maxPrice: 10000 };

  if (filterCache) filterCache.set(cacheKey, priceRange);

  return priceRange;
};


module.exports = {
  createAsset,
  getAllAssets,
  getAssetById,
  updateAsset,
  deleteAsset,
  getAssetBySlug,
  // New functions
  getAvailableFilters,
  getPriceRange,
  
};
// services/asset/asset.service.js
const Asset = require('../../models/asset.model');
const mongoose = require('mongoose');
const { ErrorHandler } = require('../../utils/error-handler');
const { uploadMultiple, uploadBuffer } = require('../../utils/cloudinary');
const { getPaginationParams, buildAssetFilters } = require('../../utils/pagination');
const { mergeImages } = require('../../utils/merge-images');
const { validateFiltersArray } = require('../filter/filter-validator.service');

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

const createAsset = async (payload, files = {}) => {

  // Fix filters parsing from FormData
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
        "filters",
        "attributes",
        "grading",
        "existingImages",
        "images",
        "reseller_users"
      ];

      jsonFields.forEach((field) => {
        if (payload[field] && typeof payload[field] === "string") {
          try {
            payload[field] = JSON.parse(payload[field]);
          } catch {
            // leave as original if parsing fails
          }
        }
      });

      // Make sure attributes is always array
      if (!Array.isArray(payload.attributes)) {
        payload.attributes = [];
      }

  // Make sure filters ALWAYS parsed
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

      return await Asset.create(payload);

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

  const [data, total] = await Promise.all([
    Asset.find(filters).sort(sort).skip(skip).limit(limit),
    Asset.countDocuments(filters),
  ]);

  return {
    data,
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

const updateAsset = async (id, payload, files = {}) => {
  // Fix filters parsing from FormData
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
    // 🔥 Parse JSON fields coming from FormData
    const jsonFields = [
      "filters",
      "attributes",
      "grading",
      "existingImages",
      "images",
      "reseller_users"
    ];

    jsonFields.forEach((field) => {
      if (payload[field] && typeof payload[field] === "string") {
        try {
          payload[field] = JSON.parse(payload[field]);
        } catch {}
      }
    });

    // Ensure arrays
    if (!Array.isArray(payload.existingImages)) {
      payload.existingImages = [];
    }

    // Upload media
    await uploadOptionalMedia(payload, files);

    const uploaded = await uploadImages(files);

    // Merge old + new images
    payload.images = mergeImages(payload.existingImages, uploaded);

    delete payload.existingImages;
    console.log('Updated Payload:', payload);

    const updated = await Asset.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    if (!updated) throw new ErrorHandler(404, 'asset.not_found');

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
  return true;
};

module.exports = {
  createAsset,
  getAllAssets,
  getAssetById,
  updateAsset,
  deleteAsset,
};

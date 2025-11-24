const Asset = require('../../models/asset.model');
const { ErrorHandler } = require('../../utils/error-handler');
const { uploadMultiple, uploadBuffer } = require('../../utils/cloudinary');
const mongoose = require('mongoose');
const { getPaginationParams, buildAssetFilters } = require('../../utils/pagination');


const createAsset = async (payload, files = {}) => {
  try {
    if (typeof payload.filters === 'string') {
      try {
        payload.filters = JSON.parse(payload.filters);
      } catch (e) {
      }
    }

    const uploadedImageUrls = [];
    if (files.images && files.images.length) {
      const res = await uploadMultiple(files.images, 'assets/images');
      for (const r of res) uploadedImageUrls.push(r.secure_url);
    }

    if (files.thumbnail && files.thumbnail.length) {
      const r = await uploadBuffer(files.thumbnail[0].buffer, {
        folder: 'assets/thumbnails',
        resource_type: 'image',
      });
      payload.thumbnail_url = r.secure_url;
    }

    if (files.video && files.video.length) {
      const r = await uploadBuffer(files.video[0].buffer, {
        folder: 'assets/videos',
        resource_type: 'video',
      });
      payload.video_url = r.secure_url;
    }

    payload.images = payload.images || [];
    if (typeof payload.images === 'string' && payload.images.length) {
      try {
        payload.images = JSON.parse(payload.images);
      } catch (e) {
        payload.images = payload.images.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }

    payload.images = Array.isArray(payload.images) ? payload.images.concat(uploadedImageUrls) : uploadedImageUrls;

    if (payload.owner_id && !mongoose.Types.ObjectId.isValid(payload.owner_id)) {
      throw new ErrorHandler(400, 'asset.invalid_owner_id');
    }

    const created = await Asset.create(payload);
    return created;
  } catch (err) {
    if (err.code === 11000) {
      throw new ErrorHandler(409, 'asset.duplicate');
    }
    if (err instanceof ErrorHandler) throw err;
    throw new ErrorHandler(500, err.message);
  }
};

const getAllAssets = async (query = {}) => {
  const { page, limit } = getPaginationParams(query);
  const filters = buildAssetFilters(query);
  const sortBy = query.sortBy || 'createdAt';
  const order = query.order || 'desc';
  const skip = (page - 1) * limit;
  const sortOrder = order === 'asc' ? 1 : -1;
  const sort = {};
  sort[sortBy] = sortOrder;

  const [data, total] = await Promise.all([
    Asset.find(filters).sort(sort).skip(skip).limit(limit),
    Asset.countDocuments(filters),
  ]);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
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
  try {
    if (typeof payload.filters === 'string') {
      try {
        payload.filters = JSON.parse(payload.filters);
      } catch (e) {}
    }

    const uploadedImageUrls = [];
    if (files.images && files.images.length) {
      const res = await uploadMultiple(files.images, 'assets/images');
      for (const r of res) uploadedImageUrls.push(r.secure_url);
    }

    if (files.thumbnail && files.thumbnail.length) {
      const r = await uploadBuffer(files.thumbnail[0].buffer, {
        folder: 'assets/thumbnails',
        resource_type: 'image',
      });
      payload.thumbnail_url = r.secure_url;
    }

    if (files.video && files.video.length) {
      const r = await uploadBuffer(files.video[0].buffer, {
        folder: 'assets/videos',
        resource_type: 'video',
      });
      payload.video_url = r.secure_url;
    }

    if (!payload.images) payload.images = [];
    if (typeof payload.images === 'string' && payload.images.length) {
      try {
        payload.images = JSON.parse(payload.images);
      } catch (e) {
        payload.images = payload.images.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }

    payload.images = Array.isArray(payload.images) ? payload.images.concat(uploadedImageUrls) : uploadedImageUrls;

    const updated = await Asset.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    if (!updated) throw new ErrorHandler(404, 'asset.not_found');
    return updated;
  } catch (err) {
    if (err.code === 11000) {
      throw new ErrorHandler(409, 'asset.duplicate');
    }
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

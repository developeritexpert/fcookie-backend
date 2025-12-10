const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload buffer to Cloudinary
 */
const uploadBuffer = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'assets',
        resource_type: options.resource_type || 'image',
        public_id: options.public_id,
        overwrite: true,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(buffer);
  });
};

/**
 * Upload multiple files to Cloudinary
 */
const uploadMultiple = async (files = [], folder = 'assets') => {
  const results = [];
  for (const f of files) {
    const isVideo = f.mimetype.startsWith('video/');
    const resource_type = isVideo ? 'video' : 'image';
    const res = await uploadBuffer(f.buffer, { folder, resource_type });
    results.push(res);
  }
  return results;
};

/**
 * Extract public_id from Cloudinary URL
 */
const extractPublicId = (url) => {
  if (!url) return null;

  try {
    // Example URL: https://res.cloudinary.com/demo/image/upload/v1234567890/folder/filename.jpg
    const regex = /\/upload\/(?:v\d+\/)?(.+)\.\w+$/;
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch (err) {
    console.error('Error extracting public_id:', err);
    return null;
  }
};

/**
 * Delete file from Cloudinary using URL
 */
const deleteFromCloudinary = async (url, resourceType = 'image') => {
  if (!url) return null;

  const publicId = extractPublicId(url);
  if (!publicId) {
    console.warn('Could not extract public_id from URL:', url);
    return null;
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (err) {
    console.error('Error deleting from Cloudinary:', err);
    throw err;
  }
};

/**
 * Delete multiple files from Cloudinary
 */
const deleteMultipleFromCloudinary = async (urls = [], resourceType = 'image') => {
  const results = [];
  for (const url of urls) {
    try {
      const result = await deleteFromCloudinary(url, resourceType);
      results.push({ url, result, success: true });
    } catch (err) {
      results.push({ url, error: err.message, success: false });
    }
  }
  return results;
};

module.exports = {
  cloudinary,
  uploadBuffer,
  uploadMultiple,
  extractPublicId,
  deleteFromCloudinary,
  deleteMultipleFromCloudinary,
};
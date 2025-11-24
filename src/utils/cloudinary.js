const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

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

module.exports = {
  uploadBuffer,
  uploadMultiple,
  cloudinary,
};

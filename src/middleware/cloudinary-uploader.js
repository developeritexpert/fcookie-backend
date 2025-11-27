const cloudinaryUtils = require('../utils/cloudinary');
const { ErrorHandler } = require('../utils/error-handler');


const uploadToCloudinary = (fieldName, folder = 'uploads') => {
    return async (req, res, next) => {
        try {
            if (req.file) {
                const result = await cloudinaryUtils.uploadBuffer(req.file.buffer, { folder });
                req.body[fieldName] = result.secure_url;
            }
            else if (req.files && req.files[fieldName]) {

            }

            next();
        } catch (error) {
            next(new ErrorHandler(500, `Image upload failed: ${error.message}`));
        }
    };
};

module.exports = uploadToCloudinary;

const cloudinary = require('cloudinary').v2;
const Ticket = require('../models/ticketRaise.model');




cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


const FILE_SIZE_LIMITS = {
  image: 5 * 1024 * 1024,      // 5MB
  video: 50 * 1024 * 1024,     // 50MB
  document: 10 * 1024 * 1024   // 10MB
};

// Get file type and folder
const getFileTypeAndFolder = (mimetype) => {
  if (mimetype.startsWith('image/')) {
    return { type: 'image', folder: 'tickets/images' };
  } else if (mimetype.startsWith('video/')) {
    return { type: 'video', folder: 'tickets/videos' };
  } else {
    return { type: 'document', folder: 'tickets/documents' };
  }
};

// Upload to Cloudinary
 const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const { type, folder } = getFileTypeAndFolder(file.mimetype);
    
    // Check file size
    const sizeLimit = FILE_SIZE_LIMITS[type];
    if (file.size > sizeLimit) {
      return reject(new Error(`${type} size exceeds ${sizeLimit / (1024 * 1024)}MB limit`));
    }

    const uploadOptions = {
      folder: folder,
      resource_type: type === 'document' ? 'raw' : type,
      allowed_formats: type === 'image' 
        ? ['jpg', 'jpeg', 'png', 'gif', 'webp']
        : type === 'video'
        ? ['mp4', 'mov', 'avi', 'mkv']
        : ['pdf', 'doc', 'docx', 'txt', 'xlsx', 'xls']
    };

    cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id
          });
        }
      }
    ).end(file.buffer);
  });
};

module.exports = uploadToCloudinary
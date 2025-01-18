const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const config = require('../config/config');
const { AppError } = require('../middleware/error');

// Ensure upload directory exists
const createUploadDir = async () => {
  try {
    await fs.access(config.upload.directory);
  } catch {
    await fs.mkdir(config.upload.directory, { recursive: true });
  }
};

createUploadDir();

// Configure storage
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const userId = req.user.id;
    const userDir = path.join(config.upload.directory, userId);
    
    try {
      await fs.access(userDir);
    } catch {
      await fs.mkdir(userDir, { recursive: true });
    }
    
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    cb(null, `${Date.now()}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  if (!config.upload.allowedTypes.includes(file.mimetype)) {
    cb(new AppError(`Invalid file type. Allowed types: ${config.upload.allowedTypes.join(', ')}`, 400), false);
    return;
  }
  cb(null, true);
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxSize
  }
});

// Helper functions
const deleteFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error(`Failed to delete file: ${filePath}`, error);
  }
};

const getFileUrl = (userId, filename) => {
  return `/uploads/${userId}/${filename}`;
};

// Middleware for different upload types
const uploadMiddleware = {
  resume: upload.single('resume'),
  avatar: upload.single('avatar'),
  multiple: upload.array('files', 5)
};

// Error handler for multer
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError(`File too large. Maximum size: ${config.upload.maxSize / 1024 / 1024}MB`, 400));
    }
    return next(new AppError(error.message, 400));
  }
  next(error);
};

// Clean up old files
const cleanupOldFiles = async (userId, fileType) => {
  const userDir = path.join(config.upload.directory, userId);
  try {
    const files = await fs.readdir(userDir);
    const oldFiles = files.filter(file => file.includes(fileType));
    
    for (const file of oldFiles) {
      await deleteFile(path.join(userDir, file));
    }
  } catch (error) {
    console.error(`Failed to cleanup old files for user ${userId}`, error);
  }
};

module.exports = {
  uploadMiddleware,
  handleUploadError,
  deleteFile,
  getFileUrl,
  cleanupOldFiles
}; 
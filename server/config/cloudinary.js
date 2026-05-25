const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

const isCloudinaryConfigured = 
  cloudName && !cloudName.includes('placeholder') &&
  apiKey && !apiKey.includes('placeholder') &&
  apiSecret && !apiSecret.includes('placeholder');

let upload;
let isLocal = true;

if (isCloudinaryConfigured) {
  try {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret
    });

    const storage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'zuntra_clone',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif'],
        transformation: [{ width: 1000, crop: 'limit' }]
      }
    });

    upload = multer({ storage: storage });
    isLocal = false;
    console.log('Cloudinary upload storage configured successfully.');
  } catch (error) {
    console.error('Failed to initialize Cloudinary storage, falling back to local:', error.message);
  }
}

if (isLocal) {
  console.log('Using local disk storage for uploads.');
  // Ensure upload directory exists
  const uploadDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Create simple file placeholder to keep directory git-tracked if needed
  const keepFile = path.join(uploadDir, '.gitkeep');
  if (!fs.existsSync(keepFile)) {
    fs.writeFileSync(keepFile, '');
  }

  const localStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  upload = multer({
    storage: localStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
      const filetypes = /jpeg|jpg|png|webp|gif/;
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = filetypes.test(file.mimetype);

      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Only images (jpg, jpeg, png, webp, gif) are allowed.'));
      }
    }
  });
}

// Helper function to extract image URL based on configuration
const getImageUrl = (req) => {
  if (!req.file) return null;
  if (!isLocal) {
    return req.file.path; // Cloudinary returns URL in path
  }
  // Local storage returns relative local URL
  const port = process.env.PORT || 5000;
  return `${req.protocol}://${req.hostname}:${port}/uploads/${req.file.filename}`;
};

module.exports = {
  upload,
  getImageUrl,
  isCloudinaryConfigured: !isLocal
};

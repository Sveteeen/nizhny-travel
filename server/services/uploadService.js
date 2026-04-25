const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadsRoot = path.join(__dirname, '..', 'uploads');
const uploadMaxFileSizeMb = Number(process.env.UPLOAD_MAX_FILE_SIZE_MB) || 15;

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/jfif',
  'image/png',
  'image/webp',
]);

const targetDirs = {
  placeMain: 'places/main',
  placeGallery: 'places/gallery',
  routeMain: 'routes/main',
};

Object.values(targetDirs).forEach((relativeDir) => {
  fs.mkdirSync(path.join(uploadsRoot, relativeDir), { recursive: true });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const target = targetDirs[req.body.target] || targetDirs.placeGallery;
    cb(null, path.join(uploadsRoot, target));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ext || '.jpg';
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
  },
});

const uploadMiddleware = multer({
  storage,
  limits: { fileSize: uploadMaxFileSizeMb * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      const error = new Error('Only jpg, jpeg, jfif, png and webp files are allowed');
      error.status = 400;
      return cb(error);
    }

    return cb(null, true);
  },
}).single('file');

const toPublicUploadUrl = (absoluteFilePath) => {
  const relativePath = path.relative(uploadsRoot, absoluteFilePath).split(path.sep).join('/');
  return `/uploads/${relativePath}`;
};

module.exports = {
  uploadMiddleware,
  toPublicUploadUrl,
  uploadMaxFileSizeMb,
  uploadsRoot,
};

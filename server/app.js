const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const uploadsRoot = path.join(__dirname, 'uploads');

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jfif',
  'image/png',
  'image/webp',
]);

const TARGET_DIRS = {
  placeMain: 'places/main',
  placeGallery: 'places/gallery',
  routeMain: 'routes/main',
};

Object.values(TARGET_DIRS).forEach((relativeDir) => {
  fs.mkdirSync(path.join(uploadsRoot, relativeDir), { recursive: true });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const target = TARGET_DIRS[req.body.target] || TARGET_DIRS.placeGallery;
    cb(null, path.join(uploadsRoot, target));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ext || '.jpg';
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return cb(new Error('Only jpg, jpeg, jfif, png and webp files are allowed'));
    }
    cb(null, true);
  },
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsRoot));

app.use((req, res, next) => {
    console.log('Я middleware, сработаю на любой запрос');
    next();
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'file is required' });
    }

    const relativePath = path
      .relative(uploadsRoot, req.file.path)
      .split(path.sep)
      .join('/');

    return res.status(201).json({
      message: 'File uploaded',
      file: {
        originalName: req.file.originalname,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: `/uploads/${relativePath}`,
      },
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    }

    if (err.message === 'Only jpg, jpeg, jfif, png and webp files are allowed') {
      return res.status(400).json({ error: err.message });
    }

    return res.status(500).json({ error: 'Something went wrong' });
});

module.exports = app;
const { Router } = require('express');
const uploadController = require('../controllers/uploadController');
const { uploadMiddleware } = require('../services/uploadService');

const router = Router();

router.post('/upload', uploadMiddleware, uploadController.uploadFile);

module.exports = router;

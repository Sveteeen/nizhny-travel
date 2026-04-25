const { toPublicUploadUrl } = require('../services/uploadService');

const uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'file is required' });
  }

  return res.status(201).json({
    message: 'File uploaded',
    file: {
      originalName: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      url: toPublicUploadUrl(req.file.path),
    },
  });
};

module.exports = {
  uploadFile,
};

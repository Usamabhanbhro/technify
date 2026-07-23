const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join('uploads', 'fees');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/** Multer storage for student payment proof screenshots */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `proof-${Date.now()}${ext}`);
  },
});

const uploadPaymentProof = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for payment proof'));
    }
  },
});

module.exports = { uploadPaymentProof };

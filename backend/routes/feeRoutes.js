const express = require('express');
const multer = require('multer');
const router = express.Router();
const feeController = require('../controllers/feeControllers/feeController');
const adminAuth = require('../middlewares/adminAuth');
const auth = require('../middlewares/auth');
const { uploadPaymentProof } = require('../middlewares/feeUpload');

// ——— Admin ———
router.post('/generate', adminAuth, feeController.generateChallans);
router.get('/all', adminAuth, feeController.getAllChallans);
router.get('/pending', adminAuth, feeController.getPendingChallans);
router.get('/enrolled-students', adminAuth, feeController.getEnrolledByCourse);
router.put('/verify/:id', adminAuth, feeController.verifyChallan);
router.put('/reject/:id', adminAuth, feeController.rejectChallan);

// ——— Student ———
router.get('/my-challans', auth('student'), feeController.getMyChallans);
router.post(
  '/upload-proof/:id',
  auth('student'),
  uploadPaymentProof.single('paymentScreenshot'),
  feeController.uploadPaymentProof
);

// Multer / upload error handler
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message?.includes('image')) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next(err);
});

module.exports = router;

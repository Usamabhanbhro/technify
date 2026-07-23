const express = require('express');
const router = express.Router();
const userController = require('../controllers/userControllers/userController');
const publicCertificateController = require('../controllers/userControllers/certificateController');
const courseController = require('../controllers/adminControllers/courseController');
const branchController = require('../controllers/adminControllers/branchController');
const paymentVerificationController = require('../controllers/adminControllers/paymentVerificationController');
const eventController = require('../controllers/userControllers/eventController');
const multer = require('multer');
const path = require('path');
const { uploadPaymentProof } = require('../middlewares/feeUpload');

// 0. Get Courses (for dropdown)
router.get('/courses', courseController.getCourses);

// Get Branches (for admission form)
router.get('/branches', branchController.getBranches);

// Public certificate verification
router.get('/certificates/verify/:certNo', publicCertificateController.verifyCertificatePublic);

// Multer Storage Configuration for photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Multer for combined photo and payment proof upload
const combinedUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === 'photo') {
        cb(null, 'uploads/');
      } else if (file.fieldname === 'paymentProof') {
        cb(null, 'uploads/fees/');
      }
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 }
});

// 1. Admission Form Submission with payment proof
router.post('/admission', combinedUpload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'paymentProof', maxCount: 1 }
]), userController.applyAdmission);

// Event join request
router.post('/events/join', eventController.joinEvent);

// Re-upload payment proof for rejected applications
router.post('/payment/reupload/:studentId', uploadPaymentProof.single('paymentProof'), paymentVerificationController.reUploadPaymentProof);

// Test User Route
router.get('/test', (req, res) => {
  res.json({ message: "User route is working" });
});

module.exports = router;

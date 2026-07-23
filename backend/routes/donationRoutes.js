const express = require('express');
const router = express.Router();
const donationController = require('../controllers/userControllers/donationController');
const multer = require('multer');
const path = require('path');

// Multer configuration for donation payment screenshots
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/donations/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const donationUpload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and PDF are allowed.'));
    }
  }
});

// Submit Donation with Payment Proof
router.post('/submit', donationUpload.single('paymentScreenshot'), donationController.submitDonation);

// Get All Donations (Admin)
router.get('/all', donationController.getDonations);

// Get Donation by ID
router.get('/:id', donationController.getDonationById);

// Update Donation Status (Admin)
router.put('/:id/status', donationController.updateDonationStatus);

module.exports = router;

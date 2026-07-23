const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donor: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
  },
  amount: { type: Number, required: true },
  paymentMethod: {
    type: String,
    enum: ['Jazzcash', 'Easypaisa', 'Bank', 'Card'],
    required: true,
  },
  paymentScreenshot: {
    filename: String,
    path: String,
  },
  campaign: { type: String, default: 'Education Support' },
  status: {
    type: String,
    enum: ['Pending', 'Verified', 'Rejected'],
    default: 'Pending',
  },
  notes: { type: String }, // Admin notes
  createdAt: { type: Date, default: Date.now },
  verifiedAt: { type: Date },
  verifiedBy: { type: String }, // Admin email who verified
});

module.exports = mongoose.model('Donation', donationSchema);

const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
  challanNo: { type: String, required: true, unique: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  studentName: { type: String, required: true },
  courseName: { type: String, required: true },
  amount: { type: Number, required: true },
  month: { type: String, required: true }, // e.g., "May 2026"
  status: { type: String, enum: ['Paid', 'Unpaid'], default: 'Paid' },
  paidDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Fee', feeSchema, 'Fees');

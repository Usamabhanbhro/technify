const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    certNo: { type: String, required: true, unique: true, trim: true },
    studentName: { type: String, required: true, trim: true },
    courseName: { type: String, required: true, trim: true },
    issueDate: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Certificate', certificateSchema, 'Certificates');

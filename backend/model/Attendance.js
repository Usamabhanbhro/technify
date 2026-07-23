const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  students: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
      status: { type: String, enum: ['present', 'absent'], required: true },
    }
  ],
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);

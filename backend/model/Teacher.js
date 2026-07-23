const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  gender: { type: String, required: true },
  age: { type: Number, required: true },
  qualification: { type: String, required: true },
  cnic: { type: String, required: true, unique: true },
  phone: { type: String },
  email: { type: String },
  address: { type: String },
  experience: { type: String },
  password: { type: String, required: true }, // hashed
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true
  },
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }], // assigned courses
  photo: { type: String }, // Path to teacher profile picture
  /** Password reset token (JWT) for forgot password feature */
  resetPasswordToken: { type: String },
  /** Token expiry time (timestamp) */
  resetPasswordExpiry: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Teacher', teacherSchema);

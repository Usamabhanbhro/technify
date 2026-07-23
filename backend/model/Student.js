const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  fatherName: { 
    type: String, 
    required: true 
  },
  /** Used for student portal login (set at admission or by admin). */
  email: {
    type: String,
    trim: true,
    lowercase: true,
    sparse: true,
    unique: true,
  },
  dob: { 
    type: Date, 
    required: true 
  },
  qualification: { type: String },
  cnic: { 
    type: Number, 
    required: true 
  },
  address: { 
    type: String, 
    required: true 
  },
  whatsapp: { 
    type: Number, 
    required: true 
  },
  course: { type: String, required: true },
  classMode: {
    type: String,
    enum: ['Physical', 'Online'],
    default: null
  },
  courseFee: { type: Number, default: 0 }, // Course fee amount
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true
  },
  message: { type: String },
  photo: { type: String },
  /** Payment-related fields */
  paymentMethod: { 
    type: String, 
    enum: ['EasyPaisa', 'JazzCash', 'Bank Account', null],
    default: null 
  },
  paymentProof: { type: String }, // Path to payment proof file
  paymentStatus: {
    type: String,
    enum: ['Pending Fee Verification', 'Verified', 'Rejected'],
    default: 'Pending Fee Verification'
  },
  enrollmentStatus: {
    type: String,
    enum: ['Pending Fee Verification', 'Enrolled', 'Payment Rejected'],
    default: 'Pending Fee Verification'
  },
  /** 4-digit portal PIN — set by admin for enrolled students. */
  portalPassword: { type: String },
  rollNo: { type: String },
  attendancePresent: { type: Number, default: 0 },
  attendanceTotal: { type: Number, default: 0 },
  currentSubjects: [{ type: String }],
  testScores: [
    {
      testName: { type: String, required: true },
      score: { type: Number, required: true },
      maxScore: { type: Number, default: 100 },
      date: { type: Date, default: Date.now },
    },
  ],
  status: {
    type: String,
    enum: ['Enrolled', 'Not Enrolled', 'Dropout', 'Passout'],
    default: 'Not Enrolled'
  },
  appliedAt: { 
    type: Date, 
    default: Date.now 
  },
  /** Password reset token (JWT) for forgot password feature */
  resetPasswordToken: { type: String },
  /** Token expiry time (timestamp) */
  resetPasswordExpiry: { type: Date }
});

module.exports = mongoose.model('Student', studentSchema, 'Student');

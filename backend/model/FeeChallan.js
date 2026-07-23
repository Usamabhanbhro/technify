const mongoose = require('mongoose');

const STATUSES = ['Unpaid', 'Pending Verification', 'Paid', 'Rejected'];

const bankDetailsSchema = new mongoose.Schema(
  {
    bankName: { type: String, required: true, trim: true },
    accountTitle: { type: String, required: true, trim: true },
    accountNumber: { type: String, required: true, trim: true },
    iban: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

/**
 * Fee challan — unique challanNo, bank details, payment verification workflow.
 */
const feeChallanSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    challanNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    semester: { type: String, required: true, trim: true },
    feeType: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    fine: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: STATUSES,
      default: 'Unpaid',
    },
    dueDate: { type: Date, required: true },
    bankDetails: { type: bankDetailsSchema },

    // Student payment proof
    paymentScreenshot: { type: String },
    transactionId: { type: String, trim: true },
    paymentDate: { type: Date },

    // Admin verification
    verifiedBy: { type: String },
    verifiedAt: { type: Date },
    rejectionReason: { type: String, trim: true },

    paidAt: { type: Date },
    generatedBy: { type: String, default: 'admin' },
  },
  { timestamps: true }
);

feeChallanSchema.index({ studentId: 1 });
feeChallanSchema.index({ status: 1 });

module.exports = mongoose.model('FeeChallan', feeChallanSchema, 'FeeChallans');
module.exports.FEE_STATUSES = STATUSES;

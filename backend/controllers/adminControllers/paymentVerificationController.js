const Student = require('../../model/Student');

// Get all pending payment verifications
const getPendingPayments = async (req, res) => {
  try {
    const pendingStudents = await Student.find({
      paymentStatus: 'Pending Fee Verification',
      paymentProof: { $exists: true, $ne: null }
    })
      .populate('branchId', 'branchName branchCode')
      .sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      students: pendingStudents
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error fetching pending payments"
    });
  }
};

// Get all payment verification history (verified + rejected)
const getPaymentHistory = async (req, res) => {
  try {
    const verifiedStudents = await Student.find({
      $or: [
        { paymentStatus: 'Verified' },
        { paymentStatus: 'Rejected' }
      ]
    })
      .populate('branchId', 'branchName branchCode')
      .sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      students: verifiedStudents
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error fetching payment history"
    });
  }
};

// Verify payment and enroll student
const verifyPayment = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    if (student.paymentStatus === 'Verified') {
      return res.status(400).json({
        success: false,
        message: "Payment already verified for this student"
      });
    }

    // Update payment status and enrollment status
    student.paymentStatus = 'Verified';
    student.enrollmentStatus = 'Enrolled';
    student.status = 'Enrolled';

    await student.save();

    res.status(200).json({
      success: true,
      message: "Payment verified successfully. Student enrolled.",
      student
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error verifying payment"
    });
  }
};

// Reject payment
const rejectPayment = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { rejectionReason } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    if (student.paymentStatus === 'Rejected') {
      return res.status(400).json({
        success: false,
        message: "Payment already rejected for this student"
      });
    }

    // Update payment status and enrollment status
    student.paymentStatus = 'Rejected';
    student.enrollmentStatus = 'Payment Rejected';
    student.status = 'Not Enrolled';

    await student.save();

    res.status(200).json({
      success: true,
      message: "Payment rejected. Student can upload new proof.",
      student
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error rejecting payment"
    });
  }
};

// Get payment details for a specific student
const getStudentPaymentDetails = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId)
      .populate('branchId', 'branchName branchCode');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    res.status(200).json({
      success: true,
      student
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error fetching student payment details"
    });
  }
};

// Re-upload payment proof (for rejected payments)
const reUploadPaymentProof = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Payment proof file is required"
      });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    if (student.enrollmentStatus !== 'Payment Rejected') {
      return res.status(400).json({
        success: false,
        message: "This student's payment was not rejected"
      });
    }

    // Update payment proof and status
    student.paymentProof = req.file.path;
    student.paymentStatus = 'Pending Fee Verification';
    student.enrollmentStatus = 'Pending Fee Verification';

    await student.save();

    res.status(200).json({
      success: true,
      message: "Payment proof updated. Waiting for admin verification.",
      student
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error uploading payment proof"
    });
  }
};

module.exports = {
  getPendingPayments,
  getPaymentHistory,
  verifyPayment,
  rejectPayment,
  getStudentPaymentDetails,
  reUploadPaymentProof
};

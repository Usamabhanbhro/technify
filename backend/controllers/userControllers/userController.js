const Student = require('../../model/Student');
const Branch = require('../../model/Branch');
const Course = require('../../model/Course');

// 1. Apply for Admission
const applyAdmission = async (req, res) => {
  try {
    const {
      name,
      fatherName,
      dob,
      qualification,
      cnic,
      address,
      whatsapp,
      course,
      classMode,
      branchId,
      timing,
      message,
      email,
      portalPassword,
      paymentMethod,
    } = req.body;

    const emailNorm =
      typeof email === 'string' && email.trim() ? email.trim().toLowerCase() : '';
    const pin = typeof portalPassword === 'string' ? portalPassword.trim() : '';

    if (!emailNorm) {
      return res.status(400).json({
        success: false,
        message: 'Email is required.',
      });
    }

    if (!classMode) {
      return res.status(400).json({
        success: false,
        message: 'Please select Physical or Online classes.',
      });
    }

    if (!['Physical', 'Online'].includes(classMode)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid class mode selection.',
      });
    }

    if (!branchId) {
      return res.status(400).json({
        success: false,
        message: 'Branch selection is required.',
      });
    }

    if (!/^\d{4}$/.test(pin)) {
      return res.status(400).json({
        success: false,
        message: 'You must create a 4-digit numeric password.',
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Payment method is required.',
      });
    }

    if (!['EasyPaisa', 'JazzCash', 'Bank Account'].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method.',
      });
    }

    // Check if payment proof file exists
    const paymentProofFile = req.files && req.files.paymentProof && req.files.paymentProof[0];
    if (!paymentProofFile) {
      return res.status(400).json({
        success: false,
        message: 'Payment proof is required.',
      });
    }

    // Verify that the branch exists and is active
    const branch = await Branch.findOne({ _id: branchId, status: 'Active' });
    if (!branch) {
      return res.status(400).json({
        success: false,
        message: 'Selected branch is not available.',
      });
    }

    // Get course fee
    const courseData = await Course.findOne({ title: course });
    const courseFee = courseData ? courseData.courseFee : 0;

    // Get photo file if exists
    const photoFile = req.files && req.files.photo && req.files.photo[0];

    const newStudent = new Student({
      name,
      fatherName,
      dob,
      qualification,
      cnic,
      address,
      whatsapp,
      course,
      classMode,
      courseFee,
      branchId,
      message,
      email: emailNorm,
      portalPassword: pin,
      photo: photoFile ? photoFile.path : null,
      paymentMethod,
      paymentProof: paymentProofFile.path,
      paymentStatus: 'Pending Fee Verification',
      enrollmentStatus: 'Pending Fee Verification',
      status: 'Not Enrolled'
    });

    await newStudent.save();

    res.status(201).json({
      success: true,
      message: "Application submitted successfully. Your payment will be verified by the admin.",
      student: newStudent
    });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'This email is already registered. Use another email or contact the institute.',
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error during admission submission"
    });
  }
};

module.exports = {
  applyAdmission
};

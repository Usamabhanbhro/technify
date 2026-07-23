const FeeChallan = require('../../model/FeeChallan');
const { FEE_STATUSES } = require('../../model/FeeChallan');
const Student = require('../../model/Student');
const { generateUniqueChallanNo } = require('../../utils/challanNo');
const { sendChallanNotification } = require('../../services/emailService');

/** Overdue fine applies only when still unpaid (not verified yet). */
function enrichChallan(doc) {
  const o = doc.toObject ? doc.toObject() : { ...doc };
  const due = o.dueDate ? new Date(o.dueDate) : null;
  const now = new Date();
  const unpaidLike = ['Unpaid', 'Rejected'].includes(o.status);
  const isOverdue = unpaidLike && due && now > due;
  o.isOverdue = Boolean(isOverdue);
  o.fineAmount = isOverdue ? Number(o.fine || 0) : 0;
  o.totalPayable = Number(o.amount || 0) + o.fineAmount;
  return o;
}

function validateBankDetails(body) {
  const { bankName, accountTitle, accountNumber, iban } = body;
  if (!bankName?.trim() || !accountTitle?.trim() || !accountNumber?.trim()) {
    return null;
  }
  return {
    bankName: bankName.trim(),
    accountTitle: accountTitle.trim(),
    accountNumber: accountNumber.trim(),
    iban: iban ? String(iban).trim() : '',
  };
}

/**
 * POST /api/fees/generate — Admin creates challans with bank details.
 */
exports.generateChallans = async (req, res) => {
  try {
    const {
      course,
      semester,
      month,
      feeType,
      amount,
      fine = 0,
      dueDate,
      studentIds,
      bankName,
      accountTitle,
      accountNumber,
      iban,
    } = req.body;

    const challanSemester = (semester || month || '').trim();

    const bankDetails = validateBankDetails({
      bankName,
      accountTitle,
      accountNumber,
      iban,
    });

    if (!bankDetails) {
      return res.status(400).json({
        success: false,
        message: 'Bank name, account title, and account number are required',
      });
    }

    if (!challanSemester || !feeType || amount === undefined || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'semester, feeType, amount, and dueDate are required',
      });
    }

    const parsedAmount = Number(amount);
    const parsedFine = Number(fine) || 0;
    if (Number.isNaN(parsedAmount) || parsedAmount < 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    const due = new Date(dueDate);
    if (Number.isNaN(due.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid dueDate' });
    }

    let students = [];
    if (Array.isArray(studentIds) && studentIds.length > 0) {
      students = await Student.find({ _id: { $in: studentIds }, status: 'Enrolled' });
    } else if (course) {
      students = await Student.find({
        course: String(course).trim(),
        status: 'Enrolled',
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Select a class/course or specific students',
      });
    }

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No enrolled students found',
      });
    }

    const generatedBy = req.user?.email || 'admin';
    const created = [];

    for (const student of students) {
      const challanNo = await generateUniqueChallanNo();
      const challan = await FeeChallan.create({
        studentId: student._id,
        challanNo,
        semester: challanSemester,
        feeType,
        amount: parsedAmount,
        fine: parsedFine,
        status: 'Unpaid',
        dueDate: due,
        bankDetails,
        generatedBy,
      });
      created.push(challan);

      // Send email notification to student (async, don't wait for it)
      if (student.email) {
        sendChallanNotification(
          student.email,
          student.name,
          challanNo,
          parsedAmount,
          due
        ).catch((err) => {
          console.error(`Failed to send email to ${student.email}:`, err.message);
          // Don't fail the request if email fails
        });
      }
    }

    const populated = await FeeChallan.find({ _id: { $in: created.map((c) => c._id) } })
      .populate('studentId', 'name rollNo course email')
      .sort({ createdAt: -1 });

    return res.status(201).json({
      success: true,
      message: `Generated ${created.length} challan(s)`,
      count: created.length,
      challans: populated.map(enrichChallan),
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors || {})
        .map((e) => e.message)
        .join(', ');
      return res.status(400).json({ success: false, message: message || 'Validation failed' });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate challan number. Please try again.',
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error generating challans',
    });
  }
};

/**
 * GET /api/fees/all — Admin: all challans with filters.
 */
exports.getAllChallans = async (req, res) => {
  try {
    const { status, search, semester, month, course } = req.query;
    const filter = {};

    if (status && FEE_STATUSES.includes(status)) {
      filter.status = status;
    }
    const semesterQuery = (semester || month || '').trim();
    if (semesterQuery) {
      filter.semester = new RegExp(semesterQuery, 'i');
    }

    let challans = await FeeChallan.find(filter)
      .populate('studentId', 'name rollNo course email cnic')
      .sort({ createdAt: -1 });

    if (course) {
      const c = String(course).trim().toLowerCase();
      challans = challans.filter(
        (ch) => ch.studentId && String(ch.studentId.course || '').toLowerCase().includes(c)
      );
    }

    if (search) {
      const q = String(search).trim().toLowerCase();
      challans = challans.filter((ch) => {
        const s = ch.studentId;
        return (
          ch.challanNo.toLowerCase().includes(q) ||
          (ch.transactionId && ch.transactionId.toLowerCase().includes(q)) ||
          (s?.name && s.name.toLowerCase().includes(q)) ||
          (s?.rollNo && String(s.rollNo).toLowerCase().includes(q))
        );
      });
    }

    return res.json({
      success: true,
      count: challans.length,
      challans: challans.map(enrichChallan),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error fetching challans' });
  }
};

/**
 * GET /api/fees/pending — Admin: challans awaiting verification.
 */
exports.getPendingChallans = async (req, res) => {
  try {
    const challans = await FeeChallan.find({ status: 'Pending Verification' })
      .populate('studentId', 'name rollNo course email cnic')
      .sort({ updatedAt: -1 });

    return res.json({
      success: true,
      count: challans.length,
      challans: challans.map(enrichChallan),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error fetching pending challans' });
  }
};

/**
 * POST /api/fees/upload-proof/:id — Student uploads payment proof (own challan only).
 */
exports.uploadPaymentProof = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user.studentId;
    const { transactionId, paymentDate } = req.body;

    if (!transactionId?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID is required',
      });
    }

    if (!paymentDate) {
      return res.status(400).json({
        success: false,
        message: 'Payment date is required',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Payment screenshot is required',
      });
    }

    const challan = await FeeChallan.findById(id);
    if (!challan) {
      return res.status(404).json({ success: false, message: 'Challan not found' });
    }

    // Security: only own challans
    if (String(challan.studentId) !== String(studentId)) {
      return res.status(403).json({
        success: false,
        message: 'You can only upload proof for your own challans',
      });
    }

    if (!['Unpaid', 'Rejected'].includes(challan.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot upload proof when status is "${challan.status}"`,
      });
    }

    challan.paymentScreenshot = req.file.path.replace(/\\/g, '/');
    challan.transactionId = transactionId.trim();
    challan.paymentDate = new Date(paymentDate);
    challan.status = 'Pending Verification';
    challan.rejectionReason = undefined;
    challan.verifiedBy = undefined;
    challan.verifiedAt = undefined;

    await challan.save();

    const populated = await FeeChallan.findById(challan._id).populate(
      'studentId',
      'name rollNo course email'
    );

    return res.json({
      success: true,
      message: 'Payment proof submitted. Awaiting admin verification.',
      challan: enrichChallan(populated),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error uploading proof' });
  }
};

/**
 * PUT /api/fees/verify/:id — Admin approves payment.
 */
exports.verifyChallan = async (req, res) => {
  try {
    const { id } = req.params;
    const challan = await FeeChallan.findById(id);

    if (!challan) {
      return res.status(404).json({ success: false, message: 'Challan not found' });
    }

    if (challan.status !== 'Pending Verification') {
      return res.status(400).json({
        success: false,
        message: 'Only challans pending verification can be approved',
      });
    }

    challan.status = 'Paid';
    challan.verifiedBy = req.user?.email || 'admin';
    challan.verifiedAt = new Date();
    challan.paidAt = new Date();
    challan.rejectionReason = undefined;
    await challan.save();

    const populated = await FeeChallan.findById(id).populate(
      'studentId',
      'name rollNo course email'
    );

    return res.json({
      success: true,
      message: 'Payment verified. Challan marked as Paid.',
      challan: enrichChallan(populated),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error verifying payment' });
  }
};

/**
 * PUT /api/fees/reject/:id — Admin rejects payment proof.
 */
exports.rejectChallan = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const challan = await FeeChallan.findById(id);
    if (!challan) {
      return res.status(404).json({ success: false, message: 'Challan not found' });
    }

    if (challan.status !== 'Pending Verification') {
      return res.status(400).json({
        success: false,
        message: 'Only challans pending verification can be rejected',
      });
    }

    challan.status = 'Rejected';
    challan.rejectionReason = reason ? String(reason).trim() : 'Payment proof rejected';
    challan.verifiedBy = req.user?.email || 'admin';
    challan.verifiedAt = new Date();
    await challan.save();

    const populated = await FeeChallan.findById(id).populate(
      'studentId',
      'name rollNo course email'
    );

    return res.json({
      success: true,
      message: 'Payment proof rejected. Student may re-upload.',
      challan: enrichChallan(populated),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error rejecting payment' });
  }
};

/** GET /api/fees/my-challans — Student own challans */
exports.getMyChallans = async (req, res) => {
  try {
    const studentId = req.user.studentId;
    if (!studentId) {
      return res.status(403).json({ success: false, message: 'Invalid student session' });
    }

    const challans = await FeeChallan.find({ studentId }).sort({ createdAt: -1 });
    return res.json({
      success: true,
      challans: challans.map(enrichChallan),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error fetching challans' });
  }
};

exports.getEnrolledByCourse = async (req, res) => {
  try {
    const { course } = req.query;
    const filter = { status: 'Enrolled' };
    if (course) filter.course = String(course).trim();

    const students = await Student.find(filter)
      .select('_id name rollNo course email')
      .sort({ name: 1 });

    return res.json({ success: true, students });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error fetching students' });
  }
};

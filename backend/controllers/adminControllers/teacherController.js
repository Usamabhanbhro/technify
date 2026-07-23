const Teacher = require('../../model/Teacher');
const bcrypt = require('bcryptjs');
const { sendTeacherWelcomeEmail } = require('../../services/emailService');

// Add a new teacher
exports.addTeacher = async (req, res) => {
  try {
    const { name, gender, age, qualification, cnic, password, courses, phone, email, address, experience, branchId } = req.body;
    if (!name || !gender || !age || !qualification || !cnic || !password || !branchId) {
      return res.status(400).json({ success: false, message: 'All fields including branch are required.' });
    }
    const existing = await Teacher.findOne({ cnic });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Teacher with this CNIC already exists.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Get photo file if exists
    const photoFile = req.files && req.files.photo && req.files.photo[0];
    
    const teacher = new Teacher({
      name,
      gender,
      age,
      qualification,
      cnic,
      phone,
      email,
      address,
      experience,
      branchId,
      password: hashedPassword,
      courses: Array.isArray(courses) ? courses : [],
      photo: photoFile ? photoFile.path : null,
    });
    await teacher.save();

    // Send welcome email to teacher (async, don't wait for it)
    if (email) {
      sendTeacherWelcomeEmail(email, name, password, cnic).catch((err) => {
        console.error(`Failed to send welcome email to ${email}:`, err.message);
        // Don't fail the request if email fails
      });
    }

    res.status(201).json({ success: true, message: 'Teacher added successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Get all teachers
exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find({}, '-password').populate('courses', 'title').populate('branchId', 'branchName branchCode').sort({ createdAt: -1 });
    res.json({ success: true, teachers });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Get teachers by branch
exports.getTeachersByBranch = async (req, res) => {
  try {
    const { branchId } = req.params;
    const teachers = await Teacher.find({ branchId }, '-password').populate('courses', 'title').populate('branchId', 'branchName branchCode').sort({ createdAt: -1 });
    res.json({ success: true, teachers });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

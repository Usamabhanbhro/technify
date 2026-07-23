const jwt = require('jsonwebtoken');
const Student = require('../../model/Student');

const JWT_SECRET = process.env.JWT_SECRET;

function sanitizeStudent(doc) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : { ...doc };
  delete o.portalPassword;
  return o;
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const pin = typeof password === 'string' ? password.trim() : '';

    if (!normalizedEmail || !pin) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    if (!/^\d{4}$/.test(pin)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be exactly 4 digits',
      });
    }

    const student = await Student.findOne({ email: normalizedEmail });

    if (!student) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (!student.portalPassword) {
      return res.status(403).json({
        success: false,
        message: 'Portal access is not set up yet. Please contact the institute.',
      });
    }

    if (String(student.portalPassword) !== pin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (!['Enrolled', 'Passout'].includes(student.status)) {
      if (student.status === 'Not Enrolled') {
        return res.status(403).json({
          success: false,
          message:
            'Your application is still pending. You can log in after the institute approves and enrolls you.',
        });
      }
      return res.status(403).json({
        success: false,
        message: 'Your account is not eligible for portal access. Please contact the institute.',
      });
    }

    const token = jwt.sign(
      { role: 'student', studentId: String(student._id) },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      student: sanitizeStudent(student),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login',
    });
  }
};

const getMe = async (req, res) => {
  try {
    const student = await Student.findById(req.studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    return res.status(200).json({
      success: true,
      student: sanitizeStudent(student),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching profile',
    });
  }
};

module.exports = {
  login,
  getMe,
};

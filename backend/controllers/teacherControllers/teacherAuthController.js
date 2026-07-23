const Teacher = require('../../model/Teacher');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.teacherLogin = async (req, res) => {
  try {
    const { cnic, password } = req.body;
    if (!cnic || !password) {
      return res.status(400).json({ success: false, message: 'CNIC and password are required.' });
    }
    const teacher = await Teacher.findOne({ cnic });
    if (!teacher) {
      return res.status(401).json({ success: false, message: 'Invalid CNIC or password.' });
    }
    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid CNIC or password.' });
    }
    const token = jwt.sign({ id: teacher._id, cnic: teacher.cnic, role: 'teacher' }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({
      success: true,
      token,
      teacher: { name: teacher.name, cnic: teacher.cnic },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

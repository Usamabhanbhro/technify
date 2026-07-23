const Teacher = require('../../model/Teacher');
const { getTeacherWithCourses, findStudentsForTeacher } = require('../../utils/teacherCourseScope');

/** Logged-in teacher profile (no password) */
exports.getMe = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.user.id)
      .populate('courses', 'title description')
      .select('-password');

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found.' });
    }

    return res.json({ success: true, teacher });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

/** Courses this teacher was hired to teach */
exports.getAssignedCourses = async (req, res) => {
  try {
    const scope = await getTeacherWithCourses(req.user.id);
    if (!scope) {
      return res.status(404).json({ success: false, message: 'Teacher not found.' });
    }

    return res.json({
      success: true,
      courses: scope.courses.map((c) => ({
        _id: c._id,
        title: c.title,
      })),
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

/** Enrolled students in teacher's assigned course(s); optional ?course=Title */
exports.getStudents = async (req, res) => {
  try {
    const result = await findStudentsForTeacher(req.user.id, {
      course: req.query.course,
    });

    if (result.error) {
      return res.status(result.status).json({ success: false, message: result.error });
    }

    return res.json({
      success: true,
      students: result.students,
      teacherCourses: result.courseTitles,
      courses: result.courses,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

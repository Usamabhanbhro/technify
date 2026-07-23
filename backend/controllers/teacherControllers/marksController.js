const Student = require('../../model/Student');
const {
  findStudentsForTeacher,
  validateStudentIdsForTeacher,
} = require('../../utils/teacherCourseScope');

/** Students with test scores — same course scope as attendance */
exports.getStudentsForMarks = async (req, res) => {
  try {
    const result = await findStudentsForTeacher(req.user.id, {
      course: req.query.course,
      select: '_id name rollNo course testScores',
    });

    if (result.error) {
      return res.status(result.status).json({ success: false, message: result.error });
    }

    return res.json({
      success: true,
      students: result.students,
      teacherCourses: result.courseTitles,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

/** Add a test score for one student (must be in teacher's course) */
exports.addTestScore = async (req, res) => {
  try {
    const { studentId, testName, score, maxScore, date, course } = req.body;

    if (!studentId || !testName || score === undefined || score === null) {
      return res.status(400).json({
        success: false,
        message: 'studentId, testName, and score are required',
      });
    }

    const validation = await validateStudentIdsForTeacher(req.user.id, [studentId], {
      course,
    });
    if (!validation.ok) {
      return res.status(validation.status).json({
        success: false,
        message: validation.error,
      });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const entry = {
      testName: String(testName).trim(),
      score: Number(score),
      maxScore: maxScore !== undefined && maxScore !== null ? Number(maxScore) : 100,
      date: date ? new Date(date) : new Date(),
    };

    if (!entry.testName || Number.isNaN(entry.score)) {
      return res.status(400).json({ success: false, message: 'Invalid test data' });
    }

    student.testScores = student.testScores || [];
    student.testScores.push(entry);
    await student.save();

    return res.json({
      success: true,
      message: 'Test score saved',
      student: {
        _id: student._id,
        name: student.name,
        rollNo: student.rollNo,
        course: student.course,
        testScores: student.testScores,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

const Attendance = require('../../model/Attendance');
const Teacher = require('../../model/Teacher');
const {
  findStudentsForTeacher,
  validateStudentIdsForTeacher,
} = require('../../utils/teacherCourseScope');

function parseDateRange(dateStr) {
  const [y, m, d] = String(dateStr).split('-').map(Number);
  if (!y || !m || !d) return null;
  const start = new Date(y, m - 1, d, 0, 0, 0, 0);
  const end = new Date(y, m - 1, d, 23, 59, 59, 999);
  return { start, end };
}

function buildSummaryPayload(record) {
  if (!record || !record.students?.length) {
    return {
      present: 0,
      absent: 0,
      total: 0,
      students: [],
    };
  }

  const rows = record.students.map((entry) => {
    const s = entry.student;
    return {
      studentId: s?._id ? String(s._id) : undefined,
      name: s?.name || 'Unknown',
      rollNo: s?.rollNo || '',
      course: s?.course || '',
      status: entry.status,
    };
  });

  const present = rows.filter((r) => r.status === 'present').length;
  const absent = rows.filter((r) => r.status === 'absent').length;

  return {
    present,
    absent,
    total: rows.length,
    students: rows,
  };
}

async function populateAttendanceRecord(recordId) {
  return Attendance.findById(recordId).populate(
    'students.student',
    'name rollNo course'
  );
}

// Enrolled students in teacher's assigned course(s); ?course=CourseTitle optional
exports.getStudentsForTeacher = async (req, res) => {
  try {
    const result = await findStudentsForTeacher(req.user.id, {
      course: req.query.course,
      select: '_id name rollNo course email status',
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

// Save attendance — only students in teacher's assigned courses
exports.saveAttendance = async (req, res) => {
  try {
    const { date, students, course } = req.body;
    const teacherId = req.user.id;

    if (!date || !Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ success: false, message: 'Date and students are required.' });
    }

    const studentIds = students.map((s) => s.student);
    const validation = await validateStudentIdsForTeacher(teacherId, studentIds, { course });
    if (!validation.ok) {
      return res.status(validation.status).json({ success: false, message: validation.error });
    }

    const normalized = students.map((s) => ({
      student: s.student,
      status: String(s.status).toLowerCase() === 'absent' ? 'absent' : 'present',
    }));

    const range = parseDateRange(date);
    if (!range) {
      return res.status(400).json({ success: false, message: 'Invalid date format.' });
    }

    await Attendance.deleteMany({
      teacher: teacherId,
      date: { $gte: range.start, $lte: range.end },
    });

    const attendance = new Attendance({
      date: range.start,
      teacher: teacherId,
      students: normalized,
    });
    await attendance.save();

    const populated = await populateAttendanceRecord(attendance._id);
    const summary = buildSummaryPayload(populated);
    const teacher = await Teacher.findById(teacherId).select('name');

    return res.json({
      success: true,
      message: 'Attendance saved.',
      date,
      teacherName: teacher?.name || '',
      course: course || 'All assigned courses',
      summary,
      record: populated,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Attendance for a date with present/absent counts
exports.getAttendanceSummary = async (req, res) => {
  try {
    const { date } = req.query;
    const teacherId = req.user.id;

    if (!date) {
      return res.status(400).json({ success: false, message: 'Date query parameter is required.' });
    }

    const range = parseDateRange(date);
    if (!range) {
      return res.status(400).json({ success: false, message: 'Invalid date format.' });
    }

    const record = await Attendance.findOne({
      teacher: teacherId,
      date: { $gte: range.start, $lte: range.end },
    }).populate('students.student', 'name rollNo course');

    const summary = buildSummaryPayload(record);
    const teacher = await Teacher.findById(teacherId).select('name');

    return res.json({
      success: true,
      date,
      teacherName: teacher?.name || '',
      hasRecord: Boolean(record),
      summary,
      record,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

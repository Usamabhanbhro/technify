const Teacher = require('../model/Teacher');
const Student = require('../model/Student');

/**
 * Load teacher and assigned course documents (title used to match Student.course).
 */
async function getTeacherWithCourses(teacherId) {
  const teacher = await Teacher.findById(teacherId).populate('courses', 'title _id');
  if (!teacher) return null;

  const courses = (teacher.courses || []).filter((c) => c && c.title);
  const courseTitles = courses.map((c) => c.title);

  return { teacher, courses, courseTitles };
}

/**
 * Restrict to one course title if requested; null if teacher not assigned to it.
 */
function resolveCourseTitles(allTitles, requestedCourse) {
  if (!requestedCourse || requestedCourse === 'all') {
    return allTitles;
  }
  const q = String(requestedCourse).trim();
  if (!allTitles.includes(q)) {
    return null;
  }
  return [q];
}

/**
 * Students enrolled in courses this teacher is hired for.
 */
async function findStudentsForTeacher(teacherId, options = {}) {
  const {
    course,
    status = 'Enrolled',
    select = '_id name rollNo course email status testScores attendancePresent attendanceTotal',
  } = options;

  const scope = await getTeacherWithCourses(teacherId);
  if (!scope) {
    return { error: 'Teacher not found', status: 404 };
  }

  const { courses, courseTitles } = scope;

  if (courseTitles.length === 0) {
    return {
      students: [],
      courses,
      courseTitles,
      assignedCourseTitles: courseTitles,
    };
  }

  const filterTitles = resolveCourseTitles(courseTitles, course);
  if (filterTitles === null) {
    return {
      error: 'You are not assigned to this course',
      status: 403,
    };
  }

  const students = await Student.find({
    course: { $in: filterTitles },
    status,
  })
    .select(select)
    .sort({ name: 1 });

  return {
    students,
    courses,
    courseTitles,
    assignedCourseTitles: courseTitles,
    activeCourseTitles: filterTitles,
  };
}

/**
 * Ensure every student id belongs to teacher's assigned courses (enrolled only).
 */
async function validateStudentIdsForTeacher(teacherId, studentIds, options = {}) {
  const { course } = options;
  const scope = await getTeacherWithCourses(teacherId);
  if (!scope) {
    return { ok: false, error: 'Teacher not found', status: 404 };
  }

  const { courseTitles } = scope;
  if (courseTitles.length === 0) {
    return { ok: false, error: 'No courses assigned to your account', status: 403 };
  }

  const filterTitles = resolveCourseTitles(courseTitles, course);
  if (filterTitles === null) {
    return { ok: false, error: 'You are not assigned to this course', status: 403 };
  }

  const ids = [...new Set((studentIds || []).map(String).filter(Boolean))];
  if (ids.length === 0) {
    return { ok: false, error: 'No students provided', status: 400 };
  }

  const allowed = await Student.find({
    _id: { $in: ids },
    course: { $in: filterTitles },
    status: 'Enrolled',
  }).select('_id course');

  if (allowed.length !== ids.length) {
    return {
      ok: false,
      error: 'One or more students are not in your assigned courses',
      status: 403,
    };
  }

  return { ok: true, courseTitles: filterTitles };
}

module.exports = {
  getTeacherWithCourses,
  resolveCourseTitles,
  findStudentsForTeacher,
  validateStudentIdsForTeacher,
};

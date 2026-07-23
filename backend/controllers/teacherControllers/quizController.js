const Quiz = require('../../model/Quiz');
const QuizAttempt = require('../../model/QuizAttempt');
const Student = require('../../model/Student');
const { getTeacherWithCourses } = require('../../utils/teacherCourseScope');

/**
 * POST /api/teacher/quiz
 * Create a new quiz for one of the teacher's assigned courses.
 */
exports.createQuiz = async (req, res) => {
  try {
    const { courseId, title, questions } = req.body;

    if (!courseId || !title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'courseId, title, and at least 1 question are required.',
      });
    }

    // Validate teacher owns this course
    const scope = await getTeacherWithCourses(req.user.id);
    if (!scope) {
      return res.status(404).json({ success: false, message: 'Teacher not found.' });
    }

    const course = scope.courses.find((c) => String(c._id) === String(courseId));
    if (!course) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this course.',
      });
    }

    // Validate each question
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText || !Array.isArray(q.options) || q.options.length < 2) {
        return res.status(400).json({
          success: false,
          message: `Question ${i + 1}: must have text and at least 2 options.`,
        });
      }
      if (q.correctIndex == null || q.correctIndex < 0 || q.correctIndex >= q.options.length) {
        return res.status(400).json({
          success: false,
          message: `Question ${i + 1}: correctIndex is invalid.`,
        });
      }
    }

    const quiz = new Quiz({
      teacherId: req.user.id,
      courseId: course._id,
      courseName: course.title,
      title: title.trim(),
      questions,
    });

    await quiz.save();

    return res.status(201).json({
      success: true,
      message: 'Quiz created successfully.',
      quiz,
    });
  } catch (err) {
    console.error('Error creating quiz:', err);
    return res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};

/**
 * GET /api/teacher/quiz
 * Get all quizzes created by this teacher. Optional ?course=Title filter.
 */
exports.getMyQuizzes = async (req, res) => {
  try {
    const filter = { teacherId: req.user.id };
    if (req.query.course) {
      filter.courseName = req.query.course;
    }

    const quizzes = await Quiz.find(filter).sort({ createdAt: -1 });

    // For each quiz, get the attempt count
    const quizzesWithStats = await Promise.all(
      quizzes.map(async (quiz) => {
        const attemptCount = await QuizAttempt.countDocuments({ quizId: quiz._id });
        return {
          ...quiz.toObject(),
          attemptCount,
        };
      })
    );

    return res.json({ success: true, quizzes: quizzesWithStats });
  } catch (err) {
    console.error('Error fetching quizzes:', err);
    return res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};

/**
 * GET /api/teacher/quiz/:id/results
 * Get all student attempts / results for a specific quiz.
 */
exports.getQuizResults = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, teacherId: req.user.id });
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found.' });
    }

    const attempts = await QuizAttempt.find({ quizId: quiz._id })
      .populate('studentId', 'name rollNo email course')
      .sort({ attemptedAt: -1 });

    return res.json({
      success: true,
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        courseName: quiz.courseName,
        totalQuestions: quiz.questions.length,
      },
      attempts: attempts.map((a) => ({
        _id: a._id,
        student: a.studentId,
        score: a.score,
        totalMarks: a.totalMarks,
        attemptedAt: a.attemptedAt,
      })),
    });
  } catch (err) {
    console.error('Error fetching quiz results:', err);
    return res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};

/**
 * DELETE /api/teacher/quiz/:id
 * Delete a quiz and all its attempts.
 */
exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOneAndDelete({ _id: req.params.id, teacherId: req.user.id });
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found.' });
    }

    await QuizAttempt.deleteMany({ quizId: quiz._id });

    return res.json({ success: true, message: 'Quiz deleted successfully.' });
  } catch (err) {
    console.error('Error deleting quiz:', err);
    return res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};

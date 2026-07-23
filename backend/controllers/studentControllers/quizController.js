const Quiz = require('../../model/Quiz');
const QuizAttempt = require('../../model/QuizAttempt');
const Student = require('../../model/Student');

/**
 * GET /api/student/quizzes
 * Get all quizzes for the student's enrolled course, with attempted flag.
 */
exports.getMyQuizzes = async (req, res) => {
  try {
    const student = await Student.findById(req.studentId);
    if (!student || student.status !== 'Enrolled') {
      return res.status(403).json({ success: false, message: 'Not enrolled.' });
    }

    const quizzes = await Quiz.find({ courseName: student.course })
      .select('_id title courseName questions createdAt')
      .sort({ createdAt: -1 });

    // Get this student's attempts
    const attempts = await QuizAttempt.find({
      studentId: req.studentId,
      quizId: { $in: quizzes.map((q) => q._id) },
    }).select('quizId score totalMarks');

    const attemptMap = {};
    attempts.forEach((a) => {
      attemptMap[String(a.quizId)] = { score: a.score, totalMarks: a.totalMarks };
    });

    const result = quizzes.map((q) => ({
      _id: q._id,
      title: q.title,
      courseName: q.courseName,
      totalQuestions: q.questions.length,
      createdAt: q.createdAt,
      attempted: !!attemptMap[String(q._id)],
      score: attemptMap[String(q._id)]?.score ?? null,
      totalMarks: attemptMap[String(q._id)]?.totalMarks ?? null,
    }));

    return res.json({ success: true, quizzes: result });
  } catch (err) {
    console.error('Error fetching student quizzes:', err);
    return res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};

/**
 * GET /api/student/quizzes/has-new
 * Lightweight check: are there quizzes the student hasn't attempted yet?
 */
exports.hasNewQuizzes = async (req, res) => {
  try {
    const student = await Student.findById(req.studentId).select('course status');
    if (!student || student.status !== 'Enrolled') {
      return res.json({ success: true, hasNew: false });
    }

    const quizIds = await Quiz.find({ courseName: student.course }).select('_id');
    if (quizIds.length === 0) {
      return res.json({ success: true, hasNew: false });
    }

    const attemptedCount = await QuizAttempt.countDocuments({
      studentId: req.studentId,
      quizId: { $in: quizIds.map((q) => q._id) },
    });

    return res.json({ success: true, hasNew: attemptedCount < quizIds.length });
  } catch (err) {
    console.error('Error checking new quizzes:', err);
    return res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};

/**
 * GET /api/student/quizzes/:id
 * Get quiz details (questions + options, NO correct answers) for attempting.
 */
exports.getQuizDetails = async (req, res) => {
  try {
    const student = await Student.findById(req.studentId).select('course status');
    if (!student || student.status !== 'Enrolled') {
      return res.status(403).json({ success: false, message: 'Not enrolled.' });
    }

    const quiz = await Quiz.findOne({ _id: req.params.id, courseName: student.course });
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found.' });
    }

    // Check if already attempted
    const existing = await QuizAttempt.findOne({ quizId: quiz._id, studentId: req.studentId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already attempted this quiz.',
        score: existing.score,
        totalMarks: existing.totalMarks,
      });
    }

    // Strip correctIndex from questions before sending
    const safeQuestions = quiz.questions.map((q) => ({
      questionText: q.questionText,
      options: q.options,
    }));

    return res.json({
      success: true,
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        courseName: quiz.courseName,
        questions: safeQuestions,
      },
    });
  } catch (err) {
    console.error('Error fetching quiz details:', err);
    return res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};

/**
 * POST /api/student/quizzes/:id/submit
 * Submit answers for a quiz. Grades and returns the score.
 */
exports.submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body;

    const student = await Student.findById(req.studentId).select('course status');
    if (!student || student.status !== 'Enrolled') {
      return res.status(403).json({ success: false, message: 'Not enrolled.' });
    }

    const quiz = await Quiz.findOne({ _id: req.params.id, courseName: student.course });
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found.' });
    }

    if (!Array.isArray(answers) || answers.length !== quiz.questions.length) {
      return res.status(400).json({
        success: false,
        message: `You must answer all ${quiz.questions.length} questions.`,
      });
    }

    // Grade the quiz
    let score = 0;
    quiz.questions.forEach((q, i) => {
      if (answers[i] === q.correctIndex) {
        score++;
      }
    });

    const attempt = new QuizAttempt({
      quizId: quiz._id,
      studentId: req.studentId,
      answers,
      score,
      totalMarks: quiz.questions.length,
    });

    await attempt.save();

    return res.status(201).json({
      success: true,
      message: 'Quiz submitted successfully.',
      score,
      totalMarks: quiz.questions.length,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already attempted this quiz.',
      });
    }
    console.error('Error submitting quiz:', err);
    return res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};

/**
 * GET /api/student/quizzes/attempts
 * Get all past quiz attempts for this student (their course).
 */
exports.getMyAttempts = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ studentId: req.studentId })
      .populate('quizId', 'title courseName')
      .sort({ attemptedAt: -1 });

    const result = attempts.map((a) => ({
      _id: a._id,
      quizTitle: a.quizId?.title || 'Deleted Quiz',
      courseName: a.quizId?.courseName || '—',
      score: a.score,
      totalMarks: a.totalMarks,
      attemptedAt: a.attemptedAt,
    }));

    return res.json({ success: true, attempts: result });
  } catch (err) {
    console.error('Error fetching attempts:', err);
    return res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};

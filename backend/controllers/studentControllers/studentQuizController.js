const Quiz = require('../../model/Quiz');
const QuizAttempt = require('../../model/QuizAttempt');
const Result = require('../../model/Result');
const Student = require('../../model/Student');

/**
 * GET /api/student/quizzes
 * Get all quizzes assigned to the student
 */
exports.getMyQuizzes = async (req, res) => {
  try {
    const studentId = req.userId;

    const student = await Student.findById(studentId);
    if (!student || student.status !== 'Enrolled') {
      return res.status(403).json({
        success: false,
        message: 'Student not enrolled',
      });
    }

    // Get quizzes assigned to this student
    const quizzes = await Quiz.find({
      assignedTo: studentId,
      isPublished: true,
    }).select('_id title subject difficulty duration totalQuestions assignedTo createdAt');

    // Get student's attempts for these quizzes
    const attempts = await QuizAttempt.find({
      studentId,
      quizId: { $in: quizzes.map((q) => q._id) },
    }).select('quizId score totalMarks');

    const results = await Result.find({
      studentId,
      quizId: { $in: quizzes.map((q) => q._id) },
    }).select('quizId score totalMarks percentage status');

    const attemptMap = {};
    attempts.forEach((a) => {
      attemptMap[String(a.quizId)] = { score: a.score, totalMarks: a.totalMarks };
    });

    const resultMap = {};
    results.forEach((r) => {
      resultMap[String(r.quizId)] = {
        score: r.score,
        totalMarks: r.totalMarks,
        percentage: r.percentage,
        status: r.status,
      };
    });

    const quizzesWithStatus = quizzes.map((q) => ({
      _id: q._id,
      title: q.title,
      subject: q.subject,
      difficulty: q.difficulty,
      duration: q.duration,
      totalQuestions: q.totalQuestions,
      courseName: q.courseName,
      attempted: !!resultMap[String(q._id)],
      ...resultMap[String(q._id)],
      createdAt: q.createdAt,
    }));

    return res.json({
      success: true,
      quizzes: quizzesWithStatus,
    });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch quizzes',
      error: error.message,
    });
  }
};

/**
 * GET /api/student/quizzes/:quizId
 * Get quiz details for attempting
 */
exports.getQuizForAttempt = async (req, res) => {
  try {
    const { quizId } = req.params;
    const studentId = req.userId;

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    // Check if quiz is assigned to this student
    if (!quiz.assignedTo.includes(studentId)) {
      return res.status(403).json({
        success: false,
        message: 'Quiz not assigned to you',
      });
    }

    // Check if quiz is expired
    if (quiz.expiryDate && new Date(quiz.expiryDate) < new Date()) {
      return res.status(403).json({
        success: false,
        message: 'Quiz has expired',
      });
    }

    // Randomize questions if enabled
    let questions = quiz.questions;
    if (quiz.randomizeQuestions) {
      questions = questions.sort(() => Math.random() - 0.5);
    }

    // Randomize options if enabled
    if (quiz.randomizeOptions) {
      questions = questions.map((q) => ({
        ...q.toObject(),
        options: [...q.options].sort(() => Math.random() - 0.5),
      }));
    }

    return res.json({
      success: true,
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        subject: quiz.subject,
        difficulty: quiz.difficulty,
        duration: quiz.duration,
        totalQuestions: quiz.totalQuestions,
        questions: questions.map((q) => ({
          _id: q._id,
          question: q.question,
          options: q.options,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz',
      error: error.message,
    });
  }
};

/**
 * POST /api/student/quiz/:quizId/submit
 * Submit quiz attempt and calculate score
 */
exports.submitQuizAttempt = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body;
    const studentId = req.userId;

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    // Validate quiz assignment
    if (!quiz.assignedTo.includes(studentId)) {
      return res.status(403).json({
        success: false,
        message: 'Quiz not assigned to you',
      });
    }

    // Calculate score
    let score = 0;
    let correctAnswers = 0;
    let wrongAnswers = 0;
    const resultDetails = [];

    quiz.questions.forEach((question, idx) => {
      const userAnswer = answers.find((a) => a.questionId.toString() === question._id.toString());
      const selectedAnswer = userAnswer?.selectedAnswer;
      const isCorrect = selectedAnswer === question.correctAnswer;

      if (isCorrect) {
        score += 1;
        correctAnswers += 1;
      } else {
        if (quiz.negativeMarking.enabled) {
          score -= quiz.negativeMarking.marks;
        }
        wrongAnswers += 1;
      }

      resultDetails.push({
        questionId: question._id,
        question: question.question,
        userAnswer: selectedAnswer || null,
        correctAnswer: question.correctAnswer,
        isCorrect,
      });
    });

    // Ensure score is not negative
    score = Math.max(0, score);

    // Calculate percentage
    const percentage = (score / quiz.totalQuestions) * 100;

    // Determine pass/fail
    const status = percentage >= quiz.passPercentage ? 'Pass' : 'Fail';

    // Create QuizAttempt
    const attempt = new QuizAttempt({
      quizId,
      studentId,
      answers: answers.map((a) => ({
        questionId: a.questionId,
        selectedAnswer: a.selectedAnswer,
        isCorrect: quiz.questions.find((q) =>
          q._id.toString() === a.questionId.toString()
        )?.correctAnswer === a.selectedAnswer,
      })),
      score,
      totalMarks: quiz.totalQuestions,
      percentage,
      status,
      startedAt: new Date(Date.now() - quiz.duration * 60 * 1000), // Approximate
      submittedAt: new Date(),
    });

    await attempt.save();

    // Create Result
    const result = new Result({
      quizId,
      studentId,
      quizAttemptId: attempt._id,
      score,
      totalMarks: quiz.totalQuestions,
      percentage,
      status,
      correctAnswers,
      wrongAnswers,
      resultDetails,
      submittedAt: new Date(),
    });

    await result.save();

    return res.status(201).json({
      success: true,
      message: 'Quiz submitted successfully',
      result: {
        _id: result._id,
        score,
        totalMarks: quiz.totalQuestions,
        percentage,
        status,
        correctAnswers,
        wrongAnswers,
      },
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit quiz',
      error: error.message,
    });
  }
};

/**
 * GET /api/student/quiz/:quizId/result
 * Get quiz result for student
 */
exports.getQuizResult = async (req, res) => {
  try {
    const { quizId } = req.params;
    const studentId = req.userId;

    const result = await Result.findOne({
      quizId,
      studentId,
    }).sort({ submittedAt: -1 });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result not found',
      });
    }

    const quiz = await Quiz.findById(quizId);

    return res.json({
      success: true,
      result: {
        ...result.toObject(),
        quizTitle: quiz?.title || 'Quiz',
      },
    });
  } catch (error) {
    console.error('Error fetching result:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch result',
      error: error.message,
    });
  }
};

/**
 * GET /api/student/quizzes/:quizId/attempts
 * Get all attempts for a quiz
 */
exports.getPastAttempts = async (req, res) => {
  try {
    const { quizId } = req.params;
    const studentId = req.userId;

    const attempts = await QuizAttempt.find({
      quizId,
      studentId,
    }).sort({ attemptedAt: -1 });

    return res.json({
      success: true,
      attempts,
    });
  } catch (error) {
    console.error('Error fetching attempts:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch attempts',
      error: error.message,
    });
  }
};

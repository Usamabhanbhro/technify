const Quiz = require('../../model/Quiz');
const QuizAttempt = require('../../model/QuizAttempt');
const Result = require('../../model/Result');
const Student = require('../../model/Student');
const Teacher = require('../../model/Teacher');
const { generateQuizQuestionsWithAI } = require('../../utils/geminiAPI');

/**
 * POST /api/teacher/quiz/generate-ai
 * Generate quiz questions using AI (Gemini)
 */
exports.generateAIQuiz = async (req, res) => {
  try {
    const { subject, numQuestions, difficulty, quizTime, assignedStudents, quizTitle } = req.body;
    const teacherId = req.userId;

    // Validation
    if (!subject || !numQuestions || !difficulty || !quizTime) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: subject, numQuestions, difficulty, quizTime',
      });
    }

    if (!['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: 'Difficulty must be Easy, Medium, or Hard',
      });
    }

    if (numQuestions < 1 || numQuestions > 50) {
      return res.status(400).json({
        success: false,
        message: 'Number of questions must be between 1 and 50',
      });
    }

    // Generate questions using Gemini API
    const questions = await generateQuizQuestionsWithAI(subject, numQuestions, difficulty);

    if (!questions || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Failed to generate questions from AI',
      });
    }

    // Create quiz document
    const quizData = {
      title: quizTitle || `${subject} Quiz - ${difficulty}`,
      subject,
      difficulty,
      duration: quizTime,
      totalQuestions: questions.length,
      questions: questions.map((q) => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
      })),
      createdBy: teacherId,
      teacherId,
      assignedTo: assignedStudents || [],
      isPublished: false,
      passPercentage: 50,
      randomizeQuestions: true,
      randomizeOptions: true,
    };

    const quiz = new Quiz(quizData);
    await quiz.save();

    return res.status(201).json({
      success: true,
      message: 'Quiz generated successfully',
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        subject: quiz.subject,
        difficulty: quiz.difficulty,
        duration: quiz.duration,
        totalQuestions: quiz.totalQuestions,
        questions: quiz.questions,
      },
    });
  } catch (error) {
    console.error('Error generating AI quiz:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate quiz',
      error: error.message,
    });
  }
};

/**
 * POST /api/teacher/quiz/create
 * Create quiz manually (without AI)
 */
exports.createQuiz = async (req, res) => {
  try {
    const { title, subject, difficulty, duration, questions, assignedStudents } = req.body;
    const teacherId = req.userId;

    if (!title || !subject || !difficulty || !duration || !questions || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    const quizData = {
      title,
      subject,
      difficulty,
      duration,
      totalQuestions: questions.length,
      questions: questions.map((q) => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
      })),
      createdBy: teacherId,
      teacherId,
      assignedTo: assignedStudents || [],
      isPublished: false,
    };

    const quiz = new Quiz(quizData);
    await quiz.save();

    return res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      quiz,
    });
  } catch (error) {
    console.error('Error creating quiz:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create quiz',
      error: error.message,
    });
  }
};

/**
 * GET /api/teacher/quiz/list
 * Get all quizzes created by teacher
 */
exports.getTeacherQuizzes = async (req, res) => {
  try {
    const teacherId = req.userId;

    const quizzes = await Quiz.find({
      $or: [{ teacherId }, { createdBy: teacherId }],
    })
      .select('_id title subject difficulty duration totalQuestions assignedTo isPublished createdAt')
      .sort({ createdAt: -1 });

    // Get attempt counts for each quiz
    const quizzesWithStats = await Promise.all(
      quizzes.map(async (quiz) => {
        const attempts = await QuizAttempt.countDocuments({ quizId: quiz._id });
        return {
          _id: quiz._id,
          title: quiz.title,
          subject: quiz.subject,
          difficulty: quiz.difficulty,
          duration: quiz.duration,
          totalQuestions: quiz.totalQuestions,
          assignedStudents: quiz.assignedTo.length,
          attempts,
          isPublished: quiz.isPublished,
          createdAt: quiz.createdAt,
        };
      })
    );

    return res.json({
      success: true,
      quizzes: quizzesWithStats,
    });
  } catch (error) {
    console.error('Error fetching teacher quizzes:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch quizzes',
      error: error.message,
    });
  }
};

/**
 * GET /api/teacher/quiz/:quizId
 * Get quiz details
 */
exports.getQuizDetails = async (req, res) => {
  try {
    const { quizId } = req.params;
    const teacherId = req.userId;

    const quiz = await Quiz.findById(quizId).populate('assignedTo', 'name email rollNo');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    // Check if teacher owns this quiz
    if (quiz.teacherId.toString() !== teacherId && quiz.createdBy.toString() !== teacherId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    return res.json({
      success: true,
      quiz,
    });
  } catch (error) {
    console.error('Error fetching quiz details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz details',
      error: error.message,
    });
  }
};

/**
 * PUT /api/teacher/quiz/:quizId/assign
 * Assign quiz to students
 */
exports.assignQuizToStudents = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { studentIds } = req.body;
    const teacherId = req.userId;

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    // Check if teacher owns this quiz
    if (quiz.teacherId.toString() !== teacherId && quiz.createdBy.toString() !== teacherId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Update assigned students
    quiz.assignedTo = studentIds || [];
    quiz.isPublished = true;
    await quiz.save();

    // Emit socket event to notify students
    if (req.io && req.userSockets) {
      studentIds.forEach((studentId) => {
        const studentSocketId = req.userSockets[studentId.toString()];
        if (studentSocketId) {
          req.io.to(studentSocketId).emit('quiz_assigned', {
            quizId: quiz._id,
            title: quiz.title,
            subject: quiz.subject,
            duration: quiz.duration,
            difficulty: quiz.difficulty,
          });
        }
      });
    }

    return res.json({
      success: true,
      message: 'Quiz assigned successfully',
      quiz,
    });
  } catch (error) {
    console.error('Error assigning quiz:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to assign quiz',
      error: error.message,
    });
  }
};

/**
 * GET /api/teacher/quiz/:quizId/results
 * Get results for a specific quiz
 */
exports.getQuizResults = async (req, res) => {
  try {
    const { quizId } = req.params;
    const teacherId = req.userId;

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    // Check if teacher owns this quiz
    if (quiz.teacherId.toString() !== teacherId && quiz.createdBy.toString() !== teacherId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const results = await Result.find({ quizId })
      .populate('studentId', 'name email rollNo')
      .sort({ submittedAt: -1 });

    // Add quiz title to results
    const resultsWithQuizInfo = results.map((result) => ({
      ...result.toObject(),
      quizTitle: quiz.title,
    }));

    return res.json({
      success: true,
      results: resultsWithQuizInfo,
    });
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch results',
      error: error.message,
    });
  }
};

/**
 * GET /api/teacher/quiz/:quizId/leaderboard
 * Get leaderboard for a quiz
 */
exports.getQuizLeaderboard = async (req, res) => {
  try {
    const { quizId } = req.params;
    const teacherId = req.userId;

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    // Check if teacher owns this quiz
    if (quiz.teacherId.toString() !== teacherId && quiz.createdBy.toString() !== teacherId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const leaderboard = await Result.find({ quizId })
      .populate('studentId', 'name rollNo email')
      .sort({ percentage: -1, submittedAt: 1 })
      .select('studentId score percentage status submittedAt');

    const leaderboardWithRank = leaderboard.map((entry, index) => ({
      rank: index + 1,
      studentId: entry.studentId._id,
      studentName: entry.studentId.name,
      rollNo: entry.studentId.rollNo,
      email: entry.studentId.email,
      score: entry.score,
      percentage: entry.percentage,
      status: entry.status,
      submittedAt: entry.submittedAt,
    }));

    return res.json({
      success: true,
      leaderboard: leaderboardWithRank,
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard',
      error: error.message,
    });
  }
};

/**
 * GET /api/teacher/students/list
 * Get list of all students for assignment
 */
exports.getStudentsList = async (req, res) => {
  try {
    const students = await Student.find({ status: 'Enrolled' }).select('_id name email rollNo course');

    return res.json({
      success: true,
      students,
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch students',
      error: error.message,
    });
  }
};

/**
 * DELETE /api/teacher/quiz/:quizId
 * Delete a quiz
 */
exports.deleteQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const teacherId = req.userId;

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    // Check if teacher owns this quiz
    if (quiz.teacherId.toString() !== teacherId && quiz.createdBy.toString() !== teacherId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Delete quiz and related attempts/results
    await Quiz.findByIdAndDelete(quizId);
    await QuizAttempt.deleteMany({ quizId });
    await Result.deleteMany({ quizId });

    return res.json({
      success: true,
      message: 'Quiz deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete quiz',
      error: error.message,
    });
  }
};

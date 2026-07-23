const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const studentPortalController = require('../controllers/studentControllers/studentPortalController');
const quizController = require('../controllers/studentControllers/quizController');
const studentQuizController = require('../controllers/studentControllers/studentQuizController');
const passwordResetController = require('../controllers/studentControllers/passwordResetController');

const JWT_SECRET = process.env.JWT_SECRET;

function requireStudent(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  const token = header.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'student' || !decoded.studentId) {
      return res.status(403).json({ success: false, message: 'Invalid student token' });
    }
    req.studentId = decoded.studentId;
    req.userId = decoded.studentId; // Add userId for compatibility
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

router.post('/login', studentPortalController.login);
router.get('/me', requireStudent, studentPortalController.getMe);

// Password Reset Routes (public endpoints)
router.post('/forgot-password', passwordResetController.forgotPassword);
router.get('/verify-reset-token', passwordResetController.verifyResetToken);
router.post('/reset-password', passwordResetController.resetPassword);

// Existing Quizzes routes
router.get('/quizzes', requireStudent, quizController.getMyQuizzes);
router.get('/quizzes/has-new', requireStudent, quizController.hasNewQuizzes);
router.get('/quizzes/attempts', requireStudent, quizController.getMyAttempts);
router.get('/quizzes/:id', requireStudent, quizController.getQuizDetails);
router.post('/quizzes/:id/submit', requireStudent, quizController.submitQuiz);

// AI Quiz Management routes
router.get('/quizzes', requireStudent, studentQuizController.getMyQuizzes);
router.get('/quizzes/:quizId', requireStudent, studentQuizController.getQuizForAttempt);
router.post('/quiz/:quizId/submit', requireStudent, studentQuizController.submitQuizAttempt);
router.get('/quiz/:quizId/result', requireStudent, studentQuizController.getQuizResult);
router.get('/quizzes/:quizId/attempts', requireStudent, studentQuizController.getPastAttempts);

module.exports = router;


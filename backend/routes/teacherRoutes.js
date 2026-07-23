const express = require('express');
const router = express.Router();
const teacherAuthController = require('../controllers/teacherControllers/teacherAuthController');
const teacherPortalController = require('../controllers/teacherControllers/teacherPortalController');
const marksController = require('../controllers/teacherControllers/marksController');
const quizController = require('../controllers/teacherControllers/quizController');
const quizManagementController = require('../controllers/teacherControllers/quizManagementController');
const passwordResetController = require('../controllers/teacherControllers/passwordResetController');
const auth = require('../middlewares/auth');

// Teacher login
router.post('/login', teacherAuthController.teacherLogin);

// Password Reset Routes (public endpoints)
router.post('/forgot-password', passwordResetController.forgotPassword);
router.get('/verify-reset-token', passwordResetController.verifyResetToken);
router.post('/reset-password', passwordResetController.resetPassword);

// Profile
router.get('/me', auth('teacher'), teacherPortalController.getMe);

// Assigned courses & roster (scoped to hire)
router.get('/courses', auth('teacher'), teacherPortalController.getAssignedCourses);
router.get('/students', auth('teacher'), teacherPortalController.getStudents);

// Test marks (scoped to hire)
router.get('/marks/students', auth('teacher'), marksController.getStudentsForMarks);
router.post('/marks', auth('teacher'), marksController.addTestScore);

// Quizzes - Existing routes
router.post('/quiz', auth('teacher'), quizController.createQuiz);
router.get('/quiz', auth('teacher'), quizController.getMyQuizzes);
router.get('/quiz/:id/results', auth('teacher'), quizController.getQuizResults);
router.delete('/quiz/:id', auth('teacher'), quizController.deleteQuiz);

// AI Quiz Generation & Management - New routes
router.post('/quiz/generate-ai', auth('teacher'), quizManagementController.generateAIQuiz);
router.post('/quiz/create', auth('teacher'), quizManagementController.createQuiz);
router.get('/quiz/list', auth('teacher'), quizManagementController.getTeacherQuizzes);
router.get('/quiz/:quizId/details', auth('teacher'), quizManagementController.getQuizDetails);
router.put('/quiz/:quizId/assign', auth('teacher'), quizManagementController.assignQuizToStudents);
router.get('/quiz/:quizId/results', auth('teacher'), quizManagementController.getQuizResults);
router.get('/quiz/:quizId/leaderboard', auth('teacher'), quizManagementController.getQuizLeaderboard);
router.delete('/quiz/:quizId', auth('teacher'), quizManagementController.deleteQuiz);
router.get('/students/list', auth('teacher'), quizManagementController.getStudentsList);

module.exports = router;

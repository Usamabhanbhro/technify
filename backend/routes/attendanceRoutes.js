const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/teacherControllers/attendanceController');
const auth = require('../middlewares/auth');

// Get students for a teacher (filtered by assigned courses)
router.get('/students', auth('teacher'), attendanceController.getStudentsForTeacher);

// Save attendance (teacher only)
router.post('/save', auth('teacher'), attendanceController.saveAttendance);

// Get attendance summary (teacher only)
router.get('/summary', auth('teacher'), attendanceController.getAttendanceSummary);

module.exports = router;

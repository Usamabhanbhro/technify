const express = require('express');
const router = express.Router();
const branchController = require('../controllers/adminControllers/branchController');

// Get all branches
router.get('/', branchController.getBranches);

// Get all branches with statistics
router.get('/statistics/all', branchController.getAllBranchesStatistics);

// Get branch teachers (paginated)
router.get('/:id/teachers', branchController.getBranchTeachers);

// Get branch students (paginated)
router.get('/:id/students', branchController.getBranchStudents);

// Get single branch
router.get('/:id', branchController.getBranchById);

// Get branch statistics
router.get('/:id/statistics', branchController.getBranchStatistics);

// Create branch
router.post('/', branchController.createBranch);

// Update branch
router.put('/:id', branchController.updateBranch);

// Delete branch
router.delete('/:id', branchController.deleteBranch);

module.exports = router;

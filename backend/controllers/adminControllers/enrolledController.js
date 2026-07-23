const Student = require('../../model/Student');

// Get List of Enrolled Students (Enrolled, Passout, Dropout)
const getEnrolledStudents = async (req, res) => {
  try {
    // Fetch students with status 'Enrolled', 'Passout', or 'Dropout'
    const students = await Student.find({ 
      status: { $in: ['Enrolled', 'Passout', 'Dropout'] } 
    }).populate('branchId', 'branchName branchCode').sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      students
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error fetching enrolled students"
    });
  }
};

// Get Enrolled Students by Branch
const getEnrolledStudentsByBranch = async (req, res) => {
  try {
    const { branchId } = req.params;
    const students = await Student.find({ 
      branchId,
      status: { $in: ['Enrolled', 'Passout', 'Dropout'] } 
    }).populate('branchId', 'branchName branchCode').sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      students
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error fetching branch enrolled students"
    });
  }
};

// Update Enrolled Student Status or Details
const updateEnrolledStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedStudent = await Student.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedStudent) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    res.status(200).json({
      success: true,
      message: "Student record updated successfully",
      student: updatedStudent
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error updating enrolled student"
    });
  }
};

module.exports = {
  getEnrolledStudents,
  getEnrolledStudentsByBranch,
  updateEnrolledStudent
};

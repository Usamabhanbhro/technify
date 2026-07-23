const Student = require('../../model/Student');

// Get List of Students who applied (Not Enrolled)
const getAdmissions = async (req, res) => {
  try {
    // Search for both 'Not Enrolled' and 'not enrolled' just in case
    const admissions = await Student.find({ 
      status: { $regex: /^not enrolled$/i } 
    }).populate('branchId', 'branchName branchCode').sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      admissions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error fetching admissions"
    });
  }
};

// Get admissions by branch
const getAdmissionsByBranch = async (req, res) => {
  try {
    const { branchId } = req.params;
    const admissions = await Student.find({ 
      branchId,
      status: { $regex: /^not enrolled$/i }
    }).populate('branchId', 'branchName branchCode').sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      admissions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error fetching branch admissions"
    });
  }
};

// Update Student Details/Status
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedStudent = await Student.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedStudent) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    res.status(200).json({
      success: true,
      message: "Student updated successfully",
      student: updatedStudent
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error updating student"
    });
  }
};

module.exports = {
  getAdmissions,
  getAdmissionsByBranch,
  updateStudent
};

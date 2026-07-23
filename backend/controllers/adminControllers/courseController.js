const Course = require('../../model/Course');
const Student = require('../../model/Student');

// Add New Course
const addCourse = async (req, res) => {
  try {
    const { title, description, courseFee } = req.body;
    const image = req.file ? req.file.path : null;

    if (!courseFee || isNaN(courseFee) || courseFee < 0) {
      return res.status(400).json({
        success: false,
        message: "Course fee is required and must be a positive number"
      });
    }

    const newCourse = new Course({
      title,
      description,
      image,
      courseFee: parseFloat(courseFee)
    });

    await newCourse.save();

    res.status(201).json({
      success: true,
      message: "Course added successfully",
      course: newCourse
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error adding course" });
  }
};

// Get All Courses (Admin/User)
const getCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, courses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error fetching courses" });
  }
};

// Update Course
const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, courseFee } = req.body;
    const updateData = { title, description };

    if (courseFee !== undefined) {
      if (isNaN(courseFee) || courseFee < 0) {
        return res.status(400).json({
          success: false,
          message: "Course fee must be a positive number"
        });
      }
      updateData.courseFee = parseFloat(courseFee);
    }

    if (req.file) {
      updateData.image = req.file.path;
    }

    const updatedCourse = await Course.findByIdAndUpdate(id, updateData, { new: true });

    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      course: updatedCourse
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error updating course" });
  }
};

// Delete Course
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    await Course.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error deleting course" });
  }
};

// Get Course Enrolled Students
const getCourseEnrolledStudents = async (req, res) => {
  try {
    const { courseName } = req.params;
    const students = await Student.find({ course: courseName, status: 'Enrolled' });
    res.status(200).json({ success: true, students });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error fetching enrolled students" });
  }
};

module.exports = {
  addCourse,
  getCourses,
  updateCourse,
  deleteCourse,
  getCourseEnrolledStudents
};

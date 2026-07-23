const Branch = require('../../model/Branch');
const Teacher = require('../../model/Teacher');
const Student = require('../../model/Student');

const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(5, parseInt(query.limit, 10) || 10));
  return { page, limit, skip: (page - 1) * limit };
};

const buildTeacherSearchFilter = (search) => {
  if (!search) return {};
  const pattern = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  return {
    $or: [
      { name: pattern },
      { email: pattern },
      { cnic: pattern },
      { phone: pattern },
      { qualification: pattern },
    ],
  };
};

const buildStudentSearchFilter = (search) => {
  if (!search) return {};
  const pattern = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  const orClauses = [
    { name: pattern },
    { fatherName: pattern },
    { course: pattern },
    { rollNo: pattern },
    { email: pattern },
    { status: pattern },
  ];
  if (!Number.isNaN(Number(search))) {
    orClauses.push({ cnic: Number(search) });
  }
  return { $or: orClauses };
};

const formatTeacherRow = (teacher, branchStatus) => ({
  _id: teacher._id,
  name: teacher.name,
  employeeId: teacher.cnic,
  email: teacher.email || '—',
  phone: teacher.phone || '—',
  subject:
    Array.isArray(teacher.courses) && teacher.courses.length > 0
      ? teacher.courses.map((c) => c.title || c).join(', ')
      : '—',
  qualification: teacher.qualification,
  joiningDate: teacher.createdAt,
  status: branchStatus === 'Inactive' ? 'Inactive' : 'Active',
});

const formatStudentRow = (student) => ({
  _id: student._id,
  name: student.name,
  studentId: student.rollNo || String(student.cnic),
  fatherName: student.fatherName,
  class: student.course,
  section:
    Array.isArray(student.currentSubjects) && student.currentSubjects.length > 0
      ? student.currentSubjects[0]
      : '—',
  rollNo: student.rollNo || '—',
  phone: student.whatsapp ? String(student.whatsapp) : '—',
  admissionDate: student.appliedAt,
  status: student.status,
  email: student.email,
  cnic: student.cnic,
  whatsapp: student.whatsapp,
  course: student.course,
  photo: student.photo,
  qualification: student.qualification,
});

// Get All Branches
const getBranches = async (req, res) => {
  try {
    const branches = await Branch.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      branches
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error fetching branches"
    });
  }
};

// Get Single Branch
const getBranchById = async (req, res) => {
  try {
    const { id } = req.params;
    const branch = await Branch.findById(id);

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found"
      });
    }

    res.status(200).json({
      success: true,
      branch
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error fetching branch"
    });
  }
};

// Create New Branch
const createBranch = async (req, res) => {
  try {
    const { branchName, branchCode, address, status } = req.body;

    // Validation
    if (!branchName || !branchCode) {
      return res.status(400).json({
        success: false,
        message: "Branch name and code are required"
      });
    }

    // Check if branch code already exists
    const existingBranch = await Branch.findOne({ branchCode: branchCode.toUpperCase() });
    if (existingBranch) {
      return res.status(400).json({
        success: false,
        message: "Branch code already exists"
      });
    }

    const newBranch = new Branch({
      branchName,
      branchCode: branchCode.toUpperCase(),
      address: address || '',
      status: status || 'Active'
    });

    await newBranch.save();

    res.status(201).json({
      success: true,
      message: "Branch created successfully",
      branch: newBranch
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error creating branch"
    });
  }
};

// Update Branch
const updateBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const { branchName, branchCode, address, status } = req.body;

    // Check if new branch code already exists (if being changed)
    if (branchCode) {
      const existingBranch = await Branch.findOne({
        branchCode: branchCode.toUpperCase(),
        _id: { $ne: id }
      });
      if (existingBranch) {
        return res.status(400).json({
          success: false,
          message: "Branch code already exists"
        });
      }
    }

    const updateData = {};
    if (branchName) updateData.branchName = branchName;
    if (branchCode) updateData.branchCode = branchCode.toUpperCase();
    if (address) updateData.address = address;
    if (status) updateData.status = status;
    updateData.updatedAt = Date.now();

    const updatedBranch = await Branch.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedBranch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Branch updated successfully",
      branch: updatedBranch
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error updating branch"
    });
  }
};

// Delete Branch
const deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if branch has teachers or students
    const teacherCount = await Teacher.countDocuments({ branchId: id });
    const studentCount = await Student.countDocuments({ branchId: id });

    if (teacherCount > 0 || studentCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete branch with ${teacherCount} teacher(s) and ${studentCount} student(s)`
      });
    }

    const deletedBranch = await Branch.findByIdAndDelete(id);

    if (!deletedBranch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Branch deleted successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error deleting branch"
    });
  }
};

// Get Branch Statistics
const getBranchStatistics = async (req, res) => {
  try {
    const { id } = req.params;

    const branch = await Branch.findById(id);
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found"
      });
    }

    const totalTeachers = await Teacher.countDocuments({ branchId: id });
    const totalStudents = await Student.countDocuments({ branchId: id });
    const enrolledStudents = await Student.countDocuments({ branchId: id, status: 'Enrolled' });

    res.status(200).json({
      success: true,
      statistics: {
        branch: branch.branchName,
        totalTeachers,
        totalStudents,
        enrolledStudents,
        notEnrolled: totalStudents - enrolledStudents
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error fetching branch statistics"
    });
  }
};

// Get All Branches Statistics
const getAllBranchesStatistics = async (req, res) => {
  try {
    const branches = await Branch.find().sort({ createdAt: -1 });
    
    const statistics = await Promise.all(
      branches.map(async (branch) => {
        const totalTeachers = await Teacher.countDocuments({ branchId: branch._id });
        const totalStudents = await Student.countDocuments({ branchId: branch._id });
        const enrolledStudents = await Student.countDocuments({ branchId: branch._id, status: 'Enrolled' });

        return {
          branchId: branch._id,
          branchName: branch.branchName,
          branchCode: branch.branchCode,
          status: branch.status,
          totalTeachers,
          totalStudents,
          enrolledStudents,
          notEnrolled: totalStudents - enrolledStudents
        };
      })
    );

    res.status(200).json({
      success: true,
      statistics
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error fetching branch statistics"
    });
  }
};

// Get teachers assigned to a branch (paginated + search)
const getBranchTeachers = async (req, res) => {
  try {
    const { id } = req.params;
    const search = (req.query.search || '').trim();
    const { page, limit, skip } = parsePagination(req.query);

    const branch = await Branch.findById(id);
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found',
      });
    }

    const filter = { branchId: id, ...buildTeacherSearchFilter(search) };
    const [total, teachers] = await Promise.all([
      Teacher.countDocuments(filter),
      Teacher.find(filter, '-password')
        .populate('courses', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    res.status(200).json({
      success: true,
      branch: {
        _id: branch._id,
        branchName: branch.branchName,
        branchCode: branch.branchCode,
        status: branch.status,
      },
      teachers: teachers.map((t) => formatTeacherRow(t, branch.status)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching branch teachers',
    });
  }
};

// Get students assigned to a branch (paginated + search)
const getBranchStudents = async (req, res) => {
  try {
    const { id } = req.params;
    const search = (req.query.search || '').trim();
    const { page, limit, skip } = parsePagination(req.query);

    const branch = await Branch.findById(id);
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found',
      });
    }

    const filter = { branchId: id, ...buildStudentSearchFilter(search) };
    const [total, students] = await Promise.all([
      Student.countDocuments(filter),
      Student.find(filter).sort({ appliedAt: -1 }).skip(skip).limit(limit),
    ]);

    res.status(200).json({
      success: true,
      branch: {
        _id: branch._id,
        branchName: branch.branchName,
        branchCode: branch.branchCode,
        status: branch.status,
      },
      students: students.map(formatStudentRow),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching branch students',
    });
  }
};

module.exports = {
  getBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
  getBranchStatistics,
  getAllBranchesStatistics,
  getBranchTeachers,
  getBranchStudents,
};

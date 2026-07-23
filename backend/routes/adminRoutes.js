const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");

// Controllers
const dashboardController = require("../controllers/adminControllers/dashboardController");
const admissionController = require("../controllers/adminControllers/admissionController");
const courseController = require("../controllers/adminControllers/courseController");
const enrolledController = require("../controllers/adminControllers/enrolledController");
const teacherController = require("../controllers/adminControllers/teacherController");
const certificateController = require("../controllers/adminControllers/certificateController");
const branchController = require("../controllers/adminControllers/branchController");
const paymentVerificationController = require("../controllers/adminControllers/paymentVerificationController");
const { uploadPaymentProof } = require("../middlewares/feeUpload");

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "111222";
const JWT_SECRET = process.env.JWT_SECRET;

/* =========================
   ADMIN AUTH MIDDLEWARE
========================= */
const adminAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

/* =========================
   MULTER STORAGE
========================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/courses/");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

/* =========================
   ADMIN LOGIN
========================= */
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = jwt.sign(
      {
        role: "admin",
      },
      JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
    });
  }

  return res.status(401).json({
    success: false,
    message: "Invalid email or password",
  });
});

/* =========================
   PROTECTED ROUTES
========================= */

// Dashboard
router.get(
  "/dashboard",
  adminAuth,
  dashboardController.getDashboardStats
);

// Admissions
router.get(
  "/admissions",
  adminAuth,
  admissionController.getAdmissions
);

router.get(
  "/admissions/branch/:branchId",
  adminAuth,
  admissionController.getAdmissionsByBranch
);

router.put(
  "/students/:id",
  adminAuth,
  admissionController.updateStudent
);

// Courses
router.post(
  "/courses",
  adminAuth,
  upload.single("image"),
  courseController.addCourse
);

router.get(
  "/courses",
  adminAuth,
  courseController.getCourses
);

router.put(
  "/courses/:id",
  adminAuth,
  upload.single("image"),
  courseController.updateCourse
);

router.delete(
  "/courses/:id",
  adminAuth,
  courseController.deleteCourse
);

router.get(
  "/courses/:courseName/students",
  adminAuth,
  courseController.getCourseEnrolledStudents
);

// Enrolled Students
router.get(
  "/enrolled",
  adminAuth,
  enrolledController.getEnrolledStudents
);

router.get(
  "/enrolled/branch/:branchId",
  adminAuth,
  enrolledController.getEnrolledStudentsByBranch
);

router.put(
  "/enrolled/:id",
  adminAuth,
  enrolledController.updateEnrolledStudent
);

// Multer storage for teacher photo upload
const teacherPhotoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/teachers/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'teacher-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const teacherUpload = multer({
  storage: teacherPhotoStorage,
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'photo' && !file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files allowed for photo'), false);
    }
    cb(null, true);
  }
});

// Teachers
router.post(
  "/add-teacher",
  adminAuth,
  teacherUpload.fields([{ name: 'photo', maxCount: 1 }]),
  teacherController.addTeacher
);

router.get(
  "/teachers",
  adminAuth,
  teacherController.getAllTeachers
);

router.get(
  "/teachers/branch/:branchId",
  adminAuth,
  teacherController.getTeachersByBranch
);

// Certificates
router.post(
  "/certificates",
  adminAuth,
  certificateController.createCertificate
);

router.get(
  "/certificates",
  adminAuth,
  certificateController.getAllCertificates
);

router.get(
  "/certificates/verify/:certNo",
  adminAuth,
  certificateController.verifyCertificate
);

router.delete(
  "/certificates/:id",
  adminAuth,
  certificateController.deleteCertificate
);

// Branches
router.get(
  "/branches",
  adminAuth,
  branchController.getBranches
);

router.get(
  "/branches/statistics/all",
  adminAuth,
  branchController.getAllBranchesStatistics
);

router.get(
  "/branches/:id",
  adminAuth,
  branchController.getBranchById
);

router.post(
  "/branches",
  adminAuth,
  branchController.createBranch
);

router.put(
  "/branches/:id",
  adminAuth,
  branchController.updateBranch
);

router.delete(
  "/branches/:id",
  adminAuth,
  branchController.deleteBranch
);

// Payment Verification Routes
router.get(
  "/payments/pending",
  adminAuth,
  paymentVerificationController.getPendingPayments
);

router.get(
  "/payments/history",
  adminAuth,
  paymentVerificationController.getPaymentHistory
);

router.get(
  "/payments/student/:studentId",
  adminAuth,
  paymentVerificationController.getStudentPaymentDetails
);

router.post(
  "/payments/verify/:studentId",
  adminAuth,
  paymentVerificationController.verifyPayment
);

router.post(
  "/payments/reject/:studentId",
  adminAuth,
  paymentVerificationController.rejectPayment
);

router.post(
  "/payments/reupload/:studentId",
  adminAuth,
  uploadPaymentProof.single("paymentProof"),
  paymentVerificationController.reUploadPaymentProof
);

module.exports = router;
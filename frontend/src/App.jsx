import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import MainLayout from '../src/user/layouts/MainLayout';
import Home from '../src/user/pages/Home';
import AboutPage from '../src/user/pages/AboutUs';
import CoursesPage from '../src/user/pages/Courses';
import ContactPage from '../src/user/pages/ContactUs';
import TestimonialsPage from '../src/user/pages/SuccessStories';
import AdmissionForm from './user/components/AdmissionForm';
import CertificateVerification from './user/components/CertificateVerification';
import DonateUs from '../src/user/pages/DonateUs';
import Event from '../src/user/pages/Event';
import NotFound from '../src/user/pages/NotFound';
import Lms from './user/pages/Lms';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import './index.css';

// Admin Imports
import AdminLayout from './admin/layouts/MainLayout';
import DashboardPage from './admin/pages/DashboardPage';
import AdmissionPage from './admin/pages/AdmissionPage';
import EnrolledPage from './admin/pages/EnrolledPage';
import CertificateGeneratorPage from './admin/pages/CertificateGeneratorPage';
import FeeChallanGenerator from './admin/pages/FeeChallanGenerator';
import VerifyFeePage from './admin/pages/VerifyFeePage';
import AdminVerifyChallans from './admin/pages/AdminVerifyChallans';
import AdminLogin from './admin/pages/AdminLogin';
import AdminCoursesPage from './admin/pages/AdminCoursesPage';
import AddTeacher from './admin/pages/AddTeacher';
import BranchManagement from './admin/pages/BranchManagement';
import BranchTeachersPage from './admin/pages/BranchTeachersPage';
import BranchStudentsPage from './admin/pages/BranchStudentsPage';
import NotificationsPage from './admin/pages/NotificationsPage';


// import AddStudent from './admin/pages/AddStudent';

import StudentProfile from './student/pages/StudentProfile';
import StudentLayout from './student/layouts/MainLayout';
import StudentLogin from './student/pages/StudentLogin';
import StudentDashboard from './student/pages/StudentDashboard';
import StudentCoursesPage from './student/pages/StudentCoursesPage';
import StudentAttendancePage from './student/pages/StudentAttendancePage';
import StudentTestScoresPage from './student/pages/StudentTestScoresPage';
import StudentAdmissionPage from './student/pages/StudentAdmissionPage';
import StudentChallans from './student/pages/StudentChallans';

import AvailableQuizzes from './student/components/AvailableQuizzes';
import TakeQuiz from './student/components/TakeQuiz';
import PastAttempts from './student/components/PastAttempts';

// Teacher Imports
import TeacherMainLayout from './teacher/layouts/MainLayout';
import TeacherDashboard from './teacher/pages/TeacherDashboard';
import MyCourses from './teacher/pages/MyCourses';
import UploadMarks from './teacher/pages/UploadMarks';
import ManageAttendance from './teacher/pages/ManageAttendance';
import Updates from './teacher/pages/Updates';
import StudentList from './teacher/pages/StudentList';
import TeacherLogin from './teacher/pages/TeacherLogin';
import TeacherProfile from './teacher/pages/TeacherProfile';
import AIQuizGenerator from './teacher/pages/AIQuizGenerator';

import AssignQuiz from './teacher/components/AssignQuiz';
import QuizList from './teacher/components/QuizList';
import QuizResults from './teacher/components/QuizResults';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes (No Layout) */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/teacher/login" element={<TeacherLogin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* User Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/testimonials" element={<TestimonialsPage />} />
          <Route path="/admission" element={<AdmissionForm />} />
          <Route path="/certificate-verification" element={<CertificateVerification />} />
          <Route path="/donate" element={<DonateUs />} />
          <Route path="/events" element={<Event />} />
          <Route path="/lms" element={<Lms />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="branches" element={<BranchManagement />} />
          <Route path="branches/:branchId/teachers" element={<BranchTeachersPage />} />
          <Route path="branches/:branchId/students" element={<BranchStudentsPage />} />
          <Route path="courses" element={<AdminCoursesPage />} />
          {/* <Route path="addStudent" element={<AddStudent />} /> */}
          <Route path="admissions" element={<AdmissionPage />} />
          <Route path="enrolled" element={<EnrolledPage />} />
          <Route path="certificates" element={<CertificateGeneratorPage />} />
          <Route path="fees" element={<FeeChallanGenerator />} />
          <Route path="verify-fee" element={<VerifyFeePage />} />
          <Route path="verify-challans" element={<AdminVerifyChallans />} />
          <Route path="add-teacher" element={<AddTeacher />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>
        {/* Student portal (read-only) */}
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<Navigate to="/student/dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="admission" element={<StudentAdmissionPage />} />
          <Route path="courses" element={<StudentCoursesPage />} />
          <Route path="attendance" element={<StudentAttendancePage />} />
          <Route path="tests" element={<StudentTestScoresPage />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="challans" element={<StudentChallans />} />
          <Route path="studentprofile" element={<Navigate to="/student/profile" replace />} />
          <Route path="/student/quizzes" element={<AvailableQuizzes />} />
          <Route path="/student/take-quiz/:id" element={<TakeQuiz />} />
          <Route path="/student/attempts" element={<PastAttempts />} />

        </Route>
        {/* Teacher Portal (dynamic) */}
        <Route path="/teacher/login" element={<TeacherLogin />} />
        <Route path="/teacher" element={<TeacherMainLayout />}>
          <Route index element={<Navigate to="/teacher/dashboard" replace />} />
          <Route path="dashboard" element={<TeacherDashboard />} />
          <Route path="courses" element={<MyCourses />} />
          <Route path="marks" element={<UploadMarks />} />
          <Route path="attendance" element={<ManageAttendance />} />
          <Route path="updates" element={<Updates />} />
          <Route path="students" element={<StudentList />} />
          <Route path="profile" element={<TeacherProfile />} />
          <Route path="quiz-generator" element={<AIQuizGenerator />} />

          <Route path="/teacher/assign-quiz" element={<AssignQuiz />} />
          <Route path="/teacher/quizzes" element={<QuizList />} />
          <Route path="/teacher/quiz-results/:id" element={<QuizResults />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

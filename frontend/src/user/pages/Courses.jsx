import Courses from '../components/Courses';

export default function CoursesPage() {
  return (
    // mt-16 ya pt-16 lagane se ye navbar (h-16) ke bilkul neeche se shuru hoga
    // Agar mazeed neeche gap dena chahte hain toh pt-20 ya pt-24 use kar sakte hain
    <div className="min-h-screen pt-16 bg-gray-50">
      <Courses />
    </div>
  );
}
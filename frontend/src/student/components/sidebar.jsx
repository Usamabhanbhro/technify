import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  Trophy,
  User,
  LogOut,
  FileText,
  ReceiptText,
  Menu,
  X,
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { path: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/student/admission', icon: FileText, label: 'Admission form' },
    { path: '/student/courses', icon: BookOpen, label: 'My course' },
    { path: '/student/attendance', icon: ClipboardCheck, label: 'Attendance' },
    { path: '/student/tests', icon: Trophy, label: 'Test scores' },
    // 🔴 NEW: Attend Quiz item (add before "My challans" and "Profile")
    { path: '/student/quizzes', icon: Trophy, label: 'Attend Quiz' }, // icon can be changed
    { path: '/student/challans', icon: ReceiptText, label: 'My challans' },
    { path: '/student/profile', icon: User, label: 'Profile' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('studentToken');
    navigate('/student/login');
  };

  return (
    <>
      {/* Mobile Topbar */}
      <div className="lg:hidden flex items-center justify-between bg-slate-900 text-white px-4 py-4 sticky top-0 z-50">
        <h1 className="text-lg font-bold text-emerald-400">IIT Student Portal</h1>
        <button onClick={() => setIsOpen(true)}><Menu size={28} /></button>
      </div>

      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsOpen(false)} />}

      {/* Sidebar */}
      <div className={`fixed lg:static top-0 left-0 z-50 w-64 bg-slate-900 text-white min-h-screen flex flex-col shrink-0 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-emerald-400">IIT Student Portal</h1>
            <p className="text-xs text-slate-500 mt-1">Read-only access</p>
          </div>
          <button className="lg:hidden" onClick={() => setIsOpen(false)}><X size={24} /></button>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            // 🔴 SPECIAL HANDLING FOR "Attend Quiz" to show red dot
            if (item.label === 'Attend Quiz') {
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`relative flex items-center gap-3 p-3 rounded-lg transition ${
                    isActive ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium text-sm">{item.label}</span>
                  </Link>
              );
            }

            // Default rendering for other items
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 p-3 rounded-lg transition ${
                  isActive ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 w-full rounded-lg text-red-300 hover:bg-slate-800 transition"
          >
            <LogOut size={20} />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
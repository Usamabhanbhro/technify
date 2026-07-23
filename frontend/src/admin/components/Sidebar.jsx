import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserPlus, 
  Users, 
  BookOpen,
  FileBadge, 
  ReceiptText, 
  Search, 
  LogOut,
  Building,
  Menu,
  X,
  Bell
} from 'lucide-react';
import { useState } from 'react';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/notifications', icon: Bell, label: 'Notifications' },
    { path: '/admin/branches', icon: Building, label: 'Branches' },
    { path: '/admin/courses', icon: BookOpen, label: 'Courses' },
    { path: '/admin/add-teacher', icon: UserPlus, label: 'Add Teacher' },
    { path: '/admin/admissions', icon: UserPlus, label: 'Admissions' },
    { path: '/admin/enrolled', icon: Users, label: 'Enrolled' },
    { path: '/admin/certificates', icon: FileBadge, label: 'Certificates' },
    { path: '/admin/fees', icon: ReceiptText, label: 'Generate Challan' },
    { path: '/admin/verify-challans', icon: Search, label: 'Verify Challans' },
    { path: '/admin/verify-fee', icon: ReceiptText, label: 'Fee Management' },
  ];

  const handleLogout = () => {
    // Logic for logout
    localStorage.removeItem('adminToken');
    navigate('/');
  };

  return (
    <>
      {/* Mobile top bar with hamburger */}
      <div className="md:hidden flex items-center justify-between p-3 bg-gray-900 text-white fixed inset-x-0 top-0 z-50">
        <div className="flex items-center gap-3">
          <button onClick={() => setOpen(true)} className="p-2 rounded-md text-gray-200 hover:bg-gray-800">
            <Menu size={20} />
          </button>
          <h1 className="text-lg font-bold text-green-500">IIT ADMIN</h1>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex w-64 bg-gray-900 text-white min-h-screen flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold text-green-500">IIT ADMIN</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 p-3 rounded-lg transition ${
                  isActive 
                  ? 'bg-green-600 text-white' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 w-full rounded-lg text-red-400 hover:bg-gray-800 transition"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile drawer + overlay */}
      {open && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setOpen(false)} />

          <aside className={`absolute left-0 top-0 h-full w-64 bg-gray-900 text-white transform transition-transform duration-200 z-50`}> 
            <div className="p-4 flex items-center justify-between border-b border-gray-800">
              <h1 className="text-lg font-bold text-green-500">IIT ADMIN</h1>
              <button onClick={() => setOpen(false)} className="p-2 rounded-md text-gray-200 hover:bg-gray-800">
                <X size={20} />
              </button>
            </div>

            <nav className="p-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 p-3 rounded-lg transition ${
                      isActive 
                      ? 'bg-green-600 text-white' 
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-gray-800">
              <button
                onClick={() => { setOpen(false); handleLogout(); }}
                className="flex items-center gap-3 p-3 w-full rounded-lg text-red-400 hover:bg-gray-800 transition"
              >
                <LogOut size={20} />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;

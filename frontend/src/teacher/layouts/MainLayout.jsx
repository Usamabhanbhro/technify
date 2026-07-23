import Sidebar from '../components/Sidebar';
import { Outlet } from 'react-router-dom';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-3 sm:px-6 py-3 shrink-0">
          <p className="text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-lg px-2 sm:px-3 py-2 inline-block">
            Welcome to the Teacher Admin Panel
          </p>
        </header>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

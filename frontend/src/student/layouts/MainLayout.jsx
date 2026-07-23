import { useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/sidebar';

export default function StudentLayout() {
  // Perform a synchronous check for the student token so child routes
  // are not mounted (and do not trigger API calls) when unauthenticated.
  const token = localStorage.getItem('studentToken');
  if (!token) {
    return <Navigate to="/student/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-3 sm:px-6 py-3 shrink-0">
          <p className="text-xs font-medium text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-2 sm:px-3 py-2 inline-block">
            View-only portal — you cannot change your academic record here.
          </p>
        </header>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, GraduationCap } from 'lucide-react';
import { API_BASE } from '../api';

export default function StudentLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('studentToken')) {
      navigate('/student/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!/^\d{4}$/.test(password)) {
      setError('Password must be exactly 4 digits.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/student/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      let data;
      try {
        data = await response.json();
      } catch {
        const text = await response.text();
        throw new Error(
          `Login API error (${response.status}). ${text?.slice(0, 120) || 'Invalid response.'}`
        );
      }

      if (data.success) {
        localStorage.setItem('studentToken', data.token);
        navigate('/student/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      setError('Unable to reach server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-2 sm:px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-4 sm:p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
            <GraduationCap className="text-emerald-700" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Student Portal</h1>
          <p className="text-slate-500 text-sm mt-1 text-center">
            Sign in with your institute email and 4-digit password to view your record (read-only).
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <div className="flex items-center border border-slate-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-emerald-500">
              <Mail className="text-slate-400 mr-3" size={20} />
              <input
                type="email"
                autoComplete="username"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full outline-none bg-transparent"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-slate-700">4-digit password</label>
              <button
                type="button"
                onClick={() => navigate('/forgot-password?type=student')}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium transition"
              >
                Forgot Password?
              </button>
            </div>
            <div className="flex items-center border border-slate-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-emerald-500">
              <Lock className="text-slate-400 mr-3" size={20} />
              <input
                type="password"
                inputMode="numeric"
                autoComplete="current-password"
                pattern="\d{4}"
                maxLength={4}
                placeholder="••••"
                value={password}
                onChange={(e) => setPassword(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="w-full outline-none bg-transparent tracking-widest"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 transition"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : null}
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Use the same email and 4-digit password you chose on your admission form. Login stays disabled until your
          application is approved and you are enrolled.
        </p>
      </div>
    </div>
  );
}

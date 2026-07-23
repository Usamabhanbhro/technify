import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, CheckCircle, Lock } from 'lucide-react';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const userType = searchParams.get('type') || 'student'; // student or teacher

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // Verify token on component mount
  useEffect(() => {
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    if (!token) {
      setError('No reset token provided. Please use the link from your email.');
      setVerifying(false);
      return;
    }

    try {
      const endpoint = userType === 'teacher'
        ? `http://localhost:5000/api/teacher/verify-reset-token?token=${token}`
        : `http://localhost:5000/api/student/verify-reset-token?token=${token}`;

      const response = await fetch(endpoint);
      const data = await response.json();

      if (data.success) {
        setTokenValid(true);
        setUserEmail(data.email);
        setError('');
      } else {
        setError(data.message || 'Invalid or expired reset token. Please request a new one.');
        setTokenValid(false);
      }
    } catch (err) {
      console.error('Error verifying token:', err);
      setError('Error verifying reset token. Please try again.');
      setTokenValid(false);
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!password) {
      setError('Password is required');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const endpoint = userType === 'teacher'
        ? 'http://localhost:5000/api/teacher/reset-password'
        : 'http://localhost:5000/api/student/reset-password';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: password,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setPassword('');
        setConfirmPassword('');
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate(`/${userType === 'teacher' ? 'teacher' : 'student'}-login`);
        }, 3000);
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Verifying token
  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying reset token...</p>
        </div>
      </div>
    );
  }

  // Token invalid
  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="flex justify-center mb-4">
            <AlertCircle size={48} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">Invalid Link</h1>
          <p className="text-center text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(`/forgot-password?type=${userType}`)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition"
          >
            Request New Link
          </button>
        </div>
      </div>
    );
  }

  // Token valid - show reset form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          {!success ? (
            <>
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <Lock size={40} className="text-blue-500" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Set New Password</h1>
                <p className="text-gray-600 text-sm">
                  Create a strong password for your account
                </p>
                <p className="text-gray-500 text-xs mt-2">
                  {userEmail && `Email: ${userEmail}`}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* New Password */}
                <div>
                  <label htmlFor="password" className="block text-gray-700 font-semibold mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      disabled={loading}
                      className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    • Minimum 8 characters
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-gray-700 font-semibold mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      disabled={loading}
                      className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Error Alert */}
                {error && (
                  <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle size={20} className="text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                {/* Password Match Indicator */}
                {password && confirmPassword && (
                  <div className={`flex items-center space-x-2 p-3 rounded-lg ${
                    password === confirmPassword
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    {password === confirmPassword ? (
                      <CheckCircle size={18} className="text-green-500" />
                    ) : (
                      <AlertCircle size={18} className="text-red-500" />
                    )}
                    <p className={`text-sm ${
                      password === confirmPassword
                        ? 'text-green-700'
                        : 'text-red-700'
                    }`}>
                      {password === confirmPassword
                        ? 'Passwords match'
                        : 'Passwords do not match'}
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Resetting...</span>
                    </>
                  ) : (
                    <>
                      <Lock size={20} />
                      <span>Reset Password</span>
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  This link expires in 15 minutes. Do not share it with anyone.
                </p>
              </form>
            </>
          ) : (
            // Success Message
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle size={48} className="text-green-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Success!</h1>
              <p className="text-gray-600 mb-6">
                Your password has been reset successfully. You can now login with your new password.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-700 text-sm">
                  Redirecting to login in a few seconds...
                </p>
              </div>
              <button
                onClick={() => navigate(`/${userType === 'teacher' ? 'teacher' : 'student'}-login`)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition"
              >
                Go to Login
              </button>
            </div>
          )}

          {/* Footer */}
          <p className="text-center text-gray-500 text-xs mt-8">
            {userType === 'teacher' ? 'Teacher Portal' : 'Student Portal'} • Secure Password Reset
          </p>
        </div>
      </div>
    </div>
  );
}

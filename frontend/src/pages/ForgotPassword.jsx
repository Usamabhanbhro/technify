import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Mail, AlertCircle, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userType = searchParams.get('type') || 'student'; // student or teacher
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const endpoint = userType === 'teacher' 
        ? 'http://localhost:5000/api/teacher/forgot-password'
        : 'http://localhost:5000/api/student/forgot-password';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      const data = await response.json();

      if (data.success || response.status === 200) {
        setSuccess(true);
        setSubmitted(true);
        setEmail('');
        // Show success message for 5 seconds then redirect
        setTimeout(() => {
          navigate(`/${userType === 'teacher' ? 'teacher' : 'student'}-login`);
        }, 5000);
      } else {
        setError(data.message || 'Failed to send reset email');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(`/${userType === 'teacher' ? 'teacher' : 'student'}-login`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={handleGoBack}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-8 transition"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Login
        </button>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Mail size={40} className="text-blue-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Forgot Password?</h1>
            <p className="text-gray-600">
              Enter your registered email address and we'll send you a password reset link.
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              {/* Error Alert */}
              {error && (
                <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle size={20} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{error}</p>
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
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Mail size={20} />
                    <span>Send Reset Link</span>
                  </>
                )}
              </button>

              {/* Info Text */}
              <p className="text-xs text-gray-500 text-center">
                The reset link will expire in 15 minutes. Check your spam folder if you don't receive the email.
              </p>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Success Message */}
              <div className="flex items-start space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle size={20} className="text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-green-700 font-semibold mb-1">Email Sent Successfully!</p>
                  <p className="text-green-600 text-sm">
                    If an account exists with that email, you'll receive a password reset link within a few moments. 
                    Check your spam folder if needed.
                  </p>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">Next Steps:</h3>
                <ol className="text-gray-700 text-sm space-y-1 list-decimal list-inside">
                  <li>Check your email (including spam folder)</li>
                  <li>Click the "Reset Password" link in the email</li>
                  <li>Enter your new password</li>
                  <li>Log in with your new password</li>
                </ol>
              </div>

              {/* Redirecting Text */}
              <p className="text-center text-gray-600 text-sm">
                Redirecting to login in a few seconds...
              </p>

              {/* Manual Login Button */}
              <button
                onClick={handleGoBack}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition"
              >
                Back to Login
              </button>
            </div>
          )}

          {/* Footer */}
          <p className="text-center text-gray-500 text-xs mt-8">
            {userType === 'teacher' ? 'Teacher Portal' : 'Student Portal'} • Secure Password Recovery
          </p>
        </div>
      </div>
    </div>
  );
}

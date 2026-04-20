import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { resetPasswordApi, verifyResetTokenApi } from '../../services/authService';
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token || !email) {
        setErrors({ general: 'Invalid reset link. Missing token or email.' });
        setIsVerifying(false);
        return;
      }

      try {
        await verifyResetTokenApi({ token, email });
        setTokenValid(true);
      } catch (error) {
        setErrors({ general: error?.response?.data?.message || 'Invalid or expired reset link' });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token, email]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error on change
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    // Validate passwords
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
    }

    if (formData.newPassword && formData.confirmPassword && formData.newPassword !== formData.confirmPassword) {
      newErrors.general = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      await resetPasswordApi({
        token,
        email,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      });

      setSuccessMessage('Password has been reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setErrors({ general: error?.response?.data?.message || 'Failed to reset password' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        <Navbar />
        <section className="py-12 px-4 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-2xl p-8 border border-purple-100 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto"></div>
              <p className="text-gray-700 mt-4">Verifying your reset link...</p>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  if (!tokenValid || !token || !email) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        <Navbar />
        <section className="py-12 px-4 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-2xl p-8 border border-purple-100 text-center">
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">✕</span>
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-4 text-red-600">Invalid Reset Link</h2>
              <p className="text-gray-700 mb-6">
                {errors.general || 'The password reset link is invalid or has expired.'}
              </p>
              <Link
                to="/forgot-password"
                className="inline-block bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition shadow-lg"
              >
                Request New Reset Link
              </Link>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <Navbar />

      <section className="py-12 px-4 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-2xl p-8 border border-purple-100">
            <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">EasyCart</h1>
            <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent">Create New Password</h2>

            {successMessage && (
              <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 text-center">
                {successMessage}
              </p>
            )}

            {errors.general && (
              <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 text-center">
                {errors.general}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-purple-700">New Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-3 text-purple-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="newPassword"
                    placeholder="Enter new password"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-10 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition ${
                      errors.newPassword ? 'border-red-500 bg-red-50' : 'border-purple-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-purple-400 hover:text-purple-600"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.newPassword && <p className="text-red-600 text-sm mt-1">{errors.newPassword}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-purple-700">Confirm Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-3 text-purple-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Confirm new password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-10 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition ${
                      errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-purple-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-purple-400 hover:text-purple-600"
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition disabled:opacity-50 shadow-lg"
              >
                {isLoading ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/login" className="text-purple-600 hover:text-purple-800 font-semibold hover:underline transition">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default ResetPassword;

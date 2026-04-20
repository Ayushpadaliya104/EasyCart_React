import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { forgotPasswordApi } from '../../services/authService';
import { validateField } from '../../utils/validators';
import { FiMail } from 'react-icons/fi';

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { value } = e.target;
    setEmail(value);

    if (errors.email) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.email;
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    const emailError = validateField('email', email);
    if (emailError) {
      setErrors({ email: emailError });
      return;
    }

    setIsLoading(true);
    try {
      await forgotPasswordApi({ email });
      setEmailSubmitted(true);
      setSuccessMessage(`Instructions have been sent to ${email}. Please check your inbox and spam folder.`);
    } catch (error) {
      setSuccessMessage(error?.response?.data?.message || 'If an account with that email exists, password reset instructions have been sent.');
      setEmailSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        <Navbar />

        <section className="py-12 px-4 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-2xl p-8 border border-purple-100">
              <div className="text-center">
                <div className="mb-6 flex justify-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-3xl">✓</span>
                  </div>
                </div>

                <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent">
                  Check Your Email
                </h2>

                <p className="text-gray-700 mb-6">
                  {successMessage}
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-900">
                    <strong>Tip:</strong> The password reset link will expire in 15 minutes.
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-gray-700">
                    Remember your password?{' '}
                    <Link to="/login" className="text-purple-600 hover:text-purple-800 font-semibold hover:underline">
                      Sign in
                    </Link>
                  </p>

                  <button
                    onClick={() => {
                      setEmailSubmitted(false);
                      setSuccessMessage('');
                      setEmail('');
                    }}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition shadow-lg"
                  >
                    Try Another Email
                  </button>
                </div>
              </div>
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
            <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent">Reset Password</h2>

            <p className="text-gray-700 text-center mb-6">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-purple-700">Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-3 text-purple-400" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition ${
                      errors.email ? 'border-red-500 bg-red-50' : 'border-purple-200'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition disabled:opacity-50 shadow-lg"
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
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

export default ForgotPassword;

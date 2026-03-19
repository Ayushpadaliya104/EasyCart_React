import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import { validateField } from '../../utils/validators';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

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

    // Validate
    const newErrors = {};
    ['name', 'email', 'password', 'confirmPassword'].forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    // Check password match
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Check terms
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms and conditions';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    const result = await register(formData.email, formData.password, formData.name);
    setIsLoading(false);

    if (!result.success) {
      setErrors({ email: result.message });
      return;
    }

    setSuccessMessage('Registration successful! Redirecting to login...');
    setTimeout(() => {
      navigate('/login');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="py-12 px-4 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-soft p-8">
            <h1 className="text-3xl font-bold text-center mb-2 gradient-text">EasyCart</h1>
            <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>

            {successMessage && (
              <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                {successMessage}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold mb-2">Full Name</label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition ${
                      errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.name && <p className="error-message">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold mb-2">Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition ${
                      errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.email && <p className="error-message">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold mb-2">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition ${
                      errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.password && <p className="error-message">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold mb-2">Confirm Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition ${
                      errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}
              </div>

              {/* Terms & Conditions */}
              <div>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleInputChange}
                    className="w-4 h-4 mt-1 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">
                    I agree to the <Link to="#" className="text-primary font-semibold hover:underline">Terms and Conditions</Link> and <Link to="#" className="text-primary font-semibold hover:underline">Privacy Policy</Link>
                  </span>
                </label>
                {errors.agreeTerms && <p className="error-message">{errors.agreeTerms}</p>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-700 transition disabled:opacity-50 btn-hover-lift"
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or sign up with</span>
                </div>
              </div>

              {/* Social Signup */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="border border-gray-300 py-2 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  Google
                </button>
                <button
                  type="button"
                  className="border border-gray-300 py-2 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  Facebook
                </button>
              </div>
            </form>

            {/* Sign In Link */}
            <p className="text-center text-gray-600 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-slate-900 font-semibold hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Register;


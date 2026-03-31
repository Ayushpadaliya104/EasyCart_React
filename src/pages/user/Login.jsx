import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import { validateField } from '../../utils/validators';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (successMessage) {
      setSuccessMessage('');
    }

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
    ['email', 'password'].forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    const result = await login(formData.email, formData.password);
    setIsLoading(false);

    if (!result.success) {
      setErrors({ password: result.message });
      return;
    }

    setSuccessMessage(`Welcome ${result.user.name}, successfully logged in.`);
    setTimeout(() => {
      navigate(result.user.role === 'admin' ? '/admin' : '/');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <Navbar />

      <section className="py-12 px-4 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-2xl p-8 border border-purple-100">
            <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">EasyCart</h1>
            <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent">Welcome Back</h2>

            {successMessage && (
              <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                {successMessage}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-purple-700">Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-3 text-purple-400" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition ${
                      errors.email ? 'border-red-500 bg-red-50' : 'border-purple-200'
                    }`}
                  />
                </div>
                {errors.email && <p className="error-message">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-purple-700">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-3 text-purple-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-10 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition ${
                      errors.password ? 'border-red-500 bg-red-50' : 'border-purple-200'
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
                {errors.password && <p className="error-message">{errors.password}</p>}
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 cursor-pointer accent-purple-600" />
                  <span className="text-gray-700">Remember me</span>
                </label>
                <button type="button" className="text-purple-600 hover:text-purple-800 hover:underline font-semibold transition">
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition disabled:opacity-50 btn-hover-lift shadow-lg"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            {/* Sign Up Link */}
            <p className="text-center text-gray-700 mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent font-bold hover:from-purple-700 hover:to-indigo-700 transition">
                Sign up here
              </Link>
            </p>
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-gradient-to-r from-purple-100 to-blue-100 border-2 border-purple-300 rounded-lg p-4 text-sm text-purple-900">
            <p className="font-semibold mb-1">📌 Demo Credentials</p>
            <p>Email: user@example.com</p>
            <p>Password: 123456</p>
            <p className="mt-2 font-semibold">👨‍💼 Admin Credentials</p>
            <p>Email: admin@easycart.com</p>
            <p>Password: Admin@123</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Login;
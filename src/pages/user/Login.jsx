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

  const handleSubmit = (e) => {
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
    setTimeout(() => {
      const result = login(formData.email, formData.password);
      setIsLoading(false);

      if (!result.success) {
        setErrors({ password: result.message });
        return;
      }

      setSuccessMessage(`Welcome ${result.user.name}, successfully logged in.`);
      setTimeout(() => {
        navigate(result.user.role === 'admin' ? '/admin' : '/');
      }, 1200);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="py-12 px-4 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-soft p-8">
            <h1 className="text-3xl font-bold text-center mb-2 gradient-text">EasyCart</h1>
            <h2 className="text-2xl font-bold text-center mb-6">Welcome Back</h2>

            {successMessage && (
              <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                {successMessage}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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
                    placeholder="Enter your password"
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

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 cursor-pointer" />
                  <span>Remember me</span>
                </label>
                <Link to="#" className="text-slate-900 hover:underline">Forgot password?</Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-700 transition disabled:opacity-50 btn-hover-lift"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              {/* Social Login */}
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

            {/* Sign Up Link */}
            <p className="text-center text-gray-600 mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-slate-900 font-semibold hover:underline">
                Sign up here
              </Link>
            </p>
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <p className="font-semibold mb-1">Demo Credentials</p>
            <p>Email: demo@example.com</p>
            <p>Password: password123</p>
            <p className="mt-2 font-semibold">Admin Credentials</p>
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


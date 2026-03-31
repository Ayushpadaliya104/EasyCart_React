import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { FiUser, FiMail, FiPhone, FiMapPin, FiLogOut, FiEdit2, FiHeart, FiPackage, FiSettings, FiEye, FiClock, FiTruck, FiCheckCircle, FiBell } from 'react-icons/fi';
import { fetchMyOrdersApi } from '../../services/orderService';

const splitName = (name = '') => {
  const trimmedName = String(name).trim();

  if (!trimmedName) {
    return { firstName: '', lastName: '' };
  }

  const [firstName, ...rest] = trimmedName.split(/\s+/);
  return {
    firstName,
    lastName: rest.join(' ')
  };
};

const buildProfileFormData = (user) => {
  const shipping = user?.defaultShippingAddress || {};

  return {
    name: user?.name || '',
    email: user?.email || '',
    phone: shipping.phone || user?.phone || '',
    address: shipping.address || user?.address || '',
    city: shipping.city || '',
    state: shipping.state || '',
    zipcode: shipping.zipcode || '',
  };
};

function UserProfile() {
  const { user, logout, updateUser } = useAuth();
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [formData, setFormData] = useState(() => buildProfileFormData(user));
  
  // Password change state
  const [passwordFormData, setPasswordFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    setFormData(buildProfileFormData(user));
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');

    // Validation
    if (!passwordFormData.oldPassword.trim()) {
      setPasswordError('Please enter your current password');
      return;
    }

    if (!passwordFormData.newPassword.trim()) {
      setPasswordError('Please enter a new password');
      return;
    }

    if (passwordFormData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (passwordFormData.oldPassword === passwordFormData.newPassword) {
      setPasswordError('New password must be different from current password');
      return;
    }

    try {
      setChangingPassword(true);
      // Call API to change password
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          oldPassword: passwordFormData.oldPassword,
          newPassword: passwordFormData.newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setPasswordError(data.message || 'Failed to change password');
        return;
      }

      setPasswordSuccess('Password changed successfully!');
      setPasswordFormData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setPasswordError(error.message || 'An error occurred while changing password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      setFormData(buildProfileFormData(user));
      setSaveError('');
    }

    setSaveSuccess('');
    setIsEditing((prev) => !prev);
  };

  const handleSaveProfile = async () => {
    const trimmed = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      zipcode: formData.zipcode.trim()
    };

    if (!trimmed.name || !trimmed.email || !trimmed.phone || !trimmed.address || !trimmed.city || !trimmed.state || !trimmed.zipcode) {
      setSaveSuccess('');
      setSaveError('Please fill all profile and shipping address fields.');
      return;
    }

    const { firstName, lastName } = splitName(trimmed.name);

    try {
      setSavingProfile(true);
      setSaveError('');
      setSaveSuccess('');

      const result = await updateUser({
        name: trimmed.name,
        email: trimmed.email,
        phone: trimmed.phone,
        defaultShippingAddress: {
          firstName: firstName || 'Customer',
          lastName: lastName || 'User',
          email: trimmed.email,
          phone: trimmed.phone,
          address: trimmed.address,
          city: trimmed.city,
          state: trimmed.state,
          zipcode: trimmed.zipcode
        }
      });

      if (!result.success) {
        setSaveError(result.message || 'Failed to update profile');
        return;
      }

      setFormData(buildProfileFormData(result.user));
      setIsEditing(false);
      setSaveSuccess('Profile and default shipping address saved successfully.');
    } finally {
      setSavingProfile(false);
    }
  };

  useEffect(() => {
    const loadOrders = async () => {
      if (!user || activeTab !== 'orders') {
        return;
      }

      try {
        setOrdersLoading(true);
        setOrdersError('');
        const orderList = await fetchMyOrdersApi();
        setOrders(orderList);
      } catch (fetchError) {
        setOrdersError(fetchError?.response?.data?.message || 'Failed to load orders');
      } finally {
        setOrdersLoading(false);
      }
    };

    loadOrders();
  }, [activeTab, user]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'Out for Delivery':
        return 'bg-purple-100 text-purple-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
        return <FiClock className="inline mr-1" />;
      case 'Shipped':
      case 'Out for Delivery':
        return <FiTruck className="inline mr-1" />;
      case 'Delivered':
        return <FiCheckCircle className="inline mr-1" />;
      default:
        return <FiBell className="inline mr-1" />;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-xl text-gray-600">Please log in to view your profile</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50 to-indigo-100">
      <Navbar />

      {/* Profile Header */}
      <section className="bg-gradient-to-r from-slate-900 via-indigo-900 to-cyan-800 text-white py-12 px-4">
        <div className="container mx-auto flex items-center gap-8">
          <div className="w-24 h-24 bg-gradient-to-br from-pink-400 via-orange-300 to-yellow-300 rounded-full flex items-center justify-center text-4xl text-slate-900 font-bold shadow-xl ring-4 ring-white/40">
            {user.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-cyan-100 to-amber-100 bg-clip-text text-transparent">{user.name}</h1>
            <p className="text-cyan-100 font-medium">{user.email}</p>
            <p className="text-cyan-200 text-sm">
              Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently joined'}
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-b from-white via-pink-50 to-orange-50 rounded-xl shadow-xl sticky top-24 border border-pink-100">
                <div className="p-6 space-y-2">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                      activeTab === 'profile'
                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                        : 'text-slate-700 hover:bg-pink-100'
                    }`}
                  >
                    <FiUser /> Profile
                  </button>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                      activeTab === 'orders'
                        ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-md'
                        : 'text-slate-700 hover:bg-indigo-100'
                    }`}
                  >
                    <FiPackage /> Orders
                  </button>
                  <button
                    onClick={() => setActiveTab('wishlist')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                      activeTab === 'wishlist'
                        ? 'bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white shadow-md'
                        : 'text-slate-700 hover:bg-fuchsia-100'
                    }`}
                  >
                    <FiHeart /> Wishlist
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                      activeTab === 'settings'
                        ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-md'
                        : 'text-slate-700 hover:bg-cyan-100'
                    }`}
                  >
                    <FiSettings /> Settings
                  </button>
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-rose-600 hover:bg-rose-100 transition mt-4"
                  >
                    <FiLogOut /> Logout
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="bg-gradient-to-br from-white via-cyan-50 to-indigo-50 rounded-xl shadow-xl p-8 border border-cyan-100">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-700 to-cyan-600 bg-clip-text text-transparent">Profile Information</h2>
                    <button
                      onClick={handleToggleEdit}
                      className="flex items-center gap-2 px-4 py-2 border border-indigo-300 text-indigo-700 rounded-lg hover:bg-indigo-600 hover:text-white transition"
                    >
                      <FiEdit2 size={18} />
                      {isEditing ? 'Cancel' : 'Edit'}
                    </button>
                  </div>

                  {saveError && (
                    <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                      {saveError}
                    </p>
                  )}

                  {saveSuccess && (
                    <p className="mb-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
                      {saveSuccess}
                    </p>
                  )}

                  {isEditing ? (
                    <form className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          name="name"
                          placeholder="Full Name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="px-4 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                        <input
                          type="email"
                          name="email"
                          placeholder="Email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="px-4 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                        <input
                          type="tel"
                          name="phone"
                          placeholder="Phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="px-4 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                      </div>
                      <input
                        type="text"
                        name="address"
                        placeholder="Address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                          type="text"
                          name="city"
                          placeholder="City"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="px-4 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                        <input
                          type="text"
                          name="state"
                          placeholder="State"
                          value={formData.state}
                          onChange={handleInputChange}
                          className="px-4 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                        <input
                          type="text"
                          name="zipcode"
                          placeholder="Zip Code"
                          value={formData.zipcode}
                          onChange={handleInputChange}
                          className="px-4 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSaveProfile}
                        disabled={savingProfile}
                        className="w-full bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:via-blue-700 hover:to-cyan-700 transition btn-hover-lift shadow-md"
                      >
                        {savingProfile ? 'Saving...' : 'Save Changes'}
                      </button>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 pb-4 border-b border-indigo-100">
                        <FiUser className="text-indigo-600 text-xl" />
                        <div>
                          <p className="text-indigo-500 text-sm">Full Name</p>
                          <p className="font-semibold text-slate-900">{formData.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 pb-4 border-b border-indigo-100">
                        <FiMail className="text-blue-600 text-xl" />
                        <div>
                          <p className="text-blue-500 text-sm">Email Address</p>
                          <p className="font-semibold text-slate-900">{formData.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 pb-4 border-b border-indigo-100">
                        <FiPhone className="text-fuchsia-600 text-xl" />
                        <div>
                          <p className="text-fuchsia-500 text-sm">Phone Number</p>
                          <p className="font-semibold text-slate-900">{formData.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <FiMapPin className="text-emerald-600 text-xl mt-1" />
                        <div>
                          <p className="text-emerald-600 text-sm">Address</p>
                          <p className="font-semibold text-slate-900">
                            {formData.address}<br />
                            {formData.city}, {formData.state} {formData.zipcode}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="bg-gradient-to-br from-white via-indigo-50 to-blue-50 rounded-xl shadow-xl p-8 border border-indigo-100">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-700 to-blue-600 bg-clip-text text-transparent mb-6">My Orders</h2>

                  {ordersLoading ? (
                    <div className="text-center py-10">
                      <p className="text-gray-600">Loading orders...</p>
                    </div>
                  ) : ordersError ? (
                    <div className="text-center py-10">
                      <p className="text-red-600">{ordersError}</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-indigo-300 rounded-lg bg-indigo-50/60">
                      <p className="text-indigo-800 font-semibold mb-2">No orders found</p>
                      <p className="text-indigo-600 mb-4 text-sm">You have not placed any orders yet.</p>
                      <Link
                        to="/products"
                        className="inline-block bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-blue-700 transition"
                      >
                        Start Shopping
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {orders.map((order) => (
                        <div key={order.id} className="border border-indigo-200 rounded-lg p-5 hover:shadow-soft transition bg-white/80 hover:bg-white">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                              <p className="font-bold text-lg text-gray-900">Order #{order.id.slice(-8).toUpperCase()}</p>
                              <p className="text-sm text-gray-600">Placed on {order.date}</p>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-xl font-bold text-slate-900">INR {order.total.toFixed(2)}</p>
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                                  {getStatusIcon(order.status)}
                                  {order.status}
                                </span>
                              </div>

                              <Link
                                to={`/order/${order.id}/track`}
                                className="flex items-center gap-2 px-4 py-2 border border-indigo-300 rounded-lg font-semibold text-indigo-700 hover:bg-indigo-50 transition"
                              >
                                <FiEye /> View Details
                              </Link>
                            </div>
                          </div>

                          <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                            {order.products.slice(0, 4).map((product, idx) => (
                              <div key={idx} className="flex-shrink-0 text-center w-20">
                                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-md overflow-hidden mb-1">
                                  {product.image ? (
                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">N/A</div>
                                  )}
                                </div>
                                <p className="text-[11px] font-semibold line-clamp-2">{product.name}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}

                    </div>
                  )}
                </div>
              )}

              {/* Wishlist Tab */}
              {activeTab === 'wishlist' && (
                <div className="bg-gradient-to-br from-white via-fuchsia-50 to-pink-50 rounded-xl shadow-xl p-8 border border-fuchsia-100">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-fuchsia-700 to-pink-600 bg-clip-text text-transparent mb-6">My Wishlist</h2>

                  {wishlistItems.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-fuchsia-200 rounded-lg bg-white/70">
                      <p className="text-fuchsia-800 font-semibold mb-2">Your wishlist is currently empty.</p>
                      <p className="text-fuchsia-600 text-sm mb-4">Add products using the heart icon and they will appear here.</p>
                      <Link
                        to="/products"
                        className="inline-block bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-fuchsia-700 hover:to-pink-700 transition"
                      >
                        Browse Products
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {wishlistItems.map((item) => (
                          <div key={item.id} className="relative rounded-xl border border-fuchsia-200 bg-white/85 p-3 shadow-sm">
                            <button
                              type="button"
                              onClick={() => removeFromWishlist(item.id)}
                              aria-label="Remove from wishlist"
                              title="Remove from wishlist"
                              className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-rose-200 bg-white text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition shadow-sm"
                            >
                              <FiHeart size={18} className="fill-current" />
                            </button>

                            <div className="w-full h-36 rounded-lg overflow-hidden bg-fuchsia-50 mb-3">
                              <img
                                src={item.image || 'https://via.placeholder.com/300x200'}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <p className="font-semibold text-slate-900 line-clamp-2 mb-1">{item.name}</p>
                            <p className="text-fuchsia-700 font-bold">INR {Number(item.price || 0).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6">
                        <Link
                          to="/wishlist"
                          className="inline-block bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-fuchsia-700 hover:to-pink-700 transition"
                        >
                          Open Full Wishlist
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="bg-gradient-to-br from-white via-violet-50 to-purple-50 rounded-xl shadow-xl p-8 border border-violet-100">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-700 to-purple-600 bg-clip-text text-transparent mb-8">Change Password</h2>
                  
                  {passwordError && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                      {passwordError}
                    </div>
                  )}

                  {passwordSuccess && (
                    <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                      {passwordSuccess}
                    </div>
                  )}

                  <form className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Current Password</label>
                      <input
                        type="password"
                        name="oldPassword"
                        value={passwordFormData.oldPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter your current password"
                        className="w-full px-4 py-3 border-2 border-violet-200 rounded-lg focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-300/50 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">New Password</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordFormData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter your new password"
                        className="w-full px-4 py-3 border-2 border-violet-200 rounded-lg focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-300/50 transition"
                      />
                      <p className="text-xs text-gray-500 mt-1">Minimum 6 characters required</p>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordFormData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Confirm your new password"
                        className="w-full px-4 py-3 border-2 border-violet-200 rounded-lg focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-300/50 transition"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleChangePassword}
                      disabled={changingPassword}
                      className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-3 rounded-lg font-bold hover:from-violet-700 hover:to-purple-700 transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {changingPassword ? 'Changing Password...' : 'Change Password'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default UserProfile;


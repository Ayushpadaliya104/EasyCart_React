import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
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
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [formData, setFormData] = useState(() => buildProfileFormData(user));

  useEffect(() => {
    setFormData(buildProfileFormData(user));
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Profile Header */}
      <section className="bg-gradient-to-r from-slate-900 to-cyan-800 text-white py-12 px-4">
        <div className="container mx-auto flex items-center gap-8">
          <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-4xl">
            {user.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-4xl font-bold">{user.name}</h1>
            <p className="text-white opacity-90">{user.email}</p>
            <p className="text-white opacity-75 text-sm">
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
              <div className="bg-white rounded-lg shadow-soft sticky top-24">
                <div className="p-6 space-y-2">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                      activeTab === 'profile'
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <FiUser /> Profile
                  </button>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                      activeTab === 'orders'
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <FiPackage /> Orders
                  </button>
                  <button
                    onClick={() => setActiveTab('wishlist')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                      activeTab === 'wishlist'
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <FiHeart /> Wishlist
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                      activeTab === 'settings'
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <FiSettings /> Settings
                  </button>
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition mt-4"
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
                <div className="bg-white rounded-lg shadow-soft p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Profile Information</h2>
                    <button
                      onClick={handleToggleEdit}
                      className="flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition"
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
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <input
                          type="email"
                          name="email"
                          placeholder="Email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <input
                          type="tel"
                          name="phone"
                          placeholder="Phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <input
                        type="text"
                        name="address"
                        placeholder="Address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                          type="text"
                          name="city"
                          placeholder="City"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <input
                          type="text"
                          name="state"
                          placeholder="State"
                          value={formData.state}
                          onChange={handleInputChange}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <input
                          type="text"
                          name="zipcode"
                          placeholder="Zip Code"
                          value={formData.zipcode}
                          onChange={handleInputChange}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSaveProfile}
                        disabled={savingProfile}
                        className="w-full bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-700 transition btn-hover-lift"
                      >
                        {savingProfile ? 'Saving...' : 'Save Changes'}
                      </button>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 pb-4 border-b">
                        <FiUser className="text-primary text-xl" />
                        <div>
                          <p className="text-gray-600 text-sm">Full Name</p>
                          <p className="font-semibold">{formData.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 pb-4 border-b">
                        <FiMail className="text-primary text-xl" />
                        <div>
                          <p className="text-gray-600 text-sm">Email Address</p>
                          <p className="font-semibold">{formData.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 pb-4 border-b">
                        <FiPhone className="text-primary text-xl" />
                        <div>
                          <p className="text-gray-600 text-sm">Phone Number</p>
                          <p className="font-semibold">{formData.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <FiMapPin className="text-primary text-xl mt-1" />
                        <div>
                          <p className="text-gray-600 text-sm">Address</p>
                          <p className="font-semibold">
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
                <div className="bg-white rounded-lg shadow-soft p-8">
                  <h2 className="text-2xl font-bold mb-6">My Orders</h2>

                  {ordersLoading ? (
                    <div className="text-center py-10">
                      <p className="text-gray-600">Loading orders...</p>
                    </div>
                  ) : ordersError ? (
                    <div className="text-center py-10">
                      <p className="text-red-600">{ordersError}</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-gray-300 rounded-lg">
                      <p className="text-gray-700 font-semibold mb-2">No orders found</p>
                      <p className="text-gray-500 mb-4 text-sm">Aapne abhi tak koi order place nahi kiya.</p>
                      <Link
                        to="/products"
                        className="inline-block bg-slate-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-700 transition"
                      >
                        Start Shopping
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {orders.map((order) => (
                        <div key={order.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-soft transition">
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
                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
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
                <div className="bg-white rounded-lg shadow-soft p-8">
                  <h2 className="text-2xl font-bold mb-6">My Wishlist</h2>
                  <Link
                    to="/wishlist"
                    className="inline-block bg-slate-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-700 transition"
                  >
                    View Wishlist
                  </Link>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="bg-white rounded-lg shadow-soft p-8">
                  <h2 className="text-2xl font-bold mb-6">Settings</h2>
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input type="checkbox" className="w-4 h-4" defaultChecked />
                      <span className="font-semibold">Receive email notifications</span>
                    </label>
                    <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input type="checkbox" className="w-4 h-4" defaultChecked />
                      <span className="font-semibold">Receive SMS notifications</span>
                    </label>
                    <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input type="checkbox" className="w-4 h-4" />
                      <span className="font-semibold">Subscribe to newsletter</span>
                    </label>
                    <button className="w-full bg-slate-900 text-white py-2 rounded-lg font-semibold hover:bg-slate-700 transition mt-6">
                      Save Settings
                    </button>
                  </div>
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


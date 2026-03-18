import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiMail, FiPhone, FiMapPin, FiLogOut, FiEdit2, FiHeart, FiPackage, FiSettings } from 'react-icons/fi';

function UserProfile() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '9876543210',
    address: '123 Main Street',
    city: 'New York',
    state: 'NY',
    zipcode: '10001',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
    // API call would go here
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
            U
          </div>
          <div>
            <h1 className="text-4xl font-bold">{user.name}</h1>
            <p className="text-white opacity-90">{user.email}</p>
            <p className="text-white opacity-75 text-sm">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
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
                      onClick={() => setIsEditing(!isEditing)}
                      className="flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition"
                    >
                      <FiEdit2 size={18} />
                      {isEditing ? 'Cancel' : 'Edit'}
                    </button>
                  </div>

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
                        className="w-full bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-700 transition btn-hover-lift"
                      >
                        Save Changes
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
                  <h2 className="text-2xl font-bold mb-6">Recent Orders</h2>
                  <Link
                    to="/orders"
                    className="inline-block bg-slate-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-700 transition"
                  >
                    View All Orders
                  </Link>
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


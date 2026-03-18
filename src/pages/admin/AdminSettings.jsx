import React, { useState } from 'react';
import { FiSave } from 'react-icons/fi';
import AdminLayout from '../../components/AdminLayout';

function AdminSettings() {
  const [settings, setSettings] = useState({
    storeName: 'EasyCart',
    email: 'admin@easycart.com',
    phone: '+1-800-EASYCART',
    address: '123 Business Ave, City, State 12345',
    currency: 'USD',
    taxRate: 8,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveSettings = () => {
    console.log('Settings saved:', settings);
    alert('Settings saved successfully!');
  };

  return (
    <AdminLayout
      title="Settings"
      subtitle="Manage operational details for your storefront."
      activePath="/admin/settings"
    >
      <section className="bg-white rounded-3xl border border-slate-200 p-8 max-w-3xl shadow-sm">
        <h2 className="text-2xl font-bold mb-6 text-slate-900">Store Settings</h2>

            <div className="space-y-6 mb-8">
              {/* Store Name */}
              <div>
            <label className="block text-sm font-semibold mb-2">Store Name</label>
                <input
                  type="text"
                  name="storeName"
                  value={settings.storeName}
                  onChange={handleInputChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* Email */}
              <div>
              <label className="block text-sm font-semibold mb-2">Admin Email</label>
                <input
                  type="email"
                  name="email"
                  value={settings.email}
                  onChange={handleInputChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* Phone */}
              <div>
              <label className="block text-sm font-semibold mb-2">Support Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={settings.phone}
                  onChange={handleInputChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* Address */}
              <div>
              <label className="block text-sm font-semibold mb-2">Store Address</label>
                <textarea
                  name="address"
                  value={settings.address}
                  onChange={handleInputChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                  rows="3"
                ></textarea>
              </div>

              {/* Currency */}
              <div>
              <label className="block text-sm font-semibold mb-2">Currency</label>
                <select
                  name="currency"
                  value={settings.currency}
                  onChange={handleInputChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="USD">US Dollar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                  <option value="GBP">British Pound (GBP)</option>
                  <option value="INR">Indian Rupee (INR)</option>
                </select>
              </div>

              {/* Tax Rate */}
              <div>
              <label className="block text-sm font-semibold mb-2">Tax Rate (%)</label>
                <input
                  type="number"
                  name="taxRate"
                  value={settings.taxRate}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            {/* Notifications Settings */}
        <div className="border-t border-slate-200 pt-8 mb-8">
          <h3 className="text-xl font-bold mb-4 text-slate-900">Notification Settings</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="text-gray-700">Email notifications for new orders</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="text-gray-700">Email notifications for new users</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="text-gray-700">Email notifications for low stock</span>
                </label>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex gap-4">
              <button
                onClick={handleSaveSettings}
            className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-slate-700"
              >
                <FiSave /> Save Settings
              </button>
          <button className="flex items-center gap-2 px-8 py-3 border border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-100 transition">
                Reset to Default
              </button>
            </div>
      </section>
    </AdminLayout>
  );
}

export default AdminSettings;


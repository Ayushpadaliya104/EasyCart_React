import React, { useEffect, useState } from 'react';
import { FiSave } from 'react-icons/fi';
import AdminLayout from '../../components/AdminLayout';
import {
  fetchAdminStoreSettingsApi,
  updateAdminStoreSettingsApi
} from '../../services/storeSettingsService';
import { useStoreSettings } from '../../context/StoreSettingsContext';

function AdminSettings() {
  const { refreshSettings } = useStoreSettings();
  const [settings, setSettings] = useState({
    storeName: 'EasyCart',
    email: 'support@easycart.com',
    phone: '+91-90909-90909',
    address: '123 Business Ave, City, State 12345',
    taxRate: 8
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await fetchAdminStoreSettingsApi();
        setSettings(response);
      } catch (fetchError) {
        setError(fetchError?.response?.data?.message || 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMessage('');
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setError('');
      setMessage('');

      const payload = {
        ...settings,
        taxRate: Number(settings.taxRate || 0)
      };

      const updated = await updateAdminStoreSettingsApi(payload);
      setSettings(updated);
      setMessage('Settings saved successfully. Changes are now applied across the app.');
      await refreshSettings();
    } catch (saveError) {
      setError(saveError?.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title="Settings"
      subtitle="Manage operational details for your storefront."
      activePath="/admin/settings"
    >
      <section className="bg-white rounded-3xl border border-slate-200 p-8 max-w-3xl shadow-sm">
        <h2 className="text-2xl font-bold mb-6 text-slate-900">Store Settings</h2>

        {loading && <p className="text-slate-500 mb-5">Loading settings...</p>}
        {error && <p className="text-rose-600 mb-5">{error}</p>}
        {message && <p className="text-emerald-700 mb-5">{message}</p>}

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
              <label className="block text-sm font-semibold mb-2">Support Email</label>
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

            {/* Save Button */}
            <div className="flex gap-4">
              <button
                onClick={handleSaveSettings}
                disabled={loading || saving}
            className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-slate-700 disabled:opacity-50"
              >
                <FiSave /> {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
      </section>
    </AdminLayout>
  );
}

export default AdminSettings;


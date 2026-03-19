import React, { useState } from 'react';
import { FiTrash2, FiSearch } from 'react-icons/fi';
import AdminLayout from '../../components/AdminLayout';
import { deleteUserApi, fetchUsersApi } from '../../services/userService';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  React.useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        setError('');
        const userList = await fetchUsersApi();
        setUsers(userList);
      } catch (fetchError) {
        setError(fetchError?.response?.data?.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await deleteUserApi(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (deleteError) {
      alert(deleteError?.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <AdminLayout
      title="User Management"
      subtitle="Review user accounts and quickly remove unwanted entries."
      activePath="/admin/users"
    >
      <section className="bg-white rounded-3xl border border-slate-200 p-5 mb-5 shadow-sm">
            <div className="relative">
          <FiSearch className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <p className="text-slate-500">Total Users</p>
          <p className="text-3xl font-bold text-slate-900">{users.length}</p>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <p className="text-slate-500">Active Users</p>
          <p className="text-3xl font-bold text-emerald-600">{users.filter(u => u.status === 'Active').length}</p>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <p className="text-slate-500">This Month</p>
          <p className="text-3xl font-bold text-cyan-700">2</p>
        </div>
      </section>

      <section className="bg-white rounded-3xl border border-slate-200 overflow-x-auto shadow-sm">
            <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
              <th className="px-6 py-3 text-left text-xs uppercase tracking-wide text-slate-500">Name</th>
              <th className="px-6 py-3 text-left text-xs uppercase tracking-wide text-slate-500">Email</th>
              <th className="px-6 py-3 text-left text-xs uppercase tracking-wide text-slate-500">Phone</th>
              <th className="px-6 py-3 text-left text-xs uppercase tracking-wide text-slate-500">Joined</th>
              <th className="px-6 py-3 text-left text-xs uppercase tracking-wide text-slate-500">Status</th>
              <th className="px-6 py-3 text-left text-xs uppercase tracking-wide text-slate-500">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="px-6 py-8 text-center text-slate-500" colSpan={6}>Loading users...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td className="px-6 py-8 text-center text-rose-600" colSpan={6}>{error}</td>
                  </tr>
                ) : filteredUsers.map(user => (
              <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{user.name}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                    <td className="px-6 py-4 text-sm">{user.phone}</td>
                    <td className="px-6 py-4 text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.status === 'Active' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                    className="flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200"
                      >
                        <FiTrash2 size={14} /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
      </section>
    </AdminLayout>
  );
}

export default UserManagement;


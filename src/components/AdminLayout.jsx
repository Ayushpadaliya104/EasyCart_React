import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiBarChart2,
  FiBox,
  FiGrid,
  FiList,
  FiUsers,
  FiFileText,
  FiSettings,
  FiMessageSquare,
  FiLogOut,
  FiMenu,
  FiX,
} from 'react-icons/fi';
import { useQuery } from '../context/QueryContext';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: FiBarChart2 },
  { to: '/admin/products', label: 'Products', icon: FiBox },
  { to: '/admin/categories', label: 'Categories', icon: FiGrid },
  { to: '/admin/orders', label: 'Orders', icon: FiList },
  { to: '/admin/users', label: 'Users', icon: FiUsers },
  { to: '/admin/reports', label: 'Reports', icon: FiFileText },
  { to: '/admin/queries', label: 'Queries', icon: FiMessageSquare },
  { to: '/admin/settings', label: 'Settings', icon: FiSettings },
];

function AdminLayout({ title, subtitle, activePath, actions, children }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { getUnreadCountForAdmin } = useQuery();
  const adminUnread = getUnreadCountForAdmin();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <p className="text-lg font-semibold text-slate-900">Admin Panel</p>
        <button
          onClick={() => setSidebarOpen((prev) => !prev)}
          className="p-2 rounded-xl border border-slate-200 text-slate-700"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
      </div>

      <div className="mx-auto max-w-[1400px] lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-6 lg:px-6 lg:py-6">
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 text-slate-100 p-6 transition-transform duration-300 lg:translate-x-0 lg:sticky lg:top-6 lg:h-[calc(100vh-48px)] lg:rounded-3xl`}
        >
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.2em] text-teal-300">EasyCart</p>
            <h1 className="text-2xl font-bold mt-2">Admin Console</h1>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePath === item.to;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-lg'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon size={17} />
                  {item.label}
                  {item.to === '/admin/queries' && adminUnread > 0 && (
                    <span className={`ml-auto text-[10px] font-semibold rounded-full min-w-5 h-5 px-1 flex items-center justify-center ${
                      isActive ? 'bg-slate-900 text-white' : 'bg-rose-500 text-white'
                    }`}>
                      {adminUnread > 99 ? '99+' : adminUnread}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={handleLogout}
            className="mt-8 w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-rose-300 hover:bg-slate-800"
            type="button"
          >
            <FiLogOut size={17} />
            Logout
          </button>
        </aside>

        {sidebarOpen && (
          <button
            className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
            type="button"
          />
        )}

        <main className="px-4 py-6 lg:p-0">
          <header className="bg-white rounded-3xl border border-slate-200 px-6 py-6 md:px-8 md:py-7 shadow-sm mb-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">{title}</h2>
                {subtitle && <p className="text-slate-600 mt-2">{subtitle}</p>}
              </div>
              {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
            </div>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;

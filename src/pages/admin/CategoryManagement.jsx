import React, { useEffect, useState } from 'react';
import { FiEdit2, FiTrash2, FiPlus, FiSearch } from 'react-icons/fi';
import AdminLayout from '../../components/AdminLayout';
import {
  createCategoryApi,
  deleteCategoryApi,
  fetchCategories,
  updateCategoryApi,
} from '../../services/productService';

const slugify = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', slug: '', icon: '' });

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchCategories();
      setCategories(data);
    } catch (fetchError) {
      setError(fetchError?.response?.data?.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCategory = () => {
    setEditingCategory(null);
    setFormData({ name: '', slug: '', icon: '' });
    setShowModal(true);
  };

  const handleSaveCategory = async () => {
    if (!formData.name) {
      alert('Category name is required');
      return;
    }

    try {
      if (editingCategory) {
        await updateCategoryApi(editingCategory.id, {
          name: formData.name,
        });
      } else {
        await createCategoryApi({
          name: formData.name,
          description: '',
        });
      }
      await loadCategories();
      setShowModal(false);
    } catch (saveError) {
      alert(saveError?.response?.data?.message || 'Failed to save category');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      await deleteCategoryApi(id);
      await loadCategories();
    } catch (deleteError) {
      alert(deleteError?.response?.data?.message || 'Failed to delete category');
    }
  };

  return (
    <AdminLayout
      title="Category Management"
      subtitle="Keep categories clean and discoverable for shoppers."
      activePath="/admin/categories"
      actions={(
        <button
          onClick={handleAddCategory}
          className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-xl font-medium hover:bg-slate-700"
        >
          <FiPlus /> Add Category
        </button>
      )}
    >
      <section className="bg-white rounded-3xl border border-slate-200 p-5 mb-5 shadow-sm">
            <div className="relative">
          <FiSearch className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {loading ? (
              <div className="col-span-full text-center text-slate-500 py-12">Loading categories...</div>
            ) : error ? (
              <div className="col-span-full text-center text-rose-600 py-12">{error}</div>
            ) : filteredCategories.map(category => (
          <div key={category.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <div className="text-4xl mb-3">{category.icon}</div>
            <h3 className="text-lg font-bold mb-1 text-slate-900">{category.name}</h3>
            <p className="text-slate-500 text-sm mb-4">/{category.slug}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingCategory(category);
                      setFormData(category);
                      setShowModal(true);
                    }}
                  className="flex-1 flex items-center justify-center gap-1 p-2 bg-cyan-100 text-cyan-700 rounded-xl hover:bg-cyan-200 transition"
                  >
                    <FiEdit2 size={16} /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                  className="flex-1 flex items-center justify-center gap-1 p-2 bg-rose-100 text-rose-700 rounded-xl hover:bg-rose-200 transition"
                  >
                    <FiTrash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            ))}
      </section>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h2>
            <div className="space-y-4 mb-6">
              <input
                type="text"
                placeholder="Category Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value,
                    slug: slugify(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="text"
                placeholder="Slug"
                value={formData.slug}
                onChange={(e) => setFormData({...formData, slug: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="text"
                placeholder="Icon/Emoji"
                value={formData.icon}
                onChange={(e) => setFormData({...formData, icon: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-300 px-4 py-2 rounded-lg font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCategory}
                className="flex-1 bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-opacity-90"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default CategoryManagement;


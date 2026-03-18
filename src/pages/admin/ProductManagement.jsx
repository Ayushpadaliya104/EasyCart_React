import React, { useState } from 'react';
import { mockProducts } from '../../utils/mockData';
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiX } from 'react-icons/fi';
import AdminLayout from '../../components/AdminLayout';

function ProductManagement() {
  const [products, setProducts] = useState(mockProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    category: '',
    description: '',
    image: '',
    images: [],
  });

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProduct = () => {
    setEditingProduct(null);
    setFormData({ name: '', price: '', originalPrice: '', category: '', description: '', image: '', images: [] });
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({...product});
    setShowModal(true);
  };

  const handleAddImage = () => {
    if (formData.image.trim()) {
      setFormData({
        ...formData,
        images: [...formData.images, formData.image],
        image: ''
      });
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Image = event.target.result;
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, base64Image]
        }));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    });
  };

  const handleSaveProduct = () => {
    if (!formData.name || !formData.price || formData.images.length === 0) {
      alert('Please fill in all fields and add at least one image');
      return;
    }

    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      originalPrice: parseFloat(formData.originalPrice) || parseFloat(formData.price),
      image: formData.images[0],
      images: formData.images.length > 0 ? formData.images : [formData.images[0]]
    };

    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? { ...productData, id: p.id } : p));
    } else {
      setProducts([...products, { ...productData, id: Math.max(...products.map(p => p.id), 0) + 1 }]);
    }
    setShowModal(false);
  };

  const handleDeleteProduct = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  return (
    <AdminLayout
      title="Product Management"
      subtitle="Create, edit, and maintain your product catalog."
      activePath="/admin/products"
      actions={(
        <button
          onClick={handleAddProduct}
          className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-xl font-medium hover:bg-slate-700 transition"
        >
          <FiPlus /> Add Product
        </button>
      )}
    >
      <section className="bg-white rounded-3xl border border-slate-200 p-5 mb-5 shadow-sm">
            <div className="relative">
          <FiSearch className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
      </section>

      <section className="bg-white rounded-3xl border border-slate-200 overflow-x-auto shadow-sm">
            <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
              <th className="px-6 py-3 text-left text-xs uppercase tracking-wide text-slate-500">Image</th>
              <th className="px-6 py-3 text-left text-xs uppercase tracking-wide text-slate-500">Name</th>
              <th className="px-6 py-3 text-left text-xs uppercase tracking-wide text-slate-500">Category</th>
              <th className="px-6 py-3 text-left text-xs uppercase tracking-wide text-slate-500">Price</th>
              <th className="px-6 py-3 text-left text-xs uppercase tracking-wide text-slate-500">Images</th>
              <th className="px-6 py-3 text-left text-xs uppercase tracking-wide text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
              <tr key={product.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                <td className="px-6 py-4 text-sm">
                  {product.image && (
                    <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-lg" />
                  )}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-800">{product.name}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{product.category}</td>
                <td className="px-6 py-4 text-sm font-semibold text-slate-900">₹{product.price.toFixed(2)}</td>
                <td className="px-6 py-4 text-sm">
                  <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-xs font-semibold">
                        {(product.images || []).length} images
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm flex gap-2">
                      <button
                        onClick={() => handleEditProduct(product)}
                    className="p-2 hover:bg-cyan-100 text-cyan-700 rounded-lg transition"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                    className="p-2 hover:bg-rose-100 text-rose-700 rounded-lg transition"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
      </section>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <div className="space-y-4 mb-6">
              <input
                type="text"
                placeholder="Product Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Price"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="number"
                  placeholder="Original Price"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({...formData, originalPrice: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <input
                type="text"
                placeholder="Category"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                rows="3"
              ></textarea>

              {/* Images Section */}
              <div className="bg-slate-50 p-4 rounded-lg border-2 border-dashed border-slate-300">
                <h3 className="font-semibold text-slate-900 mb-3">Product Images</h3>
                
                {/* URL Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Add from URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Paste image URL"
                      value={formData.image}
                      onChange={(e) => setFormData({...formData, image: e.target.value})}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      onClick={handleAddImage}
                      className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition font-medium whitespace-nowrap"
                    >
                      + Add URL
                    </button>
                  </div>
                </div>

                {/* File Upload */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Upload from Device</label>
                  <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-400 rounded-lg bg-white hover:bg-slate-50 cursor-pointer transition">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <span className="text-slate-600 font-medium">📁 Click to upload or drag images</span>
                  </label>
                </div>

                {/* Image Preview */}
                {formData.images.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-slate-700 mb-2">Added Images ({formData.images.length})</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {formData.images.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={img}
                            alt={`Product ${idx + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                          >
                            <FiX size={16} />
                          </button>
                          <span className="absolute bottom-1 left-1 bg-black text-white text-xs px-2 py-1 rounded">
                            {idx + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {formData.images.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4">No images added yet. Upload from device or paste URLs above.</p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-300 px-4 py-2 rounded-lg font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProduct}
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

export default ProductManagement;



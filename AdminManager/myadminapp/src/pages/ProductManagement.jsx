import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Edit2, Trash2, Filter, X, Upload, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/common/ConfirmModal';

const getImageUrl = (imageName) => {
  if (!imageName || imageName === 'default.png') return 'https://via.placeholder.com/40';
  if (imageName.startsWith('http')) return imageName;
  const apiUrl = import.meta.env.VITE_API_URL || '/api';
  return `${apiUrl}/public/products/image/${imageName}`;
};

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });
  const [modalMode, setModalMode] = useState('add');
  const [currentProduct, setCurrentProduct] = useState({
    productName: '',
    description: '',
    price: 0,
    discount: 0,
    quantity: 0,
    categoryId: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, searchQuery]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const url = searchQuery 
        ? `/public/products/keyword/${searchQuery}?pageNumber=${currentPage}&pageSize=${pageSize}`
        : `/public/products?pageNumber=${currentPage}&pageSize=${pageSize}`;
      const response = await axiosClient.get(url);
      if (response && response.content) {
        setProducts(response.content);
        setTotalPages(response.totalPages || 1);
      } else if (Array.isArray(response)) {
        setProducts(response);
        setTotalPages(1);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axiosClient.get('/public/categories');
      if (response && response.content) {
        setCategories(response.content);
      } else if (Array.isArray(response)) {
        setCategories(response);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleDelete = (productId) => {
    setConfirmModal({ isOpen: true, id: productId });
  };

  const confirmDelete = async () => {
    try {
      await axiosClient.delete(`/admin/products/${confirmModal.id}`);
      toast.success('Product deleted successfully');
      setConfirmModal({ isOpen: false, id: null });
      if (products.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchProducts();
      }
    } catch (error) {
      toast.error('Failed to delete product.');
      setConfirmModal({ isOpen: false, id: null });
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setCurrentProduct({
      productName: '',
      description: '',
      price: 0,
      discount: 0,
      quantity: 0,
      categoryId: categories.length > 0 ? categories[0].categoryId : ''
    });
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setModalMode('edit');
    setCurrentProduct({
      productId: product.productId,
      productName: product.productName,
      description: product.description || product.productDescription || '',
      price: product.price,
      discount: product.discount,
      quantity: product.quantity,
      categoryId: product.categoryId || ''
    });
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const uploadImage = async (productId, file) => {
    const formData = new FormData();
    formData.append('image', file);
    await axiosClient.put(`/admin/products/${productId}/image`, formData);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      let savedProductId = null;

      const productPayload = {
        productName: currentProduct.productName,
        productDescription: currentProduct.description,
        price: currentProduct.price,
        discount: currentProduct.discount,
        quantity: currentProduct.quantity,
        category: { categoryId: currentProduct.categoryId }
      };

      if (modalMode === 'add') {
        if (!currentProduct.categoryId) {
          toast.error('Please select a category');
          return;
        }
        const res = await axiosClient.post(`/admin/categories/${currentProduct.categoryId}/products`, productPayload);
        savedProductId = res.productId;
        toast.success('Product added successfully');
      } else {
        await axiosClient.put(`/admin/products/${currentProduct.productId}`, productPayload);
        savedProductId = currentProduct.productId;
        toast.success('Product updated successfully');
      }

      if (selectedFile && savedProductId) {
        await uploadImage(savedProductId, selectedFile);
      }

      closeModal();
      fetchProducts();
    } catch (error) {
      toast.error('Failed to save product. Please check your inputs.');
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Products</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your product catalog</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm flex items-center transition-colors"
        >
          <Plus size={18} className="mr-2" />
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
          <div className="relative w-full sm:w-72">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <Search size={18} className="text-gray-400" />
            </span>
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/80 text-xs uppercase text-gray-500 border-b border-gray-100 sticky top-0">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Product</th>
                  <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Category</th>
                  <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Price</th>
                  <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Stock</th>
                  <th scope="col" className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <Inbox size={48} className="mb-4 opacity-50" />
                        <p className="text-lg font-medium text-gray-600">No products found</p>
                        <p className="text-sm mt-1">Get started by adding a new product.</p>
                      </div>
                    </td>
                  </tr>
                ) : products.map((product) => (
                  <tr key={product.productId} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img 
                          className="h-10 w-10 rounded-md object-cover bg-gray-100 shadow-sm" 
                          src={getImageUrl(product.image)} 
                          alt="" 
                        />
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">{product.productName}</div>
                          <div className="text-sm text-gray-500 truncate w-48" title={product.description || product.productDescription}>
                            {product.description || product.productDescription}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {categories.find(c => c.categoryId === product.categoryId)?.categoryName || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${product.price?.toFixed(2) || '0.00'}</div>
                      {/* {product.discount > 0 && (
                        <div className="text-xs font-semibold text-green-600 mt-0.5">-{product.discount}% (${product.specialPrice?.toFixed(2)})</div>
                      )} */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.quantity > 10 ? 'bg-green-100 text-green-800' : product.quantity > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                          {product.quantity} in stock
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => openEditModal(product)}
                        className="text-gray-400 hover:text-blue-600 mx-2 p-1.5 rounded-md hover:bg-blue-50 transition-colors opacity-0 group-hover:opacity-100" 
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.productId)} 
                        className="text-gray-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100" 
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && products.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
            <div className="text-sm text-gray-500">
              Page <span className="font-medium text-gray-900">{currentPage}</span> of <span className="font-medium text-gray-900">{totalPages}</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-md border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={closeModal}></div>

          <div className="bg-white rounded-xl shadow-2xl transform transition-all w-full max-w-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
            <form onSubmit={handleSave}>
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  {modalMode === 'add' ? 'Add New Product' : 'Edit Product'}
                </h3>
                <button type="button" onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                    <input
                      type="text"
                      required
                      className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      value={currentProduct.productName}
                      onChange={(e) => setCurrentProduct({...currentProduct, productName: e.target.value})}
                    />
                  </div>
                  
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      required
                      className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
                      value={currentProduct.categoryId}
                      onChange={(e) => setCurrentProduct({...currentProduct, categoryId: e.target.value})}
                    >
                      <option value="" disabled>Select a category</option>
                      {categories.map(cat => (
                        <option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity in Stock</label>
                    <input
                      type="number"
                      min="0"
                      required
                      className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      value={currentProduct.quantity}
                      onChange={(e) => setCurrentProduct({...currentProduct, quantity: Number(e.target.value)})}
                    />
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Base Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      value={currentProduct.price}
                      onChange={(e) => setCurrentProduct({...currentProduct, price: Number(e.target.value)})}
                    />
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      value={currentProduct.discount}
                      onChange={(e) => setCurrentProduct({...currentProduct, discount: Number(e.target.value)})}
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                      value={currentProduct.description}
                      onChange={(e) => setCurrentProduct({...currentProduct, description: e.target.value})}
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600 justify-center">
                          <label className="relative cursor-pointer bg-transparent rounded-md font-medium text-blue-600 hover:text-blue-700 focus-within:outline-none">
                            <span>Upload a file</span>
                            <input 
                              type="file" 
                              className="sr-only" 
                              accept="image/*"
                              onChange={handleFileChange}
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500">
                          {selectedFile ? selectedFile.name : 'PNG, JPG, GIF up to 10MB'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  {modalMode === 'add' ? 'Save Product' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
      />
    </>
  );
}

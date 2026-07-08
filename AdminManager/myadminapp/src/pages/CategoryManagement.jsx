import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/common/ConfirmModal';

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentCategory, setCurrentCategory] = useState({ categoryName: '', image: '' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });

  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCategories();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, searchQuery]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const url = searchQuery
        ? `/public/categories/search/${searchQuery}?pageNumber=${currentPage}&pageSize=${pageSize}`
        : `/public/categories?pageNumber=${currentPage}&pageSize=${pageSize}`;
      const response = await axiosClient.get(url);
      if (response && response.content) {
        setCategories(response.content);
        setTotalPages(response.totalPages || 1);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (categoryId) => {
    setConfirmModal({ isOpen: true, id: categoryId });
  };

  const confirmDelete = async () => {
    try {
      await axiosClient.delete(`/admin/categories/${confirmModal.id}`);
      toast.success('Category deleted successfully');
      if (categories.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchCategories();
      }
    } catch (error) {
      toast.error('Failed to delete category. It might have products attached.');
    } finally {
      setConfirmModal({ isOpen: false, id: null });
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setCurrentCategory({ categoryName: '', image: '' });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (category) => {
    setModalMode('edit');
    setCurrentCategory({ categoryId: category.categoryId, categoryName: category.categoryName, image: category.image || '' });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentCategory({ categoryName: '', image: '' });
    setImageFile(null);
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      // Create local preview URL
      setCurrentCategory({ ...currentCategory, image: URL.createObjectURL(file) });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setIsUploading(true);
      let finalImageUrl = currentCategory.image;

      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        const uploadRes = await axiosClient.post('/admin/upload-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        finalImageUrl = uploadRes.url;
      }

      if (modalMode === 'add') {
        await axiosClient.post('/admin/categories', {
          categoryName: currentCategory.categoryName,
          image: finalImageUrl
        });
        toast.success('Category added successfully');
      } else {
        await axiosClient.put(`/admin/categories/${currentCategory.categoryId}`, {
          categoryName: currentCategory.categoryName,
          image: finalImageUrl
        });
        toast.success('Category updated successfully');
      }
      closeModal();
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save category. Please check your permissions.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Categories</h1>
          <p className="text-sm text-slate-500 mt-1">Manage product categories</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-300 flex items-center"
        >
          <Plus size={18} className="mr-2" />
          Add Category
        </button>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-100/60 overflow-hidden relative">
        {/* Toolbar */}
        <div className="p-5 border-b border-slate-100/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/50">
          <div className="relative w-full sm:w-96 group">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
              <Search size={18} />
            </span>
            <input 
              type="text" 
              placeholder="Search categories..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-300"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
             <div className="flex flex-col justify-center items-center h-64 text-blue-500">
               <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
               <p className="text-sm font-medium animate-pulse text-slate-500">Loading categories...</p>
             </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <tr>
                  <th scope="col" className="px-6 py-4">ID</th>
                  <th scope="col" className="px-6 py-4">Image</th>
                  <th scope="col" className="px-6 py-4">Category Name</th>
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <div className="bg-slate-50 p-4 rounded-full mb-4">
                          <Inbox size={48} className="text-slate-300" />
                        </div>
                        <p className="text-lg font-bold text-slate-700">No categories found</p>
                        <p className="text-sm mt-1">Get started by creating a new category.</p>
                      </div>
                    </td>
                  </tr>
                ) : categories.map((category) => (
                  <tr key={category.categoryId} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-500">#{category.categoryId?.toString().padStart(3, '0')}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {category.image ? (
                        <img src={category.image} alt={category.categoryName} className="h-12 w-12 object-cover rounded-xl shadow-sm border border-slate-200 bg-slate-100" />
                      ) : (
                        <div className="h-12 w-12 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 text-[10px] font-medium shadow-sm">No img</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900">{category.categoryName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end items-center gap-2">
                        <button 
                          onClick={() => openEditModal(category)}
                          className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 bg-white border border-slate-200 hover:border-blue-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-blue-50 transition-all opacity-0 group-hover:opacity-100" 
                          title="Edit Category"
                        >
                          <Edit2 size={16} />
                          <span className="text-xs font-semibold">Edit</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(category.categoryId)} 
                          className="flex items-center gap-1.5 text-slate-500 hover:text-rose-600 bg-white border border-slate-200 hover:border-rose-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100" 
                          title="Delete Category"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && categories.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="text-sm text-slate-500 font-medium">
              Page <span className="text-slate-900 font-bold">{currentPage}</span> of <span className="text-slate-900 font-bold">{totalPages}</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
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
          <div className="bg-white rounded-xl shadow-2xl transform transition-all w-full max-w-lg overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
            <form onSubmit={handleSave}>
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  {modalMode === 'add' ? 'Add New Category' : 'Edit Category'}
                </h3>
                <button type="button" onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors" disabled={isUploading}>
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6">
                <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                  <input
                    type="text"
                    name="categoryName"
                    id="categoryName"
                    required
                    className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900"
                    placeholder="e.g. Electronics"
                    value={currentCategory.categoryName}
                    onChange={(e) => setCurrentCategory({...currentCategory, categoryName: e.target.value})}
                    disabled={isUploading}
                  />
                </div>

                <div className="px-6 pb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category Image</label>
                  
                  <div className="flex items-center gap-4">
                    <div className="relative h-20 w-20 flex-shrink-0 bg-gray-100 rounded-lg border border-dashed border-gray-300 overflow-hidden flex items-center justify-center">
                      {currentCategory.image ? (
                        <img src={currentCategory.image} alt="Preview" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-gray-400 text-xs">No Image</span>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        id="imageUpload"
                        className="hidden"
                        onChange={handleImageChange}
                        disabled={isUploading}
                      />
                      <label 
                        htmlFor="imageUpload"
                        className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Choose Image
                      </label>
                      <p className="mt-1 text-xs text-gray-500">JPG, PNG, GIF up to 5MB</p>
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
                  {modalMode === 'add' ? 'Add Category' : 'Save Changes'}
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
        title="Delete Category"
        message="Are you sure you want to delete this category?"
        confirmText="Delete"
      />
    </div>
  );
}

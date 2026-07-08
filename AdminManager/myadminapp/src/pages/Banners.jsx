import { useState, useEffect } from 'react';
import { bannerApi } from '../services/bannerApi';
import axiosClient from '../api/axiosClient';
import { Edit2, Trash2, Plus, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/common/ConfirmModal';

export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(null);
  
  const [formData, setFormData] = useState({
    section: 'DISCOVER_SLIDER',
    title: '',
    subtitle: '',
    description: '',
    image: '',
    badge: '',
    active: true,
    sortOrder: 0
  });

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const data = await bannerApi.getAllBanners();
      setBanners(data);
    } catch (error) {
      toast.error('Failed to fetch banners');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setFormData({ ...formData, image: URL.createObjectURL(file) });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsUploading(true);
      let finalImageUrl = formData.image;

      if (imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('image', imageFile);
        const uploadRes = await axiosClient.post('/admin/upload-image', uploadFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        finalImageUrl = uploadRes.url;
      }

      const updatedFormData = { ...formData, image: finalImageUrl };

      if (currentBanner) {
        await bannerApi.updateBanner(currentBanner.id, updatedFormData);
        toast.success('Banner updated successfully');
      } else {
        await bannerApi.createBanner(updatedFormData);
        toast.success('Banner created successfully');
      }
      setIsModalOpen(false);
      fetchBanners();
    } catch (error) {
      toast.error(currentBanner ? 'Failed to update banner' : 'Failed to create banner');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (banner) => {
    setCurrentBanner(banner);
    setFormData({ ...banner });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setConfirmModal({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    try {
      await bannerApi.deleteBanner(confirmModal.id);
      toast.success('Banner deleted successfully');
      fetchBanners();
    } catch (error) {
      toast.error('Failed to delete banner');
    }
  };

  const openNewModal = () => {
    setCurrentBanner(null);
    setFormData({
      section: 'DISCOVER_SLIDER',
      title: '',
      subtitle: '',
      description: '',
      image: '',
      badge: '',
      active: true,
      sortOrder: 0
    });
    setImageFile(null);
    setIsModalOpen(true);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  return (
    <div className="animate-fade-in-up space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Banners & Content</h1>
          <p className="text-sm text-slate-500 mt-1">Manage dynamic text and sliders across the website</p>
        </div>
        <button
          onClick={openNewModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
        >
          <Plus size={18} />
          Add Banner
        </button>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-100/60 overflow-hidden relative">
        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
             <div className="flex flex-col justify-center items-center h-64 text-blue-500">
               <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
               <p className="text-sm font-medium animate-pulse text-slate-500">Loading banners...</p>
             </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <tr>
                  <th scope="col" className="px-6 py-4">Image/Section</th>
                  <th scope="col" className="px-6 py-4">Content</th>
                  <th scope="col" className="px-6 py-4 text-center">Status</th>
                  <th scope="col" className="px-6 py-4 text-center">Order</th>
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {banners.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <div className="bg-slate-50 p-4 rounded-full mb-4">
                          <ImageIcon size={48} className="text-slate-300" />
                        </div>
                        <p className="text-lg font-bold text-slate-700">No banners found</p>
                        <p className="text-sm mt-1">Create a new banner to customize your storefront.</p>
                      </div>
                    </td>
                  </tr>
                ) : banners.map((banner) => (
                  <tr key={banner.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        {banner.image ? (
                          <img src={banner.image} alt={banner.title} className="h-16 w-24 object-cover rounded-lg shadow-sm border border-slate-200" />
                        ) : (
                          <div className="h-16 w-24 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
                            <ImageIcon size={24} />
                          </div>
                        )}
                        <div>
                          <span className="inline-block px-2.5 py-1 text-[10px] font-bold uppercase rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100">
                            {banner.section}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-900">{banner.title}</div>
                      <div className="text-xs font-medium text-slate-500 line-clamp-1 mt-0.5">{banner.subtitle}</div>
                      {banner.badge && (
                        <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-50 text-amber-600 border border-amber-200">
                          {banner.badge}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                        banner.active ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}>
                        {banner.active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-slate-500">
                      {banner.sortOrder}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          onClick={() => handleEdit(banner)}
                          className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 bg-white border border-slate-200 hover:border-blue-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-blue-50 transition-all opacity-0 group-hover:opacity-100"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                          <span className="text-xs font-semibold">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(banner.id)}
                          className="flex items-center gap-1.5 text-slate-500 hover:text-rose-600 bg-white border border-slate-200 hover:border-rose-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                          title="Delete"
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
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">
                {currentBanner ? 'Edit Banner/Content' : 'Add New Banner/Content'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Section Code *</label>
                  <select
                    name="section"
                    value={formData.section}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  >
                    <option value="DISCOVER_SLIDER">Homepage - Discover Slider</option>
                    <option value="PRODUCTS_HEADER">Products Page - Header Text</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-1">Where will this content appear?</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Badge Text</label>
                  <input
                    type="text"
                    name="badge"
                    value={formData.badge}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. New Arrivals 2025"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Subtitle</label>
                  <input
                    type="text"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  ></textarea>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Banner Image</label>
                  
                  <div className="flex items-start gap-4">
                    <div className="relative h-24 w-40 flex-shrink-0 bg-slate-100 rounded-lg border border-dashed border-slate-300 overflow-hidden flex items-center justify-center">
                      {formData.image ? (
                        <img src={formData.image} alt="Preview" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-slate-400 text-xs">No Image</span>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        id="bannerImageUpload"
                        className="hidden"
                        onChange={handleImageChange}
                        disabled={isUploading}
                      />
                      <label 
                        htmlFor="bannerImageUpload"
                        className="cursor-pointer inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        <ImageIcon size={16} className="mr-2" />
                        Choose Image
                      </label>
                      <p className="mt-2 text-xs text-slate-500">Leave empty for plain text sections. Supported formats: JPG, PNG, WEBP.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Sort Order</label>
                  <input
                    type="number"
                    name="sortOrder"
                    value={formData.sortOrder}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="flex items-center mt-6">
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleInputChange}
                    id="active"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                    Active (visible to users)
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {currentBanner ? 'Update Banner' : 'Create Banner'}
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
        title="Delete Banner"
        message="Are you sure you want to delete this banner? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
}

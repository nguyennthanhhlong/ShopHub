import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const bannerApi = {
  // Get all banners (Admin)
  getAllBanners: async () => {
    const response = await axios.get(`${API_URL}/admin/banners`, getAuthHeaders());
    return response.data;
  },

  // Get banners by section (Public)
  getBannersBySection: async (section) => {
    const response = await axios.get(`${API_URL}/public/banners/section/${section}`);
    return response.data;
  },

  // Create new banner
  createBanner: async (bannerData) => {
    const response = await axios.post(`${API_URL}/admin/banners`, bannerData, getAuthHeaders());
    return response.data;
  },

  // Update banner
  updateBanner: async (id, bannerData) => {
    const response = await axios.put(`${API_URL}/admin/banners/${id}`, bannerData, getAuthHeaders());
    return response.data;
  },

  // Delete banner
  deleteBanner: async (id) => {
    const response = await axios.delete(`${API_URL}/admin/banners/${id}`, getAuthHeaders());
    return response.data;
  }
};

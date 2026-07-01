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

export const testimonialApi = {
  // Get all testimonials (Admin)
  getAllTestimonials: async () => {
    const response = await axios.get(`${API_URL}/admin/testimonials`, getAuthHeaders());
    return response.data;
  },

  // Get active testimonials (Public)
  getActiveTestimonials: async () => {
    const response = await axios.get(`${API_URL}/public/testimonials`);
    return response.data;
  },

  // Create new testimonial
  createTestimonial: async (data) => {
    const response = await axios.post(`${API_URL}/admin/testimonials`, data, getAuthHeaders());
    return response.data;
  },

  // Update testimonial
  updateTestimonial: async (id, data) => {
    const response = await axios.put(`${API_URL}/admin/testimonials/${id}`, data, getAuthHeaders());
    return response.data;
  },

  // Delete testimonial
  deleteTestimonial: async (id) => {
    const response = await axios.delete(`${API_URL}/admin/testimonials/${id}`, getAuthHeaders());
    return response.data;
  }
};

import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL || "/api"}/admin/coupons`;

// Helper function to get the auth token
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

export const getAllCoupons = async () => {
  try {
    const response = await axios.get(API_URL, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Error fetching coupons:", error);
    throw error;
  }
};

export const createCoupon = async (couponData) => {
  try {
    const response = await axios.post(API_URL, couponData, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Error creating coupon:", error);
    throw error;
  }
};

export const updateCoupon = async (id, couponData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, couponData, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Error updating coupon:", error);
    throw error;
  }
};

export const deleteCoupon = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Error deleting coupon:", error);
    throw error;
  }
};

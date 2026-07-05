import axios from 'axios';
import { Product } from '@/types/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const getUserWishlist = async (email: string, token: string) => {
  return await axios.get<Product[]>(`${API_BASE_URL}/user/wishlist?email=${email}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const getUserWishlistProductIds = async (email: string, token: string) => {
  return await axios.get<number[]>(`${API_BASE_URL}/user/wishlist/product-ids?email=${email}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const addProductToWishlist = async (productId: number, email: string, token: string) => {
  return await axios.post(`${API_BASE_URL}/user/wishlist/add/${productId}?email=${email}`, null, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const removeProductFromWishlist = async (productId: number, email: string, token: string) => {
  return await axios.delete(`${API_BASE_URL}/user/wishlist/remove/${productId}?email=${email}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

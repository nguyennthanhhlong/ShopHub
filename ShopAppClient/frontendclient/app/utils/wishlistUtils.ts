import { Product } from '@/types/types';

export const WISHLIST_STORAGE_KEY = 'shophub_wishlist';

export const getWishlist = (): Product[] => {
  if (typeof window === 'undefined') return [];
  const wishlistItems = localStorage.getItem(WISHLIST_STORAGE_KEY);
  return wishlistItems ? JSON.parse(wishlistItems) : [];
};

export const addToWishlist = (product: Product): boolean => {
  if (typeof window === 'undefined') return false;
  
  const wishlist = getWishlist();
  
  const existingProduct = wishlist.find(
    (item) => item.productId === product.productId
  );

  if (existingProduct) {
    // Already in wishlist
    return false;
  } else {
    // Add new product
    wishlist.push(product);
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    // Dispatch event to update other components
    window.dispatchEvent(new Event('wishlistUpdated'));
    return true;
  }
};

export const removeFromWishlist = (productId: number) => {
  if (typeof window === 'undefined') return;
  
  const wishlist = getWishlist();
  const newWishlist = wishlist.filter(item => item.productId !== productId);
  
  localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(newWishlist));
  window.dispatchEvent(new Event('wishlistUpdated'));
};

export const isInWishlist = (productId: number): boolean => {
  const wishlist = getWishlist();
  return wishlist.some(item => item.productId === productId);
};

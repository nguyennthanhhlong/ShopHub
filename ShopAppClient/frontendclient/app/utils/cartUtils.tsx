import { CartItem, Product } from '@/types/types';
import { toast } from 'react-toastify';

const CART_KEY = 'cart';

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(CART_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    
    // Filter out invalid items to prevent crashes from old/corrupted local storage data
    return parsed.filter(item => item && item.product && item.product.productId !== undefined);
  } catch (error) {
    console.error("Failed to parse cart from local storage", error);
    return [];
  }
}

export function saveCart(cart: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event('cart-updated'));
}

export function addToCart(product: Product, quantity = 1): boolean {
  const cart = getCart();
  const index = cart.findIndex(
    (item) => item.product.productId === product.productId
  );

  const availableStock = product.quantity || 0;

  if (index !== -1) {
    const newQuantity = cart[index].quantity + quantity;
    if (newQuantity > availableStock) {
      toast.warning(`Không thể thêm. Chỉ còn ${availableStock} sản phẩm trong kho!`);
      return false;
    }
    cart[index].quantity = newQuantity;
    toast.success(
      `Đã cập nhật giỏ hàng: ${cart[index].product.productName} (x${newQuantity})`
    );
  } else {
    if (quantity > availableStock) {
      toast.warning(`Không thể thêm. Chỉ còn ${availableStock} sản phẩm trong kho!`);
      return false;
    }
    toast.success(`Đã thêm ${product.productName} vào giỏ hàng`);
    cart.push({ product, quantity });
  }

  saveCart(cart);
  window.dispatchEvent(new Event('cartUpdated'));
  return true;
}

export function updateCartQuantity(product: Product, quantity: number): boolean {
  const cart = getCart();
  const index = cart.findIndex(
    (item) => item.product.productId === product.productId
  );

  const availableStock = product.quantity || 0;
  if (quantity > availableStock) {
    toast.warning(`Chỉ còn ${availableStock} sản phẩm trong kho!`);
    return false;
  }

  if (index !== -1) {
    cart[index].quantity = Math.max(quantity, 1);
    toast.success(
      `Đã cập nhật giỏ hàng: ${cart[index].product.productName} (x${cart[index].quantity})`
    );
  } else {
    toast.success(`Đã thêm ${product.productName} vào giỏ hàng`);
    cart.push({ product, quantity: Math.max(quantity, 1) });
  }

  saveCart(cart);
  window.dispatchEvent(new Event('cartUpdated'));
  return true;
}

export function removeFromCart(productId: number) {
  const cart = getCart().filter((item) => item.product.productId !== productId);
  saveCart(cart);
  window.dispatchEvent(new Event('cartUpdated'));
}

export function removeCart(productId: Product) {
  window.dispatchEvent(new Event('cartUpdated'));
}

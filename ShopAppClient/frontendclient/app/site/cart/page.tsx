'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { CartItem } from '@/components/cart-item';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ShoppingBag, ShieldCheck, CreditCard, Wallet, Truck } from 'lucide-react';
import {
  getCart,
  removeFromCart,
  updateCartQuantity,
} from '@/app/utils/cartUtils';
import { CartItemForCart, Product } from '@/types/types';
import { useAuth } from '@/context/authContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [cartItems, setCartItems] = useState<CartItemForCart[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const storedCart = getCart();
    setCartItems(storedCart);
    setMounted(true);
    
    // Listen for cart changes from other tabs/components
    const handleCartUpdated = () => {
      setCartItems(getCart());
    };
    window.addEventListener('cartUpdated', handleCartUpdated);
    return () => window.removeEventListener('cartUpdated', handleCartUpdated);
  }, []);

  const subtotal = useMemo(
    () =>
      cartItems.reduce((sum, item) => {
        const p = item.product;
        const hasDiscount = p.discount > 0;
        const finalPrice = hasDiscount ? (p.price || 0) * (1 - p.discount / 100) : (p.price || 0);
        return sum + finalPrice * item.quantity;
      }, 0),
    [cartItems]
  );

  const shipping = subtotal > 0 ? 15 : 0;
  const total = subtotal + shipping;

  const handleUpdateQuantity = (product: Product, quantity: number) => {
    const success = updateCartQuantity(product, quantity);
    if (success) {
      setCartItems((prev) =>
        prev.map((item) =>
          item.product.productId === product.productId
            ? { ...item, quantity }
            : item
        )
      );
    }
  };

  const handleRemoveItem = (product: Product) => {
    removeFromCart(product.productId);
    setCartItems((prev) =>
      prev.filter((item) => item.product.productId !== product.productId)
    );
  };

  const handleVnpayCheckout = () => {
    if (cartItems.length === 0) return;
    if (!user || !token) {
      router.push('/site/login');
      return;
    }
    router.push('/site/checkout?paymentMethod=vnpay');
  };

  const handleCODCheckout = () => {
    if (cartItems.length === 0) return;
    if (!user || !token) {
      router.push('/site/login');
      return;
    }
    router.push('/site/checkout?paymentMethod=cod');
  };

  if (!mounted) return null;

  return (
    <section className='min-h-screen bg-slate-50/50 pb-24 relative overflow-hidden'>
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-1/3 h-[500px] bg-gradient-to-bl from-indigo-100/60 to-transparent blur-3xl pointer-events-none -z-10"></div>
      
      <div className='container mx-auto px-4 relative z-10 pt-10'>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <Button
            variant='ghost'
            className='mb-8 flex items-center gap-2 text-slate-500 hover:text-indigo-700 bg-white shadow-sm rounded-full px-6 py-2 transition-all w-fit'
            onClick={() => router.push('/site/products')}
          >
            <ArrowLeft className='h-4 w-4' />
            Tiếp tục mua sắm
          </Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className='text-4xl lg:text-5xl font-extrabold text-slate-900 mb-2 flex items-center gap-4 tracking-tight'>
            <div className="bg-indigo-100 p-3 rounded-2xl">
              <ShoppingBag className='h-8 w-8 text-indigo-600' />
            </div>
            Giỏ Hàng Của Bạn
          </h1>
          <p className="text-slate-500 text-lg mb-10 ml-16">
            Bạn đang có {cartItems.length} sản phẩm trong giỏ hàng.
          </p>
        </motion.div>

        {cartItems.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className='text-center bg-white rounded-[3rem] shadow-xl shadow-indigo-100/20 border border-slate-100 py-32 relative overflow-hidden'
          >
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-indigo-500 to-blue-500"></div>
            <div className='bg-indigo-50 w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner'>
              <ShoppingBag className='h-12 w-12 text-indigo-400' />
            </div>
            <h2 className='text-3xl font-extrabold text-slate-900 mb-4'>Giỏ hàng trống</h2>
            <p className='text-slate-500 text-lg mb-10 max-w-md mx-auto'>
              Có vẻ như bạn chưa thêm sản phẩm nào. Hãy khám phá các bộ sưu tập tuyệt vời của chúng tôi ngay nhé!
            </p>
            <Button size='lg' onClick={() => router.push('/site/products')} className='bg-indigo-600 hover:bg-indigo-700 rounded-full px-10 h-14 text-lg font-bold shadow-lg shadow-indigo-200 transition-all hover:scale-105'>
              Khám phá sản phẩm
            </Button>
          </motion.div>
        ) : (
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start'>
            {/* Cart Items List */}
            <div className='lg:col-span-2 space-y-5'>
              <AnimatePresence>
                {cartItems.map((item) => (
                  <CartItem
                    key={item.product.productId}
                    item={item}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemoveItem}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary Checkout Card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
              className='lg:col-span-1'
            >
              <Card className='p-8 bg-white shadow-2xl shadow-indigo-100/50 rounded-[2.5rem] border border-slate-100 sticky top-24'>
                <h2 className='text-2xl font-extrabold text-slate-900 mb-8 pb-4 border-b border-slate-100'>Tổng Đơn Hàng</h2>
                
                <div className='space-y-5 mb-8'>
                  <div className='flex justify-between items-center text-slate-600 text-lg'>
                    <span>Tạm tính</span>
                    <span className='font-bold text-slate-900'>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className='flex justify-between items-center text-slate-600 text-lg'>
                    <span className="flex items-center gap-2"><Truck className="w-4 h-4 text-slate-400" /> Phí giao hàng</span>
                    <span className='font-bold text-slate-900'>${shipping.toFixed(2)}</span>
                  </div>
                </div>

                <div className='bg-slate-50 p-6 rounded-3xl mb-8 border border-slate-100'>
                  <div className='flex justify-between items-center'>
                    <span className='text-xl font-bold text-slate-700'>Tổng cộng</span>
                    <span className='text-4xl font-black text-indigo-600'>${total.toFixed(2)}</span>
                  </div>
                  <p className="text-right text-sm text-slate-400 mt-2">Đã bao gồm VAT nếu có</p>
                </div>
                
                <div className="space-y-4">
                  <Button 
                    className='w-full h-14 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-lg font-bold shadow-xl shadow-slate-200 transition-all hover:-translate-y-1'
                    onClick={handleCODCheckout}
                  >
                    <Wallet className="w-5 h-5 mr-3" />
                    Thanh toán khi nhận hàng
                  </Button>
                  
                  <Button 
                    className='w-full h-14 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg font-bold shadow-xl shadow-blue-200 transition-all hover:-translate-y-1'
                    onClick={handleVnpayCheckout}
                  >
                    <CreditCard className="w-5 h-5 mr-3" />
                    Thanh toán VNPay
                  </Button>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400">
                  <ShieldCheck className="w-5 h-5" />
                  <span className="text-sm font-medium">Thanh toán an toàn & Bảo mật 100%</span>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}

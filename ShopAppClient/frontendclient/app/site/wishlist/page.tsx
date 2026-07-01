'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, ArrowLeft } from 'lucide-react';
import { Product } from '@/types/types';
import { getWishlist, removeFromWishlist } from '@/app/utils/wishlistUtils';
import { addToCart } from '@/app/utils/cartUtils';
import Link from 'next/link';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from 'framer-motion';

export default function WishlistPage() {
  const router = useRouter();
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setWishlist(getWishlist());

    const handleWishlistUpdate = () => {
      setWishlist(getWishlist());
    };
    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    return () => window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
  }, []);

  const handleRemove = (product: Product) => {
    removeFromWishlist(product.productId);
    toast.info(`Đã xoá ${product.productName} khỏi danh sách yêu thích`);
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
  };

  if (!mounted) return null;

  return (
    <div className='min-h-screen bg-slate-50/50 pb-20'>
      <ToastContainer />
      
      {/* Header Hero Section */}
      <div className="bg-gradient-to-br from-rose-500 via-rose-600 to-red-600 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20 [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, type: 'spring' }}
            className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md"
          >
            <Heart className="w-10 h-10 text-white fill-white" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Danh sách Yêu Thích
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-rose-100"
          >
            Nơi lưu giữ những sản phẩm bạn quan tâm nhất
          </motion.p>
        </div>
      </div>

      <div className='container mx-auto px-4 mt-12'>
        <Button 
          variant="ghost" 
          onClick={() => router.push('/site/products')}
          className="mb-8 text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Tiếp tục mua sắm
        </Button>

        {wishlist.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className='text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm max-w-2xl mx-auto'
          >
            <Heart className="w-16 h-16 text-slate-200 mx-auto mb-6" />
            <h3 className='text-2xl font-bold text-slate-800 mb-2'>Danh sách trống</h3>
            <p className='text-slate-500 mb-8'>Bạn chưa có sản phẩm yêu thích nào. Hãy khám phá và thêm vào nhé!</p>
            <Button size="lg" className="rounded-full bg-rose-600 hover:bg-rose-700" onClick={() => router.push('/site/products')}>
              Khám phá sản phẩm
            </Button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
            className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'
          >
            <AnimatePresence>
              {wishlist.map((product, idx) => {
                const hasDiscount = product.discount > 0;
                const discountPercent = product.discount || 0;
                const finalPrice = hasDiscount ? product.price * (1 - discountPercent / 100) : product.price;

                return (
                  <motion.div 
                    key={product.productId}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="h-full group overflow-hidden border-0 shadow-md hover:shadow-2xl transition-all duration-300 rounded-2xl bg-white flex flex-col">
                      <div className="relative aspect-square overflow-hidden bg-slate-100">
                        <Link href={`/site/products/${product.productId}`}>
                          <img
                            src={`http://localhost:8080/api/public/products/image/${product.image}`}
                            alt={product.productName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e: any) => { e.target.src = '/placeholder.png' }}
                          />
                        </Link>
                        
                        <div className="absolute top-3 right-3 z-10">
                          <Button 
                            size="icon" 
                            variant="secondary" 
                            className="rounded-full w-10 h-10 bg-white/90 hover:bg-red-50 text-red-500 hover:text-red-600 shadow-sm border-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemove(product);
                            }}
                          >
                            <Heart className="w-5 h-5 fill-current" />
                          </Button>
                        </div>
                      </div>

                      <CardContent className="p-5 flex-1 flex flex-col">
                        <Link href={`/site/products/${product.productId}`} className="group-hover:text-rose-600 transition-colors">
                          <h3 className="text-lg font-bold mb-2 line-clamp-2 leading-snug text-slate-900">{product.productName}</h3>
                        </Link>
                        
                        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                          <div className="flex flex-col">
                            {hasDiscount ? (
                              <>
                                <span className="text-sm text-slate-400 line-through font-medium">${(product.price || 0).toFixed(2)}</span>
                                <span className="text-xl font-bold text-slate-900">${finalPrice.toFixed(2)}</span>
                              </>
                            ) : (
                              <span className="text-xl font-bold text-slate-900">${(product.price || 0).toFixed(2)}</span>
                            )}
                          </div>
                        </div>

                        <Button 
                          onClick={() => handleAddToCart(product)}
                          className="w-full mt-6 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" /> Thêm vào giỏ
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}

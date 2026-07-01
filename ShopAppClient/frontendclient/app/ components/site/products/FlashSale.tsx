'use client';

import { addToCart } from '@/app/utils/cartUtils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { getProducts } from '@/services/productService';
import { Product } from '@/types/types';
import { ShoppingCart, Zap, Clock } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import { WishlistButton } from '@/components/wishlist-button';

export default function FlashSale() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Countdown state
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
  };

  useEffect(() => {
    const fetchFlashSaleProducts = async () => {
      try {
        setLoading(true);
        // Lấy danh sách sản phẩm (Có thể dùng getProducts chung)
        // Nếu API có hỗ trợ sort theo discount thì truyển param vào đây, 
        // ở đây ta lấy danh sách rồi sort ở client để chắc chắn tìm được sản phẩm giảm giá cao nhất
        const res = await getProducts({ pageSize: '50' }); 
        
        let allProducts: Product[] = res.data.content;
        
        // Lọc các sản phẩm có giảm giá
        let discountedProducts = allProducts.filter(p => p.discount && p.discount > 0);
        
        // Sắp xếp theo phần trăm giảm giá giảm dần (CA0 NHẤT)
        discountedProducts.sort((a, b) => b.discount - a.discount);
        
        // Lấy top 4 sản phẩm
        setProducts(discountedProducts.slice(0, 4));
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Đã có lỗi xảy ra');
      } finally {
        setLoading(false);
      }
    };

    fetchFlashSaleProducts();
  }, []);

  // Countdown timer logic
  useEffect(() => {
    // Set mục tiêu đến cuối ngày hôm nay
    const targetTime = new Date();
    targetTime.setHours(23, 59, 59, 999);

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetTime.getTime() - now;

      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="py-20 flex justify-center"><Spinner /></div>;
  if (error) return null; // Ẩn component nếu lỗi để không làm xấu trang chủ
  if (products.length === 0) return null; // Ẩn component nếu không có sản phẩm khuyến mãi

  return (
    <section className='py-16 md:py-24 bg-gradient-to-r from-red-600 via-rose-500 to-red-600 relative overflow-hidden'>
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-400 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
      
      <ToastContainer />
      <div className='container mx-auto px-4 relative z-10'>
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className='flex flex-col md:flex-row justify-between items-center mb-12 bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20'
        >
          <div className='flex items-center gap-4 mb-4 md:mb-0'>
            <div className="bg-yellow-400 p-3 rounded-full shadow-lg shadow-yellow-400/30 animate-pulse">
              <Zap className="w-8 h-8 text-red-600" fill="currentColor" />
            </div>
            <div>
              <h2 className='text-3xl md:text-4xl font-extrabold text-white tracking-tight uppercase italic'>
                Flash Sale
              </h2>
              <p className='text-red-100 font-medium'>Giá Sốc Hôm Nay - Số Lượng Có Hạn!</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-red-900/40 py-3 px-6 rounded-2xl border border-red-400/30">
            <Clock className="text-yellow-400 w-6 h-6" />
            <span className="text-white font-semibold">Kết thúc trong:</span>
            <div className="flex gap-2 text-xl font-bold">
              <div className="bg-white text-red-600 w-10 h-10 flex items-center justify-center rounded-lg shadow-inner">
                {String(timeLeft.hours).padStart(2, '0')}
              </div>
              <span className="text-white/80 self-center">:</span>
              <div className="bg-white text-red-600 w-10 h-10 flex items-center justify-center rounded-lg shadow-inner">
                {String(timeLeft.minutes).padStart(2, '0')}
              </div>
              <span className="text-white/80 self-center">:</span>
              <div className="bg-white text-red-600 w-10 h-10 flex items-center justify-center rounded-lg shadow-inner">
                {String(timeLeft.seconds).padStart(2, '0')}
              </div>
            </div>
          </div>
        </motion.div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
          {products.map((product, idx) => {
            const hasDiscount = product.discount > 0;
            const discountPercent = product.discount || 0;
            const finalPrice = hasDiscount ? product.price * (1 - discountPercent / 100) : product.price;

            return (
              <motion.div
                key={product.productId}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
              >
                <Card
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/json', JSON.stringify(product));
                  }}
                  className='h-full group overflow-hidden border-[3px] border-transparent hover:border-yellow-400 shadow-xl transition-all duration-300 rounded-2xl bg-white flex flex-col cursor-grab active:cursor-grabbing relative'
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-red-600 rotate-45 translate-x-12 -translate-y-12 z-20 flex items-end justify-center pb-2">
                    <span className="text-white font-black text-sm -rotate-45 block">HOT</span>
                  </div>

                  <div className='relative aspect-square overflow-hidden bg-slate-100'>
                    <Link href={`/site/products/${product.productId}`}>
                      <img
                        src={`http://localhost:8080/api/public/products/image/${product.image}`}
                        alt={product.productName}
                        className='h-full w-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out'
                        onError={(e: any) => { e.target.src = '/placeholder.png' }}
                      />
                    </Link>

                    <div className="absolute top-3 left-3 z-10">
                      <Badge className="bg-red-500 hover:bg-red-600 text-white font-extrabold border-2 border-white px-3 py-1 shadow-lg text-lg animate-bounce">
                        -{discountPercent}%
                      </Badge>
                    </div>

                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                      <WishlistButton product={product} />
                    </div>

                    {/* Progress bar (Giả lập đã bán) */}
                    <div className="absolute inset-x-0 bottom-0 p-4 pt-12 bg-gradient-to-t from-black/80 to-transparent">
                      <div className="w-full bg-white/30 rounded-full h-2 mb-3 overflow-hidden">
                        <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${Math.floor(Math.random() * 50) + 40}%` }}></div>
                      </div>
                      <Button 
                        onClick={() => handleAddToCart(product)}
                        className="w-full bg-red-600 text-white hover:bg-red-700 font-bold shadow-lg rounded-xl"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" /> Mua Ngay
                      </Button>
                    </div>
                  </div>

                  <CardContent className='p-5 flex-1 flex flex-col z-10 bg-white'>
                    <Link href={`/site/products/${product.productId}`} className="group-hover:text-red-600 transition-colors">
                      <CardTitle className='text-lg mb-2 line-clamp-2 leading-snug'>
                        {product.productName}
                      </CardTitle>
                    </Link>
                    <CardDescription className='line-clamp-1 text-slate-500 text-sm mb-4'>
                      {product.productDescription || 'Số lượng có hạn, nhanh tay!'}
                    </CardDescription>

                    <div className='mt-auto pt-4 border-t border-slate-100 flex items-end justify-between'>
                      <div className='flex flex-col'>
                        <span className="text-sm text-slate-400 line-through font-medium">${(product.price || 0).toFixed(2)}</span>
                        <span className="text-2xl font-black text-red-600">${finalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className='text-center mt-12'
        >
          <Link href='/site/products'>
            <Button size='lg' variant='outline' className='rounded-full border-2 border-white/40 bg-white/10 text-white hover:bg-white hover:text-red-600 px-8 py-6 text-base font-semibold transition-all backdrop-blur-sm'>
              Xem tất cả khuyến mãi
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

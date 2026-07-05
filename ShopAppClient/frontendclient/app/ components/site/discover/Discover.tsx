'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const fallbackBanners = [
  {
    id: 1,
    title: 'Khám Phá Phong Cách',
    subtitle: 'Định Hình Đẳng Cấp',
    description: 'Bộ sưu tập mới nhất với thiết kế tinh xảo, chất liệu cao cấp mang đến cho bạn trải nghiệm tuyệt vời nhất.',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2000&auto=format&fit=crop',
    badge: 'MỚI RA MẮT',
  },
  {
    id: 2,
    title: 'Công Nghệ Tiên Phong',
    subtitle: 'Cuộc Sống Thông Minh',
    description: 'Trang bị cho mình những thiết bị điện tử tối tân, giúp bạn vượt qua mọi giới hạn trong công việc và giải trí.',
    image: 'https://images.unsplash.com/photo-1550009158-9fd373285ed2?q=80&w=2000&auto=format&fit=crop',
    badge: 'THỊNH HÀNH',
  },
  {
    id: 3,
    title: 'Nội Thất Sang Trọng',
    subtitle: 'Không Gian Đẳng Cấp',
    description: 'Biến ngôi nhà của bạn thành một tác phẩm nghệ thuật với những món đồ nội thất được chế tác tỉ mỉ.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000&auto=format&fit=crop',
    badge: 'ĐỘC QUYỀN',
  },
];

export default function BannerSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [banners, setBanners] = useState(fallbackBanners);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/public/banners/section/DISCOVER_SLIDER`);
        if (response.data && response.data.length > 0) {
          setBanners(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch banners, using fallback:', error);
      }
    };
    fetchBanners();
  }, []);

  // Auto-play
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const prevSlide = () =>
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  const nextSlide = () =>
    setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));

  const currentBanner = banners[currentIndex];

  return (
    <section className='relative overflow-hidden bg-slate-50 min-h-[600px] lg:min-h-[700px] flex items-center'>
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] rounded-full bg-indigo-100/50 blur-3xl opacity-50 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[600px] h-[600px] rounded-full bg-blue-100/50 blur-3xl opacity-50 pointer-events-none"></div>

      <div className='container relative z-10 mx-auto px-4 py-12 lg:py-0'>
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className='grid gap-12 lg:grid-cols-2 lg:gap-16 items-center'
          >
            {/* Text Section */}
            <div className='space-y-6 lg:space-y-8 order-2 lg:order-1'>
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}
                className='inline-block'
              >
                <Badge className='px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold tracking-widest uppercase border-0 shadow-sm'>
                  {currentBanner.badge || 'NỔI BẬT'}
                </Badge>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
                className='text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl leading-[1.1]'
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
                  {currentBanner.title}
                </span>
                <span className='block text-slate-800 mt-2 font-black'>
                  {currentBanner.subtitle}
                </span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
                className='text-lg sm:text-xl text-slate-600 max-w-xl leading-relaxed'
              >
                {currentBanner.description}
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}
                className='flex flex-col sm:flex-row gap-4 pt-4'
              >
                <Link href='/site/products'>
                  <Button size='lg' className='w-full sm:w-auto text-base px-8 py-6 h-auto bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 rounded-full group'>
                    Mua sắm ngay
                    <ArrowRight className='ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform' />
                  </Button>
                </Link>
                <Link href='/site/products'>
                  <Button
                    size='lg'
                    variant='outline'
                    className='w-full sm:w-auto text-base px-8 py-6 h-auto border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-full'
                  >
                    Xem bộ sưu tập
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Image Section */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1, duration: 0.6 }}
              className='relative order-1 lg:order-2 h-[400px] sm:h-[500px] lg:h-[600px] xl:h-[650px]'
            >
              <div className='relative h-full w-full rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-black/5 group'>
                <img
                  src={currentBanner.image}
                  alt={currentBanner.title}
                  className='h-full w-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out'
                />
                {/* Overlay gradient for image */}
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/20 to-transparent"></div>
              </div>

              {/* Slider Controls */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/90 backdrop-blur-md p-2 rounded-full shadow-lg border border-slate-100">
                <button
                  onClick={prevSlide}
                  className='p-3 rounded-full hover:bg-slate-100 text-slate-700 transition-colors'
                >
                  <ChevronLeft className='h-5 w-5' />
                </button>
                
                {/* Dots indicator */}
                <div className='flex justify-center gap-2 px-2'>
                  {banners.map((_, idx) => (
                    <span
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-2 rounded-full cursor-pointer transition-all duration-300 ${
                        currentIndex === idx ? 'w-8 bg-indigo-600' : 'w-2 bg-slate-300 hover:bg-indigo-400'
                      }`}
                    ></span>
                  ))}
                </div>

                <button
                  onClick={nextSlide}
                  className='p-3 rounded-full hover:bg-slate-100 text-slate-700 transition-colors'
                >
                  <ChevronRight className='h-5 w-5' />
                </button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

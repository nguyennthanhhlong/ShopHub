'use client';

import React, { useEffect, useState } from 'react';
import { CategoryCard } from '@/components/category-card';
import { Category } from '@/types/types';
import { getCategories } from '@/services/categoryService';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CategoryComponent() {
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        if (data && Array.isArray(data)) {
          setAvailableCategories(data);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  return (
    <section id='categories' className='py-20 md:py-32 bg-white relative overflow-hidden'>
      {/* Subtle Background Elements */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-60"></div>
      
      <div className='container relative mx-auto px-4 z-10'>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className='text-center mb-16'
        >
          <h2 className='text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight'>
            Khám phá <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Danh Mục</span>
          </h2>
          <p className='text-lg text-slate-500 max-w-2xl mx-auto font-medium'>
            Lựa chọn những dòng sản phẩm phù hợp nhất với phong cách của riêng bạn
          </p>
        </motion.div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'>
          {availableCategories.map((category: any, idx: number) => (
            <motion.div
              key={category.categoryId}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <Link
                href={`site/products?category=${category.categoryId}`}
                passHref
                className="block h-full transition-transform duration-300 hover:-translate-y-2"
              >
                <CategoryCard id={category.categoryId} name={category.categoryName} image={category.image} />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

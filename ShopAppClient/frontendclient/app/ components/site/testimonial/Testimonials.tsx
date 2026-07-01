'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import axios from 'axios';
import { Spinner } from '@/components/ui/spinner';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  rating: number;
  image?: string;
  initials?: string;
  active: boolean;
  sortOrder: number;
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8080/api/public/testimonials');
        if (response.data && Array.isArray(response.data)) {
          const dataWithInitials = response.data.map((item: any) => {
            const names = item.name ? item.name.split(' ') : ['U'];
            let initials = '';
            if (names.length >= 2) {
              initials = names[0][0] + names[names.length - 1][0];
            } else if (names.length === 1) {
              initials = names[0].substring(0, 2);
            }
            return {
              ...item,
              initials: initials.toUpperCase()
            };
          });
          setTestimonials(dataWithInitials);
        }
      } catch (error) {
        console.error('Failed to fetch testimonials:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  return (
    <section className='py-20 md:py-32 bg-slate-50 relative overflow-hidden'>
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-50/80 to-transparent pointer-events-none z-0"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-100 rounded-full blur-[100px] opacity-40 pointer-events-none z-0"></div>

      <div className='container mx-auto px-4 relative z-10'>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className='text-center mb-16'
        >
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-full mb-4 text-indigo-600">
            <Quote className="w-6 h-6" />
          </div>
          <h2 className='text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight'>
            Khách Hàng <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Nói Gì Về Chúng Tôi</span>
          </h2>
          <p className='text-lg text-slate-500 max-w-2xl mx-auto font-medium'>
            Hơn 10,000+ khách hàng đã tin tưởng và trải nghiệm. Dưới đây là những đánh giá chân thực nhất.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : testimonials.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-16 bg-white rounded-3xl border border-slate-100 border-dashed max-w-2xl mx-auto shadow-sm"
          >
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className='text-slate-500 text-lg'>Chưa có lời nhận xét nào. Hãy trở thành người đầu tiên!</p>
          </motion.div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto'>
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={testimonial.id || idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-[2rem] bg-white relative">
                  {/* Quote icon watermark */}
                  <Quote className="absolute top-6 right-6 w-12 h-12 text-slate-50 opacity-50 rotate-180" />
                  
                  <CardContent className="p-8 pt-10 flex flex-col h-full relative z-10">
                    <div className="flex gap-1 mb-6">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-5 h-5 ${i < (testimonial.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} 
                        />
                      ))}
                    </div>
                    
                    <p className="text-slate-600 text-lg leading-relaxed flex-1 italic mb-8">
                      "{testimonial.content}"
                    </p>
                    
                    <div className="flex items-center gap-4 mt-auto">
                      {testimonial.image ? (
                        <img 
                          src={testimonial.image} 
                          alt={testimonial.name} 
                          className="w-14 h-14 rounded-full border-2 border-indigo-100 object-cover shadow-sm"
                          onError={(e: any) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                          {testimonial.initials || 'U'}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-slate-900">{testimonial.name || 'Khách hàng'}</h4>
                        <p className="text-sm font-medium text-slate-500">{testimonial.role || 'Khách hàng'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

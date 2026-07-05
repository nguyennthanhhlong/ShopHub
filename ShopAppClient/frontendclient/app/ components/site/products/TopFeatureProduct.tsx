'use client';
import { getImageUrl } from '@/lib/utils';


import { addToCart } from '@/app/utils/cartUtils';
import { computeBadge } from '@/app/utils/reviewBadgeStar';
import { SearchBar } from '@/components/search-bar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { getTopProducts } from '@/services/productService';
import { Product } from '@/types/types';
import { ArrowRight, ShoppingCart, Star } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import { WishlistButton } from '@/components/wishlist-button';

export default function ProductListAndSearch() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const router = useRouter();

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/site/products?query=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/site/products');
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await getTopProducts();
        setProducts(res.data.content);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Đã có lỗi xảy ra');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div className="py-32 flex justify-center"><Spinner /></div>;
  if (error) return <div className='py-32 text-center text-red-500 font-medium'>{error}</div>;

  return (
    <>
      {/* Lớp chứa Search nổi bật */}
      <section className='relative py-20 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white'>
        {/* Abstract background shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500 rounded-full blur-[100px] opacity-20"></div>
          <div className="absolute bottom-0 left-10 w-72 h-72 bg-blue-500 rounded-full blur-[80px] opacity-20"></div>
        </div>

        <div className='container relative z-10 mx-auto px-4 max-w-4xl'>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className='text-center mb-10'
          >
            <h2 className='text-4xl md:text-5xl font-extrabold mb-4 tracking-tight text-white'>
              Bạn đang tìm kiếm gì?
            </h2>
            <p className='text-lg text-indigo-200/80 max-w-2xl mx-auto'>
              Gõ từ khóa để khám phá ngay hàng ngàn sản phẩm cao cấp của chúng tôi
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/10 backdrop-blur-md p-2 rounded-[2rem] border border-white/20 shadow-2xl"
          >
            <div className="bg-white rounded-full p-2">
              <SearchBar onSearch={handleSearch} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Top Featured Products */}
      <section id='products' className='py-20 md:py-32 bg-slate-50 relative'>
        <ToastContainer />
        <div className='container mx-auto px-4'>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className='text-center mb-16'
          >
            <h2 className='text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight'>
              Sản Phẩm <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Nổi Bật</span>
            </h2>
            <p className='text-lg text-slate-500 max-w-2xl mx-auto font-medium'>
              Những lựa chọn hàng đầu được yêu thích nhất bởi khách hàng
            </p>
          </motion.div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'>
            {products.map((product, idx) => {
              const hasDiscount = product.discount > 0;
              const discountPercent = product.discount || 0;
              const finalPrice = hasDiscount ? product.price * (1 - discountPercent / 100) : product.price;
              const { badgeText, badgeColor } = computeBadge(0);

              return (
                <motion.div
                  key={product.productId}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                >
                  <Card
                    draggable={true}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/json', JSON.stringify(product));
                    }}
                    className='h-full group overflow-hidden border-0 shadow-md hover:shadow-2xl transition-all duration-300 rounded-2xl bg-white flex flex-col cursor-grab active:cursor-grabbing'
                  >
                    <div className='relative aspect-square overflow-hidden bg-slate-100'>
                      <Link href={`/site/products/${product.productId}`}>
                        <img
                          src={getImageUrl(product.image)}
                          alt={product.productName}
                          className='h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out'
                          onError={(e: any) => { e.target.src = '/placeholder.png' }}
                        />
                      </Link>

                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {hasDiscount && (
                          <Badge className="bg-red-500 hover:bg-red-600 text-white font-bold border-0 px-3 py-1 shadow-sm">
                            -{discountPercent}%
                          </Badge>
                        )}
                        {badgeText && (
                          <Badge className={`${badgeColor} text-white font-semibold border-0 px-3 py-1 shadow-sm`}>
                            {badgeText}
                          </Badge>
                        )}
                      </div>

                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <WishlistButton product={product} />
                      </div>

                      <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-gradient-to-t from-black/50 to-transparent">
                        <Button 
                          onClick={() => handleAddToCart(product)}
                          className="w-full bg-white text-indigo-900 hover:bg-indigo-50 font-bold shadow-lg rounded-xl"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" /> Thêm vào giỏ
                        </Button>
                      </div>
                    </div>

                    <CardContent className='p-5 flex-1 flex flex-col'>
                      <Link href={`/site/products/${product.productId}`} className="group-hover:text-indigo-600 transition-colors">
                        <CardTitle className='text-lg mb-2 line-clamp-2 leading-snug'>
                          {product.productName}
                        </CardTitle>
                      </Link>
                      <CardDescription className='line-clamp-2 text-slate-500 text-sm mb-4'>
                        {product.productDescription || 'Chưa có mô tả chi tiết'}
                      </CardDescription>

                      <div className='mt-auto pt-4 border-t border-slate-100 flex items-center justify-between'>
                        <div className='flex flex-col'>
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
            transition={{ duration: 0.5, delay: 0.2 }}
            className='text-center mt-16'
          >
            <Link href='/site/products'>
              <Button size='lg' variant='outline' className='rounded-full border-2 border-slate-200 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 px-8 py-6 text-base font-semibold transition-all'>
                Xem tất cả sản phẩm
                <ArrowRight className='ml-2 h-5 w-5' />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Star, ArrowLeft, ShoppingCart, MessageSquare, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { Product } from '@/types/types';
import { Spinner } from '@/components/ui/spinner';
import {
  getProductsByCategoryId,
  getSingleProductById,
} from '@/services/productService';
import { computeBadge } from '@/app/utils/reviewBadgeStar';
import Link from 'next/link';
import { addToCart, updateCartQuantity } from '@/app/utils/cartUtils';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '@/context/authContext';
import { getReviewsByProduct, addReview, ReviewDTO } from '@/services/reviewService';
import { WishlistButton } from '@/components/wishlist-button';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [quantity, setQuantity] = useState(1);
  
  const { user, token } = useAuth();
  const [reviews, setReviews] = useState<ReviewDTO[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        if (id === undefined) {
          throw new Error('Missing id parameter');
        }
        const numericId = Number(id);
        const res = await getSingleProductById(numericId);
        setProduct(res.data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    
    const fetchReviews = async () => {
      try {
        const res = await getReviewsByProduct(Number(id));
        setReviews(res.data);
      } catch (error) {
        console.error("Failed to fetch reviews", error);
      }
    };
    fetchReviews();
  }, [id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token) {
      toast.info('Vui lòng đăng nhập để gửi đánh giá');
      return;
    }
    if (!comment.trim()) {
      toast.warning('Vui lòng nhập nội dung đánh giá');
      return;
    }
    try {
      setSubmitting(true);
      const res = await addReview(Number(id), user.email, { rating, comment }, token);
      setReviews([res.data, ...reviews]);
      setComment('');
      setRating(5);
      toast.success('Đánh giá của bạn đã được gửi thành công!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (!product?.categoryId) return;
        const res = await getProductsByCategoryId(product.categoryId);
        setProducts(res.data.content);
      } catch (error) {
        console.error('An error occurred fetching recommendations', error);
      }
    };
    if (product) {
      fetchProducts();
    }
  }, [product, product?.categoryId]);

  const handleAddToCart = () => {
    if (product) {
      updateCartQuantity(product, quantity);
    }
  };

  if (loading) return <div className='h-screen flex items-center justify-center bg-slate-50'><Spinner /></div>;
  if (error) return <div className='h-screen flex items-center justify-center text-red-500 font-bold bg-slate-50'>{error}</div>;
  if (!product) return null;

  const hasDiscount = product.discount > 0;
  const discountPercent = product.discount || 0;
  const finalPrice = hasDiscount ? product.price * (1 - discountPercent / 100) : product.price;

  return (
    <section className='min-h-screen bg-slate-50/50 pb-24'>
      <ToastContainer />
      
      {/* Decorative Background */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-indigo-50 to-transparent pointer-events-none z-0"></div>

      <div className='container mx-auto px-4 relative z-10 pt-10'>
        {/* Breadcrumb / Back */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <Button
            variant='ghost'
            onClick={() => router.back()}
            className='mb-8 flex items-center gap-2 text-slate-500 hover:text-indigo-700 bg-white shadow-sm rounded-full px-6 py-2 transition-all'
          >
            <ArrowLeft className='h-4 w-4' />
            Trở về
          </Button>
        </motion.div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-20'>
          {/* Image Section */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className='relative'
          >
            <div className="aspect-square rounded-[2.5rem] bg-white p-8 shadow-xl border border-slate-100 flex items-center justify-center relative overflow-hidden group">
              <img
                src={`http://localhost:8080/api/public/products/image/${product?.image}`}
                alt={product?.productName}
                className='max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-700'
                onError={(e: any) => { e.target.src = '/placeholder.png' }}
              />
              <div className="absolute top-6 left-6 flex flex-col gap-2">
                {hasDiscount && (
                  <Badge className="bg-red-500 hover:bg-red-600 text-white font-bold border-0 px-4 py-1.5 shadow-sm text-sm">
                    -{discountPercent}%
                  </Badge>
                )}
                {computeBadge(product!).badgeText && (
                  <Badge className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold border-0 px-4 py-1.5 shadow-sm text-sm">
                    {computeBadge(product!).badgeText}
                  </Badge>
                )}
              </div>
              <div className="absolute top-6 right-6">
                 <WishlistButton product={product} className="w-12 h-12 shadow-lg" />
              </div>
            </div>
          </motion.div>

          {/* Info Section */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col justify-center"
          >
            <div className="inline-block mb-4">
              <Badge variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50 px-4 py-1 text-sm rounded-full">
                {product.category?.categoryName || 'Sản phẩm cao cấp'}
              </Badge>
            </div>
            
            <h1 className='text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight mb-4'>
              {product?.productName}
            </h1>
            
            <div className="flex items-center gap-4 mb-8">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <span className="text-slate-500 font-medium">
                ({reviews.length} đánh giá)
              </span>
              <span className="text-slate-300">|</span>
              <span className={`font-semibold ${product.quantity > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {product.quantity > 0 ? `Còn ${product.quantity} sản phẩm` : 'Đã hết hàng'}
              </span>
            </div>

            <div className='flex items-end gap-4 mb-8 pb-8 border-b border-slate-200'>
              {hasDiscount ? (
                <>
                  <span className='text-4xl lg:text-5xl font-black text-indigo-600'>
                    ${(finalPrice * quantity).toFixed(2)}
                  </span>
                  <span className='text-2xl font-medium text-slate-400 line-through pb-1'>
                    ${((product.price || 0) * quantity).toFixed(2)}
                  </span>
                </>
              ) : (
                <span className='text-4xl lg:text-5xl font-black text-indigo-600'>
                  ${((product.price || 0) * quantity).toFixed(2)}
                </span>
              )}
            </div>

            <p className='text-lg text-slate-600 leading-relaxed mb-10'>
              {product?.productDescription}
            </p>

            <div className="flex flex-wrap items-center gap-6 mb-10">
              <div className='flex items-center bg-white border border-slate-200 rounded-full p-1 shadow-sm'>
                <Button 
                  variant='ghost' 
                  size='icon' 
                  className="rounded-full hover:bg-slate-100" 
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  disabled={product.quantity <= 0}
                >
                  −
                </Button>
                <span className='text-xl font-bold w-12 text-center text-slate-900'>
                  {product.quantity > 0 ? quantity : 0}
                </span>
                <Button 
                  variant='ghost' 
                  size='icon' 
                  className="rounded-full hover:bg-slate-100" 
                  onClick={() => setQuantity((prev) => Math.min(product.quantity, prev + 1))}
                  disabled={product.quantity <= 0 || quantity >= product.quantity}
                >
                  +
                </Button>
              </div>

              <Button
                size='lg'
                className={`flex-1 min-w-[200px] rounded-full h-14 text-lg font-bold shadow-xl transition-all ${
                  product.quantity > 0 
                    ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 text-white' 
                    : 'bg-slate-200 text-slate-500 cursor-not-allowed shadow-none'
                }`}
                onClick={handleAddToCart}
                disabled={product.quantity <= 0}
              >
                <ShoppingCart className='h-5 w-5 mr-3' /> {product.quantity > 0 ? 'Thêm vào giỏ' : 'Hết hàng'}
              </Button>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="bg-indigo-50 p-2 rounded-full"><ShieldCheck className="w-6 h-6 text-indigo-600" /></div>
                <div className="text-sm font-semibold text-slate-800">Bảo hành 12 tháng</div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="bg-blue-50 p-2 rounded-full"><Truck className="w-6 h-6 text-blue-600" /></div>
                <div className="text-sm font-semibold text-slate-800">Giao hàng hoả tốc</div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="bg-rose-50 p-2 rounded-full"><RotateCcw className="w-6 h-6 text-rose-600" /></div>
                <div className="text-sm font-semibold text-slate-800">Đổi trả 30 ngày</div>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Reviews Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
          className='mt-32'
        >
          <div className="flex items-center gap-4 mb-10">
            <MessageSquare className="w-8 h-8 text-indigo-600" />
            <h2 className='text-3xl font-extrabold text-slate-900'>Đánh giá từ khách hàng</h2>
          </div>
          
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-12'>
            <div className='lg:col-span-2 space-y-6'>
              {reviews.length > 0 ? (
                <AnimatePresence>
                  {reviews.map(review => (
                    <motion.div key={review.reviewId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <Card className='p-6 border-0 shadow-sm bg-white rounded-2xl'>
                        <div className='flex items-start gap-4'>
                          <div className='w-14 h-14 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center font-bold text-indigo-600 text-xl border-2 border-white shadow-sm'>
                            {review.userName ? review.userName.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div className='flex-1'>
                            <div className='flex justify-between items-center mb-2'>
                              <h4 className='font-bold text-slate-900 text-lg'>{review.userName || review.userEmail}</h4>
                              <span className='text-sm text-slate-400 bg-slate-50 px-3 py-1 rounded-full'>
                                {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                            <div className='flex gap-1 mb-3'>
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-4 h-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} 
                                />
                              ))}
                            </div>
                            <p className='text-slate-600 leading-relaxed text-lg'>{review.comment}</p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              ) : (
                <div className='text-center py-16 bg-white rounded-3xl border border-slate-100 border-dashed'>
                  <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className='text-slate-500 text-lg'>Chưa có đánh giá nào cho sản phẩm này.</p>
                </div>
              )}
            </div>

            <div className='lg:col-span-1'>
              <Card className='p-8 sticky top-24 border-0 shadow-xl bg-white rounded-[2rem]'>
                <h3 className='text-2xl font-bold text-slate-900 mb-6'>Viết đánh giá</h3>
                {!user ? (
                  <div className='text-center py-8'>
                    <p className='text-slate-500 mb-6'>Bạn cần đăng nhập để viết đánh giá cho sản phẩm này.</p>
                    <Button className='w-full rounded-full bg-indigo-600 hover:bg-indigo-700' onClick={() => router.push('/site/login')}>
                      Đăng nhập ngay
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReview} className='space-y-6'>
                    <div>
                      <label className='block text-sm font-bold text-slate-700 mb-3'>Chất lượng sản phẩm</label>
                      <div className='flex gap-2'>
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className='focus:outline-none hover:scale-110 transition-transform'
                          >
                            <Star className={`w-8 h-8 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className='block text-sm font-bold text-slate-700 mb-3'>Nội dung đánh giá</label>
                      <textarea
                        className='w-full p-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none resize-none transition-shadow'
                        rows={5}
                        placeholder='Chia sẻ cảm nhận của bạn về sản phẩm này...'
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                      />
                    </div>
                    <Button type='submit' className='w-full rounded-full bg-slate-900 hover:bg-slate-800 text-white h-12 text-lg font-bold shadow-lg shadow-slate-200' disabled={submitting}>
                      {submitting ? <Spinner className="w-5 h-5" /> : 'Gửi đánh giá'}
                    </Button>
                  </form>
                )}
              </Card>
            </div>
          </div>
        </motion.div>

        {/* Recommended Products */}
        {products.length > 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            className='mt-32'
          >
            <h2 className='text-3xl font-extrabold text-slate-900 mb-10 text-center'>Sản Phẩm Cùng Danh Mục</h2>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'>
              {products.filter(p => p.productId !== product.productId).slice(0, 4).map((recProduct) => {
                const hasDiscount = recProduct.discount > 0;
                const discountPercent = recProduct.discount || 0;
                const finalPrice = hasDiscount ? recProduct.price * (1 - discountPercent / 100) : recProduct.price;

                return (
                  <Card key={recProduct.productId} className='group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl bg-white flex flex-col'>
                    <div className='relative aspect-square overflow-hidden bg-slate-100'>
                      <Link href={`/site/products/${recProduct.productId}`}>
                        <img
                          src={`http://localhost:8080/api/public/products/image/${recProduct.image}`}
                          alt={recProduct.productName}
                          className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
                          onError={(e: any) => { e.target.src = '/placeholder.png' }}
                        />
                      </Link>
                      <div className="absolute top-3 right-3">
                        <WishlistButton product={recProduct} />
                      </div>
                    </div>
                    <CardContent className='p-5'>
                      <Link href={`/site/products/${recProduct.productId}`} className="group-hover:text-indigo-600 transition-colors">
                        <h3 className='text-lg font-bold mb-2 line-clamp-1'>{recProduct.productName}</h3>
                      </Link>
                      <div className='flex items-center gap-2'>
                        {hasDiscount ? (
                          <>
                            <span className="text-xl font-bold text-indigo-600">${finalPrice.toFixed(2)}</span>
                            <span className="text-sm text-slate-400 line-through">${(recProduct.price || 0).toFixed(2)}</span>
                          </>
                        ) : (
                          <span className="text-xl font-bold text-indigo-600">${(recProduct.price || 0).toFixed(2)}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

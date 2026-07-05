'use client';
import { getImageUrl } from '@/lib/utils';


import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Filter, ShoppingCart, Loader2, Star, Box, ArrowRight, ArrowLeft } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { getProducts } from '@/services/productService';
import { Category, Product } from '@/types/types';
import { computeBadge } from '@/app/utils/reviewBadgeStar';
import { getCategories } from '@/services/categoryService';
import { useSearchParams } from 'next/navigation';
import { addToCart } from '@/app/utils/cartUtils';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from 'framer-motion';
import { WishlistButton } from '@/components/wishlist-button';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialQuery = searchParams.get('query') || '';

  const [category, setCategory] = useState(initialCategory);
  const [query, setQuery] = useState(initialQuery);
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [sortBy, setSortBy] = useState('none');
  const [page, setPage] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [isFilterOrSortChanged, setIsFilterOrSortChanged] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  
  const [headerContent, setHeaderContent] = useState({
    title: 'Khám Phá Sản Phẩm',
    subtitle: 'Tìm kiếm những sản phẩm chất lượng cao phù hợp với bạn.'
  });

  const pageSize = 8;

  const categoryOptions = useMemo(() => {
    const list = availableCategories.map((c) => ({
      value: c.categoryId.toString(),
      label: c.categoryName,
    }));
    return [{ value: 'all', label: 'Tất cả danh mục' }, ...list];
  }, [availableCategories]);

  useEffect(() => {
    setMounted(true);
    const fetchInitialData = async () => {
      try {
        const [catData, headerData] = await Promise.all([
          getCategories(),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/public/banners/section/PRODUCTS_HEADER`).catch(() => null)
        ]);
        
        if (catData && Array.isArray(catData)) setAvailableCategories(catData);
        if (headerData?.data?.length > 0) {
          setHeaderContent({
            title: headerData.data[0].title || headerContent.title,
            subtitle: headerData.data[0].subtitle || headerContent.subtitle
          });
        }
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      }
    };
    fetchInitialData();
  }, []);

  const getSortParams = () => {
    let sortField = 'productId';
    let sortOrder = 'ASC';
    if (sortBy === 'price-asc') {
      sortField = 'price';
      sortOrder = 'ASC';
    } else if (sortBy === 'price-desc') {
      sortField = 'price';
      sortOrder = 'DESC';
    }
    return { sortField, sortOrder };
  };

  const fetchProducts = useCallback(async () => {
    const { sortField, sortOrder } = getSortParams();
    const apiParams = {
      keyword: query.trim() || undefined,
      pageNumber: page.toString(),
      pageSize: pageSize.toString(),
      sortBy: sortField,
      sortOrder: sortOrder,
      categoryId: category !== 'all' ? category : '0',
    };

    setLoading(true);
    try {
      const response = await getProducts(apiParams);
      if (!response || !response.data) {
        setProducts([]);
        setTotalPages(1);
        return;
      }
      const json = response.data;
      setProducts(json.content || []);
      setTotalPages(Math.ceil((json.totalElements || 0) / pageSize));
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
      setLoadingInitial(false);
    }
  }, [query, category, sortBy, page]);

  useEffect(() => {
    if (isFilterOrSortChanged && page !== 1) {
      setPage(1);
      setIsFilterOrSortChanged(false);
      return;
    }
    fetchProducts();
    if (page === 1) setIsFilterOrSortChanged(false);
  }, [query, category, sortBy, page, fetchProducts, isFilterOrSortChanged]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <ToastContainer />
      
      {/* Header Hero Section */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20 [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            {headerContent.title}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg md:text-xl text-indigo-100/90"
          >
            {headerContent.subtitle}
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          
          <div className="flex-1 w-full relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <Input
              placeholder="Tìm kiếm sản phẩm..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setIsFilterOrSortChanged(true); }}
              className="pl-12 h-14 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-indigo-600 focus-visible:bg-white transition-all text-base"
            />
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            <Select 
              value={category} 
              onValueChange={(v) => { setCategory(v); setIsFilterOrSortChanged(true); }}
            >
              <SelectTrigger className="w-full md:w-[200px] h-14 rounded-xl bg-slate-50 border-slate-200">
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {categoryOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value} className="cursor-pointer">{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={sortBy} 
              onValueChange={(v) => { setSortBy(v); setIsFilterOrSortChanged(true); }}
            >
              <SelectTrigger className="w-full md:w-[200px] h-14 rounded-xl bg-slate-50 border-slate-200">
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="none" className="cursor-pointer">Mặc định</SelectItem>
                <SelectItem value="price-asc" className="cursor-pointer">Giá: Thấp → Cao</SelectItem>
                <SelectItem value="price-desc" className="cursor-pointer">Giá: Cao → Thấp</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-12">
        {loadingInitial ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
            <p className="text-slate-500 font-medium">Đang tải sản phẩm...</p>
          </div>
        ) : (
          <>
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            ) : products.length > 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              >
                {products.map((product, idx) => {
                  const hasDiscount = product.discount > 0;
                  const discountPercent = product.discount || 0;
                  const finalPrice = hasDiscount ? product.price * (1 - discountPercent / 100) : product.price;
                  const { badgeText, badgeColor } = computeBadge(product); 

                  return (
                    <motion.div 
                      key={product.productId}
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                    >
                      <Card 
                        draggable={true}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('application/json', JSON.stringify(product));
                        }}
                        className="h-full group overflow-hidden border-0 shadow-md hover:shadow-2xl transition-all duration-300 rounded-2xl bg-white flex flex-col cursor-grab active:cursor-grabbing"
                      >
                        <div className="relative aspect-square overflow-hidden bg-slate-100">
                          <Link href={`/site/products/${product.productId}`}>
                            <img
                              src={getImageUrl(product.image)}
                              alt={product.productName}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
                            {product.quantity <= 0 ? (
                              <Badge className="bg-slate-800 text-white font-semibold border-0 px-3 py-1 shadow-sm">
                                Hết hàng
                              </Badge>
                            ) : product.quantity <= 5 ? (
                              <Badge className="bg-orange-500 text-white font-semibold border-0 px-3 py-1 shadow-sm">
                                Chỉ còn {product.quantity}
                              </Badge>
                            ) : null}
                          </div>

                          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <WishlistButton product={product} />
                          </div>
                          
                          <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-gradient-to-t from-black/50 to-transparent">
                            <Button 
                              onClick={() => {
                                if (product.quantity > 0) handleAddToCart(product);
                              }}
                              disabled={product.quantity <= 0}
                              className={`w-full font-bold shadow-lg rounded-xl ${
                                product.quantity > 0 
                                  ? 'bg-white text-indigo-900 hover:bg-indigo-50' 
                                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              }`}
                            >
                              <ShoppingCart className="w-4 h-4 mr-2" /> {product.quantity > 0 ? 'Thêm vào giỏ' : 'Hết hàng'}
                            </Button>
                          </div>
                        </div>

                        <CardContent className="p-5 flex-1 flex flex-col">
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-1 rounded">
                              {availableCategories.find(c => c.categoryId === product.category?.categoryId)?.categoryName || 'Sản phẩm'}
                            </p>
                          </div>
                          
                          <Link href={`/site/products/${product.productId}`} className="group-hover:text-indigo-600 transition-colors">
                            <CardTitle className="text-lg mb-2 line-clamp-2 leading-snug">{product.productName}</CardTitle>
                          </Link>
                          
                          <CardDescription className="line-clamp-2 text-slate-500 text-sm mb-4">
                            {product.description || 'Chưa có mô tả chi tiết'}
                          </CardDescription>

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
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <Box className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Không tìm thấy sản phẩm</h3>
                <p className="text-slate-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn.</p>
                <Button onClick={() => { setQuery(''); setCategory('all'); setIsFilterOrSortChanged(true); }} variant="outline" className="mt-6 rounded-full">
                  Xóa bộ lọc
                </Button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && !loading && products.length > 0 && (
              <div className="flex justify-center items-center gap-2 mt-16">
                <Button 
                  variant="outline" 
                  onClick={() => handlePageChange(page - 1)} 
                  disabled={page === 1}
                  className="rounded-full w-10 h-10 p-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const p = i + 1;
                    if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                      return (
                        <Button 
                          key={p} 
                          variant={page === p ? 'default' : 'outline'}
                          onClick={() => handlePageChange(p)}
                          className={`rounded-full w-10 h-10 p-0 font-semibold ${page === p ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
                        >
                          {p}
                        </Button>
                      );
                    }
                    if (p === page - 2 || p === page + 2) {
                      return <span key={p} className="flex items-center justify-center w-10 text-slate-400">...</span>;
                    }
                    return null;
                  })}
                </div>

                <Button 
                  variant="outline" 
                  onClick={() => handlePageChange(page + 1)} 
                  disabled={page === totalPages}
                  className="rounded-full w-10 h-10 p-0"
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

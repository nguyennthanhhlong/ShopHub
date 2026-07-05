'use client';
import { getImageUrl } from '@/lib/utils';


import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Product } from '@/types/types';
import { Trash2, Plus, Minus, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface CartItemProps {
  item: {
    product: Product;
    quantity: number;
  };
  onUpdateQuantity: (product: Product, quantity: number) => void;
  onRemove: (product: Product) => void;
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const { product, quantity } = item;

  const hasDiscount = product.discount > 0;
  const discountPercent = product.discount || 0;
  const finalPrice = hasDiscount ? (product.price || 0) * (1 - discountPercent / 100) : (product.price || 0);
  const stock = product.quantity || 0;

  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}>
      <Card className={`relative flex flex-col sm:flex-row items-start sm:items-center gap-6 p-5 border-0 shadow-sm hover:shadow-md transition-shadow rounded-2xl bg-white overflow-hidden ${stock <= 0 ? 'opacity-70' : ''}`}>
        
        {/* Out of stock overlay */}
        {stock <= 0 && (
          <div className="absolute inset-0 bg-slate-50/50 z-10 flex items-center justify-center backdrop-blur-[1px]">
            <div className="bg-white/90 px-4 py-2 rounded-full border border-red-200 shadow-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="font-bold text-red-600">Sản phẩm đã hết hàng</span>
            </div>
          </div>
        )}

        <div className='w-full sm:w-32 h-32 flex-shrink-0 bg-slate-100 rounded-xl overflow-hidden relative'>
          <Link href={`/site/products/${product.productId}`}>
            <img
              src={getImageUrl(product.image)}
              alt={product.productName}
              className='w-full h-full object-cover hover:scale-110 transition-transform duration-500'
              onError={(e: any) => { e.target.src = 'https://placehold.co/150x150/e2e8f0/94a3b8?text=No+Image' }}
            />
          </Link>
          {hasDiscount && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-md shadow-sm">
              -{discountPercent}%
            </div>
          )}
        </div>

        <div className='flex-1 w-full'>
          <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2'>
            <Link href={`/site/products/${product.productId}`}>
              <h3 className='text-lg font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-2 pr-4'>
                {product.productName}
              </h3>
            </Link>
            <div className='text-right mt-2 sm:mt-0'>
              <p className='text-lg font-bold text-indigo-600'>
                ${finalPrice.toFixed(2)}
              </p>
              {hasDiscount && (
                <p className='text-sm text-slate-400 line-through'>
                  ${(product.price || 0).toFixed(2)}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 gap-4">
            <div className='flex items-center gap-3 bg-slate-50 p-1 rounded-full border border-slate-100 w-fit relative z-20'>
              <Button
                size='icon'
                variant='ghost'
                className="h-8 w-8 rounded-full hover:bg-white hover:shadow-sm"
                onClick={() => onUpdateQuantity(product, Math.max(quantity - 1, 1))}
                disabled={stock <= 0}
              >
                <Minus className='h-4 w-4' />
              </Button>

              <span className='text-base font-bold w-6 text-center text-slate-800'>
                {quantity}
              </span>

              <Button
                size='icon'
                variant='ghost'
                className="h-8 w-8 rounded-full hover:bg-white hover:shadow-sm"
                onClick={() => onUpdateQuantity(product, quantity + 1)}
                disabled={stock <= 0 || quantity >= stock}
              >
                <Plus className='h-4 w-4' />
              </Button>
            </div>
            
            <div className="flex items-center justify-between w-full sm:w-auto relative z-20">
              <p className='text-xl font-black text-slate-900 sm:hidden'>
                ${(finalPrice * quantity).toFixed(2)}
              </p>
              <Button
                variant='ghost'
                onClick={() => onRemove(product)}
                className='text-slate-400 hover:text-red-500 hover:bg-red-50 px-3 h-10 rounded-xl transition-colors flex items-center gap-2'
              >
                <Trash2 className='h-4 w-4' />
                <span className="text-sm font-medium">Xóa</span>
              </Button>
            </div>
          </div>
          
          {stock > 0 && stock <= 5 && (
            <p className="text-xs font-semibold text-orange-500 mt-3 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Chỉ còn {stock} sản phẩm trong kho!
            </p>
          )}
        </div>

        <div className='hidden sm:flex flex-col items-end gap-2 pl-4 border-l border-slate-100 min-w-[120px]'>
          <p className="text-sm font-medium text-slate-400">Thành tiền</p>
          <p className='text-2xl font-black text-slate-900'>
            ${(finalPrice * quantity).toFixed(2)}
          </p>
        </div>
      </Card>
    </motion.div>
  );
}

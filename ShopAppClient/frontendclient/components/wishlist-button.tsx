'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/types/types';
import { addToWishlist, removeFromWishlist, isInWishlist } from '@/app/utils/wishlistUtils';
import { toast } from 'react-toastify';

interface WishlistButtonProps {
  product: Product;
  className?: string;
}

export function WishlistButton({ product, className = '' }: WishlistButtonProps) {
  const [isWished, setIsWished] = useState(false);

  useEffect(() => {
    setIsWished(isInWishlist(product.productId));
    
    // Listen for cross-component wishlist updates
    const handleWishlistUpdate = () => {
      setIsWished(isInWishlist(product.productId));
    };
    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    return () => window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
  }, [product.productId]);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isWished) {
      removeFromWishlist(product.productId);
      toast.info(`Đã xoá ${product.productName} khỏi danh sách yêu thích`);
    } else {
      addToWishlist(product);
      toast.success(`Đã thêm ${product.productName} vào danh sách yêu thích!`);
    }
  };

  return (
    <Button 
      size="icon" 
      variant="secondary" 
      className={`rounded-full w-10 h-10 shadow-sm border-0 transition-colors ${
        isWished 
          ? 'bg-red-50 text-red-500 hover:bg-red-100' 
          : 'bg-white/90 text-slate-400 hover:text-red-500 hover:bg-red-50'
      } ${className}`}
      onClick={toggleWishlist}
    >
      <Heart className={`w-5 h-5 ${isWished ? 'fill-current' : ''}`} />
    </Button>
  );
}

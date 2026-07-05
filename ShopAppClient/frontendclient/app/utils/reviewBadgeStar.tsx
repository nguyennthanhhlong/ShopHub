import { Product } from '@/types/types';

const computeBadge = (product: Product | any) => {
  if (product && typeof product === 'object') {
    if ((product.specialPrice && product.specialPrice < product.price) || product.discount > 0) {
      return { badgeText: 'SALE', badgeColor: 'bg-red-500' };
    }
  }
  return { badgeText: 'New', badgeColor: 'bg-blue-500' };
};

export { computeBadge };

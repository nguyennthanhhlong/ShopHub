import { Product } from '@/types/types';

const computeBadge = (product: Product) => {
  if (product.specialPrice < product.price) return 'SALE';
  return 'New';
};

export { computeBadge };

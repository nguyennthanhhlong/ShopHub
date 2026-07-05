'use client';
import { getImageUrl } from '@/lib/utils';


import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getProducts } from '@/services/productService';
import { Product } from '@/types/types';
import Link from 'next/link';

interface SearchBarProps {
  onSearch?: (query: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Xử lý click outside để đóng dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Debounce live search 300ms
    const timer = setTimeout(async () => {
      if (query.trim()) {
        setIsLoading(true);
        setShowDropdown(true);
        try {
          const res = await getProducts({ keyword: query, pageSize: 5 });
          setResults(res.data?.content || []);
        } catch (error) {
          console.error("Lỗi khi tìm kiếm", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && query) {
      onSearch(query);
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setShowDropdown(false);
  };

  return (
    <form onSubmit={handleSearch} className='w-full mx-auto'>
      <div className='relative' ref={wrapperRef}>
        <Search className='absolute left-4 top-3.5 h-5 w-5 text-slate-400' />
        <Input
          type='text'
          placeholder='Tìm kiếm sản phẩm...'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (query.trim()) setShowDropdown(true); }}
          className='pl-11 pr-11 h-12 relative z-10 text-slate-900 placeholder:text-slate-400 bg-transparent border-none focus-visible:ring-0 text-base'
        />
        {isLoading ? (
          <Loader2 className='absolute right-4 top-3.5 h-5 w-5 text-slate-400 animate-spin z-10' />
        ) : query ? (
          <button
            type='button'
            onClick={handleClear}
            className='absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 z-10'
          >
            <X className='h-5 w-5' />
          </button>
        ) : null}

        {/* Live Search Dropdown */}
        {showDropdown && (
          <div className='absolute top-full left-0 right-0 mt-2 bg-white rounded-md shadow-lg border border-slate-200 z-50 overflow-hidden'>
            {results.length > 0 ? (
              <div className='max-h-96 overflow-y-auto'>
                {results.map((product) => (
                  <Link 
                    href={`/site/products/${product.productId}`} 
                    key={product.productId}
                    onClick={() => setShowDropdown(false)}
                  >
                    <div className='flex items-center gap-3 p-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors'>
                      <img 
                        src={getImageUrl(product.image)}
                        alt={product.productName}
                        className='w-12 h-12 object-cover rounded-md flex-shrink-0'
                      />
                      <div className='flex-1 min-w-0'>
                        <h4 className='text-sm font-semibold text-slate-900 truncate'>{product.productName}</h4>
                        <p className='text-xs text-slate-500 truncate'>{product.productDescription}</p>
                      </div>
                      <div className='font-bold text-slate-900 text-sm'>
                        ${(product.specialPrice && product.specialPrice > 0 ? product.specialPrice : product.price || 0).toFixed(0)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className='p-4 text-center text-sm text-slate-500'>
                {isLoading ? 'Đang tìm kiếm...' : 'Không tìm thấy sản phẩm nào'}
              </div>
            )}
          </div>
        )}
      </div>
    </form>
  );
}

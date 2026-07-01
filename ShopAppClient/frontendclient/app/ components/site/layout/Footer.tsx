import { ShoppingCart } from 'lucide-react';
import React from 'react';

export default function Footer() {
  return (
    <footer className='bg-white border-t py-12'>
      <div className='container mx-auto px-4'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-8 mb-8'>
          <div className='space-y-4'>
            <div className='flex items-center space-x-2'>
              <ShoppingCart className='h-6 w-6 text-slate-900' />
              <span className='text-xl font-bold text-slate-900'>ShopHub</span>
            </div>
            <p className='text-sm text-slate-600'>
              Your destination for premium products and exceptional shopping
              experience.
            </p>
          </div>
          <div>
            <h3 className='font-semibold text-slate-900 mb-4'>Shop</h3>
            <ul className='space-y-2 text-sm text-slate-600'>
              <li>
                <a href='#' className='hover:text-slate-900 transition-colors'>
                  All Products
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-slate-900 transition-colors'>
                  New Arrivals
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-slate-900 transition-colors'>
                  Best Sellers
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-slate-900 transition-colors'>
                  Sale
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className='font-semibold text-slate-900 mb-4'>Support</h3>
            <ul className='space-y-2 text-sm text-slate-600'>
              <li>
                <a href='#' className='hover:text-slate-900 transition-colors'>
                  Help Center
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-slate-900 transition-colors'>
                  Shipping Info
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-slate-900 transition-colors'>
                  Returns
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-slate-900 transition-colors'>
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className='font-semibold text-slate-900 mb-4'>Company</h3>
            <ul className='space-y-2 text-sm text-slate-600'>
              <li>
                <a href='#' className='hover:text-slate-900 transition-colors'>
                  About Us
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-slate-900 transition-colors'>
                  Careers
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-slate-900 transition-colors'>
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-slate-900 transition-colors'>
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className='border-t pt-8 text-center text-sm text-slate-600'>
          <p>&copy; 2025 ShopHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

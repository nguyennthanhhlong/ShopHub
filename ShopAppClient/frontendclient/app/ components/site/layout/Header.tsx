'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Menu, X, User, LogOut, Heart } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { getCart } from '@/app/utils/cartUtils';
import { CartItemDetail } from '@/types/types';
import { useAuth } from '@/context/authContext'; // ✅ import context
import Link from 'next/link';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItemDetail[]>([]);

  const router = useRouter();
  const { user, logoutUser } = useAuth(); // ✅ lấy user & hàm logout

  useEffect(() => {
    const loadCart = () => {
      const stored = getCart();
      const formatted = stored.map((item) => ({
        id: item.product.productId,
        name: item.product.productName,
        specialPrice: item.product.specialPrice && item.product.specialPrice > 0 ? item.product.specialPrice : item.product.price || 0,
        image: item.product.image,
        quantity: item.quantity,
      }));
      setCartItems(formatted);
    };

    loadCart();
    window.addEventListener('cart-updated', loadCart);
    window.addEventListener('storage', loadCart);

    return () => {
      window.removeEventListener('cart-updated', loadCart);
      window.removeEventListener('storage', loadCart);
    };
  }, []);

  // 🧮 Tổng số lượng và giá
  const totalItems = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const totalPrice = useMemo(
    () =>
      cartItems
        .reduce((sum, item) => sum + item.specialPrice * item.quantity, 0)
        .toFixed(0),
    [cartItems]
  );

  const handleGoToCheckout = () => {
    setCartOpen(false);
    router.push('/site/cart');
  };

  const handleLogout = () => {
    logoutUser();
    setUserMenuOpen(false);
    router.push('/site/login');
  };

  return (
    <header className='sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md shadow-md'>
      <div className='container mx-auto flex h-16 items-center justify-between px-4'>
        {/* Logo */}
        <div
          onClick={() => router.push('/')}
          className='flex items-center space-x-2 cursor-pointer'
        >
          <ShoppingCart className='h-6 w-6 text-slate-900' />
          <span className='text-xl font-bold text-slate-900'>ShopHub</span>
        </div>

        {/* Desktop Menu */}
        <div className='hidden md:flex items-center space-x-6'>
          <Link
            href='/site/products'
            className='text-sm font-medium text-slate-700 hover:text-slate-900'
          >
            Products
          </Link>
          <Link
            href='/site/features'
            className='text-sm font-medium text-slate-700 hover:text-slate-900'
          >
            Features
          </Link>
          <Link
            href='/site/about'
            className='text-sm font-medium text-slate-700 hover:text-slate-900'
          >
            About
          </Link>
        </div>

        {/* Actions */}
        <div className='flex items-center space-x-4 relative'>
          {/* ✅ Nếu chưa đăng nhập → hiện nút Sign In */}
          {!user ? (
            <Button
              variant='ghost'
              size='sm'
              onClick={() => router.push('/site/login')}
            >
              <User className='mr-1 h-4 w-4' />
              Sign In
            </Button>
          ) : (
            // ✅ Nếu đã đăng nhập → hiện tên + menu dropdown
            <div className='relative'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className='flex items-center gap-2'
              >
                {user.image && (
                  <img
                    src={user.image}
                    alt={user.name || user.email}
                    className='w-6 h-6 rounded-full'
                  />
                )}
                <span>
                  {user.firstName || user.name || user.email.split('@')[0]}
                </span>
              </Button>

              {userMenuOpen && (
                <div className='absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-md z-50'>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      router.push('/site/profile');
                    }}
                    className='w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100'
                  >
                    Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className='w-full flex items-center text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-100'
                  >
                    <LogOut className='mr-2 h-4 w-4' />
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 💖 Wishlist */}
          {user && (
            <Heart
              className='h-6 w-6 text-slate-900 cursor-pointer hover:text-red-500'
              onClick={() => router.push('/site/wishlist')}
            />
          )}

          {/* 🛒 Cart */}
          <div className='relative'>
            <ShoppingCart
              className='h-6 w-6 text-slate-900 cursor-pointer'
              onClick={() => setCartOpen(!cartOpen)}
            />
            {totalItems > 0 && (
              <span className='absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white'>
                {totalItems}
              </span>
            )}

            {cartOpen && (
              <div className='absolute right-0 mt-2 w-80 bg-white border rounded-md shadow-lg p-4 z-50'>
                {cartItems.length === 0 ? (
                  <p className='text-sm text-slate-500'>Your cart is empty</p>
                ) : (
                  <>
                    <div className='max-h-[320px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent'>
                      {cartItems.map((item) => (
                        <Card
                          key={item.id}
                          className='flex items-center gap-4 mb-3 p-2 shadow-sm'
                        >
                          <img
                            src={`http://localhost:8080/api/public/products/image/${item.image}`}
                            alt={item.name}
                            className='w-12 h-12 object-cover rounded-md border border-slate-100'
                          />
                          <div className='flex-1 overflow-hidden'>
                            <p className='font-medium text-slate-900 text-sm truncate'>
                              {item.name}
                            </p>
                            <p className='text-slate-500 text-xs mt-0.5'>
                              ${item.specialPrice} <span className='text-slate-400'>x</span> {item.quantity}
                            </p>
                          </div>
                          <p className='font-bold text-slate-900 text-sm'>
                            ${(item.specialPrice * item.quantity).toFixed(0)}
                          </p>
                        </Card>
                      ))}
                    </div>
                    <div className='border-t border-slate-200 pt-3 mt-1 flex justify-between items-center'>
                      <span className='font-bold'>Total:</span>
                      <span className='font-bold'>${totalPrice}</span>
                    </div>
                    <Button
                      className='w-full mt-2'
                      onClick={handleGoToCheckout}
                    >
                      Go to Checkout
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className='md:hidden'
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className='h-6 w-6' />
            ) : (
              <Menu className='h-6 w-6' />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className='md:hidden bg-white border-t border-slate-200'>
          <nav className='flex flex-col px-4 py-4 space-y-2'>
            <Link
              href='/site/products'
              className='text-sm font-medium text-slate-700'
            >
              Products
            </Link>
            <a href='#features' className='text-sm font-medium text-slate-700'>
              Features
            </a>
            <a href='#about' className='text-sm font-medium text-slate-700'>
              About
            </a>
            <Button
              variant='outline'
              size='sm'
              className='w-full mt-2'
              onClick={() =>
                router.push(user ? '/site/profile' : '/site/login')
              }
            >
              {user ? 'My Account' : 'Sign In'}
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}

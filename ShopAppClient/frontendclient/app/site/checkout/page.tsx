'use client';

import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, User, MapPin, CreditCard, Package, Ticket, ShieldCheck, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CartItemForCart } from '@/types/types';
import { useAuth } from '@/context/authContext';
import { getCart } from '@/app/utils/cartUtils';
import { motion } from 'framer-motion';
import { Spinner } from '@/components/ui/spinner';

function CheckoutContent() {
  const { user, token } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const paymentMethod = searchParams.get('paymentMethod');

  const [cartItems, setCartItems] = useState<CartItemForCart[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Coupon states
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    zip: '',
  });

  useEffect(() => {
    const storedCart = getCart();
    if (storedCart.length === 0) {
      router.push('/site/products');
      return;
    }
    setCartItems(storedCart);

    if (user) {
      let fullName = '';
      if (user.firstName && user.lastName) {
        fullName = `${user.firstName} ${user.lastName}`;
      } else if (user.name) {
        fullName = user.name;
      }

      setForm((prev) => ({
        ...prev,
        name: fullName || prev.name,
        email: user.email || prev.email,
        phone: user.mobileNumber || prev.phone,
        address: user.address?.buildingName || prev.address,
        city: user.address?.city || prev.city,
        country: user.address?.country || prev.country,
        zip: user.address?.pincode || prev.zip,
      }));
    }
    setIsLoading(false);
  }, [router, user]);

  const subtotal = useMemo(
    () =>
      cartItems.reduce((sum, item) => {
        const p = item.product;
        const finalPrice = p.discount > 0 ? (p.price || 0) * (1 - p.discount / 100) : (p.price || 0);
        return sum + finalPrice * item.quantity;
      }, 0),
    [cartItems]
  );
  
  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    return subtotal * (appliedCoupon.discountPercent / 100);
  }, [subtotal, appliedCoupon]);

  const shipping = subtotal > 0 ? 15 : 0;
  const total = Math.max(0, Math.ceil(subtotal - discountAmount + shipping));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  let cartIdUser: any = null;
  if (typeof window !== 'undefined') {
    const userDataString = localStorage.getItem('user');
    if (userDataString && userDataString !== 'undefined') {
      try {
        const userData = JSON.parse(userDataString);
        cartIdUser = userData?.cart?.cartId || userData?.cart;
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }

  async function syncCartWithBackend(
    cartId: number,
    cartItems: CartItemForCart[],
    token: string
  ) {
    for (const item of cartItems) {
      const productId = item.product.productId;
      const quantity = item.quantity;
      const apiEndpoint = `http://localhost:8080/api/public/carts/${cartId}/products/${productId}/quantity/${quantity}`;
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to add product ${productId} to cart`);
      }
    }
    const res = await fetch(
      `http://localhost:8080/api/public/users/${user.email}/carts/${cartId}`,
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    );
    if (!res.ok) throw new Error('Failed to fetch cart from backend');
    return await res.json();
  }

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError('');
    setCouponSuccess('');
    try {
      const res = await fetch(`http://localhost:8080/api/public/coupons/${couponInput.trim().toUpperCase()}`);
      if (!res.ok) {
        throw new Error('Mã giảm giá không hợp lệ hoặc đã hết hạn.');
      }
      const data = await res.json();
      setAppliedCoupon(data);
      setCouponSuccess(`Áp dụng thành công! Giảm ${data.discountPercent}%`);
    } catch (err: any) {
      setCouponError(err.message);
      setAppliedCoupon(null);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPlacingOrder) return;
    setIsPlacingOrder(true);

    if (!token || !user?.email) {
      alert('Không tìm thấy thông tin giỏ hàng. Vui lòng đăng nhập lại.');
      router.push('/site/login');
      return;
    }

    const cartId = user?.cart?.cartId || user?.cart;

    if (paymentMethod !== 'cod' && paymentMethod !== 'vnpay') {
      alert('Phương thức thanh toán không hợp lệ.');
      setIsPlacingOrder(false);
      return;
    }

    if (!form.name || !form.phone || !form.address) {
      alert('Vui lòng điền đầy đủ thông tin giao hàng.');
      setIsPlacingOrder(false);
      return;
    }

    try {
      await syncCartWithBackend(cartId, cartItems, token);
      const orderApi = `http://localhost:8080/api/public/users/${user.email}/carts/${cartId}/payments/${paymentMethod}/order${appliedCoupon ? `?couponCode=${appliedCoupon.code}` : ''}`;
      
      const response = await fetch(orderApi, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to place order');
      }

      const result = await response.json();
      localStorage.setItem('cart', JSON.stringify([]));
      window.dispatchEvent(new Event('cartUpdated'));

      if (paymentMethod === 'vnpay') {
        const vnpayRes = await fetch(`http://localhost:8080/api/public/payment/create_vnpay?orderId=${result.orderId}`, {
           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (vnpayRes.ok) {
           const vnpayData = await vnpayRes.json();
           window.location.href = vnpayData.url;
           return;
        } else {
           alert('Lỗi tạo thanh toán VNPAY');
        }
      }

      router.push(`/site/order-information?email=${user.email}&orderId=${result.orderId}`);
    } catch (err: any) {
      console.error('Checkout error:', err);
      alert(err.message);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const hasAutoSubmitted = useRef(false);
  useEffect(() => {
    const autoCoupon = searchParams.get('coupon');
    if (autoCoupon && !appliedCoupon && !isApplyingCoupon && !couponError && !couponSuccess) {
      setCouponInput(autoCoupon);
      const applyCouponFromUrl = async () => {
        setIsApplyingCoupon(true);
        try {
          const res = await fetch(`http://localhost:8080/api/public/coupons/${autoCoupon.trim().toUpperCase()}`);
          if (res.ok) {
            const data = await res.json();
            setAppliedCoupon(data);
            setCouponSuccess(`Áp dụng thành công! Giảm ${data.discountPercent}%`);
          } else {
            setCouponError('Mã giảm giá không hợp lệ.');
          }
        } catch (err) {
          setCouponError('Lỗi kết nối.');
        } finally {
          setIsApplyingCoupon(false);
        }
      };
      applyCouponFromUrl();
    }
  }, [searchParams, appliedCoupon, isApplyingCoupon, couponError, couponSuccess]);

  useEffect(() => {
    const autoCoupon = searchParams.get('coupon');
    const isCouponReady = !autoCoupon || appliedCoupon || couponError;

    if (!isLoading && searchParams.get('autoSubmit') === 'true' && !hasAutoSubmitted.current && isCouponReady) {
      if (form.name && form.phone && form.address) {
        hasAutoSubmitted.current = true;
        const mockEvent = { preventDefault: () => {} } as React.FormEvent;
        handleSubmit(mockEvent);
      } else {
        alert('Thiếu thông tin giao hàng mặc định (Tên, SDT, Địa chỉ). Vui lòng điền đầy đủ trước khi thanh toán.');
      }
    }
  }, [isLoading, searchParams, form, appliedCoupon, couponError, handleSubmit]);

  if (isLoading) {
    return <div className='h-screen flex items-center justify-center bg-slate-50'><Spinner /></div>;
  }

  return (
    <section className='min-h-screen bg-slate-50/50 pb-24 relative overflow-hidden'>
      <div className="absolute top-0 left-0 w-1/3 h-[500px] bg-gradient-to-br from-indigo-100/60 to-transparent blur-3xl pointer-events-none -z-10"></div>
      
      <div className='container mx-auto px-4 max-w-6xl relative z-10 pt-10'>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <Button
            variant='ghost'
            className='mb-8 flex items-center gap-2 text-slate-500 hover:text-indigo-700 bg-white shadow-sm rounded-full px-6 py-2 transition-all w-fit'
            onClick={() => router.push('/site/cart')}
          >
            <ArrowLeft className='h-4 w-4' /> Trở về giỏ hàng
          </Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className='text-4xl lg:text-5xl font-extrabold text-slate-900 mb-10 flex items-center gap-4 tracking-tight'>
            <div className="bg-indigo-100 p-3 rounded-2xl">
              <CreditCard className='h-8 w-8 text-indigo-600' />
            </div>
            Thanh Toán
          </h1>
        </motion.div>

        <form onSubmit={handleSubmit} className='grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12'>
          
          <div className='lg:col-span-2 space-y-8'>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <Card className='p-8 shadow-xl shadow-indigo-100/20 border-0 bg-white rounded-[2rem]'>
                <div className='flex items-center gap-4 mb-8 pb-4 border-b border-slate-100'>
                  <div className="bg-indigo-50 p-3 rounded-full"><User className='h-6 w-6 text-indigo-600' /></div>
                  <h2 className='text-2xl font-bold text-slate-900'>Thông tin cá nhân</h2>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className="space-y-2">
                    <Label htmlFor='name' className="text-slate-600 font-bold ml-1">Họ và tên</Label>
                    <Input id='name' name='name' placeholder='Nguyễn Văn A' value={form.name} onChange={handleChange} required className="h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor='email' className="text-slate-600 font-bold ml-1">Email</Label>
                    <Input id='email' name='email' type='email' placeholder='nguyenvana@example.com' value={form.email} onChange={handleChange} required className="h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"/>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor='phone' className="text-slate-600 font-bold ml-1">Số điện thoại</Label>
                    <Input id='phone' name='phone' placeholder='090 123 4567' value={form.phone} onChange={handleChange} required className="h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"/>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <Card className='p-8 shadow-xl shadow-indigo-100/20 border-0 bg-white rounded-[2rem]'>
                <div className='flex items-center gap-4 mb-8 pb-4 border-b border-slate-100'>
                  <div className="bg-blue-50 p-3 rounded-full"><MapPin className='h-6 w-6 text-blue-600' /></div>
                  <h2 className='text-2xl font-bold text-slate-900'>Địa chỉ giao hàng</h2>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='md:col-span-2 space-y-2'>
                    <Label htmlFor='address' className="text-slate-600 font-bold ml-1">Số nhà, Tên đường</Label>
                    <Input id='address' name='address' placeholder='123 Đường Lê Lợi' value={form.address} onChange={handleChange} required className="h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor='city' className="text-slate-600 font-bold ml-1">Tỉnh / Thành phố</Label>
                    <Input id='city' name='city' placeholder='Hồ Chí Minh' value={form.city} onChange={handleChange} required className="h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor='country' className="text-slate-600 font-bold ml-1">Quốc gia</Label>
                    <Input id='country' name='country' placeholder='Việt Nam' value={form.country} onChange={handleChange} required className="h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"/>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor='zip' className="text-slate-600 font-bold ml-1">Mã bưu chính (Zip Code)</Label>
                    <Input id='zip' name='zip' placeholder='700000' value={form.zip} onChange={handleChange} required className="h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"/>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
              <Card className='p-8 shadow-xl shadow-indigo-100/20 border-0 bg-white rounded-[2rem]'>
                <div className='flex items-center gap-4 mb-6 pb-4 border-b border-slate-100'>
                  <div className="bg-green-50 p-3 rounded-full"><CreditCard className='h-6 w-6 text-emerald-600' /></div>
                  <h2 className='text-2xl font-bold text-slate-900'>Phương thức thanh toán</h2>
                </div>
                <div className={`rounded-2xl border-2 p-6 flex items-center gap-4 transition-all ${paymentMethod === 'vnpay' ? 'border-blue-500 bg-blue-50/50' : 'border-emerald-500 bg-emerald-50/50'}`}>
                  {paymentMethod === 'vnpay' ? (
                    <div className="bg-white p-2 rounded-xl shadow-sm"><CreditCard className="w-8 h-8 text-blue-600" /></div>
                  ) : (
                    <div className="bg-white p-2 rounded-xl shadow-sm"><Package className="w-8 h-8 text-emerald-600" /></div>
                  )}
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">
                      {paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : paymentMethod === 'vnpay' ? 'Thanh toán trực tuyến (VNPAY)' : 'Khác'}
                    </h3>
                    <p className="text-slate-500 text-sm">Phương thức thanh toán đã được chọn từ Giỏ hàng.</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* RIGHT: Order Summary */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className='lg:col-span-1'>
            <Card className='p-8 bg-white shadow-2xl shadow-indigo-100/50 rounded-[2.5rem] border border-slate-100 sticky top-24'>
              <div className='flex items-center gap-4 mb-8 pb-4 border-b border-slate-100'>
                <div className="bg-indigo-50 p-3 rounded-full"><ShoppingBag className='h-6 w-6 text-indigo-600' /></div>
                <h2 className='text-2xl font-bold text-slate-900'>Chi tiết đơn hàng</h2>
              </div>

              <div className='max-h-80 overflow-y-auto pr-2 mb-8 space-y-4 scrollbar-thin scrollbar-thumb-slate-200'>
                {cartItems.map((item) => {
                  const p = item.product;
                  const finalPrice = p.discount > 0 ? (p.price || 0) * (1 - p.discount / 100) : (p.price || 0);
                  return (
                    <div key={p.productId} className='flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100'>
                      <img
                        src={`http://localhost:8080/api/public/products/image/${p.image}`}
                        alt={p.productName}
                        className='w-16 h-16 rounded-xl object-cover bg-white shadow-sm'
                        onError={(e: any) => { e.target.src = '/placeholder.png' }}
                      />
                      <div className='flex-1 min-w-0'>
                        <p className='font-bold text-slate-900 text-sm line-clamp-1'>{p.productName}</p>
                        <p className='text-xs font-medium text-slate-500 mt-1'>Số lượng: {item.quantity}</p>
                      </div>
                      <p className='font-black text-indigo-600 text-sm'>
                        ${(finalPrice * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className='space-y-4 text-sm text-slate-700 mb-8 bg-slate-50 p-6 rounded-3xl border border-slate-100'>
                <Label className="text-slate-900 font-bold block mb-3">Mã Khuyến Mãi</Label>
                <div className='flex gap-2 relative'>
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Ticket className="w-4 h-4 text-slate-400" />
                  </div>
                  <Input 
                    placeholder="Nhập mã coupon" 
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    disabled={isApplyingCoupon || appliedCoupon}
                    className="h-12 rounded-xl pl-10 border-transparent shadow-sm focus:border-indigo-500"
                  />
                  {!appliedCoupon ? (
                    <Button 
                      type="button" 
                      onClick={handleApplyCoupon}
                      disabled={isApplyingCoupon || !couponInput.trim()}
                      className="h-12 rounded-xl px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold"
                    >
                      {isApplyingCoupon ? <Spinner className="w-4 h-4" /> : 'Áp dụng'}
                    </Button>
                  ) : (
                    <Button 
                      type="button" 
                      variant="destructive" 
                      onClick={() => { setAppliedCoupon(null); setCouponInput(''); setCouponSuccess(''); }}
                      className="h-12 rounded-xl px-6 font-bold"
                    >
                      Xóa
                    </Button>
                  )}
                </div>
                {couponError && <p className="text-red-500 text-sm font-medium pt-1">{couponError}</p>}
                {couponSuccess && <p className="text-emerald-600 text-sm font-bold pt-1">{couponSuccess}</p>}
              </div>

              <div className='space-y-4 mb-8 px-2'>
                <div className='flex justify-between items-center text-slate-600 text-lg'>
                  <span>Tạm tính</span>
                  <span className='font-bold text-slate-900'>${subtotal.toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div className='flex justify-between items-center text-emerald-600 text-lg'>
                    <span>Giảm giá ({appliedCoupon.discountPercent}%)</span>
                    <span className="font-bold">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className='flex justify-between items-center text-slate-600 text-lg'>
                  <span>Phí giao hàng</span>
                  <span className='font-bold text-slate-900'>${shipping.toFixed(2)}</span>
                </div>
              </div>

              <div className='bg-indigo-50 p-6 rounded-3xl mb-8 border border-indigo-100'>
                <div className='flex justify-between items-center'>
                  <span className='text-xl font-bold text-indigo-900'>Tổng cộng</span>
                  <span className='text-4xl font-black text-indigo-600'>${total.toFixed(2)}</span>
                </div>
              </div>

              <Button
                type='submit'
                className='w-full h-14 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-lg font-bold shadow-xl shadow-slate-200 transition-all hover:-translate-y-1'
                size='lg'
                disabled={cartItems.length === 0 || isPlacingOrder}
              >
                {isPlacingOrder ? <Spinner className="mr-2" /> : null}
                {isPlacingOrder ? 'Đang xử lý...' : (paymentMethod === 'vnpay' ? `Thanh toán VNPAY ($${total.toFixed(2)})` : `Đặt Hàng COD ($${total.toFixed(2)})`)}
              </Button>
              
              <div className="mt-6 flex items-center justify-center gap-2 text-slate-400">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-sm font-medium">Bảo mật thông tin 100%</span>
              </div>
            </Card>
          </motion.div>
        </form>
      </div>
    </section>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className='h-screen flex items-center justify-center bg-slate-50'><Spinner /></div>}>
      <CheckoutContent />
    </Suspense>
  );
}

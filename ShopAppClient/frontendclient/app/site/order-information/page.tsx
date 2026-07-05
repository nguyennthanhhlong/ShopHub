'use client';
import { getImageUrl } from '@/lib/utils';


import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/authContext';
import { Package, Truck, User, ArrowLeft, CheckCircle } from 'lucide-react';
import { removeCart } from '@/app/utils/cartUtils';

interface ProductDTO {
  productId: number;
  productName: string;
  image: string;
  specialPrice: number;
}

interface OrderItemDTO {
  orderItemId: number;
  product: ProductDTO;
  quantity: number;
  discount: number;
  orderedProductPrice: number;
}

interface OrderDTO {
  orderId: number;
  email: string;
  orderItems: OrderItemDTO[];
  orderDate: string;
  totalAmount: number;
  orderStatus: string;
  payment?: {
    paymentId: number;
    paymentMethod: string;
    paymentStatus: string;
  };
}

function OrderInformationContent() {
  const { user, token } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const orderId = searchParams.get('orderId');
  const email = searchParams.get('email') || user?.email;

  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [loading, setLoading] = useState(true);

  // Gọi API lấy order
  useEffect(() => {
    if (!email || !orderId || !token) return;

    async function fetchOrder() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/public/users/${email}/orders/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        console.log(res);

        if (!res.ok) throw new Error('Failed to fetch order');
        const data = await res.json();
        setOrder(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [email, orderId, token]);

  if (loading)
    return (
      <div className='h-screen flex items-center justify-center text-slate-600'>
        Đang tải thông tin đơn hàng...
      </div>
    );

  if (!order)
    return (
      <div className='h-screen flex flex-col items-center justify-center gap-3 text-slate-600'>
        <p>Không tìm thấy đơn hàng.</p>
        <Button
          onClick={() => {
            window.dispatchEvent(new Event('cart-updated'));
            router.push('/');
          }}
        >
          Quay lại danh sách trang chủ
        </Button>
      </div>
    );

  const subtotal = order.orderItems.reduce(
    (sum, item) => sum + item.orderedProductPrice * item.quantity,
    0
  );

  console.log(order);

  return (
    <section className='py-16 bg-slate-50 min-h-screen'>
      <div className='container mx-auto max-w-4xl px-4 space-y-8'>
        {/* 🔙 Back Button */}
        <Button
          variant='ghost'
          className='flex items-center gap-2 text-slate-600 hover:text-slate-900'
          onClick={() => router.push('/')}
        >
          <ArrowLeft className='h-4 w-4' /> Back to home
        </Button>

        {/* 🧾 Order Summary Card */}
        <Card className='p-8 shadow-sm bg-white border border-slate-200 space-y-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <CheckCircle className='text-green-600 h-6 w-6' />
              <h1 className='text-2xl font-bold text-slate-900'>
                Order #{order.orderId}
              </h1>
            </div>
            <span
              className={`px-3 py-1 text-sm rounded-full font-semibold ${
                order.orderStatus === 'DELIVERED'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {order.orderStatus}
            </span>
          </div>

          <Separator />

          {/* 👤 Customer Info */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <h2 className='text-lg font-semibold mb-2 flex items-center gap-2'>
                <User className='h-5 w-5 text-slate-700' /> Customer Info
              </h2>
              <p className='text-slate-700 font-medium'>{order.email}</p>
              <p className='text-slate-500 text-sm'>
                Ngày đặt: {new Date(order.orderDate).toLocaleString('vi-VN')}
              </p>
              {order.payment && (
                <p className='text-slate-500 text-sm'>
                  Thanh toán: {order.payment.paymentMethod.toUpperCase()}
                </p>
              )}
            </div>
            <div>
              <h2 className='text-lg font-semibold mb-2 flex items-center gap-2'>
                <Truck className='h-5 w-5 text-slate-700' /> Shipping Info
              </h2>
              <p className='text-slate-700'>
                Đơn hàng sẽ được giao đến địa chỉ đã đăng ký của bạn.
              </p>
              <p className='text-slate-500 text-sm'>
                Phí giao hàng cố định: $15
              </p>
            </div>
          </div>

          <Separator />

          {/* 🛍️ Order Items */}
          <div>
            <h2 className='text-lg font-semibold mb-4 flex items-center gap-2'>
              <Package className='h-5 w-5 text-slate-700' /> Order Items
            </h2>

            <div className='divide-y divide-slate-200'>
              {order.orderItems.map((item) => (
                <div
                  key={item.orderItemId}
                  className='flex items-center justify-between py-3'
                >
                  <div className='flex items-center gap-3'>
                    <img
                      src={getImageUrl(item.product.image)}
                      alt={item.product.productName}
                      className='w-12 h-12 rounded-md object-cover border'
                    />
                    <div>
                      <p className='font-medium text-slate-900 text-sm'>
                        {item.product.productName}
                      </p>
                      <p className='text-xs text-slate-500'>
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className='font-semibold text-slate-900 text-sm'>
                    ${(item.orderedProductPrice * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* 💰 Totals */}
          <div className='text-right space-y-1 text-slate-700'>
            <p>Subtotal: ${subtotal.toFixed(2)}</p>
            <p>Shipping: $15.00</p>
            <p className='text-lg font-bold text-slate-900'>
              Total: ${order.totalAmount.toFixed(2)}
            </p>
          </div>

          <div className='text-center pt-6'>
            <Button
              onClick={() => router.push('/site/products')}
              className='bg-green-600 hover:bg-green-700'
            >
              Continue Shopping
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
}

export default function OrderInformationPage() {
  return (
    <Suspense fallback={<div className='h-screen flex items-center justify-center text-slate-600'>Đang tải trang...</div>}>
      <OrderInformationContent />
    </Suspense>
  );
}

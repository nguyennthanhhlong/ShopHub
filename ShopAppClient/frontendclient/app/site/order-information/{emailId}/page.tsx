'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/authContext';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Package, Clock, DollarSign } from 'lucide-react';

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
  orderedProductPrice: number;
}

interface OrderDTO {
  orderId: number;
  orderDate: string;
  totalAmount: number;
  orderStatus: string;
  orderItems: OrderItemDTO[];
}

export default function OrdersPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email || !token) return;

    async function fetchOrders() {
      try {
        const res = await fetch(
          `http://localhost:8080/api/public/users/${user.email}/orders`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error('Failed to load orders');
        const data = await res.json();

        setOrders(data);
      } catch (err) {
        console.error(err);
        alert('Không thể tải danh sách đơn hàng');
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [user, token]);

  if (loading)
    return (
      <div className='h-screen flex items-center justify-center text-slate-600'>
        Đang tải danh sách đơn hàng...
      </div>
    );

  if (!orders.length)
    return (
      <div className='h-screen flex flex-col items-center justify-center text-slate-600 gap-4'>
        <p>Bạn chưa có đơn hàng nào.</p>
        <Button onClick={() => router.push('/site/products')}>
          Tiếp tục mua sắm
        </Button>
      </div>
    );

  return (
    <section className='py-16 bg-slate-50 min-h-screen'>
      <div className='container mx-auto max-w-5xl px-4 space-y-8'>
        <h1 className='text-2xl font-bold text-slate-900 mb-6'>
          🧾 Danh sách đơn hàng của bạn
        </h1>

        {orders.map((order) => (
          <Card
            key={order.orderId}
            className='p-6 bg-white border border-slate-200 shadow-sm hover:shadow-md transition'
          >
            <div className='flex flex-col md:flex-row justify-between md:items-center'>
              <div>
                <h2 className='text-lg font-semibold text-slate-900'>
                  Order #{order.orderId}
                </h2>
                <p className='text-sm text-slate-500'>
                  Ngày đặt: {new Date(order.orderDate).toLocaleString('vi-VN')}
                </p>
                <p
                  className={`text-sm font-semibold mt-1 ${
                    order.orderStatus === 'DELIVERED'
                      ? 'text-green-600'
                      : 'text-yellow-600'
                  }`}
                >
                  {order.orderStatus}
                </p>
              </div>

              <div className='mt-4 md:mt-0 flex items-center gap-4'>
                <div className='text-slate-700 flex items-center gap-1'>
                  <DollarSign className='h-4 w-4 text-green-600' />
                  <span className='font-semibold'>
                    ${order.totalAmount.toFixed(2)}
                  </span>
                </div>

                <Button
                  variant='outline'
                  onClick={() =>
                    router.push(
                      `/site/order-information?email=${user.email}&orderId=${order.orderId}`
                    )
                  }
                >
                  Xem chi tiết
                </Button>
              </div>
            </div>

            <Separator className='my-4' />

            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
              {order.orderItems.slice(0, 3).map((item) => (
                <div
                  key={item.orderItemId}
                  className='flex items-center gap-3 bg-slate-50 p-2 rounded-md border border-slate-100'
                >
                  <img
                    src={`http://localhost:8080/api/public/products/image/${item.product.image}`}
                    alt={item.product.productName}
                    className='w-12 h-12 rounded-md object-cover border'
                  />
                  <div>
                    <p className='text-sm font-medium text-slate-800'>
                      {item.product.productName}
                    </p>
                    <p className='text-xs text-slate-500'>
                      Qty: {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
              {order.orderItems.length > 3 && (
                <p className='text-xs text-slate-500 italic self-center'>
                  + {order.orderItems.length - 3} sản phẩm khác
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

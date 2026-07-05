'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

function VnpayReturnPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const status = searchParams.get('status');
  const orderId = searchParams.get('orderId');

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Artificial delay to show loading state nicely
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const isSuccess = status === 'success';

  return (
    <section className="min-h-screen py-20 bg-slate-50 flex items-center justify-center">
      <Card className="max-w-md w-full mx-4 p-8 text-center shadow-xl border-0 rounded-2xl bg-white">
        {isSuccess ? (
          <>
            <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Thanh toán thành công!</h1>
            <p className="text-slate-500 mb-8">
              Cảm ơn bạn đã giao dịch qua VNPAY. Đơn hàng #{orderId} của bạn đã được xác nhận và email biên lai đã được gửi đến hộp thư.
            </p>
            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => router.push('/site/products')}
                className="w-full bg-emerald-500 hover:bg-emerald-600 py-6 text-lg rounded-xl"
              >
                Tiếp tục mua sắm
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Thanh toán thất bại</h1>
            <p className="text-slate-500 mb-8">
              Rất tiếc, giao dịch của bạn không thành công hoặc đã bị hủy bỏ. Mã lỗi hoặc trạng thái: {status}
            </p>
            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => router.push('/site/cart')}
                variant="outline"
                className="w-full py-6 text-lg rounded-xl border-slate-200 hover:bg-slate-50"
              >
                Quay lại giỏ hàng
              </Button>
            </div>
          </>
        )}
      </Card>
    </section>
  );
}

export default function VnpayReturnPage() {
  return (
    <Suspense fallback={<div className='h-screen flex items-center justify-center text-slate-600'>Đang tải trang...</div>}>
      <VnpayReturnPageContent />
    </Suspense>
  );
}

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, ArrowRight } from 'lucide-react';

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');

  const [message, setMessage] = useState('Đang xử lý thanh toán...');

  useEffect(() => {
    if (!sessionId) return;

    // 🧹 Xóa giỏ hàng localStorage
    localStorage.removeItem('cart');
    window.dispatchEvent(new Event('cart-updated'));

    console.log(sessionId);
    // 🧾 Gọi API Stripe để lấy chi tiết (nếu cần)
    fetch(`/api/checkout-sessions/${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        setMessage('🎉 Thanh toán thành công! Cảm ơn bạn đã mua hàng.');
      })
      .catch((err) => {
        console.error(err);
        setMessage(
          'Thanh toán thành công, nhưng không lấy được thông tin chi tiết.'
        );
      });
  }, [sessionId]);

  return (
    <section className='flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4'>
      <div className='bg-white shadow-xl rounded-2xl p-8 md:p-10 max-w-md w-full text-center relative overflow-hidden border border-slate-200'>
        {/* ✅ Icon Success */}
        <div className='flex justify-center mb-6'>
          <div className='bg-green-100 p-4 rounded-full animate-bounce'>
            <CheckCircle className='h-12 w-12 text-green-600' />
          </div>
        </div>

        {/* 🎉 Title */}
        <h1 className='text-3xl font-bold text-slate-800 mb-3'>
          Thanh toán thành công!
        </h1>

        {/* 💬 Message */}
        <p className='text-slate-600 mb-6 leading-relaxed'>{message}</p>

        {/* 🌟 Order summary hint */}
        <div className='bg-slate-50 p-4 rounded-md border border-slate-200 text-sm text-slate-700 mb-6'>
          Mã giao dịch:{' '}
          <span className='font-mono font-semibold text-slate-900'>
            {sessionId?.slice(0, 16)}...
          </span>
        </div>

        {/* 🔘 Buttons */}
        <div className='flex flex-col sm:flex-row items-center justify-center gap-3'>
          <button
            onClick={() => router.push('/')}
            className='w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition-all shadow-sm flex items-center justify-center gap-2'
          >
            Tiếp tục mua sắm
            <ArrowRight className='h-4 w-4' />
          </button>

          <button
            onClick={() => router.push('/site/profile')}
            className='w-full sm:w-auto border border-slate-300 text-slate-700 hover:bg-slate-100 px-6 py-3 rounded-lg text-sm font-medium transition-all'
          >
            Xem đơn hàng
          </button>
        </div>

        {/* 🎆 Background effects */}
        <div className='absolute -top-20 -right-20 w-40 h-40 bg-green-100 rounded-full blur-3xl opacity-50' />
        <div className='absolute -bottom-16 -left-16 w-32 h-32 bg-green-50 rounded-full blur-2xl opacity-60' />
      </div>
    </section>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className='h-screen flex items-center justify-center text-slate-600'>Đang tải trang...</div>}>
      <SuccessPageContent />
    </Suspense>
  );
}

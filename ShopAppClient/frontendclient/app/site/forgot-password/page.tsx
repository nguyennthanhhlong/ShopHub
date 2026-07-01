'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Mail, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/authContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { requestForgotPassword, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Vui lòng nhập địa chỉ email của bạn');
      return;
    }

    try {
      const res = await requestForgotPassword(email);
      setSuccess(res?.message || 'Mật khẩu mới đã được gửi đến email của bạn.');
    } catch (err: any) {
      setError(err.message || 'Gửi yêu cầu thất bại. Vui lòng kiểm tra lại email.');
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center px-4 py-8'>
      <div className='w-full max-w-md'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-slate-900 mb-2'>
            Quên mật khẩu
          </h1>
          <p className='text-slate-600'>Nhập email của bạn để nhận mật khẩu mới</p>
        </div>

        <Card className='border-0 shadow-lg'>
          <CardContent className='pt-6'>
            {success ? (
              <div className='space-y-6'>
                <Alert className='border-green-200 bg-green-50'>
                  <CheckCircle2 className='h-4 w-4 text-green-600' />
                  <AlertDescription className='text-green-800 ml-2'>
                    {success}
                  </AlertDescription>
                </Alert>
                <Button
                  onClick={() => router.push('/site/login')}
                  className='w-full'
                >
                  Quay lại đăng nhập
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className='space-y-4'>
                {error && (
                  <Alert variant='destructive' className='border-red-200 bg-red-50'>
                    <AlertCircle className='h-4 w-4' />
                    <AlertDescription className='text-red-800 ml-2'>
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <div className='space-y-2'>
                  <label className='text-sm font-medium text-slate-900'>
                    Địa chỉ Email
                  </label>
                  <div className='relative'>
                    <Mail className='absolute left-3 top-3 h-5 w-5 text-slate-400' />
                    <Input
                      type='email'
                      placeholder='you@example.com'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className='pl-10'
                      disabled={loading}
                    />
                  </div>
                </div>

                <Button
                  type='submit'
                  size='lg'
                  className='w-full h-11 text-base'
                  disabled={loading}
                >
                  {loading ? 'Đang gửi yêu cầu...' : 'Khôi phục mật khẩu'}
                </Button>
                
                <div className='text-center mt-4'>
                  <Link
                    href='/site/login'
                    className='inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium'
                  >
                    <ArrowLeft className='h-4 w-4 mr-1' />
                    Quay lại đăng nhập
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FaGithub, FaGoogle } from 'react-icons/fa';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { useAuth } from '@/hooks/use-auth';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/authContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { signIn, signOut, useSession } from 'next-auth/react';

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  //   const { signIn, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  //   const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { loginUser, loading, token } = useAuth(); // ✅ lấy hàm loginUser từ context

  //khong cho phép người dùng đã đăng nhập truy cập lại trang login
  useEffect(() => {
    if (token || session) router.push('/site'); // hoặc '/profile'
  }, [token, session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await loginUser({ email, password }); // ✅ gọi API login qua context
      router.push('/'); // ✅ chuyển hướng sau khi đăng nhập thành công
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    }
  };

  useEffect(() => {
    // Only run if session has a defined email
    const email = session?.user?.email;

    if (!email) return; // Exit early if no email (avoids undefined errors)

    console.log('check user', email);

    const checkUser = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/public/users/email/${email}`
        );

        if (res.status === 404) {
          // ❌ User chưa tồn tại trong backend
          router.push('/site/updateProfileAuth');
        } else if (res.ok) {
          // ✅ User đã tồn tại
          try {
            await loginUser({ email: email, password: 'oauth-user' });
            router.push('/');
          } catch (err) {
            // Lỗi xảy ra nếu người dùng đã đăng ký bằng mật khẩu thường chứ không phải qua OAuth
            setError('Email này đã được đăng ký bằng mật khẩu. Vui lòng đăng nhập bằng mật khẩu của bạn.');
            await signOut({ redirect: false });
          }
        } else {
          console.error('Lỗi khi kiểm tra user backend');
        }
      } catch (err) {
        console.error('Fetch failed:', err);
      }
    };

    checkUser();
  }, [session, router]);

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center px-4 py-8'>
      <div className='w-full max-w-md'>
        <div className='text-center mb-8'>
          <Link href='/' className='inline-flex items-center space-x-2 mb-6'>
            <div className='h-10 w-10 rounded-lg bg-slate-900 flex items-center justify-center'>
              <LogIn className='h-6 w-6 text-white' />
            </div>
            <span className='text-2xl font-bold text-slate-900'>ShopHub</span>
          </Link>
          <h1 className='text-3xl font-bold text-slate-900 mb-2'>
            Welcome Back
          </h1>
          <p className='text-slate-600'>Sign in to access your account</p>
        </div>

        <Card className='border-0 shadow-lg'>
          <CardContent className='pt-6'>
            <form onSubmit={handleSubmit} className='space-y-4'>
              {error && (
                <Alert
                  variant='destructive'
                  className='border-red-200 bg-red-50'
                >
                  <AlertCircle className='h-4 w-4' />
                  <AlertDescription className='text-red-800'>
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className='space-y-2'>
                <label className='text-sm font-medium text-slate-900'>
                  Email Address
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

              <div className='space-y-2'>
                <label className='text-sm font-medium text-slate-900'>
                  Password
                </label>
                <div className='relative'>
                  <Lock className='absolute left-3 top-3 h-5 w-5 text-slate-400' />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder='••••••••'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className='pl-10 pr-10'
                    disabled={loading}
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-3 top-3 text-slate-400 hover:text-slate-600'
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <div className='flex items-center justify-between'>
                <label className='flex items-center space-x-2 cursor-pointer'>
                  <input
                    type='checkbox'
                    className='w-4 h-4 rounded border-slate-300'
                  />
                  <span className='text-sm text-slate-600'>Remember me</span>
                </label>
                <Link
                  href='/site/forgot-password'
                  className='text-sm text-blue-600 hover:text-blue-700 font-medium'
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type='submit'
                size='lg'
                className='w-full h-11 text-base'
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>

              <div className='relative my-6'>
                <div className='absolute inset-0 flex items-center'>
                  <div className='w-full border-t border-slate-200'></div>
                </div>
                <div className='relative flex justify-center text-sm'>
                  <span className='px-2 bg-white text-slate-500'>Or</span>
                </div>
              </div>

              <Button
                type='button'
                variant='outline'
                size='lg'
                className='w-full h-11'
                disabled={loading}
                onClick={() => signIn('google')}
              >
                <FaGoogle className='text-xl' />
                Continue with Google
              </Button>
              <Button
                type='button'
                variant='outline'
                size='lg'
                className='w-full h-11'
                disabled={loading}
                onClick={() => signIn('github')}
              >
                <FaGithub className='text-xl' />
                Continue with Github
              </Button>
            </form>

            <p className='mt-6 text-center text-slate-600'>
              Don't have an account?{' '}
              <Link
                href='/site/register'
                className='text-blue-600 hover:text-blue-700 font-semibold'
              >
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className='mt-6 text-center text-xs text-slate-500'>
          By signing in, you agree to our{' '}
          <Link href='#' className='underline hover:text-slate-700'>
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href='#' className='underline hover:text-slate-700'>
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}

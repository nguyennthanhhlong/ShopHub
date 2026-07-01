'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
// import { useAuth } from '@/hooks/use-auth';
import {
  Mail,
  Lock,
  User,
  UserPlus,
  Phone,
  MapPin,
  AlertCircle,
  Check,
} from 'lucide-react'; // Thêm Phone, MapPin
import { useAuth } from '@/context/authContext';
import { signIn } from 'next-auth/react';
import { FaGithub, FaGoogle } from 'react-icons/fa';

export default function RegisterPage() {
  const router = useRouter();
  const { registerUser, loading: authLoading, loginUser } = useAuth();
  // --- STATE CÁC TRƯỜNG NGƯỜI DÙNG PHẢI ĐIỀN ---
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // --- STATE CÁC TRƯỜNG ĐỊA CHỈ (address) ---
  const [street, setStreet] = useState('');
  const [buildingName, setBuildingName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [pincode, setPincode] = useState('');

  const [error, setError] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordStrength = () => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  };

  const strength = passwordStrength();
  const strengthColor =
    strength < 2
      ? 'bg-red-500'
      : strength < 3
      ? 'bg-yellow-500'
      : 'bg-green-500';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (
      !firstName ||
      !lastName ||
      !mobileNumber ||
      !email ||
      !password ||
      !confirmPassword ||
      !street ||
      !city ||
      !state ||
      !country ||
      !pincode
    ) {
      setError(
        'Vui lòng điền đầy đủ tất cả các trường thông tin cá nhân và địa chỉ.'
      );
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }

    // 2. CHUẨN BỊ DỮ LIỆU GỬI ĐI
    const registrationData = {
      firstName,
      lastName,
      mobileNumber,
      email,
      password,
      // TRƯỜNG 'roles' và 'cart' SẼ DO BACKEND TẠO NGẦM ĐỊNH
      address: {
        street,
        buildingName, // Có thể là chuỗi rỗng nếu người dùng không điền
        city,
        state,
        country,
        pincode,
      },
      roles: [
        {
          roleId: 101,
          roleName: 'Admin',
        },
      ],
      cart: {
        cartId: Math.floor(Math.random() * 1000000), // Tạo số ngẫu nhiên 0 → 999999
      },
    };

    // 3. GỌI API
    try {
      console.log('Submitting data:', registrationData);
      const res = await registerUser(registrationData);
      console.error(res);
      await loginUser({
        email: registrationData.email,
        password: registrationData.password,
      }); // ✅ gọi API login qua context
      router.push('/'); // ✅ chuyển hướng sau khi đăng nhập thành công
    } catch (signUpError: any) {
      console.error('Registration failed:', signUpError);
      setError(
        signUpError.message || 'Lỗi: Không thể tạo tài khoản. Vui lòng thử lại.'
      );
    }
  };

  if (authLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center px-4'>
        <div className='animate-pulse text-slate-600'>Loading...</div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center px-4 py-8'>
      <div className='w-full max-w-lg'>
        <div className='text-center mb-8'>
          <Link href='/' className='inline-flex items-center space-x-2 mb-6'>
            <div className='h-10 w-10 rounded-lg bg-slate-900 flex items-center justify-center'>
              <UserPlus className='h-6 w-6 text-white' />
            </div>
            <span className='text-2xl font-bold text-slate-900'>ShopHub</span>
          </Link>
          <h1 className='text-3xl font-bold text-slate-900 mb-2'>
            Create Account
          </h1>
          <p className='text-slate-600'>Join us and start shopping</p>
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

              {/* FIRST NAME & LAST NAME */}
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <label className='text-sm font-medium text-slate-900'>
                    Tên (First Name)
                  </label>
                  <div className='relative'>
                    <User className='absolute left-3 top-3 h-5 w-5 text-slate-400' />
                    <Input
                      type='text'
                      placeholder='John'
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className='pl-10'
                    />
                  </div>
                </div>
                <div className='space-y-2'>
                  <label className='text-sm font-medium text-slate-900'>
                    Họ (Last Name)
                  </label>
                  <div className='relative'>
                    <User className='absolute left-3 top-3 h-5 w-5 text-slate-400' />
                    <Input
                      type='text'
                      placeholder='Doe'
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className='pl-10'
                    />
                  </div>
                </div>
              </div>

              {/* MOBILE NUMBER */}
              <div className='space-y-2'>
                <label className='text-sm font-medium text-slate-900'>
                  Số điện thoại di động
                </label>
                <div className='relative'>
                  <Phone className='absolute left-3 top-3 h-5 w-5 text-slate-400' />
                  <Input
                    type='tel'
                    placeholder='+84 901 234 567'
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className='pl-10'
                  />
                </div>
              </div>

              {/* EMAIL */}
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
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-3 top-3 text-slate-400 hover:text-slate-600'
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {password && (
                  <div className='flex items-center gap-2'>
                    <div className='flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden'>
                      <div
                        className={`h-full ${strengthColor} transition-all`}
                        style={{ width: `${(strength / 4) * 100}%` }}
                      ></div>
                    </div>
                    <span className='text-xs text-slate-600'>
                      {strength < 2 ? 'Weak' : strength < 3 ? 'Fair' : 'Strong'}
                    </span>
                  </div>
                )}
              </div>

              <div className='space-y-2'>
                <label className='text-sm font-medium text-slate-900'>
                  Confirm Password
                </label>
                <div className='relative'>
                  <Lock className='absolute left-3 top-3 h-5 w-5 text-slate-400' />
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder='••••••••'
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className='pl-10 pr-10'
                  />
                  <button
                    type='button'
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className='absolute right-3 top-3 text-slate-400 hover:text-slate-600'
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {confirmPassword && password === confirmPassword && (
                  <div className='flex items-center gap-2 text-green-600 text-sm'>
                    <Check className='h-4 w-4' />
                    Passwords match
                  </div>
                )}
              </div>

              {/* --- THÔNG TIN ĐỊA CHỈ (ADDRESS) --- */}
              <h3 className='text-lg font-semibold text-slate-900 pt-4'>
                Thông tin Địa chỉ
              </h3>

              {/* STREET */}
              <div className='space-y-2'>
                <label className='text-sm font-medium text-slate-900'>
                  Tên Đường/Số nhà
                </label>
                <div className='relative'>
                  <MapPin className='absolute left-3 top-3 h-5 w-5 text-slate-400' />
                  <Input
                    type='text'
                    placeholder='123 Đường Nguyễn Huệ'
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className='pl-10'
                  />
                </div>
              </div>

              {/* BUILDING NAME */}
              <div className='space-y-2'>
                <label className='text-sm font-medium text-slate-900'>
                  Tên Tòa nhà (Nếu có)
                </label>
                <div className='relative'>
                  <MapPin className='absolute left-3 top-3 h-5 w-5 text-slate-400' />
                  <Input
                    type='text'
                    placeholder='Tòa nhà Bitexco'
                    value={buildingName}
                    onChange={(e) => setBuildingName(e.target.value)}
                    className='pl-10'
                  />
                </div>
              </div>

              {/* CITY & STATE */}
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <label className='text-sm font-medium text-slate-900'>
                    Thành phố/Tỉnh
                  </label>
                  <Input
                    type='text'
                    placeholder='Hồ Chí Minh'
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div className='space-y-2'>
                  <label className='text-sm font-medium text-slate-900'>
                    Quận/Huyện
                  </label>
                  <Input
                    type='text'
                    placeholder='Quận 1'
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                </div>
              </div>

              {/* COUNTRY & PINCODE */}
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <label className='text-sm font-medium text-slate-900'>
                    Quốc gia
                  </label>
                  <Input
                    type='text'
                    placeholder='Việt Nam'
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </div>
                <div className='space-y-2'>
                  <label className='text-sm font-medium text-slate-900'>
                    Mã bưu chính (Pincode)
                  </label>
                  <Input
                    type='text'
                    placeholder='700000'
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                  />
                </div>
              </div>

              <label className='flex items-start space-x-2 cursor-pointer'>
                <input
                  type='checkbox'
                  className='w-4 h-4 mt-1 rounded border-slate-300'
                  required
                />
                <span className='text-sm text-slate-600'>
                  Terms of Service and Privacy Policy
                </span>
              </label>

              <Button type='submit' size='lg' className='w-full h-11 text-base'>
                Create Account
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
                onClick={() => signIn('github')}
              >
                <FaGithub className='text-xl' />
                Continue with Github
              </Button>
            </form>

            <p className='mt-6 text-center text-slate-600'>
              Already have an account?{' '}
              <Link
                href='/site/login'
                className='text-blue-600 hover:text-blue-700 font-semibold'
              >
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className='mt-6 text-center text-xs text-slate-500'>
          This site is protected by reCAPTCHA and the Google{' '}
          <Link href='#' className='underline hover:text-slate-700'>
            Privacy Policy
          </Link>{' '}
          and{' '}
          <Link href='#' className='underline hover:text-slate-700'>
            Terms of Service
          </Link>{' '}
          apply.
        </p>
      </div>
    </div>
  );
}

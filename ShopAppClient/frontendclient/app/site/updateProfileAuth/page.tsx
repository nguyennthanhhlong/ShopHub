'use client';
import { useSession } from 'next-auth/react';
import { useAuth } from '@/context/authContext';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function SocialRegisterPage() {
  const { data: session } = useSession();
  const { registerUser, loginUser } = useAuth();
  const router = useRouter();

  const [tempPassword, setTempPassword] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    firstName: session?.user?.name?.split(' ')[0] || '',
    lastName: session?.user?.name?.split(' ')[1] || '',
    email: session?.user?.email || '',
    mobileNumber: '',
    street: '',
    buildingName: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.firstName.length < 2) return alert('Họ phải ít nhất 2 ký tự');
    if (form.lastName.length < 2) return alert('Tên phải ít nhất 2 ký tự');
    if (form.city.length < 4) return alert('Thành phố phải ít nhất 4 ký tự');
    if (!form.country) return alert('Quốc gia không được để trống');
    if (!form.mobileNumber) return alert('Số điện thoại không được để trống');
    if (!form.street) return alert('Địa chỉ không được để trống');

    const generatedPassword = `ShopHub@${Math.floor(100000 + Math.random() * 900000)}`;

    const registrationData = {
      firstName: form.firstName,
      lastName: form.lastName,
      mobileNumber: form.mobileNumber,
      email: form.email,
      password: generatedPassword, // Mật khẩu tạm
      address: {
        street: form.street,
        buildingName: form.buildingName || 'string',
        city: form.city || 'string',
        state: form.state || 'string',
        country: form.country || 'string',
        pincode: form.pincode || 'string',
      },
      roles: [
        {
          roleId: 101,
          roleName: 'Admin',
        },
      ],
      cart: {
        cartId: Math.floor(Math.random() * 1000000),
      },
    };

    try {
      await registerUser(registrationData);
      await loginUser({
        email: registrationData.email,
        password: generatedPassword,
      });
      setTempPassword(generatedPassword);
      setShowModal(true);
    } catch (err) {
      console.error(err);
      alert('Cập nhật thông tin thất bại');
    }
  };

  const handleContinue = () => {
    setShowModal(false);
    router.push('/site');
  };

  return (
    <section className='min-h-screen flex justify-center items-center bg-slate-50 py-12'>
      <Card className='w-full max-w-lg p-8 shadow-lg space-y-6'>
        <h1 className='text-2xl font-semibold text-center'>
          Cập nhật thông tin tài khoản
        </h1>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='firstName'>Họ</Label>
              <Input
                id='firstName'
                name='firstName'
                placeholder='Nguyễn'
                value={form.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor='lastName'>Tên</Label>
              <Input
                id='lastName'
                name='lastName'
                placeholder='Thanh Long'
                value={form.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              name='email'
              value={form.email}
              readOnly
              className='bg-gray-100 cursor-not-allowed'
            />
          </div>

          <div>
            <Label htmlFor='mobileNumber'>Số điện thoại</Label>
            <Input
              id='mobileNumber'
              name='mobileNumber'
              placeholder='+84 912 345 678'
              value={form.mobileNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor='street'>Địa chỉ</Label>
            <Input
              id='street'
              name='street'
              placeholder='123 Đường ABC'
              value={form.street}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor='buildingName'>Tên tòa nhà / Số nhà</Label>
            <Input
              id='buildingName'
              name='buildingName'
              placeholder='Tòa nhà XYZ / Số 12'
              value={form.buildingName}
              onChange={handleChange}
            />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <Label htmlFor='city'>Thành phố</Label>
              <Input
                id='city'
                name='city'
                placeholder='Hà Nội'
                value={form.city}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor='country'>Quốc gia</Label>
              <Input
                id='country'
                name='country'
                placeholder='Việt Nam'
                value={form.country}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor='pincode'>Mã bưu chính</Label>
              <Input
                id='pincode'
                name='pincode'
                placeholder='100000'
                value={form.pincode}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <Button
            type='submit'
            className='w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold'
          >
            Lưu & Tiếp tục
          </Button>
        </form>
      </Card>

      {/* MODAL HIỂN THỊ MẬT KHẨU TẠM */}
      {showModal && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4'>
          <div className='bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative'>
            <h2 className='text-xl font-bold text-slate-900 mb-2'>
              Tạo tài khoản thành công!
            </h2>
            <p className='text-slate-600 mb-4'>
              Để thuận tiện cho những lần đăng nhập sau bằng email và mật khẩu (nếu không dùng Social Login), hệ thống đã tạo cho bạn một mật khẩu tạm thời:
            </p>
            <div className='bg-blue-50 border border-blue-200 rounded-md p-4 mb-4 text-center'>
              <span className='text-2xl font-mono font-bold text-blue-700 tracking-wider'>{tempPassword}</span>
            </div>
            <p className='text-sm text-red-500 mb-6 font-medium'>
              * Vui lòng lưu lại mật khẩu này và đổi lại mật khẩu mới trong phần Hồ sơ (Profile) của bạn.
            </p>
            <Button onClick={handleContinue} className='w-full'>
              Tôi đã lưu mật khẩu & Đăng nhập
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

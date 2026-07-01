'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Check,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  User,
  LogOut,
  Loader,
  Package,
  Lock,
  ShoppingBag,
  ShieldCheck,
  ChevronRight,
  Map,
  Edit3
} from 'lucide-react';
import { useAuth } from '@/context/authContext';
import { OrderDTO } from '@/types/types';
import { motion, AnimatePresence } from 'framer-motion';

interface UserFormData {
  firstName: string;
  lastName: string;
  mobileNumber: string;
  address: string;
}

export default function ProfilePage() {
  const { user, updateUserInfo, logoutUser, token, updateUserPassword } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'security'>('profile');
  
  // Profile State
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    firstName: '',
    lastName: '',
    mobileNumber: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Orders State
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [hasFetchedOrders, setHasFetchedOrders] = useState(false);

  // Security State
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [loadingPassword, setLoadingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        mobileNumber: user.mobileNumber || '',
        address: user.address?.street || '',
      });
    } else {
      if (localStorage.getItem('token')) {
        const userString = localStorage.getItem('user');
        if (userString) {
          const parsedUser = JSON.parse(userString);
          setFormData({
            firstName: parsedUser.firstName || '',
            lastName: parsedUser.lastName || '',
            mobileNumber: parsedUser.mobileNumber || '',
            address: parsedUser.address?.street || '',
          });
        }
      }
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'orders' && !hasFetchedOrders && user) {
      fetchOrders();
    }
  }, [activeTab, user, hasFetchedOrders]);

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setSuccessMessage('');
      setErrorMessage('');
      await updateUserInfo(user.userId, formData);
      setSuccessMessage('Cập nhật thông tin thành công!');
      setEditMode(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setErrorMessage('Cập nhật thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Mật khẩu mới không khớp!');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    try {
      setLoadingPassword(true);
      await updateUserPassword({
        email: user.email,
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });
      setPasswordSuccess('Đổi mật khẩu thành công!');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (err: any) {
      setPasswordError(err.message || 'Đổi mật khẩu thất bại. Vui lòng thử lại.');
    } finally {
      setLoadingPassword(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const res = await fetch(`http://localhost:8080/api/public/users/${user.email}/orders`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
        setHasFetchedOrders(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <Loader className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
        <p className="text-lg text-slate-600">Đang tải thông tin...</p>
      </div>
    );
  }

  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();

  return (
    <div className="min-h-screen bg-slate-50/50 py-12">
      <div className="container mx-auto max-w-6xl px-4">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {fullName ? fullName.charAt(0).toUpperCase() : <User />}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{fullName || 'Khách hàng'}</h1>
              <p className="text-slate-500 flex items-center gap-2 mt-1">
                <Mail className="w-4 h-4" /> {user.email}
              </p>
            </div>
          </div>
          <Button 
            variant="destructive" 
            className="flex items-center gap-2 rounded-full px-6 shadow-sm hover:shadow-md transition-all"
            onClick={() => logoutUser()}
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </Button>
        </div>

        {/* Main Content Grid */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Navigation */}
          <div className="w-full lg:w-1/4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-3 flex flex-col gap-2 sticky top-24">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`flex items-center justify-between w-full p-4 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:bg-slate-50 text-slate-600'}`}
              >
                <span className="flex items-center gap-3"><User className="w-5 h-5" /> Thông tin cá nhân</span>
                {activeTab === 'profile' && <ChevronRight className="w-4 h-4" />}
              </button>
              <button 
                onClick={() => setActiveTab('orders')}
                className={`flex items-center justify-between w-full p-4 rounded-xl transition-all ${activeTab === 'orders' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:bg-slate-50 text-slate-600'}`}
              >
                <span className="flex items-center gap-3"><ShoppingBag className="w-5 h-5" /> Lịch sử đơn hàng</span>
                {activeTab === 'orders' && <ChevronRight className="w-4 h-4" />}
              </button>
              <button 
                onClick={() => setActiveTab('security')}
                className={`flex items-center justify-between w-full p-4 rounded-xl transition-all ${activeTab === 'security' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:bg-slate-50 text-slate-600'}`}
              >
                <span className="flex items-center gap-3"><ShieldCheck className="w-5 h-5" /> Đổi mật khẩu</span>
                {activeTab === 'security' && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="w-full lg:w-3/4">
            <AnimatePresence mode="wait">
              {/* PROFILE TAB */}
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="border-0 shadow-lg rounded-3xl overflow-hidden bg-white">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="text-2xl text-slate-800">Hồ sơ của bạn</CardTitle>
                          <CardDescription>Quản lý thông tin cá nhân và địa chỉ giao hàng</CardDescription>
                        </div>
                        {!editMode && (
                          <Button variant="outline" onClick={() => setEditMode(true)} className="rounded-full gap-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                            <Edit3 className="w-4 h-4" /> Cập nhật
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-8">
                      {successMessage && (
                        <Alert className="mb-6 border-green-200 bg-green-50 text-green-800 rounded-xl">
                          <Check className="h-4 w-4 text-green-600" />
                          <AlertDescription>{successMessage}</AlertDescription>
                        </Alert>
                      )}
                      {errorMessage && (
                        <Alert variant="destructive" className="mb-6 rounded-xl">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{errorMessage}</AlertDescription>
                        </Alert>
                      )}

                      {editMode ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-600">Họ</label>
                            <Input value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="rounded-xl h-12" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-600">Tên</label>
                            <Input value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="rounded-xl h-12" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-600">Số điện thoại</label>
                            <Input value={formData.mobileNumber} onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })} className="rounded-xl h-12" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-600">Địa chỉ (Đường/Số nhà)</label>
                            <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="rounded-xl h-12" />
                          </div>
                          <div className="col-span-1 md:col-span-2 flex gap-3 mt-4">
                            <Button onClick={handleSaveProfile} disabled={loading} className="rounded-xl h-12 px-8 bg-indigo-600 hover:bg-indigo-700">
                              {loading ? <Loader className="w-4 h-4 animate-spin mr-2" /> : null} Lưu thay đổi
                            </Button>
                            <Button variant="ghost" onClick={() => setEditMode(false)} className="rounded-xl h-12">Hủy</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <div className="p-3 bg-white rounded-xl shadow-sm"><User className="w-6 h-6 text-indigo-500" /></div>
                            <div>
                              <p className="text-sm text-slate-500 font-medium mb-1">Họ và Tên</p>
                              <p className="text-lg font-semibold text-slate-800">{fullName}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <div className="p-3 bg-white rounded-xl shadow-sm"><Mail className="w-6 h-6 text-indigo-500" /></div>
                            <div>
                              <p className="text-sm text-slate-500 font-medium mb-1">Email</p>
                              <p className="text-lg font-semibold text-slate-800">{user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <div className="p-3 bg-white rounded-xl shadow-sm"><Phone className="w-6 h-6 text-indigo-500" /></div>
                            <div>
                              <p className="text-sm text-slate-500 font-medium mb-1">Số điện thoại</p>
                              <p className="text-lg font-semibold text-slate-800">{user.mobileNumber || 'Chưa cập nhật'}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <div className="p-3 bg-white rounded-xl shadow-sm"><Map className="w-6 h-6 text-indigo-500" /></div>
                            <div>
                              <p className="text-sm text-slate-500 font-medium mb-1">Địa chỉ giao hàng</p>
                              <p className="text-lg font-semibold text-slate-800 line-clamp-2">{user.address?.street || 'Chưa cập nhật'}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* ORDERS TAB */}
              {activeTab === 'orders' && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="border-0 shadow-lg rounded-3xl overflow-hidden bg-white">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-6">
                      <CardTitle className="text-2xl text-slate-800">Lịch sử đơn hàng</CardTitle>
                      <CardDescription>Theo dõi và quản lý các đơn hàng bạn đã mua</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8">
                      {loadingOrders ? (
                        <div className="flex flex-col items-center justify-center py-12">
                          <Loader className="w-8 h-8 animate-spin text-indigo-500 mb-4" />
                          <p className="text-slate-500">Đang tải đơn hàng...</p>
                        </div>
                      ) : orders.length === 0 ? (
                        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                          <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                          <h3 className="text-xl font-bold text-slate-700 mb-2">Chưa có đơn hàng nào</h3>
                          <p className="text-slate-500 mb-6">Bạn chưa thực hiện giao dịch nào trên ShopHub.</p>
                          <Link href="/site/products">
                            <Button className="rounded-full px-8 bg-indigo-600 hover:bg-indigo-700">Khám phá sản phẩm</Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {orders.map((order, idx) => (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                              key={order.orderId} 
                              className="border border-slate-100 rounded-2xl p-6 hover:shadow-md transition-shadow bg-white"
                            >
                              <div className="flex flex-col md:flex-row justify-between md:items-center border-b border-slate-100 pb-4 mb-4 gap-4">
                                <div>
                                  <p className="text-sm text-slate-500 font-medium">Mã đơn hàng</p>
                                  <p className="font-bold text-lg text-slate-800">#{order.orderId}</p>
                                </div>
                                <div className="flex flex-wrap gap-4">
                                  <div className="bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100">
                                    <p className="text-xs text-indigo-600 font-bold uppercase mb-1">Trạng thái</p>
                                    <p className="font-bold text-indigo-900">{order.orderStatus}</p>
                                  </div>
                                  <div className="bg-green-50 px-4 py-2 rounded-xl border border-green-100">
                                    <p className="text-xs text-green-600 font-bold uppercase mb-1">Tổng tiền</p>
                                    <p className="font-bold text-green-900">${order.totalAmount?.toFixed(2)}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-3">
                                {order.orderItems?.map((item: any, i: number) => (
                                  <div key={i} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                                    <div className="flex items-center gap-3">
                                      <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center border border-slate-100 overflow-hidden">
                                        <img src={`http://localhost:8080/api/public/products/image/${item.product.image}`} alt={item.product.productName} className="w-full h-full object-cover" onError={(e: any) => { e.target.src = '/placeholder.png' }} />
                                      </div>
                                      <div>
                                        <p className="font-semibold text-slate-800">{item.product.productName}</p>
                                        <p className="text-sm text-slate-500">Số lượng: {item.quantity}</p>
                                      </div>
                                    </div>
                                    <p className="font-bold text-slate-700">${(item.orderedProductPrice * item.quantity).toFixed(2)}</p>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* SECURITY TAB */}
              {activeTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="border-0 shadow-lg rounded-3xl overflow-hidden bg-white max-w-2xl">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-6">
                      <CardTitle className="text-2xl text-slate-800 flex items-center gap-2">
                        <Lock className="w-6 h-6 text-indigo-500" /> Thay đổi mật khẩu
                      </CardTitle>
                      <CardDescription>Bảo vệ tài khoản của bạn bằng một mật khẩu mạnh</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                      {passwordSuccess && (
                        <Alert className="mb-6 border-green-200 bg-green-50 text-green-800 rounded-xl">
                          <Check className="h-4 w-4 text-green-600" />
                          <AlertDescription>{passwordSuccess}</AlertDescription>
                        </Alert>
                      )}
                      {passwordError && (
                        <Alert variant="destructive" className="mb-6 rounded-xl">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{passwordError}</AlertDescription>
                        </Alert>
                      )}

                      <div className="space-y-5">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-600">Mật khẩu hiện tại</label>
                          <Input 
                            type="password" 
                            value={passwordData.oldPassword} 
                            onChange={e => setPasswordData({...passwordData, oldPassword: e.target.value})} 
                            className="rounded-xl h-12"
                            placeholder="Nhập mật khẩu cũ..."
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-600">Mật khẩu mới</label>
                          <Input 
                            type="password" 
                            value={passwordData.newPassword} 
                            onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} 
                            className="rounded-xl h-12"
                            placeholder="Nhập mật khẩu mới..."
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-600">Xác nhận mật khẩu mới</label>
                          <Input 
                            type="password" 
                            value={passwordData.confirmPassword} 
                            onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} 
                            className="rounded-xl h-12"
                            placeholder="Nhập lại mật khẩu mới..."
                          />
                        </div>
                        
                        <Button 
                          onClick={handleChangePassword} 
                          disabled={loadingPassword || !passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                          className="w-full rounded-xl h-12 mt-4 bg-indigo-600 hover:bg-indigo-700"
                        >
                          {loadingPassword ? <Loader className="w-4 h-4 animate-spin mr-2" /> : null} 
                          Cập nhật mật khẩu
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

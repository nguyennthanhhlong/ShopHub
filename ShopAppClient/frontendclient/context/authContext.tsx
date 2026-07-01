'use client';
import {
  login,
  register,
  updateUser,
  getUserByEmail,
  forgotPassword,
  changePassword,
} from '@/services/authService';
import { createContext, useContext, useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react'; 
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: any;
  token: string | null;
  loading: boolean;
  registerUser: (data: any) => Promise<void>;
  loginUser: (credentials: {
    email: string;
    password: string;
  }) => Promise<void>;
  logoutUser: () => void;
  updateUserInfo: (userId: number, data: any) => Promise<void>;
  requestForgotPassword: (email: string) => Promise<any>;
  updateUserPassword: (data: any) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession(); // 👈 lấy thông tin NextAuth session
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // 🧠 Ưu tiên user từ NextAuth nếu có (GitHub)
  useEffect(() => {
    if (session?.user) {
      const storedUser = localStorage.getItem('user');
      const userLocal = storedUser ? JSON.parse(storedUser) : null;
      setUser(userLocal);
      setToken('nextauth'); // đánh dấu là user đăng nhập qua NextAuth
      return;
    }

    // nếu không có session => dùng token localStorage (JWT)
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, [session]);

  const registerUser = async (data: any) => {
    setLoading(true);
    try {
      const res = await register(data);
      if (!res || !res['jwt-token']) throw new Error('Đăng ký thất bại');
      localStorage.removeItem('shopHubChatMessages');
      return res;
    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginUser = async (credentials: {
    email: string;
    password: string;
  }) => {
    setLoading(true);
    try {
      const res = await login(credentials);
      const jwt = res['jwt-token'];
      setToken(jwt);
      localStorage.setItem('token', jwt);
      const userDetail = await getUserByEmail(credentials.email);
      setUser(userDetail);
      localStorage.setItem('user', JSON.stringify(userDetail));
    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 🧹 Logout cho cả 2 trường hợp
  const logoutUser = () => {
    if (session) {
      signOut({ callbackUrl: '/' }); // 👈 nếu là NextAuth (GitHub)
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('shopHubChatMessages');
    router.push('/');
  };

  const updateUserInfo = async (userId: number, data: any) => {
    // 🔹 Nếu là user GitHub (NextAuth)
    if (token === 'nextauth') {
      if (!user?.email)
        throw new Error('Không tìm thấy email người dùng GitHub.');

      const res = await fetch(
        `http://localhost:8080/api/public/users/email/${user.email}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      );

      if (!res.ok) {
        throw new Error('Cập nhật GitHub user thất bại');
      }

      const updatedUser = await res.json();
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return;
    }

    // 🔹 Nếu là user đăng nhập thường (JWT)
    const updatedUser = await updateUser(userId, data, token!);
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const requestForgotPassword = async (email: string) => {
    setLoading(true);
    try {
      const res = await forgotPassword(email);
      return res;
    } finally {
      setLoading(false);
    }
  };

  const updateUserPassword = async (data: any) => {
    setLoading(true);
    try {
      const res = await changePassword(data);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        registerUser,
        loginUser,
        logoutUser,
        updateUserInfo,
        requestForgotPassword,
        updateUserPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

import axiosClient from '@/libraryService/axiosClient';

const BASE_URL = 'http://localhost:8080/api';

export const register = async (userData: any) => {
  try {
    const res = await axiosClient.post(`${BASE_URL}/register`, userData);
    return res.data;
  } catch (error: any) {
    console.log('❌ Register failed:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message ||
        'Register failed. Please check your information and try again.'
    );
  }
};

export const login = async (credentials: {
  email: string;
  password: string;
}) => {
  try {
    console.log(
      'login auth service: email:',
      credentials.email,
      ' ,password: ',
      credentials.password
    );
    const res = await axiosClient.post(`${BASE_URL}/login`, credentials);
    return res.data;
  } catch (error: any) {
    console.log('❌ Login failed:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message ||
        'Login failed. Please check your credentials.'
    );
  }
};

export const updateUser = async (
  userId: number,
  userData: any,
  token: string
) => {
  try {
    const res = await axiosClient.put(`${BASE_URL}/users/${userId}`, userData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error: any) {
    console.log(
      '❌ Update user failed:',
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || 'Update user failed. Please try again.'
    );
  }
};

export const getUserByEmail = async (email: string) => {
  try {
    const res = await axiosClient.get(
      `${BASE_URL}/public/users/email/${email}`
    );
    return res.data; // UserDTO trả về từ backend
    } catch (error: any) {
    console.log(
      '❌ Failed to fetch user by email:',
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || 'Không thể lấy thông tin người dùng.'
    );
  }
};

export const forgotPassword = async (email: string) => {
  try {
    const res = await axiosClient.post(`${BASE_URL}/public/users/forgot-password`, { email });
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Gửi yêu cầu quên mật khẩu thất bại. Vui lòng thử lại.'
    );
  }
};

export const changePassword = async (data: any) => {
  try {
    const res = await axiosClient.put(`${BASE_URL}/public/users/change-password`, data);
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại.'
    );
  }
};

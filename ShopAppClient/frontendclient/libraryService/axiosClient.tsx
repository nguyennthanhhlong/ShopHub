import API_CONFIG from '@/config/api';
import axios from 'axios';

// Tạo instance Axios với cấu hình mặc định
const axiosClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 30000,
  headers: API_CONFIG.HEADERS,
});

// ✅ Interceptor cho request
axiosClient.interceptors.request.use(
  (config) => {
    const token =
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJVc2VyIERldGFpbHMiLCJpc3MiOiJFdmVuIFNjaGVkdWxlciIsImlhdCI6MTc2MjU3MzIwOSwiZW1haWwiOiJ0ZXN0QGdtYWlsLmNvbSJ9.yyTuTtnDwG636TePN-SPf8-4QbmI_vCwZ6TZBpje3IY';
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Interceptor cho response
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default axiosClient;

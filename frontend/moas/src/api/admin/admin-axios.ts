// src/api/admin-axios.ts
import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const adminApiClient: AxiosInstance = axios.create({
  baseURL: 'http://54.180.99.55/admin/api',  // HTTP + 새 IP로 변경
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 관리자 토큰 사용
adminApiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('adminAccessToken');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// 401 에러 시 관리자 로그인으로 리다이렉트
adminApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminAccessToken');
      localStorage.removeItem('adminRefreshToken');
      localStorage.removeItem('adminName');
      localStorage.removeItem('adminId');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default adminApiClient;
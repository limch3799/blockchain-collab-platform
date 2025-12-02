import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',  // 백엔드 주소
  headers: {
    'Content-Type': 'application/json',
  },
});

// 토큰 설정 (로그인 후 받은 토큰)
export const setAuthToken = (token: string) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export default api;
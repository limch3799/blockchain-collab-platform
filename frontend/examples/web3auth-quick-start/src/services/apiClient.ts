// src/services/apiClient.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://k13s401.p.ssafy.io/api', // 실제 백엔드 API 주소로 변경
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: Web3Auth 로그인 후 백엔드에서 받은 JWT를 모든 요청 헤더에 추가
apiClient.interceptors.request.use(
  (config) => {
    // 실제 앱에서는 로그인 후 localStorage 또는 상태 관리 라이브러리에 JWT 저장
    const token = 'eyJhbGciOiJIUzI1NiJ9.eyJtZW1iZXJJZCI6MzI4LCJyb2xlIjoiQVJUSVNUIiwiaWF0IjoxNzYyNDA4NDA3LCJleHAiOjE3NjUwMDA0MDcsImZpZCI6IjRmODM5NGNiLTcyMjctNDM1NC1hODM0LWI5OTg1MzFlODRlZiIsInNpZCI6ImIxNmRiNjc5LTMzOGItNGI0ZC05MmQzLTdlOGY4MzIzNjBjZSIsImZ2ZXIiOjF9.LQuz6FIUJW9O8JGQjx9aeINUDxqqhF7a6gd6BADg4QY'
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
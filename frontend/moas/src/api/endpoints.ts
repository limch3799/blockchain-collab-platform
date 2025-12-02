// API 엔드포인트 URL을 한 곳에서 관리
// API 호출 함수들을 모듈화
// URL 변경 시 한 곳만 수정하면 됨

import api from './axios'
import type { User, LoginRequest, LoginResponse } from '@/types/user'
//import { Project, CreateProjectRequest } from '@/types/project'

// ==================== Auth API ====================
export const authAPI = {
  // 로그인
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', data)
    return response.data
  },

  // 회원가입
//   register: async (data: RegisterRequest): Promise<User> => {
//     const response = await api.post<User>('/auth/register', data)
//     return response.data
//   },

  // OAuth 로그인 (카카오, 구글 등)
  oauthLogin: async (provider: string, code: string) => {
    const response = await api.post(`/auth/oauth/${provider}`, { code })
    return response.data
  },

  // Web3 로그인
  web3Login: async (walletAddress: string) => {
    const response = await api.post('/auth/web3-login', { walletAddress })
    return response.data
  },

  // 로그아웃
  logout: async () => {
    await api.post('/auth/logout')
  },

  // 현재 사용자 정보 조회
  getMe: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me')
    return response.data
  },
}

// ==================== User API ====================
export const userAPI = {
  // 사용자 프로필 조회
  getProfile: async (userId: string): Promise<User> => {
    const response = await api.get<User>(`/users/${userId}`);
    return response.data;
  },

  // 사용자 프로필 수정
  updateProfile: async (userId: string, data: Partial<User>) => {
    const response = await api.put(`/users/${userId}`, data);
    return response.data;
  },

  // 사용자 리뷰 조회 (내 리뷰)
  getMyReviews: async (type: 'sent' | 'received', page: number, size: number) => {
    const response = await api.get(`/members/me/reviews`, {
      params: { type, page, size },
    });
    return response.data;
  },

  // 특정 사용자의 리뷰 조회
  getUserReviews: async (userId: number, type: 'sent' | 'received', page: number, size: number) => {
    const response = await api.get(`/members/${userId}/reviews`, {
      params: { type, page, size },
    });
    return response.data;
  },
};



// ==================== Portfolio API ====================
export const portfolioAPI = {
  // 포트폴리오 목록 조회
  getPortfolios: async (userId: string) => {
    const response = await api.get(`/users/${userId}/portfolios`)
    return response.data
  },

  // 포트폴리오 업로드
  uploadPortfolio: async (formData: FormData) => {
    const response = await api.post('/portfolios', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
}
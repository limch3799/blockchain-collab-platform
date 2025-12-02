// 사용자 관련 TypeScript 타입 정의
// API 요청/응답 타입 정의


//현재 미사용중인 예시파일입니다!!!!!!!!!!!


export interface User {
  id: string
  email: string
  name: string
  walletAddress?: string
  role: 'artist' | 'leader'
  profileImage?: string
  bio?: string
  createdAt: string
  updatedAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  refreshToken: string
  user: User
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  role: 'artist' | 'leader'
}

export interface UpdateProfileRequest {
  name?: string
  bio?: string
  profileImage?: string
}
// src/api/auth.ts

import apiClient from './axios';
import type { LoginRequest, LoginResponse } from '@/types/auth';
import type { MemberMeResponse, UpdateProfileRequest } from '@/types/member';
import { getMyBookmarks } from './bookmark';
import { saveBookmarksToStorage, clearBookmarksFromStorage } from '@/pages/project-post/bookmarkUtils';

// 알림 관련 로컬스토리지 키
const NOTIFICATION_FETCH_KEY = 'lastNotificationFetch';
const NOTIFICATION_CACHE_KEY = 'cachedNotifications';

// 로그인 API
export const login = async (idToken: string, walletAddress: string): Promise<LoginResponse> => {
  const loginRequest: LoginRequest = {
    idToken,
    walletAddress
  };

  const response = await apiClient.post<LoginResponse>('/auth/login', loginRequest);

  // 로그인 성공 시 북마크 목록 로드
  try {
    clearBookmarksFromStorage(); // 기존 북마크 삭제
    const bookmarks = await getMyBookmarks();
    saveBookmarksToStorage(bookmarks);
    // console.log('북마크 목록 로드 완료:', bookmarks);
  } catch (error) {
    console.error('북마크 목록 로드 실패:', error);
  }

  return response.data;
};

// 내 정보 조회 API
export const getMemberMe = async (): Promise<MemberMeResponse> => {
  const response = await apiClient.get<MemberMeResponse>('/members/me');
  
  return response.data;
};

// 닉네임 중복 확인 API
export const checkNicknameAvailability = async (nickname: string): Promise<{ available: boolean; nickname: string }> => {
  const response = await apiClient.get<{ available: boolean; nickname: string }>('/members/nickname/exists', {
    params: { nickname }
  });
  return response.data;
};

// 프로필 수정 API
export const updateMemberProfile = async (
  data: UpdateProfileRequest,
  profileImage?: File | null
): Promise<MemberMeResponse> => {
  const formData = new FormData();

  // data 객체를 JSON 문자열로 변환하여 추가
  const dataJson = JSON.stringify(data);
  formData.append('data', dataJson);

  // 프로필 이미지가 있으면 추가
  if (profileImage) {
    formData.append('profileImage', profileImage);
  }

  const response = await apiClient.patch<MemberMeResponse>('/members/me', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

// ==================== Auth API ====================
export const authAPI = {
  // 로그인
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    
    // 로그인 성공 시 북마크 목록 로드
    try {
      clearBookmarksFromStorage();
      const bookmarks = await getMyBookmarks();
      saveBookmarksToStorage(bookmarks);
    } catch (error) {
      console.error('북마크 목록 로드 실패:', error);
    }
    
    return response.data;
  },

  // 로그아웃
  logout: async () => {
    await apiClient.post('/auth/logout');
    
    // 알림 관련 로컬스토리지 삭제
    localStorage.removeItem(NOTIFICATION_FETCH_KEY);
    localStorage.removeItem(NOTIFICATION_CACHE_KEY);
    
    // 북마크 로컬스토리지 삭제
    clearBookmarksFromStorage();
  },

  // 현재 사용자 정보 조회
  getMe: async (): Promise<MemberMeResponse> => {
    const response = await apiClient.get<MemberMeResponse>('/members/me');
    return response.data;
  },

  // 토큰 갱신
  refresh: async (): Promise<{ accessToken: string }> => {
    const response = await apiClient.post<{ accessToken: string }>('/auth/refresh');
    return response.data;
  },

  // 프로필 수정
  updateProfile: async (
    data: UpdateProfileRequest,
    profileImage?: File | null
  ): Promise<MemberMeResponse> => {
    return updateMemberProfile(data, profileImage);
  },

  // 닉네임 중복 확인
  checkNickname: async (nickname: string): Promise<{ available: boolean; nickname: string }> => {
    return checkNicknameAvailability(nickname);
  },
};
// src/lib/token.ts
// 토큰 관리 유틸리티

const TOKEN_KEY = 'accessToken';
const MEMBER_ID_KEY = 'memberId';

export const tokenManager = {
  // Access Token 저장
  setAccessToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  // Access Token 가져오기
  getAccessToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Access Token 삭제
  removeAccessToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  },

  // Member ID 저장
  setMemberId: (memberId: number): void => {
    localStorage.setItem(MEMBER_ID_KEY, memberId.toString());
  },

  // Member ID 가져오기
  getMemberId: (): number | null => {
    const id = localStorage.getItem(MEMBER_ID_KEY);
    return id ? parseInt(id, 10) : null;
  },

  // Member ID 삭제
  removeMemberId: (): void => {
    localStorage.removeItem(MEMBER_ID_KEY);
  },

  // 모든 인증 정보 삭제
  clearAll: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(MEMBER_ID_KEY);
  },

  // 로그인 상태 확인
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(TOKEN_KEY);
  },
};

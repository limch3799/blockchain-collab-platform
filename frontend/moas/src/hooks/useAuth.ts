// src/hooks/useAuth.ts

import { useState, useEffect } from 'react';
import { login, getMemberMe } from '@/api/auth';
import { tokenManager } from '@/lib/token';
import type { StoredUserInfo } from '@/types/member';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  memberId: number;
  role: 'LEADER' | 'ARTIST' | 'PENDING';
  iat: number;
  exp: number;
  fid: string;
  sid: string;
  fver: number;
}

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const userInfo = localStorage.getItem('userInfo');
    return !!userInfo;
  });

  useEffect(() => {
    const checkAuth = () => {
      const userInfo = localStorage.getItem('userInfo');
      setIsAuthenticated(!!userInfo);
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    const interval = setInterval(checkAuth, 100);

    return () => {
      window.removeEventListener('storage', checkAuth);
      clearInterval(interval);
    };
  }, []);

  const handleWeb3AuthLogin = async (idToken: string, walletAddress: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. 백엔드 로그인 API 호출
      console.log('🔐 로그인 API 호출 중...');
      const loginResponse = await login(idToken, walletAddress);
      
      console.log('✅ 로그인 성공:', {
        accessToken: loginResponse.accessToken.substring(0, 20) + '...',
        newUser: loginResponse.newUser,
      });

      // 2. Access Token 저장
      tokenManager.setAccessToken(loginResponse.accessToken);

      // 3. Access Token 디코딩하여 memberId와 role 추출
      console.log('🔓 토큰 디코딩 중...');
      const decodedToken = jwtDecode<DecodedToken>(loginResponse.accessToken);
      console.log('✅ 디코딩 성공:', {
        memberId: decodedToken.memberId,
        role: decodedToken.role,
      });

      const { memberId, role } = decodedToken;

      // 4. 멤버 ID 저장
      tokenManager.setMemberId(memberId);

      // ✅ 5. newUser이거나 role이 PENDING이면 역할 선택 필요
      const needsRoleSelection = loginResponse.newUser || (role !== 'LEADER' && role !== 'ARTIST');

      if (needsRoleSelection) {
        console.log('🔄 신규 유저 또는 역할 미설정 → 역할 선택 페이지로 이동');
        
        // ✅ 최소한의 정보만 저장 (getMemberMe 호출 안 함)
        const userInfo: StoredUserInfo & {
          memberId: number;
          biography: string;
        } = {
          accessToken: loginResponse.accessToken,
          memberId: memberId,
          nickname: '', // 빈 값
          role: role,
          profileImageUrl: null,
          biography: '', // 빈 값
        };
        
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        setIsAuthenticated(true);

        console.log('💾 최소 정보 저장 완료 (역할 선택 필요)');

        setIsLoading(false);
        return {
          success: true,
          accessToken: loginResponse.accessToken,
          newUser: loginResponse.newUser,
          needsRoleSelection: true,
          role,
        };
      }

      // 6. 기존 유저 - /api/members/me 호출하여 프로필 정보 조회
      console.log('👤 멤버 정보 조회 중...');
      const memberMe = await getMemberMe();
      
      console.log('✅ 멤버 정보 조회 성공:', memberMe);

      // 7. userInfo에 모든 정보 저장
      const userInfo: StoredUserInfo & {
        memberId: number;
        biography: string;
      } = {
        accessToken: loginResponse.accessToken,
        memberId: memberId,
        nickname: memberMe.nickname,
        role: role,
        profileImageUrl: memberMe.profileImageUrl,
        biography: memberMe.biography,
      };
      
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      setIsAuthenticated(true);

      console.log('💾 사용자 정보 저장 완료:', {
        memberId,
        nickname: memberMe.nickname,
        role,
      });

      setIsLoading(false);
      return {
        success: true,
        accessToken: loginResponse.accessToken,
        newUser: loginResponse.newUser,
        memberInfo: memberMe,
        needsRoleSelection: false,
        role,
      };
    } catch (err: any) {
      console.error('❌ 로그인 실패:', err);
      setError(err.response?.data?.message || '로그인에 실패했습니다.');
      setIsLoading(false);
      return {
        success: false,
        error: err.response?.data?.message || '로그인에 실패했습니다.',
      };
    }
  };

  const handleLogout = () => {
    tokenManager.clearAll();
    localStorage.removeItem('memberInfo');
    localStorage.removeItem('userInfo');
    setIsAuthenticated(false);
    console.log('🚪 로그아웃 완료');
  };

  const getUserInfoFromStorage = (): (StoredUserInfo & {
    memberId?: number;
    biography?: string;
  }) | null => {
    const stored = localStorage.getItem('userInfo');
    return stored ? JSON.parse(stored) : null;
  };

  return {
    handleWeb3AuthLogin,
    handleLogout,
    isAuthenticated,
    isLoading,
    error,
    getUserInfoFromStorage,
  };
};
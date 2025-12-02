// src/api/admin/auth.ts

const API_BASE_URL = 'http://54.180.99.55';  // HTTP + 새 IP로 변경

interface LoginRequest {
  loginId: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  name: string;
  adminId: number;
}

interface RefreshRequest {
  refreshToken: string;
}

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

interface LogoutRequest {
  refreshToken: string;
}

interface SignupRequest {
  loginId: string;
  password: string;
  name: string;
}

interface SignupResponse {
  adminId: number;
  loginId: string;
  name: string;
  createdAt: string;
}

export const adminApi = {
  // 로그인
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/admin/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('로그인에 실패했습니다.');
    }

    return response.json();
  },

  // 토큰 갱신
  refresh: async (data: RefreshRequest): Promise<RefreshResponse> => {
    const response = await fetch(`${API_BASE_URL}/admin/api/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('토큰 갱신에 실패했습니다.');
    }

    return response.json();
  },

  // 로그아웃
  logout: async (data: LogoutRequest, accessToken: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/admin/api/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok && response.status !== 204) {
      throw new Error('로그아웃에 실패했습니다.');
    }
  },

  // 회원가입
  signup: async (data: SignupRequest): Promise<SignupResponse> => {
    const response = await fetch(`${API_BASE_URL}/admin/api/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '회원가입에 실패했습니다.');
    }

    return response.json();
  },
};
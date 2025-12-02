// src/types/auth.ts

export interface LoginRequest {
  idToken: string;
  walletAddress: string;
}

export interface LoginResponse {
  accessToken: string;
  newUser: boolean;
}

export interface Web3AuthUserInfo {
  idToken: string;
  email?: string;
  name?: string;
  profileImage?: string;
  verifier?: string;
  verifierId?: string;
  aggregateVerifier?: string;
}
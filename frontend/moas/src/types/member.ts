// src/types/member.ts

export interface MemberInfo {
  memberId: number;
  nickname: string;
  walletAddress: string;
  email: string;
  role: 'LEADER' | 'ARTIST' | 'PENDING';
  profileImageUrl?: string;
  biography?: string;
}

export interface MemberProfileDetails {
  memberId: number;
  nickname: string;
  profileImageUrl?: string;
  averageRating: number;
  reviewCount: number;
  // Add other fields if necessary based on actual API response for /api/members/{memberId}
  // e.g., biography?: string; role?: 'LEADER' | 'ARTIST' | 'PENDING';
}

export interface MemberMeResponse {
  profileImageUrl: string | null;
  chainExploreUrl: string;
  nickname: string;
  biography: string;
  phoneNumber?: string;
  appliedProjectCount: number;
  inProgressProjectCount: number;
  completedProjectCount: number;
  inProgressProjectThumbnails: string[];
  interestedProjectThumbnails?: string[];
}

export interface StoredUserInfo {
  accessToken: string;
  nickname: string;
  role: 'LEADER' | 'ARTIST' | 'PENDING';
  profileImageUrl: string | null;
  biography?: string;
}

export interface UpdateProfileRequest {
  nickname?: string;
  biography?: string;
  phoneNumber?: string;
  profileImageUrl?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  walletAddress?: string;
  role: 'artist' | 'leader';
  profileImage?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: 'artist' | 'leader';
}
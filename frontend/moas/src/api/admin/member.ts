// src/api/admin/member.ts
import api from './admin-axios';

export interface MemberStats {
  penaltyScore: number;
  averageRating: number;
  reviewCount: number;
  pendingInquiries: number;
}

export interface MemberListItem {
  id: number;
  nickname: string;
  email: string | null;
  role: 'LEADER' | 'ARTIST' | 'PENDING';
  profileImageUrl: string | null;
  createdAt: string;
  deletedAt: string | null;
  stats: MemberStats;
}

export interface MemberListResponse {
  content: MemberListItem[];
  pageInfo: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface MemberDetail {
  id: number;
  nickname: string;
  biography: string | null;
  email: string | null;
  provider: string;
  providerId: string;
  phoneNumber: string | null;
  profileImageUrl: string | null;
  walletAddress: string;
  role: 'LEADER' | 'ARTIST' | 'PENDING';
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  stats: MemberStats;
}

export interface PenaltyItem {
  id: number;
  memberId: number;
  contractId: number | null;
  changedBy: number;
  penaltyScore: number;
  createdAt: string;
  changedAt: string;
}

export interface PenaltyListResponse {
  penalties: PenaltyItem[];
}

export interface UpdatePenaltyRequest {
  penaltyScore: number;
  reason: string;
  contractId?: number;
}

export interface UpdatePenaltyResponse {
  memberId: number;
  previousPenaltyScore: number;
  newPenaltyScore: number;
  changedScore: number;
  reason: string;
}

export interface MemberStatistics {
  totalMembers: number;
  roleDistribution: {
    pending: number;
    leader: number;
    artist: number;
  };
}

// 회원 목록 조회
export const getMemberList = async (
  page: number = 1,
  size: number = 20,
  role?: 'LEADER' | 'ARTIST',
  keyword?: string,
  order: 'asc' | 'desc' = 'desc'
) => {
  const response = await api.get<MemberListResponse>('/members', {
    params: {
      page,
      size,
      ...(role && { role }),
      ...(keyword && { keyword }),
      order,
    },
  });
  return response.data;
};

// 회원 상세 조회
export const getMemberDetail = async (memberId: number) => {
  const response = await api.get<MemberDetail>(`/members/${memberId}`);
  return response.data;
};

// 회원 페널티 이력 조회
export const getMemberPenalties = async (memberId: number) => {
  const response = await api.get<PenaltyListResponse>(`/members/${memberId}/penalties`);
  return response.data;
};

// 회원 페널티 수정
export const updateMemberPenalty = async (memberId: number, data: UpdatePenaltyRequest) => {
  const response = await api.patch<UpdatePenaltyResponse>(`/members/${memberId}/penalty`, data);
  return response.data;
};

// 회원 통계 조회
export const getMemberStatistics = async () => {
  const response = await api.get<MemberStatistics>('/members/statistics');
  return response.data;
};
// src/api/admin/contract.ts
import api from './admin-axios';
import type { ContractStatus } from '../../pages/admin/contract/contract';

export interface ContractProject {
  id: number;
  title: string;
}

export interface ContractMember {
  id: number;
  nickname: string;
}

export interface ContractListItem {
  contractId: number;
  title: string;
  project: ContractProject;
  leader: ContractMember;
  artist: ContractMember;
  amount: number;
  status: ContractStatus;
  startAt: string;
  endAt: string;
  createdAt: string;
}

export interface ContractListResponse {
  content: ContractListItem[];
  pageInfo: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface ContractDetailProject {
  projectId: number;
  title: string;
  projectPositionId: number | null;
  positionName: string | null;
  categoryName: string | null;
}

export interface ContractDetailMember {
  userId: number;
  nickname: string;
}

export interface ContractDetail {
  contractId: number;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  totalAmount: number;
  status: ContractStatus;
  appliedFeeRate: number;
  createdAt: string;
  project: ContractDetailProject;
  leader: ContractDetailMember;
  artist: ContractDetailMember;
}

export interface ContractLog {
  logId: number;
  actionType: string;
  actorMemberId: number;
  actorNickname: string;
  details: string;
  createdAt: string;
}

export interface ContractLogsResponse {
  logs: ContractLog[];
}

export interface ContractStatistics {
  statusCounts: Record<ContractStatus, number>;
}

export interface ApproveCancellationRequest {
  adminMemo: string;
  artistWorkingRatio: number;
}

export interface RejectCancellationRequest {
  adminMemo: string;
}

// 계약 목록 조회
export const getContractList = async (
  page: number = 1,
  size: number = 20,
  status?: ContractStatus,
  searchType?: 'MEMBER_ID' | 'NICKNAME',
  searchKeyword?: string,
  title?: string,
  memberId?: number,
  projectId?: number
) => {
  const response = await api.get<ContractListResponse>('/contracts', {
    params: {
      page,
      size,
      ...(status && { status }),
      ...(searchType && { searchType }),
      ...(searchKeyword && { searchKeyword }),
      ...(title && { title }),
      ...(memberId && { memberId }),
      ...(projectId && { projectId }),
    },
  });
  return response.data;
};

// 계약 상세 조회
export const getContractDetail = async (contractId: number) => {
  const response = await api.get<ContractDetail>(`/contracts/${contractId}`);
  return response.data;
};

// 계약 이력 조회
export const getContractLogs = async (contractId: number) => {
  const response = await api.get<ContractLogsResponse>(`/contracts/${contractId}/logs`);
  return response.data;
};

// 계약 통계 조회
export const getContractStatistics = async () => {
  const response = await api.get<ContractStatistics>('/contracts/statistics');
  return response.data;
};

// 계약 취소 승인
export const approveCancellation = async (
  contractId: number,
  data: ApproveCancellationRequest
) => {
  const response = await api.post(`/contracts/cancellation-requests/${contractId}/approve`, data);
  return response.data;
};

// 계약 취소 반려
export const rejectCancellation = async (contractId: number, data: RejectCancellationRequest) => {
  const response = await api.post(`/contracts/cancellation-requests/${contractId}/reject`, data);
  return response.data;
};
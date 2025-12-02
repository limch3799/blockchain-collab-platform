// src/api/apply.ts

import apiClient from './axios';

export interface ApplicationRequest {
  projectPositionId: number;
  portfolioId: number;
  message: string;
}

export interface ApplicationResponse {
  applicationId: number;
  status: string;
  createdAt: string;
}

export type ApplicationStatus = 'PENDING' | 'OFFERED' | 'REJECTED';

export interface MyApplicationItem {
  applicationId: number;
  status: ApplicationStatus;
  appliedAt: string;
  projectPositionId: number;
  positionName: string;
  project: {
    projectId: number;
    title: string;
    thumbnailUrl: string | null;
    leaderId: number;
    leaderNickname: string;
    leaderProfileUrl: string | null;
  };
  contract: any | null;
}

export interface MyApplicationsResponse {
  applications: MyApplicationItem[];
  pageInfo: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface AcceptContractResponse {
  contractId: number;
  status: string;
}

// 계약서 상세 조회 타입
export interface ContractDetail {
  contractId: number;
  title: string;
  description: string;
  leaderSignature: string;
  artistSignature: string | null;
  startAt: string;
  endAt: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  project: {
    projectId: number;
    title: string;
    projectPositionId: number | null;
    positionName: string | null;
    categoryName: string | null;
  };
  leader: {
    userId: number;
    nickname: string;
  };
  artist: {
    userId: number;
    nickname: string;
  };
}

export const applyToProject = async (
  projectId: number,
  data: ApplicationRequest
): Promise<ApplicationResponse> => {
  const response = await apiClient.post<ApplicationResponse>(
    `/projects/${projectId}/applications`,
    data
  );
  return response.data;
};

export const getMyApplications = async (params: {
  status?: ApplicationStatus | 'all';
  page?: number;
  size?: number;
}): Promise<MyApplicationsResponse> => {
  const queryParams: any = {
    page: params.page || 0,
    size: params.size || 10,
  };

  if (params.status && params.status !== 'all') {
    queryParams.status = params.status;
  }

  const response = await apiClient.get<MyApplicationsResponse>(
    '/applications/me',
    { params: queryParams }
  );
  return response.data;
};

/**
 * 내 지원 현황 조회 v2 (지원 시 지원 이력이 있는지 확인 용도)
 */
export const getMyApplicationsForCheck = async (params?: {
  status?: string;
  page?: number;
  size?: number;
}): Promise<MyApplicationsResponse> => {
  const response = await apiClient.get<MyApplicationsResponse>('/applications/me', {
    params: {
      page: params?.page ?? 0,
      size: params?.size ?? 10,
      status: params?.status,
    },
  });
  return response.data;
};

export const cancelApplication = async (applicationId: number): Promise<void> => {
  await apiClient.delete(`/applications/${applicationId}`);
};

/**
 * 지원 거절 (리더)
 * @param applicationId - 지원서 ID
 * @returns 거절 처리 결과
 */
export const rejectApplication = async (
  applicationId: number,
): Promise<{ applicationId: number; status: string }> => {
  const response = await apiClient.post<{ applicationId: number; status: string }>(
    `/applications/${applicationId}/reject`,
  );
  return response.data;
};

export const acceptContract = async (contractId: number): Promise<AcceptContractResponse> => {
  const response = await apiClient.post<AcceptContractResponse>(
    `/contracts/${contractId}/accept`
  );
  return response.data;
};

// 계약서 상세 조회
export const getContractDetail = async (contractId: number): Promise<ContractDetail> => {
  const response = await apiClient.get<ContractDetail>(`/contracts/${contractId}`);
  return response.data;
};

export const getApplicationDetail = async (applicationId: number) => {
  const response = await apiClient.get(`/applications/${applicationId}`);
  return response.data;
};

export const getRecentApplicationProjectIds = async (): Promise<number[]> => {
  try {
    const response = await getMyApplications({
      status: 'all',
      page: 0,
      size: 3,
    });
    return response.applications.map(app => app.project.projectId);
  } catch (error) {
    console.error('최근 지원 프로젝트 조회 실패:', error);
    return [];
  }
};
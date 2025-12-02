// src/api/admin/project.ts
import adminApiClient from './admin-axios';

// 리더 프로젝트 목록 조회 타입
export interface LeaderProject {
  projectId: number;
  title: string;
  summary: string;
  memberId: number;
  memberNickname: string;
  applyDeadline: string;
  startAt: string;
  endAt: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  deletedAt: string | null;
  deletedBy: number | null;
  deletedByAdminName: string | null;
}

export interface LeaderProjectListResponse {
  content: LeaderProject[];
  pageInfo: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

// 프로젝트 상세 조회 타입
export interface ProjectPosition {
  projectPositionId: number;
  positionId: number;
  positionName: string;
  categoryId: number;
  categoryName: string;
  budget: number;
  isClosed: boolean | null;
}

export interface ProjectLeader {
  userId: number;
  nickname: string;
  profileImageUrl: string;
  reviewCount: number;
  averageRating: number;
}

export interface ProjectDetail {
  projectId: number;
  title: string;
  summary: string;
  description: string;
  thumbnailUrl: string;
  isOnline: boolean;
  province: string | null;
  district: string | null;
  positions: ProjectPosition[];
  viewCount: number;
  applyDeadline: string;
  startAt: string;
  endAt: string;
  leader: ProjectLeader;
  createdAt: string;
  updatedAt: string;
  isClosed: boolean;
  similar: any | null;
}

export interface ProjectDetailResponse {
  projectDetail: ProjectDetail;
}

// 프로젝트 삭제 응답 타입
export interface DeleteProjectResponse {
  projectId: number;
  deletedAt: string;
  deletedBy: number;
}

// 아티스트 지원 목록 타입
export interface ArtistApplication {
  applicationId: number;
  projectId: number;
  projectTitle: string;
  memberId: number;
  memberNickname: string;
  portfolioId: number;
  status: string;
  message: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ArtistApplicationListResponse {
  content: ArtistApplication[];
  pageInfo: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

// 프로젝트 통계 타입
export interface ProjectStats {
  recruitingCount: number;
  closedCount: number;
  deletedCount: number;
  totalCount: number;
}

/**
 * 리더 프로젝트 목록 조회
 */
export const getLeaderProjects = async (params: {
  memberId?: number;
  keyword?: string;
  page: number;
  size: number;
}): Promise<LeaderProjectListResponse> => {
  const response = await adminApiClient.get<LeaderProjectListResponse>(
    '/projects/leaders',
    { params }
  );
  return response.data;
};

/**
 * 프로젝트 상세 조회
 */
export const getProjectDetail = async (
  projectId: number
): Promise<ProjectDetailResponse> => {
  const response = await adminApiClient.get<ProjectDetailResponse>(
    `/projects/${projectId}`
  );
  return response.data;
};

/**
 * 프로젝트 삭제
 */
export const deleteProject = async (
  projectId: number
): Promise<DeleteProjectResponse> => {
  const response = await adminApiClient.delete<DeleteProjectResponse>(
    `/projects/${projectId}`
  );
  return response.data;
};

/**
 * 아티스트 지원 목록 조회
 */
export const getArtistApplications = async (params: {
  memberId?: number;
  keyword?: string;
  page: number;
  size: number;
}): Promise<ArtistApplicationListResponse> => {
  const response = await adminApiClient.get<ArtistApplicationListResponse>(
    '/projects/artists',
    { params }
  );
  return response.data;
};

/**
 * 프로젝트 통계 조회
 */
export const getProjectStats = async (): Promise<ProjectStats> => {
  const response = await adminApiClient.get<ProjectStats>('/projects/stats');
  return response.data;
};
// src/api/project.ts

import apiClient from './axios';
import type {
  CreateProjectRequest,
  CreateProjectResponse,
  UpdateProjectRequest,
  UpdateProjectResponse,
  ProjectListResponse,
  ApplicationsResponse,
  ProjectDetailResponse, // 추가
} from '@/types/project';

export interface DescribeProjectRequest {
  title: string;
  summary: string;
  startAt: string; // ISO 8601 형식 (LocalDateTime)
  endAt: string; // ISO 8601 형식 (LocalDateTime)
  districtCode?: string; // null이면 온라인, 있으면 오프라인
  positions?: Array<{
    positionId: number;
    budget?: number; // null 가능 (협의 가능)
  }>;
  category?: string;
  applyDeadline?: string; // ISO 8601 형식 (LocalDateTime)
}

export interface DescribeProjectResponse {
  description: string;
}

/**
 * AI assistant를 사용하여 프로젝트 설명 자동 생성
 */
export const describeProject = async (
  data: DescribeProjectRequest
): Promise<DescribeProjectResponse> => {
  const response = await apiClient.post<DescribeProjectResponse>(
    '/projects/assistants/describe',
    data
  );
  return response.data;
};

/**
 * 프로젝트 등록
 * multipart/form-data 형식으로 파일과 함께 전송
 */
export const createProject = async (
  data: CreateProjectRequest
): Promise<CreateProjectResponse> => {
  const formData = new FormData();

  // JSON 데이터 준비 (날짜는 이미 ISO 형식)
  const projectData = {
    districtCode: data.districtCode,
    title: data.title,
    summary: data.summary,
    description: data.description,
    startAt: data.startDate, // ProjectForm에서 이미 ISO 형식으로 전달됨
    endAt: data.endDate,
    applyDeadline: data.deadline,
    positions: data.positions.map(pos => ({
      positionId: pos.positionId,
      budget: parseInt(pos.budget.replace(/,/g, ''), 10),
    })),
  };

  formData.append('data', JSON.stringify(projectData));
  formData.append('thumbnail', data.thumbnail);

  const response = await apiClient.post<CreateProjectResponse>(
    '/projects',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
};

/**
 * 프로젝트 목록 조회
 */
export const getProjects = async (
  params: {
    q?: string;
    categoryIds?: string;
    positionIds?: string;
    provinceCode?: string;
    districtCodes?: string;
    bookmarked?: boolean; // 이것만 추가됨
    page?: number;
    size?: number;
    sort?: string;
  } = {}
): Promise<ProjectListResponse> => {
  const response = await apiClient.get<ProjectListResponse>('/projects', {
    params: {
      q: params.q || '',
      categoryIds: params.categoryIds || '',
      positionIds: params.positionIds || '',
      provinceCode: params.provinceCode || '',
      districtCodes: params.districtCodes || '',
      bookmarked: params.bookmarked, // 이것만 추가됨
      page: params.page || 1,
      size: params.size || 20,
      sort: params.sort || 'created',
    },
  });

  return response.data;
};

/**
 * 지원 가능한 프로젝트 목록 조회 (페이지네이션 추가)
 */
export const getAvailableProjects = async (
  params?: {
    page?: number;
    size?: number;
    positionIds?: string; // 추가
  }
): Promise<ProjectListResponse> => {
  return getProjects({
    page: params?.page || 1,
    size: params?.size || 16,
    positionIds: params?.positionIds || '', // 추가
    sort: 'created',
  });
};

/**
 * 내가 등록한 프로젝트 목록 조회
 */
export const getMyProjects = async (
  params?: {
    page?: number;
    size?: number;
    status?: 'recruiting' | 'closed'; // 모집 중 / 마감
  }
): Promise<ProjectListResponse> => {
  const response = await apiClient.get<ProjectListResponse>('/projects/me', {
    params,
  });
  return response.data;
};

/**
 * 프로젝트 상세 조회 (NEW API)
 * projectPositionId를 포함한 상세 정보 조회
 */
export const getProjectById = async (
  projectId: number
): Promise<ProjectDetailResponse> => {
  const response = await apiClient.get<ProjectDetailResponse>(`/projects/${projectId}`);
  return response.data;
};

/**
 * 프로젝트 수정
 * PATCH 요청으로 부분 업데이트
 * multipart/form-data 형식으로 파일과 함께 전송
 */
export const updateProject = async (
  projectId: number,
  data: UpdateProjectRequest & { thumbnail?: File }
): Promise<UpdateProjectResponse> => {
  const formData = new FormData();

  // JSON 데이터 준비
  const projectData: Partial<UpdateProjectRequest> = {};

  if (data.title !== undefined) projectData.title = data.title;
  if (data.summary !== undefined) projectData.summary = data.summary;
  if (data.description !== undefined) projectData.description = data.description;
  if (data.districtCode !== undefined) projectData.districtCode = data.districtCode;
  if (data.thumbnailUrl !== undefined) projectData.thumbnailUrl = data.thumbnailUrl;
  if (data.applyDeadline !== undefined) projectData.applyDeadline = data.applyDeadline;
  if (data.startAt !== undefined) projectData.startAt = data.startAt;
  if (data.endAt !== undefined) projectData.endAt = data.endAt;
  if (data.positions !== undefined) projectData.positions = data.positions;

  formData.append('data', JSON.stringify(projectData));

  // 썸네일 파일이 있으면 추가
  if (data.thumbnail) {
    formData.append('thumbnail', data.thumbnail);
  }

  const response = await apiClient.patch<UpdateProjectResponse>(
    `/projects/${projectId}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
};

/**
 * 프로젝트 삭제
 */
export const deleteProject = async (projectId: number): Promise<void> => {
  await apiClient.delete(`/projects/${projectId}`);
};

/**
 * 프로젝트 지원서 목록 조회
 */
export const getProjectApplications = async (
  projectId: number
): Promise<ApplicationsResponse> => {
  const response = await apiClient.get<ApplicationsResponse>(
    `/projects/${projectId}/applications`
  );
  return response.data;
};

/**
 * 프로젝트 마감
 * 기간 종료 전 마감 처리
 */
export const closeProject = async (projectId: number): Promise<void> => {
  await apiClient.patch(`/projects/${projectId}/close`, {});
};

/**
 * 프로젝트 포지션 마감
 * 특정 포지션에 대한 모집 마감 처리
 */
export const closeProjectPosition = async (
  projectId: number,
  positionId: number
): Promise<void> => {
  await apiClient.patch(`/projects/${projectId}/positions/${positionId}/close`, {});
};

/**
 * 프로젝트 포지션 삭제 가능 여부 조회
 */
export interface CheckPositionDeletableResponse {
  deletable: boolean;
  message: string;
}

export const checkPositionDeletable = async (
  projectId: number,
  positionId: number
): Promise<CheckPositionDeletableResponse> => {
  const response = await apiClient.get<CheckPositionDeletableResponse>(
    `/projects/${projectId}/positions/${positionId}/deletable`
  );
  return response.data;
};


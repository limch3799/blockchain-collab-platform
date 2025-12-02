// src/types/project.ts

// API 응답의 Position 타입
export interface ProjectPosition {
  projectPositionId: number; // API에서 실제로 사용하는 ID - 필수
  positionId: number; // constants/categories.ts와 매핑되는 ID
  categoryId: number;
  categoryName: string;
  positionName: string;
  budget: number;
  isClosed?: boolean;
}

// API 응답의 ProjectItem 타입 (리스트에서 사용)
export interface ProjectItem {
  id: number;
  title: string;
  summary: string;
  leaderNickname: string; // 
  leaderProfileImageUrl: string | null; // 
  thumbnailUrl: string | null;
  isOnline: boolean;
  provinceCode: string;
  province: string;
  districtCode: string;
  district: string;
  startAt: number; // Unix timestamp (초 단위)
  endAt: number;   // Unix timestamp (초 단위)
  positions: ProjectPosition[];
  totalBudget: number;
  viewCount: number;
  createdAt: number; // Unix timestamp (초 단위)
  updatedAt: number; // Unix timestamp (초 단위)
  bookmarked: boolean;
  isClosed: boolean; // 프로젝트 마감 여부
}

// 프로젝트 상세 조회 API 응답 타입 (NEW)
export interface ProjectDetailResponse {
  projectId: number;
  title: string;
  summary: string;
  description: string;
  thumbnailUrl: string | null;
  province: {
    id: number;
    nameKo: string;
  } | null;
  district: {
    id: number;
    code: string;
    nameKo: string;
  } | null;
  positions: ProjectPosition[]; // projectPositionId와 positionId 모두 포함
  viewCount: number;
  applyDeadline: string; // ISO 8601 형식
  startAt: string; // ISO 8601 형식
  endAt: string; // ISO 8601 형식
  leader: {
    userId: number;
    nickname: string;
    profileImageUrl: string | null;
    reviewCount: number;
    averageRating: number;
  };
  createdAt: string; // ISO 8601 형식
  updatedAt: string; // ISO 8601 형식
}

// API 응답 타입
export interface ProjectListResponse {
  page: number;
  size: number;
  total: number;
  items: ProjectItem[];
}

// 프론트엔드에서 사용하는 Project 타입 (변환된 형태)
export interface Project extends Omit<ProjectItem, 'startAt' | 'endAt' | 'leaderNickname' | 'leaderProfileImageUrl'> {
  // 기존 필드
  mainCategoryId: number;
  subCategoryIds: number[];
  price: number;
  startDate: string;
  endDate: string;
  region: string;
  authorProfileImg: string;
  authorName: string;
  isBookmarked: boolean;
  thumbnail: string;
  // API에서 추가로 변환된 정보
  categoryName?: string;
  positionName?: string;
  // ProjectItem의 날짜 필드도 유지 (호환성)
  startAt: string | number;
  endAt: string | number;
  // 리더 정보 (API에서 받은 것) - optional로 재정의
  leaderNickname?: string;
  leaderProfileImageUrl?: string | null;
}

// 프로젝트 등록 요청 타입
export interface CreateProjectRequest {
  districtCode: string;
  title: string;
  summary: string;
  description: string;
  startDate: string;
  endDate: string;
  deadline: string;
  positions: Array<{
    positionId: number;
    budget: string;
  }>;
  thumbnail: File;
}

// 프로젝트 수정 요청 타입 (부분 업데이트)
export interface UpdateProjectRequest {
  title?: string;
  summary?: string;
  description?: string;
  districtCode?: string;
  thumbnailUrl?: string;
  applyDeadline?: string; // ISO 8601
  startAt?: string; // ISO 8601
  endAt?: string; // ISO 8601
  positions?: Array<{
    positionId: number;
    budget: number;
    headcount: number;
  }>;
}

// 프로젝트 수정 응답 타입
export interface UpdateProjectResponse {
  projectId: number;
  title: string;
  summary: string;
  description: string;
  thumbnailUrl: string | null;
  province: {
    id: number;
    nameKo: string;
  } | null;
  district: {
    id: number;
    nameKo: string;
  } | null;
  positions: Array<{
    positionId: number;
    positionName: string;
    categoryId: number;
    categoryName: string;
    budget: number;
    headcount: number;
  }>;
  viewCount: number;
  applyDeadline: string;
  startAt: string;
  endAt: string;
  leader: {
    userId: number;
    nickname: string;
    profileImageUrl: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

// 프로젝트 등록 응답 타입
export interface CreateProjectResponse {
  projectId: number;
  message: string;
}

// 지원자 정보
export interface ApplicantInfo {
  userId: number;
  nickname: string;
  profileImageUrl: string;
  averageRating: number;
  reviewCount: number;
}

// 포지션 정보
export interface PositionInfo {
  projectPositionId: number;
  positionName: string;
  positionStatus: 'RECRUITING' | 'CLOSED';
  headcount: number;
}

// 지원서 정보
export interface ApplicationItem {
  applicationId: number;
  applicationStatus: 'PENDING' | 'OFFERED' | 'REJECTED' | 'COMPLETED';
  createdAt: number[];
  applicant: ApplicantInfo;
  position: PositionInfo;
  contract?: {
    contractId: number;
    contractStatus: 'PENDING' | 'ACCEPTED' | 'ARTIST_SIGNED' | 'PAYMENT_PENDING' | 'CANCELED' | 'REJECTED' | 'COMPLETED' | 'SETTLED';
  };
}

// 지원서 목록 응답
export interface ApplicationsResponse {
  applications: ApplicationItem[];
}

// 유사 프로젝트 포지션 타입
export interface SimilarProjectPosition {
  categoryName: string;
  positionName: string;
  budget: number;
}

// 유사 프로젝트 아이템 타입
export interface SimilarProjectItem {
  projectId: number;
  title: string;
  thumbnailUrl: string | null;
  categoryName: string;
  locationText: string;
  leaderNickname: string;
  leaderProfileImageUrl: string | null;
  totalBudget: number;
  startAt: string; // ISO 8601
  endAt: string; // ISO 8601
  positions: SimilarProjectPosition[];
}

// ProjectDetailResponse에 similar 필드 추가
export interface ProjectDetailResponse {
  projectId: number;
  title: string;
  summary: string;
  description: string;
  thumbnailUrl: string | null;
  province: {
    id: number;
    nameKo: string;
  } | null;
  district: {
    id: number;
    code: string;
    nameKo: string;
  } | null;
  positions: ProjectPosition[];
  viewCount: number;
  applyDeadline: string;
  startAt: string;
  endAt: string;
  leader: {
    userId: number;
    nickname: string;
    profileImageUrl: string | null;
    reviewCount: number;
    averageRating: number;
  };
  createdAt: string;
  updatedAt: string;
  isClosed: boolean;
  similar: SimilarProjectItem[]; // 추가
}
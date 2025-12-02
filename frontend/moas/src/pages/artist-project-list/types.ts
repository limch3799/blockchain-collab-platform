// src/pages/artist-project-list/types.ts

export type ApplicationStatus = 'PENDING' | 'OFFERED' | 'REJECTED' | 'all';

// 계약 상태 타입
export type ContractStatus = 
  | 'PENDING'              // 계약서 도착
  | 'DECLINED'             // 계약 거절
  | 'WITHDRAWN'            // 계약서 철회
  | 'ARTIST_SIGNED'        // 아티스트 서명완료
  | 'PAYMENT_PENDING'      // 리더 결제대기
  | 'PAYMENT_COMPLETED'    // 리더 결제완료
  | 'COMPLETED'            // 정산완료
  | 'CANCELLATION_REQUESTED'; // 취소요청

// 계약 필터 타입 (3개 탭으로 변경)
export type ContractFilterType = 'all' | 'BEFORE_START' | 'IN_PROGRESS' | 'COMPLETED';

export type Section = 'applications' | 'contracts';

// API 응답 데이터 구조
export interface ApplicationProject {
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
  contract: {
    contractId: number;
    status: ContractStatus;
  } | null;
}

export interface Project {
  id: number;
  title: string;
  summary: string;
  categories: string[];
  date: string;
  location: string;
  budget: string;
  status: ApplicationStatus | ContractStatus;
  applicants: number;
}

export interface FilterConfig {
  label: string;
  value: ApplicationStatus | ContractFilterType;
}

// 지원 현황 필터 (4개)
export const APPLICATION_FILTERS: FilterConfig[] = [
  { label: '전체 지원', value: 'all' },
  { label: '대기중', value: 'PENDING' },
  { label: '계약 제안', value: 'OFFERED' },
  { label: '거절됨', value: 'REJECTED' },
];

// 계약 현황 필터 (3개 탭으로 변경)
export const CONTRACT_FILTERS = [
  { value: 'all' as ContractFilterType, label: '전체 계약' },
  { value: 'BEFORE_START' as ContractFilterType, label: '계약 체결' },
  { value: 'IN_PROGRESS' as ContractFilterType, label: '수행 중' },
  { value: 'COMPLETED' as ContractFilterType, label: '정산 완료' },
];

// 계약 상태별 분류 (기존 로직 유지 - 가이드에서 사용)
export const CONTRACT_STATUS_GROUPS = {
  inProgress: ['PENDING', 'ARTIST_SIGNED', 'PAYMENT_PENDING'],
  completed: ['PAYMENT_COMPLETED', 'COMPLETED'],
  cancelled: ['DECLINED', 'WITHDRAWN', 'CANCELLATION_REQUESTED'],
};

// 계약 상태별 텍스트
export const CONTRACT_STATUS_TEXT: Record<ContractStatus, string> = {
  PENDING: '계약서 도착',
  DECLINED: '계약 거절',
  WITHDRAWN: '계약서 철회',
  ARTIST_SIGNED: '아티스트 서명완료',
  PAYMENT_PENDING: '리더 결제대기',
  PAYMENT_COMPLETED: '리더 결제완료',
  COMPLETED: '정산완료',
  CANCELLATION_REQUESTED: '취소요청',
};
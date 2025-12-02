/**
 * Contract Types
 *
 */

export interface Contract {
  contractId: number;
  title: string;
  description: string;
  startAt: string; // ISO 8601 format
  endAt: string; // ISO 8601 format
  totalAmount: number;
  status: ContractStatus;
  createdAt: string; // ISO 8601 format
  artistSignature?: string; // 아티스트 서명 (ARTIST_SIGNED 상태 이후 존재)
  leaderSignature?: string; // 리더 서명 (PAYMENT_PENDING 상태 이후 존재)
  project: {
    projectId: number;
    title: string;
    projectPositionId?: number;
    positionName?: string;
    categoryName?: string;
  };
  leader: {
    userId: number;
    nickname: string;
    profileImageUrl?: string | null;
  };
  artist: {
    userId: number;
    nickname: string;
    profileImageUrl?: string | null;
  };
  position: {
    projectPositionId: number;
    positionName: string;
    categoryName: string;
  };
  nftInfo?: {
    tokenId: string;
    mintTxHash: string;
    explorerUrl: string;
    onchainStatus?: string;
  };
}

export type ContractStatus =
  | 'PENDING'        // 제안됨
  | 'ACCEPTED'       // 수락됨 (진행중)
  | 'ARTIST_SIGNED'  // 아티스트 서명 완료 (리더 최종 수락 대기)
  | 'PAYMENT_PENDING' // 결제 대기
  | 'PAYMENT_COMPLETED' // 결제 완료 (NFT 발행, 프로젝트 진행중)
  | 'CANCELED'       // 취소됨
  | 'DECLINED'       // 거절됨 (아티스트가 거절)
  | 'WITHDRAWN'      // 철회됨 (리더가 철회)
  | 'REJECTED'       // 거절됨
  | 'COMPLETED'      // 완료됨 (정산 완료)
  | 'CANCELLATION_REQUESTED' // 취소 요청
  | 'SETTLED';       // 정산 완료 (deprecated - COMPLETED 사용)

// 계약 목록 조회 필터 타입
export type ContractListStatus = 'BEFORE_START' | 'IN_PROGRESS' | 'COMPLETED';

// 계약 목록 조회 응답 타입
export interface ContractListResponse {
  contracts: Contract[];
}

// 프로젝트 지원 목록 조회용 타입 (실제 API 응답)
export interface ProjectApplicationItem {
  applicationId: number;
  applicationStatus: 'PENDING' | 'OFFERED' | 'REJECTED' | 'COMPLETED';
  createdAt: string;
  message?: string;
  contractId?: number;
  contractStatus?: ContractStatus;
  applicant: {
    userId: number;
    nickname: string;
    profileImageUrl: string | null;
    averageRating: number;
    reviewCount: number;
  };
  position: {
    projectPositionId: number;
    positionName: string;
    positionStatus: 'RECRUITING' | 'CLOSED';
    categoryName?: string; // 카테고리 이름 추가
  };
}

export interface ProjectApplicationsResponse {
  positions: Array<{
    projectPositionId: number;
    categoryName: string;
    positionName: string;
    budget: number;
    positionStatus: 'RECRUITING' | 'CLOSED' | 'COMPLETED';
  }>;
  applications: ProjectApplicationItem[];
}

// 프로젝트 계약 목록 조회용 타입 (이전 버전 - 사용 안 함)
export interface ProjectContractItem {
  contractId: number;
  status: ContractStatus;
  artist: {
    userId: number;
    nickname: string;
    profileImageUrl: string;
  };
  position: {
    id: number;
    name: string;
  };
  totalAmount: number;
  createdAt: string;
}

export interface ProjectContractsResponse {
  contracts: ProjectContractItem[];
}

export interface CategoryConfig {
  name: string;
  color: string;
  icon: string;
}

export const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  '음악/공연': {
    name: '음악/공연',
    color: '#FF7473',
    icon: '🎵',
  },
  '디자인': {
    name: '디자인',
    color: '#FFC952',
    icon: '🎨',
  },
  '사진/영상/미디어': {
    name: '사진/영상/미디어',
    color: '#47B8E0',
    icon: '🎬',
  },
  '문학': {
    name: '문학',
    color: '#7444E3',
    icon: '📚',
  },
  '게임/소프트웨어': {
    name: '게임/소프트웨어',
    color: '#258E93',
    icon: '🎮',
  },
};

// 계약서 제시 요청 타입
export interface OfferContractRequest {
  title: string;
  description: string;
  startAt: string; // ISO 8601 format
  endAt: string; // ISO 8601 format
  totalAmount: number;
}

// 계약서 제시 응답 타입
export interface OfferContractResponse {
  contractId: number;
  applicationId: number;
  contractStatus: string;
  applicationStatus: string;
}

// EIP-712 서명 데이터 조회 응답
export interface TypedDataResponse {
  domain: {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: string;
  };
  types: Record<string, Array<{ name: string; type: string }>>;
  primaryType: string;
  message: Record<string, any>;
}

// 계약 체결 및 결제 요청 (리더)
export interface FinalizeContractRequest {
  leaderSignature: string;
  nftImageUrl: string;
}

export interface FinalizeContractResponse {
  contractId: number;
  status: string;
  paymentInfo: {
    orderId: string;
    amount: number;
    productName: string;
    customerName: string;
  };
}

// 계약 완료 및 구매 확정 응답
export interface ConfirmPaymentResponse {
  contractId: number;
  status: string;
}

export function getStatusBadgeStyle(status: ContractStatus) {
  switch (status) {
    case 'PENDING':
      return {
        label: '제안됨',
        bgColor: '#E5F8FF',
        textColor: '#47B8E0',
      };
    case 'ACCEPTED':
      return {
        label: '진행중',
        bgColor: '#E4FFFA',
        textColor: '#258E93',
      };
    case 'ARTIST_SIGNED':
      return {
        label: '서명 완료',
        bgColor: '#FFF9E6',
        textColor: '#FFA940',
      };
    case 'PAYMENT_PENDING':
      return {
        label: '결제 대기',
        bgColor: '#F8F8FF',
        textColor: '#7444E3',
      };
    case 'PAYMENT_COMPLETED':
      return {
        label: 'NFT 발행 완료',
        bgColor: '#E4FFFA',
        textColor: '#258E93',
      };
    case 'CANCELED':
      return {
        label: '취소됨',
        bgColor: '#F5F5F5',
        textColor: '#666666',
      };
    case 'REJECTED':
      return {
        label: '거절됨',
        bgColor: '#FFEFEF',
        textColor: '#E91A27',
      };
    case 'WITHDRAWN':
      return {
        label: '거절됨',
        bgColor: '#FFEFEF',
        textColor: '#E91A27',
      };
    case 'COMPLETED':
      return {
        label: '정산 완료',
        bgColor: '#F8F8FF',
        textColor: '#7444E3',
      };
    case 'CANCELLATION_REQUESTED':
      return {
        label: '계약 파기 대기 중',
        bgColor: '#FFF9E6',
        textColor: '#FFA940',
      };
    case 'SETTLED':
      return {
        label: '정산 완료',
        bgColor: '#FFF9E5',
        textColor: '#FFC952',
      };
  }
}

// 결제 승인 요청 (토스페이먼츠)
export interface PaymentApproveRequest {
  paymentKey: string;
  orderId: string;
  amount: number;
}

export interface PaymentApproveResponse {
  orderId: string;
  contractId: number;
  status: string;
}

// 리뷰 작성 요청 타입
export interface CreateReviewRequest {
  contractId: number;
  revieweeMemberId: number;
  rating: number;
  comment: string;
}

// 리뷰 작성 응답 타입
export interface CreateReviewResponse {
  projectId: number;
  title: string;
  summary: string;
  thumbnailUrl: string | null;
  positionCount: number;
  createdAt: string;
}

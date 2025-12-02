// ethers에서 필요한 타입들을 가져옵니다.
import { TypedDataDomain, TypedDataField } from 'ethers';

// =================================================================
// 1. GET /api/contracts/{contractId} 응답 (`ContractDetailResponse`)
// =================================================================
export interface ContractDetailResponse {
  contractId: number;
  title: string;
  description: string;
  startAt: string; // ISO 8601 형식의 날짜 문자열
  endAt: string;   // ISO 8601 형식의 날짜 문자열
  totalAmount: number;
  status: 'PENDING' | 'DECLINED' | 'WITHDRAWN' | 'ARTIST_SIGNED' | 'PAYMENT_PENDING' | 'PAYMENT_COMPLETED' | 'COMPLETED' | 'CANCELLATION_REQUESTED' | 'CANCELED';
  createdAt: string;
  project: ProjectInfo;
  leader: ParticipantInfo;
  artist: ParticipantInfo;
  nftInfo: NftInfo | null; // null일 수 있음
}

export interface ProjectInfo {
  projectId: number;
  title: string;
}

export interface ParticipantInfo {
  userId: number;
  nickname: string;
}

export interface NftInfo {
  tokenId: string;
  mintTxHash: string;
  explorerUrl: string;
}

// ====================================================================
// 2. GET /api/contracts/{id}/signature-data 응답 (`TypedDataResponse`)
// ====================================================================
export interface TypedDataResponse {
  domain: TypedDataDomain;
  types: Record<string, TypedDataField[]>;
  primaryType: string;
  message: Record<string, any>; // 메시지 구조는 동적으로 변할 수 있으므로 Record 사용
}

// ==============================================================
// 3. POST /api/contracts/{id}/finalize 응답 (`ContractFinalizeResponse`)
// ==============================================================
export interface ContractFinalizeResponse {
  contractId: number;
  status: string; // "PAYMENT_PENDING"
  paymentInfo: {
    orderId: string;
    amount: number;
    productName: string;
    customerName: string;
  };
}

// ======================================================
// 4. POST /api/payments/approve 요청 (`PaymentApproveRequest`)
// ======================================================
export interface PaymentApproveRequest {
  paymentKey: string;
  orderId: string;
  amount: number;
}

// ======================================================
// 5. POST /api/payments/approve 응답 (`PaymentApproveResponse`)
// ======================================================
export interface PaymentApproveResponse {
  orderId: string;
  contractId: number;
  status: string; // "PAID"
}
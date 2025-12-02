// src/api/contract.ts

import apiClient from './axios';
import type {
  Contract,
  ProjectApplicationsResponse,
  OfferContractRequest,
  OfferContractResponse,
  TypedDataResponse,
  FinalizeContractRequest,
  FinalizeContractResponse,
  ConfirmPaymentResponse,
  PaymentApproveRequest,
  PaymentApproveResponse,
  CreateReviewRequest,
  CreateReviewResponse,
  ContractListStatus,
  ContractListResponse,
} from '@/types/contract';

export interface DescribeContractRequest {
  projectPositionId: number; // 필수
  title: string;
  startAt: string; // ISO 8601 형식
  endAt: string; // ISO 8601 형식
  totalAmount: number;
  additionalDetails?: string; // 사용자 추가 요구사항 (AI 프롬프트)
}

export interface DescribeContractResponse {
  title: string;
  description: string;
  totalAmount: number;
  startAt: string;
  endAt: string;
}

/**
 * AI assistant를 사용하여 계약서 설명 자동 생성
 */
export const describeContract = async (
  data: DescribeContractRequest
): Promise<DescribeContractResponse> => {
  const response = await apiClient.post<DescribeContractResponse>(
    '/contracts/assistant',
    data
  );
  return response.data;
};

/**
 * 계약 목록 조회 (상태별 필터링)
 * @param status - 계약 상태 ('BEFORE_START' | 'IN_PROGRESS' | 'COMPLETED')
 * @returns 계약 목록
 */
export const getContracts = async (
  status?: ContractListStatus,
): Promise<ContractListResponse> => {
  const params = status ? { status } : {};
  const response = await apiClient.get<ContractListResponse>('/contracts', { params });
  return response.data;
};

/**
 * 계약서 상세 조회
 */
export const getContractById = async (contractId: number): Promise<Contract> => {
  const response = await apiClient.get<Contract>(`/contracts/${contractId}`);
  return response.data;
};

/**
 * 프로젝트별 지원 목록 조회 (리더) - 계약 정보 포함
 */
export const getProjectApplications = async (
  projectId: number,
  status?: string,
): Promise<ProjectApplicationsResponse> => {
  const params = status ? { status } : {};
  const response = await apiClient.get<ProjectApplicationsResponse>(
    `/projects/${projectId}/applications`,
    { params },
  );
  return response.data;
};

/**
 * 지원자 선발을 위한 계약서 작성
 * @param applicationId - 지원서 ID
 * @param contractData - 계약 내용 (제목, 설명, 기간, 금액)
 * @returns 생성된 계약 정보
 */
export const offerContract = async (
  applicationId: number,
  contractData: OfferContractRequest,
): Promise<OfferContractResponse> => {
  const response = await apiClient.post<OfferContractResponse>(
    `/applications/${applicationId}/offer-contract`,
    contractData,
  );
  return response.data;
};

/**
 * EIP-712 서명 데이터 조회
 * @param contractId - 계약 ID
 * @returns EIP-712 형식의 서명 데이터
 */
export const getSignatureData = async (
  contractId: number,
): Promise<TypedDataResponse> => {
  const response = await apiClient.get<TypedDataResponse>(
    `/contracts/${contractId}/signature-data`,
  );
  return response.data;
};

/**
 * 계약 체결 및 결제 요청 (리더)
 * @param contractId - 계약 ID
 * @param data - 리더 서명 데이터
 * @returns 결제 정보
 */
export const finalizeContract = async (
  contractId: number,
  data: FinalizeContractRequest,
): Promise<FinalizeContractResponse> => {
  const response = await apiClient.post<FinalizeContractResponse>(
    `/contracts/${contractId}/finalize`,
    data,
  );
  return response.data;
};

/**
 * 결제 승인 (토스페이먼츠)
 * @param data - 결제 승인 데이터
 * @returns 결제 승인 결과
 */
export const approvePayment = async (
  data: PaymentApproveRequest,
): Promise<PaymentApproveResponse> => {
  const response = await apiClient.post<PaymentApproveResponse>(
    '/payments/approve',
    data,
  );
  return response.data;
};

/**
 * 계약 완료 및 구매 확정 (리더)
 * @param contractId - 계약 ID
 * @returns 계약 완료 정보
 */
export const confirmPayment = async (
  contractId: number,
): Promise<ConfirmPaymentResponse> => {
  const response = await apiClient.post<ConfirmPaymentResponse>(
    `/contracts/${contractId}/confirm-payment`,
  );
  return response.data;
};

/**
 * 계약 거절 (아티스트)
 * @param contractId - 계약 ID
 * @returns 거절 처리 결과
 */
export const declineContract = async (
  contractId: number,
): Promise<{ applicationId: number; status: string }> => {
  const response = await apiClient.post<{ applicationId: number; status: string }>(
    `/contracts/${contractId}/decline`,
  );
  return response.data;
};

/**
 * 계약 수락 (아티스트)
 * @param contractId - 계약 ID
 * @param artistSignature - 아티스트 EIP-712 서명
 * @returns 계약 수락 결과
 */
export const acceptContract = async (
  contractId: number,
  artistSignature: string,
): Promise<{ contractId: number; status: string }> => {
  const response = await apiClient.post<{ contractId: number; status: string }>(
    `/contracts/${contractId}/accept`,
    { artistSignature },
  );
  return response.data;
};

/**
 * 계약 제안 철회 (리더)
 * @param contractId - 계약 ID
 * @returns 철회 처리 결과
 */
export const withdrawContract = async (
  contractId: number,
): Promise<{ contractId: number; status: string }> => {
  const response = await apiClient.post<{ contractId: number; status: string }>(
    `/contracts/${contractId}/withdraw`,
  );
  return response.data;
};

/**
 * 계약 취소 요청 (리더 또는 아티스트)
 * @param contractId - 계약 ID
 * @param reason - 취소 사유
 * @returns 취소 요청 처리 결과
 */
export const cancelContract = async (
  contractId: number,
  reason: string,
): Promise<{ contractId: number; status: string }> => {
  const response = await apiClient.post<{ contractId: number; status: string }>(
    `/contracts/${contractId}/cancel`,
    { reason },
  );
  return response.data;
};

/**
 * 계약서 재작성 (리더)
 * @param contractId - 계약 ID
 * @param contractData - 수정할 계약 내용 (title 제외)
 * @returns 수정된 계약 정보
 */
export const updateContract = async (
  contractId: number,
  contractData: {
    description: string;
    startAt: string;
    endAt: string;
    totalAmount: number;
  },
): Promise<{ contractId: number; status: string }> => {
  const response = await apiClient.put<{ contractId: number; status: string }>(
    `/contracts/${contractId}`,
    contractData,
  );
  return response.data;
};

/**
 * 리뷰 작성
 * @param data - 리뷰 작성 데이터
 * @returns 생성된 리뷰 정보
 */
export const createReview = async (
  data: CreateReviewRequest,
): Promise<CreateReviewResponse> => {
  const response = await apiClient.post<CreateReviewResponse>(
    '/reviews',
    data,
  );
  return response.data;
};

/**
 * NFT 이미지 번들 업로드
 * @param contractId - 계약 ID
 * @param activeImage - 활성 상태 NFT 이미지
 * @param completedImage - 완료 상태 NFT 이미지
 * @param canceledImage - 취소 상태 NFT 이미지
 * @returns 업로드 성공 여부
 */
export const uploadNFTImageBundle = async (
  contractId: number,
  activeImage: Blob,
  completedImage: Blob,
  canceledImage: Blob,
): Promise<string> => {
  const formData = new FormData();

  // Contract ID를 formData에 추가
  formData.append('contractId', contractId.toString());

  // 3개의 이미지 파일 추가
  formData.append('activeImage', activeImage, 'active.png');
  formData.append('completedImage', completedImage, 'completed.png');
  formData.append('canceledImage', canceledImage, 'canceled.png');

  console.log('[API] Uploading NFT image bundle:', {
    contractId,
    activeImageSize: (activeImage.size / 1024).toFixed(2) + ' KB',
    completedImageSize: (completedImage.size / 1024).toFixed(2) + ' KB',
    canceledImageSize: (canceledImage.size / 1024).toFixed(2) + ' KB',
  });

  const response = await apiClient.post('/assets/nft/images/bundle', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  console.log('[API] NFT image bundle uploaded successfully');
  console.log('[API] NFT image URL:', response.data.imageUrl);

  return response.data.imageUrl;
};

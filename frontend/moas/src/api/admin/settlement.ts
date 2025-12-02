// src/api/admin/settlement.ts
import api from './admin-axios';

export interface FeePolicy {
  policyId: number;
  feeRate: number;
  startAt: string;
  endAt: string | null;
  adminName: string;
}

export interface FeePolicyHistoryResponse {
  policies: FeePolicy[];
}

export interface UpdateFeePolicyRequest {
  feeRate: number;
  startAt: string;
}

export interface UpdateFeePolicyResponse {
  policyId: number;
  feeRate: number;
  startAt: string;
  adminName: string;
}

// 수수료 정책 변경 이력 조회
export const getFeePolicyHistory = async (): Promise<FeePolicy[]> => {
  const response = await api.get<FeePolicyHistoryResponse>('/fee-policies');
  return response.data.policies;
};

// 현재 수수료 정책 조회
export const getCurrentFeePolicy = async (): Promise<FeePolicy | null> => {
  const response = await api.get<FeePolicyHistoryResponse>('/fee-policies');
  return response.data.policies[0] || null;
};

// 수수료 정책 변경
export const updateFeePolicy = async (
  feeRate: number,
  startAt: string,
): Promise<UpdateFeePolicyResponse> => {
  const response = await api.put<UpdateFeePolicyResponse>('/fee-policies', {
    feeRate,
    startAt,
  });
  return response.data;
};
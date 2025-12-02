// src/pages/admin/contract/
export type ContractStatus =
  | 'PENDING'
  | 'DECLINED'
  | 'WITHDRAWN'
  | 'ARTIST_SIGNED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_COMPLETED'
  | 'COMPLETED'
  | 'CANCELLATION_REQUESTED'
  | 'CANCELED';

export const CONTRACT_STATUS_MAP: Record<ContractStatus, string> = {
  PENDING: '계약서 제안',
  DECLINED: '아티스트 계약 거절',
  WITHDRAWN: '계약서 철회',
  ARTIST_SIGNED: '아티스트 서명 완료',
  PAYMENT_PENDING: '결제 대기',
  PAYMENT_COMPLETED: '결제 완료',
  COMPLETED: '정산 완료',
  CANCELLATION_REQUESTED: '취소 요청',
  CANCELED: '취소 완료',
};

export const CONTRACT_STATUS_COLORS: Record<ContractStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  DECLINED: 'bg-red-100 text-red-700 border-red-300',
  WITHDRAWN: 'bg-gray-100 text-gray-700 border-gray-300',
  ARTIST_SIGNED: 'bg-blue-100 text-blue-700 border-blue-300',
  PAYMENT_PENDING: 'bg-orange-100 text-orange-700 border-orange-300',
  PAYMENT_COMPLETED: 'bg-green-100 text-green-700 border-green-300',
  COMPLETED: 'bg-purple-100 text-purple-700 border-purple-300',
  CANCELLATION_REQUESTED: 'bg-red-100 text-red-700 border-red-300',
  CANCELED: 'bg-gray-100 text-gray-700 border-gray-300',
};

// 필터 상태 그룹
export const IN_PROGRESS_STATUSES: ContractStatus[] = [
  'PENDING',
  'DECLINED',
  'WITHDRAWN',
  'ARTIST_SIGNED',
  'PAYMENT_PENDING',
  'PAYMENT_COMPLETED',
  'CANCELLATION_REQUESTED',
];

export const COMPLETED_STATUSES: ContractStatus[] = ['COMPLETED', 'CANCELED'];
// src/api/admin/inquiry.ts
import api from './admin-axios';

export interface AdminInquiryListItem {
  inquiryId: number;
  memberId: number;
  category: 'MEMBER' | 'CONTRACT' | 'PAYMENT' | 'OTHERS';
  title: string;
  status: 'PENDING' | 'ANSWERED';
  commentCount: number;
  createdAt: string;
}

export interface AdminPageInfo {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface AdminInquiryListResponse {
  content: AdminInquiryListItem[];
  pageInfo: AdminPageInfo;
}

export interface AdminFileInfo {
  fileId: number;
  originalFileName: string;
  storedFileUrl: string;
  fileType: string;
  fileSize: number;
}

export interface AdminComment {
  commentId: number;
  memberId?: number;
  memberNickname?: string;
  adminId?: number;
  adminName?: string;
  content: string;
  file?: AdminFileInfo;
  createdAt: string;
}

export interface AdminInquiryDetail {
  inquiryId: number;
  memberId: number;
  memberNickname: string;
  category: 'MEMBER' | 'CONTRACT' | 'PAYMENT' | 'OTHERS';
  title: string;
  content: string;
  status: 'PENDING' | 'ANSWERED';
  files: AdminFileInfo[];
  comments: AdminComment[];
  createdAt: string;
  updatedAt: string;
}

export interface MemberDetail {
  id: number;
  nickname: string;
  biography: string;
  email: string;
  provider: string;
  providerId: string;
  phoneNumber: string;
  profileImageUrl: string;
  walletAddress: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  stats: {
    penaltyScore: number;
    averageRating: number;
    reviewCount: number;
    pendingInquiries: number;
  };
}

// 관리자 - 문의 목록 조회
export const getAdminInquiryList = async (
  page: number = 0,
  size: number = 30,
  category?: 'MEMBER' | 'CONTRACT' | 'PAYMENT' | 'OTHERS'
) => {
  const response = await api.get<AdminInquiryListResponse>('/inquiries', {
    params: { page, size, ...(category && { category }) },
  });
  return response.data;
};

// 관리자 - 문의 검색
export const searchAdminInquiries = async (
  keyword: string,
  page: number = 0,
  size: number = 30,
  category?: 'MEMBER' | 'CONTRACT' | 'PAYMENT' | 'OTHERS'
) => {
  const response = await api.get<AdminInquiryListResponse>('/inquiries', {
    params: { keyword, page, size, ...(category && { category }) },
  });
  return response.data;
};

// 관리자 - 문의 상세 조회
export const getAdminInquiryDetail = async (inquiryId: number) => {
  const response = await api.get<AdminInquiryDetail>(`/inquiries/${inquiryId}`);
  return response.data;
};

// 관리자 - 회원 상세 조회
export const getMemberDetail = async (memberId: number) => {
  const response = await api.get<MemberDetail>(`/members/${memberId}`);
  return response.data;
};

// 관리자 - 답변 작성
export const createAdminComment = async (inquiryId: number, formData: FormData) => {
  const response = await api.post(`/inquiries/${inquiryId}/comments`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
// src/api/inquiry.ts
import api from './axios';

export interface InquiryListItem {
  inquiryId: number;
  memberId: number;
  category: 'MEMBER' | 'CONTRACT' | 'PAYMENT' | 'OTHERS';
  title: string;
  status: 'PENDING' | 'ANSWERED';
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PageInfo {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface InquiryListResponse {
  content: InquiryListItem[];
  pageInfo: PageInfo;
}

export interface FileInfo {
  fileId: number;
  originalFileName: string;
  storedFileUrl: string;
  fileType: string;
  fileSize: number;
}

export interface Comment {
  commentId: number;
  memberId?: number;
  memberNickname?: string;
  adminId?: number;
  adminName?: string;
  content: string;
  file?: FileInfo;
  createdAt: string;
}

export interface InquiryDetail {
  inquiryId: number;
  memberId: number;
  memberNickname: string;
  category: 'MEMBER' | 'CONTRACT' | 'PAYMENT' | 'OTHERS';
  title: string;
  content: string;
  status: 'PENDING' | 'ANSWERED';
  files: FileInfo[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateInquiryRequest {
  category: 'MEMBER' | 'CONTRACT' | 'PAYMENT' | 'OTHERS';
  title: string;
  content: string;
  files?: File[];
}

export interface CreateInquiryResponse {
  inquiryId: number;
  category: string;
  title: string;
  status: 'PENDING' | 'ANSWERED';
  createdAt: string;
}

export interface CreateCommentRequest {
  content: string;
  files?: string[];
}

export interface CreateCommentResponse {
  commentId: number;
  content: string;
  file?: FileInfo;
  createdAt: string;
}

// 문의 목록 조회
export const getInquiryList = async (page: number = 0, size: number = 30) => {
  const response = await api.get<InquiryListResponse>('/member/inquiries', {
    params: { page, size },
  });
  return response.data;
};

// 문의 작성
export const createInquiry = async (formData: FormData) => {
  const response = await api.post<CreateInquiryResponse>('/member/inquiries', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// 문의 상세 조회
export const getInquiryDetail = async (inquiryId: number) => {
  const response = await api.get<InquiryDetail>(`/member/inquiries/${inquiryId}`);
  return response.data;
};

// 댓글 작성
export const createComment = async (inquiryId: number, formData: FormData) => {
  const response = await api.post<CreateCommentResponse>(
    `/member/inquiries/${inquiryId}/comments`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};
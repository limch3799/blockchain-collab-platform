// src/api/portfolio.ts
import apiClient from './axios';
import type {
  CreatePortfolioRequest,
  CreatePortfolioResponse,
  PortfolioListResponse,
  MyPortfolioListResponse,
  MyPortfolioItem,
  PortfolioDetail,
  EditPortfolioRequest,
} from '@/types/portfolio';

// MyPortfolioItem을 다시 export
export type { MyPortfolioItem } from '@/types/portfolio';

export const createPortfolio = async (
  data: CreatePortfolioRequest
): Promise<CreatePortfolioResponse> => {
  const formData = new FormData();
  formData.append('positionId', data.positionId.toString());
  formData.append('title', data.title);
  formData.append('description', data.description);
  formData.append('thumbnailImage', data.thumbnailImage);

  if (data.images && data.images.length > 0) {
    data.images.forEach((image) => {
      formData.append('images', image);
    });
  }

  if (data.files && data.files.length > 0) {
    data.files.forEach((file) => {
      formData.append('files', file);
    });
  }

  const response = await apiClient.post<CreatePortfolioResponse>(
    '/portfolios',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
};

export const getPortfolios = async (
  userId?: string
): Promise<PortfolioListResponse> => {
  const url = userId ? `/portfolios?userId=${userId}` : '/portfolios';
  const response = await apiClient.get<PortfolioListResponse>(url);
  return response.data;
};

export const getPortfolioById = async (
  portfolioId: number
): Promise<PortfolioDetail> => {
  const response = await apiClient.get<PortfolioDetail>(`/portfolios/${portfolioId}`);
  return response.data;
};

export const updatePortfolio = async (
  portfolioId: number,
  data: EditPortfolioRequest
): Promise<CreatePortfolioResponse> => {
  const formData = new FormData();

  formData.append('positionId', data.positionId.toString());
  formData.append('title', data.title);
  formData.append('description', data.description);

  if (data.thumbnailImage) {
    formData.append('thumbnailImage', data.thumbnailImage);
  }
  if (data.thumbnailUrl) {
    formData.append('thumbnailUrl', data.thumbnailUrl);
  }

  if (data.imageSequence) {
    formData.append('imageSequence', data.imageSequence);
  }
  if (data.newImages && data.newImages.length > 0) {
    data.newImages.forEach((image: File) => {
      formData.append('newImages', image);
    });
  }

  if (data.fileSequence) {
    formData.append('fileSequence', data.fileSequence);
  }
  if (data.newFiles && data.newFiles.length > 0) {
    data.newFiles.forEach((file: File) => {
      formData.append('newFiles', file);
    });
  }

  const response = await apiClient.put<CreatePortfolioResponse>(
    `/portfolios/${portfolioId}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
};

export const deletePortfolio = async (portfolioId: number): Promise<void> => {
  await apiClient.delete(`/portfolios/${portfolioId}`);
};

export const getMyPortfolios = async (): Promise<MyPortfolioListResponse> => {
  const response = await apiClient.get<MyPortfolioListResponse>('/portfolios/me');
  return response.data;
};

// 특정 포지션의 내 포트폴리오 조회
export const getMyPortfolioByPosition = async (positionId: number): Promise<MyPortfolioItem> => {
  const response = await apiClient.get<MyPortfolioItem>('/portfolios/me/position', {
    params: { positionId },
  });
  return response.data;
};
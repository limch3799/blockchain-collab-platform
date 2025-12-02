// src/types/portfolio.ts
export interface CreatePortfolioRequest {
  positionId: number;
  title: string;
  description: string;
  thumbnailImage: File;
  images?: File[];
  files?: File[];
}

export interface CreatePortfolioResponse {
  portfolioId: number;
  title: string;
  thumbnailImageUrl: string;
  imageCount: number;
  fileCount: number;
  createdAt: string;
}

export interface Portfolio {
  portfolioId: number;
  positionId: number;
  title: string;
  description: string;
  thumbnailImageUrl: string;
  imageUrls: string[];
  fileUrls: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioListResponse {
  portfolios: Portfolio[];
  totalCount: number;
}

export interface MyPortfolioItem {
  portfolioId: number;
  positionId: number;
  positionName: string;
  title: string;
  thumbnailImageUrl: string;
  createdAt: string;
}

export interface MyPortfolioListResponse {
  data: MyPortfolioItem[];
}

// src/types/portfolio.ts에 추가
export interface PortfolioImage {
  imageId: number;
  imageUrl: string;
  originalImageUrl?: string;
  imageOrder: number;
}

export interface PortfolioFile {
  fileId: number;
  originalFileName: string;
  storedFileUrl: string;
}

export interface PortfolioDetail {
  portfolioId: number;
  positionId: number;
  positionName: string;
  categoryId: number;
  categoryName: string;
  title: string;
  description: string;
  thumbnailImageUrl: string;
  images: PortfolioImage[];
  files: PortfolioFile[];
  createdAt: string;
  nickname?: string;
  profileImageUrl?: string;
}

export interface EditPortfolioRequest {
  positionId: number;
  title: string;
  description: string;
  thumbnailImage?: File;
  thumbnailUrl?: string;
  imageSequence?: string;
  newImages?: File[];
  fileSequence?: string;
  newFiles?: File[];
}
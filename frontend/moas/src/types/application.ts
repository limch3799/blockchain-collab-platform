// src/types/application.ts

export interface Applicant {
  userId: number;
  nickname: string;
  profileImageUrl: string;
  averageRating: number;
  reviewCount: number;
}

export interface Position {
  projectPositionId: number;
  positionName: string;
  positionStatus: string;
  headcount: number;
}

export interface PortfolioImage {
  imageId: number;
  imageUrl: string;
  originalImageUrl: string;
  imageOrder: number;
}

export interface PortfolioFile {
  fileId: number;
  originalFileName: string;
  storedFileUrl: string;
}

export interface Portfolio {
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
}

export interface ApplicationDetails {
  applicationId: number;
  applicationStatus: string;
  createdAt: string;
  message: string;
  contractId: number | null;
  contractStatus: string | null;
  applicant: Applicant;
  position: Position;
  portfolio: Portfolio;
}

export interface ApplicationDetailsResponse {
  message: string;
  data: ApplicationDetails;
}

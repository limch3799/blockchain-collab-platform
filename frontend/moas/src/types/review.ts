export interface ReviewBase {
  reviewId: number;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ReviewGiven extends ReviewBase {
  reviewee: {
    userId: number;
    nickname: string;
    profileImageUrl?: string;
  };
}

export interface ReviewReceived extends ReviewBase {
  reviewer: {
    userId: number;
    nickname: string;
    profileImageUrl?: string;
  };
}

export interface Member {
  userId: number;
  nickname: string;
  profileImageUrl?: string;
}

export interface Review {
  id: number;
  contractId: number;
  reviewerMemberId: number;
  revieweeMemberId: number;
  rating: number;
  comment: string;
  createdAt: string;
  contractTitle: string;
  contractNftUrl?: string;
  contractStartAt: string;
  contractEndAt: string;
}

export interface ReviewsResponse {
  success: boolean;
  message: string;
  data: {
    page: number;
    size: number;
    total: number;
    averageRating: number;
    items: Review[];
  };
}

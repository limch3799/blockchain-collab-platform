/**
 * ReviewModal Component
 *
 * Description:
 * 특정 사용자의 리뷰 목록을 모달로 표시
 */

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

import type { ReviewsResponse } from '@/types/review';
import { userAPI } from '@/api/endpoints';
import ReviewCard from '@/pages/my-account/components/ReviewCard';
import StarRating from '@/pages/my-account/components/StarRating';
import Pagination from '@/pages/my-account/components/Pagination';

const PAGE_SIZE = 10;

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: number;
  userName: string;
}

export function ReviewModal({ isOpen, onClose, userId, userName }: ReviewModalProps) {
  const [reviews, setReviews] = useState<ReviewsResponse['data'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    if (isOpen && userId) {
      fetchReviews(currentPage);
    }
  }, [isOpen, userId, currentPage]);

  const fetchReviews = async (page: number) => {
    if (!userId) return;

    setLoading(true);
    try {
      const response = await userAPI.getUserReviews(userId, 'received', page, PAGE_SIZE);
      setReviews(response);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="sticky top-0 z-10 border-b bg-white px-8 py-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{userName}님의 리뷰</h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 hover:bg-gray-100 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* 리뷰 통계 */}
          {reviews && (
            <div className="mt-6 flex gap-8">
              <div>
                <div className="text-sm text-gray-600 mb-1">총 리뷰수</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">
                    {reviews.total?.toLocaleString() || '0'}
                  </span>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 mb-1">평균 평점</div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold">
                    {reviews.averageRating?.toFixed(1) || '0.0'}
                  </span>
                  <StarRating rating={reviews.averageRating || 0} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 리뷰 목록 */}
        <div className="px-8 py-6">
          {loading ? (
            <div className="text-center py-12">로딩 중...</div>
          ) : reviews?.items?.length && reviews.items.length > 0 ? (
            <>
              <div className="divide-y divide-gray-200">
                {reviews.items.map((item) => (
                  <ReviewCard
                    key={item.id}
                    review={item}
                    profileInfoUserId={item.reviewerMemberId}
                  />
                ))}
              </div>

              {/* Pagination */}
              {reviews && reviews.total > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={reviews.page}
                    totalPages={reviews.total}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 text-gray-500">리뷰가 없습니다.</div>
          )}
        </div>
      </div>
    </div>
  );
}

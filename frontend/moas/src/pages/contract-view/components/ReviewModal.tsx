/**
 * ReviewModal Component
 *
 * Description:
 * 정산 완료 후 리뷰를 작성하는 모달
 * - 별점 선택 (1-5점)
 * - 리뷰 텍스트 입력
 * - 작성 완료 버튼
 */

import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import apiClient from '@/api/axios';
import type { MemberProfileDetails } from '@/types/member';
import DefaultProfileImage1 from '@/assets/header/default_profile/default_profile_1.png';

interface ReviewModalProps {
  revieweeId: number; // 리뷰 대상자 ID
  revieweeName: string; // 리뷰 대상자 이름
  revieweeProfileImage?: string | null; // 리뷰 대상자 프로필 이미지
  revieweeRole: string; // 리뷰 대상자 역할 (아티스트/리더)
  onSubmit: (rating: number, content: string) => void;
  onCancel: () => void;
}

export function ReviewModal({
  revieweeId,
  revieweeName,
  revieweeProfileImage,
  revieweeRole,
  onSubmit,
  onCancel,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState('');
  const [memberDetails, setMemberDetails] = useState<MemberProfileDetails | null>(null);

  useEffect(() => {
    if (revieweeId) {
      fetchMemberDetails();
    }
  }, [revieweeId]);

  const fetchMemberDetails = async () => {
    try {
      const response = await apiClient.get<MemberProfileDetails>(`/members/${revieweeId}`);
      setMemberDetails(response.data);
    } catch (error) {
      console.error('Failed to fetch member details:', error);
    }
  };

  const handleSubmit = () => {
    if (rating === 0) {
      alert('별점을 선택해주세요');
      return;
    }
    onSubmit(rating, content);
  };

  const profileImage = memberDetails?.profileImageUrl || revieweeProfileImage || DefaultProfileImage1;
  const averageRating = memberDetails?.averageRating || 0;
  const reviewCount = memberDetails?.reviewCount || 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 font-pretendard"
      onClick={onCancel}
    >
      <div
        className="w-[480px] rounded-2xl bg-white p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <h3 className="mb-6 text-2xl font-bold text-moas-text">리뷰 남기기</h3>

        {/* 리뷰 대상자 정보 */}
        <div className="mb-6 flex items-start gap-3">
          {/* 프로필 이미지 */}
          <img
            src={profileImage}
            alt={revieweeName}
            className="h-[52px] w-[52px] rounded-full object-cover"
          />

          {/* 이름 & 정보 */}
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <h4 className="text-[20px] font-bold text-moas-text">{revieweeName}</h4>
              <span className="rounded-md bg-moas-artist px-2 py-0.5 text-xs font-semibold text-white">
                {revieweeRole}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[14px] text-moas-gray-6">
              <span>⭐ {averageRating.toFixed(1)}</span>
              <span className="text-moas-gray-4">|</span>
              <span>리뷰 {reviewCount}개</span>
            </div>
          </div>
        </div>

        {/* 별점 입력 */}
        <div className="mb-6">
          <label className="mb-3 block text-sm font-semibold text-moas-text">
            별점
          </label>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const isActive = star <= (hoverRating || rating);
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform duration-300 hover:scale-110"
                >
                  <Star
                    className="h-12 w-12 transition-all duration-500 ease-in-out"
                    style={{
                      fill: isActive ? '#FFC952' : 'transparent',
                      stroke: isActive ? '#FFC952' : '#BFC1C5',
                      strokeWidth: '2',
                    }}
                  />
                </button>
              );
            })}
          </div>
          {rating > 0 && (
            <p className="mt-2 text-center text-sm text-moas-gray-6">
              {rating}점을 선택하셨습니다
            </p>
          )}
        </div>

        {/* 리뷰 내용 입력 */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-semibold text-moas-text">
            코멘트
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="리뷰 내용을 입력해주세요"
            className="h-32 w-full resize-none rounded-xl border-2 border-moas-gray-3 p-4 text-sm text-moas-text placeholder:text-moas-gray-5 focus:border-moas-main focus:outline-none"
            maxLength={500}
          />
          <p className="mt-1 text-right text-xs text-moas-gray-5">
            {content.length}/500
          </p>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border-2 border-moas-gray-3 px-4 py-3 font-semibold text-moas-gray-7 transition-colors hover:bg-moas-gray-1"
          >
            취소하기
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 rounded-lg bg-moas-main px-4 py-3 font-semibold text-moas-text transition-opacity hover:opacity-90"
          >
            작성 완료
          </button>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';

import { Card, CardContent } from '@/components/ui';
import type { Review } from '@/types/review';
import { formatKoreanDate } from '@/lib/dateUtils';
import { truncateText } from '@/lib/stringUtils';
import apiClient from '@/api/axios';

import StarRating from './StarRating';

import DefaultProfileImage1 from '@/assets/header/default_profile/default_profile_1.png';

interface ReviewCardProps {
  review: Review;
  profileInfoUserId: number;
}

const ReviewCard = ({ review, profileInfoUserId }: ReviewCardProps) => {
  const [profileInfo, setProfileInfo] = useState({
    memberId: 0,
    nickname: '',
    profileImageUrl: null,
    role: '',
    averageRating: 0.0,
    reviewCount: 0,
  });
  const [expanded, setExpanded] = useState(false);

  const {
    rating,
    comment,
    createdAt,
    contractTitle,
    contractNftUrl,
    contractStartAt,
    contractEndAt,
  } = review;

  const shouldTruncate = comment.length > 300 || comment.split('\n').length > 6;

  useEffect(() => {
    if (!profileInfoUserId) return;
    fetchProfile();
  }, [profileInfoUserId]);

  const fetchProfile = async () => {
    const res = await apiClient.get(`members/${profileInfoUserId}`);

    setProfileInfo(res.data);
  };

  const getDisplayComment = () => {
    if (!shouldTruncate || expanded) return review.comment;

    const lines = review.comment.split('\n').slice(0, 6).join('\n');
    if (lines.length > 300) {
      return lines.slice(0, 300);
    }
    return lines;
  };

  return (
    <Card className="p-6 mb-4">
      <CardContent className="p-0">
        <div className="flex items-start gap-4 mb-4">
          {/* 프로필 사진 */}
          <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden shrink-0">
            <img
              src={profileInfo?.profileImageUrl || DefaultProfileImage1}
              alt={profileInfo.nickname}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            {/* 헤더 */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base mb-1 truncate">
                  {truncateText(profileInfo?.nickname || '사용자', 20)}
                </h3>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  {contractNftUrl ? (
                    <a href={contractNftUrl} target="_blank" className="underline">
                      계약명: {contractTitle}
                    </a>
                  ) : (
                    <span>계약명: {contractTitle}</span>
                  )}
                  <span>시작일시: {formatKoreanDate(contractStartAt)}</span>
                  <span>종료일시: {formatKoreanDate(contractEndAt)}</span>
                </div>
              </div>
              <div className="ml-4 flex flex-col items-end gap-2">
                <StarRating rating={rating} />
                <span className="text-sm text-gray-500">{formatKoreanDate(createdAt)}</span>
              </div>
            </div>

            {/* 리뷰 내용 */}
            <div className="mt-4">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{getDisplayComment()}</p>
              {shouldTruncate && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-sm text-blue-600 hover:text-blue-800 mt-2 font-medium"
                >
                  {expanded ? '접기' : '더 보기'}
                </button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewCard;

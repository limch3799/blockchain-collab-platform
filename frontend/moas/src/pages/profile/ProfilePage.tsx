import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import apiClient from '@/api/axios';
import { Pagination, ReviewCard, StarRating } from '@/pages/my-account/components';
import type { ReviewsResponse } from '@/types/review';

import DefaultProfileImage1 from '@/assets/header/default_profile/default_profile_1.png';
import { Button } from '@/components/ui';
import { truncateText } from '@/lib/stringUtils';

const PAGE_SIZE = 10;
const FIRST_PAGE = 1;

interface ProfileData {
  memberId: number;
  nickname: string;
  profileImageUrl: string | null;
  chainExploreUrl: string;
  role: 'LEADER' | 'ARTIST';
  averageRating: number;
  reviewCount: number;
}

const ProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [reviews, setReviews] = useState<ReviewsResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const role = profile?.role;

  // Fetch profile data
  const fetchProfile = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get<ProfileData>(`/members/${id}`);

      // console.log('fetchProfile response', JSON.stringify(response.data, null, 2));

      setProfile(response.data);
    } catch (err: any) {
      console.error('Failed to fetch profile:', err);
      setError(err.response?.data?.message || '프로필을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch reviews
  const fetchReviews = async (page: number = FIRST_PAGE) => {
    if (!id) return;

    try {
      setReviewsLoading(true);

      const response = await apiClient.get<ReviewsResponse['data']>(`/members/${id}/reviews`, {
        params: {
          page,
          size: PAGE_SIZE,
        },
      });

      // console.log('fetchReviews response', JSON.stringify(response.data, null, 2));

      setReviews(response.data);
      setCurrentPage(page);
    } catch (err: any) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchReviews(FIRST_PAGE);
  }, [id]);

  const handlePageChange = (page: number) => {
    fetchReviews(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChainExploration = () => {
    open(profile?.chainExploreUrl);
  };

  const getRoleDisplay = () => {
    if (role === 'ARTIST') {
      return {
        text: '아티스트',
        bgColor: 'bg-moas-artist',
      };
    } else if (role === 'LEADER') {
      return {
        text: '리더',
        bgColor: 'bg-moas-leader',
      };
    } else {
      return {
        text: '미설정',
        bgColor: 'bg-black',
      };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">프로필을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || '프로필을 찾을 수 없습니다.'}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-primary-yellow text-white rounded-lg hover:bg-yellow-500"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 font-pretendard">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>뒤로가기</span>
        </button>

        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="flex items-end gap-6">
            {/* Profile Image */}
            <div className="shrink-0">
              <img
                src={profile?.profileImageUrl || DefaultProfileImage1}
                alt={profile?.nickname}
                className="w-24 h-24 rounded-full object-cover"
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span
                  className={`${getRoleDisplay().bgColor} text-white text-xs px-2 py-1 rounded-md font-medium`}
                >
                  {getRoleDisplay().text}
                </span>
              </div>
              <h1 className="text-xl font-bold mb-1">{truncateText(profile.nickname, 20)}</h1>
              <div className="flex items-center gap-2">
                <StarRating rating={profile.averageRating} />
                <span className="text-lg font-bold">{profile.averageRating.toFixed(1)}</span>
                <span className="text-gray-500">({profile.reviewCount})</span>
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={handleChainExploration}>
              모아스 활동내역
            </Button>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Section Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">받은 리뷰</h2>

            {/* Review Statistics */}
            <div className="flex gap-8 pb-6 border-b border-gray-200">
              <div>
                <div className="text-sm text-gray-600 mb-1">총 리뷰수</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">
                    {reviews?.total?.toLocaleString() || '0'}
                  </span>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 mb-1">평균 평점</div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold">
                    {reviews?.averageRating?.toFixed(1) || '0.0'}
                  </span>
                  <StarRating rating={reviews?.averageRating || 0} />
                </div>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          {reviewsLoading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-primary-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">리뷰를 불러오는 중...</p>
            </div>
          ) : reviews?.items && reviews.items.length > 0 ? (
            <>
              <div className="divide-y divide-gray-200">
                {reviews.items.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    profileInfoUserId={review.reviewerMemberId}
                  />
                ))}
              </div>

              {/* Pagination */}
              {reviews && reviews.total > PAGE_SIZE && (
                <div className="mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(reviews.total / PAGE_SIZE)}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 text-gray-500">아직 받은 리뷰가 없습니다.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

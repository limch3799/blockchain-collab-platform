import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import type { ReviewsResponse } from '@/types/review';
import { userAPI } from '@/api/endpoints';

import { Pagination, ReviewCard, StarRating } from '../components';

const PAGE_SIZE = 10;
const FIRST_PAGE = 1;

const MyReviewsSection = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  // Read query param
  const tabParam = (searchParams.get('tab') as 'received' | 'given') || 'received';
  const pageParam = Number(searchParams.get('page')) || FIRST_PAGE;

  // const { getUserInfoFromStorage } = useAuth();
  // const userInfo = getUserInfoFromStorage();

  // // console.log('userInfo', JSON.stringify(userInfo, null, 2));

  // console.log('MyReviewsSection tabParam', tabParam, 'pageParam: ', pageParam);

  const [activeTab, setActiveTab] = useState<'received' | 'given'>(tabParam);
  const [reviews, setReviews] = useState<ReviewsResponse['data'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(pageParam);

  const fetchReviews = async (tab: 'received' | 'given', page: number) => {
    setLoading(true);
    try {
      // const response = await apiClient.get(`/members/${userInfo?.memberId}/reviews`, {
      //   page,
      //   size: PAGE_SIZE,
      // });
      const response = await userAPI.getMyReviews(
        tab === 'given' ? 'sent' : 'received',
        page,
        PAGE_SIZE,
      );

      // console.log('fetchReviews response', JSON.stringify(response, null, 2));

      setReviews(response);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(activeTab, currentPage);
  }, [activeTab, currentPage]);

  useEffect(() => {
    setActiveTab(tabParam);
    setCurrentPage(pageParam);
  }, [tabParam, pageParam]);

  // useEffect(() => {
  //   setSearchParams({ tab: tabParam, page: pageParam.toString() });
  // }, []);

  // Keep state in sync with URL
  // TODO: delete
  // useEffect(() => {
  //   setSearchParams({ tab: activeTab, page: currentPage.toString() });
  // }, [activeTab, currentPage, setSearchParams]);

  const handlePageChange = (page: number) => {
    setSearchParams({ tab: activeTab, page: page.toString() });
    // setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (tab: 'received' | 'given') => {
    setSearchParams({ tab, page: '1' }); // update URL
    // setActiveTab(tab);
    // setCurrentPage(FIRST_PAGE);
    // setReviews(null); // ← Add this to clear old data
  };

  return (
    <div className="flex-1 flex flex-col space-y-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">내 리뷰</h1>

        {/* 리뷰 통계 */}
        <div className="flex gap-8 mb-6">
          <div>
            <div className="text-sm text-gray-600 mb-1">총 리뷰수</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{reviews?.total?.toLocaleString() || '0'}</span>
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

        {/* 리뷰 탭 (받은 리뷰 / 작성한 리뷰) */}
        <div className="flex gap-4 border-b border-gray-200">
          <button
            onClick={() => handleTabChange('received')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'received'
                ? 'border-primary-yellow text-gray-900'
                : 'border-transparent text-gray-400 hover:text-gray-900'
            }`}
          >
            받은 리뷰
          </button>
          <button
            onClick={() => handleTabChange('given')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'given'
                ? 'border-primary-yellow text-gray-900'
                : 'border-transparent text-gray-400 hover:text-gray-900'
            }`}
          >
            작성한 리뷰
          </button>
        </div>
      </div>

      {/* 리뷰 목록 */}
      {loading ? (
        <div className="text-center py-12">로딩 중...</div>
      ) : reviews?.items?.length && reviews?.items?.length > 0 ? (
        <>
          <div className="divide-y divide-gray-200">
            {reviews?.items?.map((item) => (
              <ReviewCard
                key={item.id}
                review={item}
                profileInfoUserId={
                  activeTab === 'received' ? item.reviewerMemberId : item.revieweeMemberId
                }
              />
            ))}
          </div>

          {/* Pagination */}
          {reviews && reviews.total > PAGE_SIZE && (
            <Pagination
              currentPage={reviews.page}
              totalPages={Math.ceil(reviews.total / PAGE_SIZE)}
              onPageChange={handlePageChange}
            />
          )}
        </>
      ) : (
        <div className="text-center py-20 text-gray-500">리뷰가 없습니다.</div>
      )}
    </div>
  );
};

export default MyReviewsSection;

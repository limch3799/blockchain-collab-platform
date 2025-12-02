import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button, Card } from '@/components/ui';
import { useMemberStore } from '@/store/memberStore';
import { useAuth } from '@/hooks/useAuth';

const MainAccountSection = () => {
  const navigate = useNavigate();
  const { memberInfo } = useMemberStore();
  const { getUserInfoFromStorage } = useAuth();

  const userInfo = getUserInfoFromStorage();
  const role = userInfo?.role ?? 'ARTIST';
  const isArtist = role === 'ARTIST';

  const {
    appliedProjectCount = 0,
    inProgressProjectCount = 0,
    completedProjectCount = 0,
    inProgressProjectThumbnails = [],
    interestedProjectThumbnails = [],
  } = memberInfo ?? {};

  // TODO: 모집 카운트 필드 추가 필요
  const projectStats = useMemo(
    () => [
      { title: isArtist ? '지원' : '모집', count: appliedProjectCount },
      { title: '진행 중', count: inProgressProjectCount },
      { title: '완료', count: completedProjectCount },
    ],
    [isArtist, appliedProjectCount, inProgressProjectCount, completedProjectCount],
  );

  const handleSeeProjects = () => navigate(`/${isArtist ? 'artist' : 'leader'}-project-list`);
  const handleSeeAllOngoing = () => navigate(`/${isArtist ? 'artist' : 'leader'}-project-list`);
  const handleSeeAllBookmarked = () => navigate('/my-bookmark');

  const handleChainExploration = () => {
    open(memberInfo?.chainExploreUrl);
  };

  const renderProjectThumbnails = useCallback(
    (thumbnails: string[], emptyMessage: string, onClick: () => void) => {
      if (thumbnails.length === 0) {
        return (
          <div className="py-20 text-center font-pretendard">
            <h3 className="text-xl font-semibold text-moas-gray-7 mb-2">{emptyMessage}</h3>
          </div>
        );
      }

      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6 font-pretendard">
          {thumbnails.map((thumbnail) => (
            <Card
              key={thumbnail}
              className="overflow-hidden cursor-pointer group p-0 transition-all duration-300 ease-out hover:-translate-y-1"
              onClick={onClick}
            >
              <div className="relative rounded-t-lg overflow-hidden h-48">
                <img
                  src={thumbnail}
                  alt="프로젝트 썸네일"
                  className="w-full h-full object-cover rounded-t-lg"
                />
              </div>
            </Card>
          ))}
        </div>
      );
    },
    [],
  );

  return (
    <div className="flex-1 flex flex-col space-y-8">
      <div className="flex">
        <h1 className="flex-1 text-3xl font-bold mb-6">마이 페이지</h1>
        <Button
          variant="default"
          size="sm"
          className="bg-primary-yellow mt-1"
          onClick={handleChainExploration}
        >
          모아스 활동내역
        </Button>
      </div>
      {/* 프로젝트 요약 */}
      <div>
        <h3 className="text-lg font-semibold mb-4">프로젝트</h3>
        <div className="flex gap-4">
          {projectStats.map(({ title, count }) => (
            <div
              key={title}
              className="flex flex-col items-start w-40 p-6 bg-moas-white rounded-2xl space-y-6 shadow-sm"
              onClick={handleSeeProjects}
            >
              <p className="text-sm text-gray-500">{title}</p>
              <p className="text-xl font-bold">{count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 진행 중인 프로젝트 */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{`${isArtist ? '진행' : '모집'}`} 중인 프로젝트</h3>
          <Button variant="link" size="sm" className="text-gray-500" onClick={handleSeeAllOngoing}>
            모두 보기 &gt;
          </Button>
        </div>
        {renderProjectThumbnails(
          inProgressProjectThumbnails,
          '진행 중인 프로젝트가 없습니다',
          handleSeeAllOngoing,
        )}
      </div>

      {/* 관심있는 프로젝트 */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">관심있는 프로젝트</h3>
          <Button
            variant="link"
            size="sm"
            className="text-gray-500"
            onClick={handleSeeAllBookmarked}
          >
            모두 보기 &gt;
          </Button>
        </div>
        {renderProjectThumbnails(
          interestedProjectThumbnails,
          '북마크한 프로젝트가 없습니다',
          handleSeeAllBookmarked,
        )}
      </div>
    </div>
  );
};

export default MainAccountSection;

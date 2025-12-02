// src/pages/project-post/components/AvailableProjectsSection.tsx
import { useEffect, useState } from 'react';
import { getAvailableProjects } from '@/api/project';
import type { ProjectItem } from '@/types/project';
import { ProjectListSkeleton } from './ProjectCardSkeleton';
import { ProjectCard } from './ProjectCard';
import type { Project } from '@/types/project';
import { Pagination } from '@/pages/leader-project-list/components/Pagination';

const CATEGORY_TABS = [
  { name: '전체', positionIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] },
  { name: '음악 / 공연', positionIds: [1, 2, 3, 4] },
  { name: '사진 / 영상 / 미디어', positionIds: [5, 6, 7, 8, 9] },
  { name: '디자인', positionIds: [10, 11, 12, 13, 14] },
  { name: '기타', positionIds: [15] },
];

// Unix timestamp를 날짜 문자열로 변환하는 함수
function formatUnixTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}월 ${day}일`;
}

// API 응답을 Project 타입으로 변환하는 함수
function convertToProject(item: ProjectItem): Project {
  const firstPosition = item.positions[0];
  const isOnline = !item.province;

  const startDate = formatUnixTimestamp(Number(item.startAt));
  const endDate = formatUnixTimestamp(Number(item.endAt));

  return {
    id: item.id,
    title: item.title,
    mainCategoryId: 1,
    subCategoryIds: [1],
    price: item.totalBudget,
    startDate: startDate,
    endDate: endDate,
    isOnline: isOnline,
    region: isOnline ? '온라인' : item.district || item.province || '',
    authorProfileImg: item.leaderProfileImageUrl || '',
    authorName: item.leaderNickname || '',
    isBookmarked: item.bookmarked,
    thumbnail: item.thumbnailUrl || '',
    categoryName: firstPosition?.categoryName || '기타',
    positionName: firstPosition?.positionName || '포지션',
    positions: item.positions,
    summary: item.summary,
    provinceCode: item.provinceCode,
    province: item.province,
    districtCode: item.districtCode,
    district: item.district,
    startAt: item.startAt,
    endAt: item.endAt,
    totalBudget: item.totalBudget,
    viewCount: item.viewCount,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    bookmarked: item.bookmarked,
    thumbnailUrl: item.thumbnailUrl,
    isClosed: item.isClosed,
    leaderNickname: item.leaderNickname,
    leaderProfileImageUrl: item.leaderProfileImageUrl,
  };
}

interface AvailableProjectsSectionProps {
  onBookmark?: (id: number) => void;
  selectedTabIndex: number;
  resetTrigger: number;
}

const ITEMS_PER_PAGE = 16;

export function AvailableProjectsSection({
  onBookmark,
  selectedTabIndex,
  resetTrigger,
}: AvailableProjectsSectionProps) {
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isTabChanging, setIsTabChanging] = useState(false);

  const fetchProjects = async (page: number, tabIndex: number) => {
    setIsLoading(true);
    try {
      const selectedPositionIds = CATEGORY_TABS[tabIndex].positionIds;

      const [response] = await Promise.all([
        getAvailableProjects({
          page,
          size: ITEMS_PER_PAGE,
          positionIds: selectedPositionIds.join(','),
        }),
        new Promise((resolve) => setTimeout(resolve, 500)),
      ]);

      const convertedProjects = response.items.map((item) => convertToProject(item));
      console.log('Fetched projects:', convertedProjects);
      console.log('Sample project positions:', convertedProjects[0]?.positions);
      setAllProjects(convertedProjects);
      setTotalCount(response.total);
    } catch (error) {
      console.error('프로젝트 목록 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects(currentPage, selectedTabIndex);
  }, [currentPage, selectedTabIndex]);

  // 탭 변경 시 페이지 초기화 및 스켈레톤 표시
  useEffect(() => {
    setCurrentPage(1);
    setIsTabChanging(true);

    const timer = setTimeout(() => {
      setIsTabChanging(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [selectedTabIndex]);

  // 초기화 버튼 클릭 시 스켈레톤 표시
  useEffect(() => {
    if (resetTrigger > 0) {
      setCurrentPage(1);
      setIsTabChanging(true);

      const timer = setTimeout(() => {
        setIsTabChanging(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [resetTrigger]);

  // 백엔드에서 이미 필터링되어 오므로 그대로 사용
  const filteredProjects = allProjects;

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-semibold text-moas-text mb-6 font-pretendard">
        모집 중인 프로젝트
      </h2>
      {isLoading || isTabChanging ? (
        <ProjectListSkeleton />
      ) : (
        <>
          {filteredProjects.length === 0 ? (
            <div className="py-20 text-center font-pretendard">
              <h3 className="text-xl font-medium text-moas-gray-7 mb-2">
                해당 카테고리의 프로젝트가 없습니다.
              </h3>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-0">
                {filteredProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} onBookmark={onBookmark} />
                ))}
              </div>

              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

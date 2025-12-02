// src/pages/project-post/ProjectPostMain.tsx
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { SearchSection } from './components/SearchSection';
import { FilterButtons } from './components/FilterButtons';
import { ResultHeader } from './components/ResultHeader';
import { ProjectList } from './components';
import { AvailableProjectsSection } from './components/AvailableProjectsSection';
import { AIRecommendedSection } from './components/AIRecommendedSection';
import { ProjectListSkeleton } from './components/ProjectCardSkeleton';
import { Pagination } from '../leader-project-list/components/Pagination';
import BookmarkConfirmationModal from './components/BookmarkConfirmationModal';
import { getProjects } from '@/api/project';
import { addBookmark, removeBookmark } from '@/api/bookmark';
import {
  isProjectBookmarked,
  addBookmarkToStorage,
  removeBookmarkFromStorage,
} from '@/pages/project-post/bookmarkUtils';
import type { Project, ProjectItem } from '@/types/project';
import { isAllDistrictCode, ALL_DISTRICTS_BY_PROVINCE } from '@/constants/regionUtils';

export type SortOption = 'latest' | 'popular' | 'deadline' | 'postDate' | 'startDate' | 'reward';

function convertToProject(item: ProjectItem): Project {
  return {
    ...item,
    mainCategoryId: item.positions[0]?.categoryId || 0,
    subCategoryIds: item.positions.map((p) => p.positionId),
    price: item.totalBudget,
    startDate:
      typeof item.startAt === 'number'
        ? new Date(item.startAt * 1000).toISOString().split('T')[0]
        : item.startAt,
    endDate:
      typeof item.endAt === 'number'
        ? new Date(item.endAt * 1000).toISOString().split('T')[0]
        : item.endAt,
    region: item.province,
    authorProfileImg: '',
    authorName: '',
    isBookmarked: item.bookmarked,
    thumbnail: item.thumbnailUrl || '',
    categoryName: item.positions[0]?.categoryName,
    positionName: item.positions[0]?.positionName,
    leaderNickname: item.leaderNickname,
    leaderProfileImageUrl: item.leaderProfileImageUrl,
  };
}

function ProjectPostMain() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPositions, setSelectedPositions] = useState<number[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<
    Array<{ provinceCode: string; districtCode: string }>
  >([]);
  const [isOnlineSelected, setIsOnlineSelected] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [isAIMode, setIsAIMode] = useState(false);

  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [bookmarkAction, setBookmarkAction] = useState<'add' | 'remove'>('add');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  useEffect(() => {
    if (location.state?.searchQuery) {
      const query = location.state.searchQuery;
      setSearchQuery(query);
      handleSearch(1, query);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    if (location.state?.selectedTabIndex !== undefined) {
      setSelectedTabIndex(location.state.selectedTabIndex);
      window.history.replaceState({}, document.title);
    }
  }, [location.state?.selectedTabIndex]);

  useEffect(() => {
    if (location.state?.aiMode === true) {
      setIsAIMode(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state?.aiMode]);

  const handleSearch = async (page: number = 1, query?: string) => {
    const searchText = query !== undefined ? query : searchQuery;

    if (
      !searchText.trim() &&
      selectedPositions.length === 0 &&
      selectedRegions.length === 0 &&
      !isOnlineSelected
    )
      return;

    setIsLoading(true);
    setHasSearched(true);
    setCurrentPage(page);

    try {
      const getSortParam = () => {
        switch (sortBy) {
          case 'popular':
            return 'viewCount';
          case 'latest':
            return 'created';
          case 'startDate':
            return 'startAt';
          case 'reward':
            return 'totalBudget';
          default:
            return 'created';
        }
      };

      const expandedDistrictCodes: string[] = [];
      selectedRegions.forEach((region) => {
        if (isAllDistrictCode(region.districtCode)) {
          const allCodes = ALL_DISTRICTS_BY_PROVINCE[region.provinceCode] || [];
          expandedDistrictCodes.push(...allCodes);
        } else {
          expandedDistrictCodes.push(region.districtCode);
        }
      });

      const [response] = await Promise.all([
        getProjects({
          q: searchText.trim() || undefined,
          positionIds: selectedPositions.length > 0 ? selectedPositions.join(',') : undefined,
          provinceCode:
            !isOnlineSelected && selectedRegions.length > 0
              ? selectedRegions[0].provinceCode
              : undefined,
          districtCodes:
            !isOnlineSelected && expandedDistrictCodes.length > 0
              ? expandedDistrictCodes.join(',')
              : undefined,
          page: page,
          size: 16,
          sort: getSortParam(),
        }),
        new Promise((resolve) => setTimeout(resolve, 1000)),
      ]);

      let filteredItems = response.items;
      if (isOnlineSelected) {
        filteredItems = filteredItems.filter((item) => item.isOnline === true);
      } else if (selectedRegions.length > 0) {
        filteredItems = filteredItems.filter((item) => item.isOnline === false);
      }

      setProjects(filteredItems.map(convertToProject));
      setTotalCount(response.total);
      setTotalPages(Math.ceil(response.total / 16));
    } catch (error) {
      console.error('검색 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSearchQuery('');
    setSelectedPositions([]);
    setSelectedRegions([]);
    setIsOnlineSelected(false);
    setHasSearched(false);
    setProjects([]);
    setTotalCount(0);
    setCurrentPage(1);
    setTotalPages(1);
    setResetTrigger((prev) => prev + 1);
  };

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
  };

  const handlePageChange = (page: number) => {
    handleSearch(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookmark = (id: number) => {
    const isBookmarked = isProjectBookmarked(id);
    setSelectedProjectId(id);
    setBookmarkAction(isBookmarked ? 'remove' : 'add');
    setShowBookmarkModal(true);
  };

  const handleConfirmBookmark = async () => {
    if (selectedProjectId === null) return;

    try {
      if (bookmarkAction === 'add') {
        await addBookmark(selectedProjectId);
        addBookmarkToStorage(selectedProjectId);
      } else {
        await removeBookmark(selectedProjectId);
        removeBookmarkFromStorage(selectedProjectId);
      }

      window.dispatchEvent(new Event('bookmarkUpdate'));
      setShowBookmarkModal(false);
      setSelectedProjectId(null);
    } catch (error) {
      console.error('북마크 처리 실패:', error);
      alert('북마크 처리에 실패했습니다. 다시 시도해주세요.');
      setShowBookmarkModal(false);
      setSelectedProjectId(null);
    }
  };

  const handleCancelBookmark = () => {
    setShowBookmarkModal(false);
    setSelectedProjectId(null);
  };

  const handleTabChange = (newTabIndex: number) => {
    setSelectedTabIndex(newTabIndex);
    setHasSearched(false);
    setProjects([]);
    setTotalCount(0);
    setCurrentPage(1);
    setTotalPages(1);
  };

  const handleAIModeChange = (isAI: boolean) => {
    setIsAIMode(isAI);
    if (isAI) {
      setHasSearched(false);
      setProjects([]);
      setTotalCount(0);
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && searchQuery.trim()) {
        handleSearch(1);
      }
    };
    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [searchQuery, selectedPositions, selectedRegions, isOnlineSelected, sortBy]);

  useEffect(() => {
    if (hasSearched) {
      handleSearch(1);
    }
  }, [sortBy]);

  return (
    <div className="min-h-screen">
      <PageHeader
        title="프로젝트 찾기"
        description="관심 있는 프로젝트를 살펴보고 지원까지 이어가 보세요"
      />
      <div className="mt-6"></div>
      <SearchSection
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedPositions={selectedPositions}
        onPositionsChange={setSelectedPositions}
        selectedRegions={selectedRegions}
        onRegionsChange={setSelectedRegions}
        isOnlineSelected={isOnlineSelected}
        onIsOnlineChange={setIsOnlineSelected}
        selectedTabIndex={selectedTabIndex}
        onTabChange={handleTabChange}
        isAIMode={isAIMode}
        onAIModeChange={handleAIModeChange}
      />

      {!isAIMode && (
        <>
          <div className="mt-4">
            <FilterButtons onSearch={() => handleSearch(1)} onReset={handleReset} />
          </div>

          {hasSearched && (
            <div className="mt-4 mb-12">
              <ResultHeader
                totalCount={totalCount}
                sortBy={sortBy}
                onSortChange={handleSortChange}
              />
              {isLoading ? (
                <ProjectListSkeleton />
              ) : (
                <>
                  <ProjectList projects={projects} onBookmark={handleBookmark} />
                  {totalPages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  )}
                </>
              )}
            </div>
          )}

          <div className={hasSearched ? 'mt-24' : 'mt-4'}>
            <AvailableProjectsSection
              onBookmark={handleBookmark}
              selectedTabIndex={selectedTabIndex}
              resetTrigger={resetTrigger}
            />
          </div>
        </>
      )}

      {isAIMode && (
        <div className="mt-8">
          <AIRecommendedSection />
        </div>
      )}

      <BookmarkConfirmationModal
        isOpen={showBookmarkModal}
        onConfirm={handleConfirmBookmark}
        onCancel={handleCancelBookmark}
        type={bookmarkAction}
      />
    </div>
  );
}

export default ProjectPostMain;

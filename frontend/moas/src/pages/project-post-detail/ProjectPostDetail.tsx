// src/pages/project-post-detail/ProjectPostDetail.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import type { ProjectDetailResponse } from '@/types/project';
import { getProjectById } from '@/api/project';
import { addBookmark, removeBookmark } from '@/api/bookmark';
import {
  isProjectBookmarked,
  addBookmarkToStorage,
  removeBookmarkFromStorage,
} from '@/pages/project-post/bookmarkUtils';

import { ProjectPostDetailTop } from './components/ProjectPostDetailTop';
import { ProjectPostDetailBottom } from './components/ProjectPostDetailBottom';
import { ProjectPostDetailTopSkeleton } from './components/ProjectPostDetailTopSkeleton';
import { ProjectPostDetailBottomSkeleton } from './components/ProjectPostDetailBottomSkeleton';
import { SimilarProjectList } from './components/SimilarProjectList';
//import { PageBanner } from '../../components/layout/PageBanner';
import BookmarkConfirmationModal from '../project-post/components/BookmarkConfirmationModal';

function ProjectPostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [projectData, setProjectData] = useState<ProjectDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isViewAllMode, setIsViewAllMode] = useState(false);

  // 북마크 모달 상태
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [bookmarkAction, setBookmarkAction] = useState<'add' | 'remove'>('add');

  useEffect(() => {
    const loadProject = async () => {
      if (!id) {
        console.warn('ID가 없습니다.');
        navigate('/project-post', { replace: true });
        return;
      }

      try {
        setIsLoading(true);
        console.log('Fetching project with id:', id);

        // 최소 0.5초 로딩 보장
        const [response] = await Promise.all([
          getProjectById(Number(id)),
          new Promise((resolve) => setTimeout(resolve, 500)),
        ]);

        console.log('Project detail fetched:', response);

        setProjectData(response);

        // 로컬스토리지에서 북마크 상태 확인
        setIsBookmarked(isProjectBookmarked(Number(id)));
      } catch (error) {
        console.error('프로젝트 조회 실패:', error);
        alert('프로젝트를 불러오는데 실패했습니다.');
        navigate('/project-post', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [id, navigate]);

  // 로컬스토리지 변경 감지
  useEffect(() => {
    if (!id) return;

    const handleBookmarkUpdate = () => {
      setIsBookmarked(isProjectBookmarked(Number(id)));
    };

    window.addEventListener('bookmarkUpdate', handleBookmarkUpdate);

    return () => {
      window.removeEventListener('bookmarkUpdate', handleBookmarkUpdate);
    };
  }, [id]);

  const handleBookmarkToggle = () => {
    const currentBookmarkStatus = isProjectBookmarked(Number(id));
    setBookmarkAction(currentBookmarkStatus ? 'remove' : 'add');
    setShowBookmarkModal(true);
  };

  const handleConfirmBookmark = async () => {
    if (!id) return;

    try {
      const projectId = Number(id);

      if (bookmarkAction === 'add') {
        await addBookmark(projectId);
        addBookmarkToStorage(projectId);
        setIsBookmarked(true);
        console.log('북마크 등록 완료:', projectId);
      } else {
        await removeBookmark(projectId);
        removeBookmarkFromStorage(projectId);
        setIsBookmarked(false);
        console.log('북마크 해제 완료:', projectId);
      }

      // 커스텀 이벤트 발생
      window.dispatchEvent(new Event('bookmarkUpdate'));

      setShowBookmarkModal(false);
    } catch (error) {
      console.error('북마크 처리 실패:', error);
      alert('북마크 처리에 실패했습니다. 다시 시도해주세요.');
      setShowBookmarkModal(false);
    }
  };

  const handleCancelBookmark = () => {
    setShowBookmarkModal(false);
  };

  const handleChat = () => {
    console.log('채팅 문의하기');

    navigate('/chat', {
      state: {
        projectId: projectData?.projectId,
        otherMemberId: projectData?.leader?.userId,
        projectTitle: projectData?.title,
        otherMemberName: projectData?.leader.nickname,
        otherMemberProfileUrl: projectData?.leader.profileImageUrl,
      },
    });
  };

  const handleViewAllToggle = () => {
    setIsViewAllMode(!isViewAllMode);
    // 전체보기 클릭 시 해당 섹션으로 스크롤
    if (!isViewAllMode) {
      setTimeout(() => {
        const similarSection = document.getElementById('similar-projects-section');
        if (similarSection) {
          similarSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  // 로딩 중 - 스켈레톤 표시
  if (isLoading) {
    return (
      <div className="min-h-screen font-pretendard">
        {/* <PageBanner /> */}

        <div className="mx-auto py-8">
          <ProjectPostDetailTopSkeleton />

          <div className="h-12" />

          <ProjectPostDetailBottomSkeleton />
        </div>
      </div>
    );
  }

  // 데이터 없음 또는 positions 없음
  if (!projectData || !projectData.positions || projectData.positions.length === 0) {
    console.error('Invalid project data:', projectData);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-moas-gray-6 mb-4">프로젝트 정보를 찾을 수 없습니다.</p>
          <button
            onClick={() => navigate('/project-post')}
            className="px-4 py-2 bg-moas-main text-white rounded-lg hover:bg-moas-main/90"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // ISO 8601 형식을 YYYY.MM.DD 형식으로 변환
  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  const registeredDate = formatDate(projectData.createdAt);

  // ProjectPostDetailTop에 전달할 데이터 구성
  const projectDetail = {
    id: projectData.projectId,
    title: projectData.title,
    category: projectData.positions[0]?.categoryName || '기타',
    registeredDate: registeredDate,
    views: projectData.viewCount,
    isBookmarked: isBookmarked,
    thumbnail: projectData.thumbnailUrl || '',
    leader: {
      id: projectData.leader.userId,
      profileImg: projectData.leader.profileImageUrl || '',
      name: projectData.leader.nickname,
      projectCount: 0,
      rating: projectData.leader.averageRating,
      reviewCount: projectData.leader.reviewCount,
    },
  };

  const recruitArtists = projectData.positions.map((p) => ({
    role: p.positionName,
    budget: p.budget,
    isClosed: p.isClosed,
  }));

  const projectForBottom = {
    projectId: projectData.projectId,
    title: projectData.title,
    summary: projectData.summary,
    description: projectData.description,
    thumbnailUrl: projectData.thumbnailUrl,
    isOnline: !projectData.province,
    province: projectData.province?.nameKo || '',
    district: projectData.district?.nameKo || '',
    startAt: projectData.startAt,
    endAt: projectData.endAt,
    applyDeadline: projectData.applyDeadline,
    positions: projectData.positions,
    totalBudget: projectData.positions.reduce((sum, p) => sum + p.budget, 0),
    viewCount: projectData.viewCount,
    createdAt: projectData.createdAt,
    updatedAt: projectData.updatedAt,
  };

  return (
    <div className="min-h-screen font-pretendard">
      {/* <PageBanner /> */}

      <div className="mx-auto py-4">
        <ProjectPostDetailTop
          project={projectDetail}
          onBookmark={handleBookmarkToggle}
          onChat={handleChat}
        />

        <div className="h-12" />

        <ProjectPostDetailBottom
          project={projectForBottom}
          description={projectData.description}
          recruitArtists={recruitArtists}
        />

        {/* 유사 프로젝트 섹션 */}
        {projectData.similar && projectData.similar.length > 0 && (
          <>
            <div className="h-16" />
            <div id="similar-projects-section" className="w-full">
              {/* 헤더 섹션 */}
              <div className="max-w-7xl mx-auto px-4 mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-moas-text">유사한 프로젝트</h2>
                {projectData.similar.length > 4 && (
                  <button
                    onClick={handleViewAllToggle}
                    className="text-moas-main hover:text-moas-main/80 font-medium text-sm transition-colors flex items-center gap-1"
                  >
                    {isViewAllMode ? '접기' : '전체보기'}
                    <svg
                      className={`w-4 h-4 transition-transform ${isViewAllMode ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                )}
              </div>

              {/* 리스트 섹션 */}
              <div className={isViewAllMode ? 'max-w-7xl mx-auto px-4' : 'w-full overflow-hidden'}>
                <SimilarProjectList
                  projects={projectData.similar}
                  isLoading={false}
                  isViewAllMode={isViewAllMode}
                />
              </div>
            </div>
            <div className="h-16" />
          </>
        )}
      </div>

      {/* 북마크 확인 모달 */}
      <BookmarkConfirmationModal
        isOpen={showBookmarkModal}
        onConfirm={handleConfirmBookmark}
        onCancel={handleCancelBookmark}
        type={bookmarkAction}
      />
    </div>
  );
}

export default ProjectPostDetail;

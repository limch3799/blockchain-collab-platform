// src/pages/project-post/Mybookmark.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // useNavigate 추가

import type { Project, ProjectItem } from '@/types/project';
import { getProjects } from '@/api/project';
import { removeBookmark } from '@/api/bookmark';
import { removeBookmarkFromStorage } from '@/pages/project-post/bookmarkUtils';

import BookmarkConfirmationModal from './components/BookmarkConfirmationModal';
import { ProjectList } from './components';
import { ProjectListSkeleton } from './components/ProjectCardSkeleton';

import faviconImage from '@/assets/favicon.png';

interface PageHeaderProps {
  title: string;
  description: string;
}

function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="w-full flex justify-between items-start font-pretendard">
      <div className="flex-1">
        <h1 className="text-3xl font-semibold text-moas-text leading-tight">{title}</h1>
        <p className="text-lg text-moas-gray-7 leading-snug mt-1">{description}</p>
      </div>
      <div className="flex-shrink-0 self-end mb-2">
        <img src={faviconImage} alt="Favicon" className="h-18 w-18 object-contain" />
      </div>
    </div>
  );
}

// Unix timestamp를 날짜 문자열로 변환
function formatUnixTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

// API 응답을 Project 타입으로 변환
function convertToProject(item: ProjectItem): Project {
  const firstPosition = item.positions[0];
  const isOnline = !item.province;

  const startDate = formatUnixTimestamp(Number(item.startAt));
  const endDate = formatUnixTimestamp(Number(item.endAt));

  return {
    id: item.id,
    title: item.title,
    summary: item.summary,
    mainCategoryId: firstPosition?.categoryId || 0,
    subCategoryIds: item.positions.map((p) => p.positionId),
    price: item.totalBudget,
    startDate: startDate,
    endDate: endDate,
    isOnline: isOnline,
    region: isOnline ? '온라인' : item.district || item.province || '',
    authorProfileImg: item.leaderProfileImageUrl || '',
    authorName: item.leaderNickname || '',
    isBookmarked: true, // 북마크 페이지이므로 항상 true
    thumbnail: item.thumbnailUrl || '',
    categoryName: firstPosition?.categoryName || '기타',
    positionName: firstPosition?.positionName || '포지션',
    positions: item.positions,
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
    bookmarked: true,
    thumbnailUrl: item.thumbnailUrl,
    isClosed: item.isClosed,
    leaderNickname: item.leaderNickname,
    leaderProfileImageUrl: item.leaderProfileImageUrl,
  };
}

export default function MyBookmark() {
  const navigate = useNavigate(); // useNavigate 훅 사용
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  // 북마크 목록 로드
  useEffect(() => {
    const fetchBookmarkedProjects = async () => {
      setIsLoading(true);
      try {
        const response = await getProjects({
          bookmarked: true,
          size: 10,
        });

        const convertedProjects = response.items.map(convertToProject);
        setProjects(convertedProjects);
      } catch (error) {
        console.error('북마크 목록 조회 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookmarkedProjects();
  }, []);

  const handleBookmarkClick = (id: number) => {
    // 북마크 페이지에서는 항상 해제 동작
    setSelectedProjectId(id);
    setShowModal(true);
  };

  const handleConfirmRemove = async () => {
    if (selectedProjectId === null) return;

    try {
      await removeBookmark(selectedProjectId);
      removeBookmarkFromStorage(selectedProjectId);

      // UI에서 제거
      setProjects((prev) => prev.filter((project) => project.id !== selectedProjectId));

      // 커스텀 이벤트 발생
      window.dispatchEvent(new Event('bookmarkUpdate'));

      console.log('북마크 해제 완료:', selectedProjectId);
    } catch (error) {
      console.error('북마크 해제 실패:', error);
      alert('북마크 해제에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setShowModal(false);
      setSelectedProjectId(null);
    }
  };

  const handleCancelRemove = () => {
    setShowModal(false);
    setSelectedProjectId(null);
  };

  // 프로젝트 찾으러 가기 핸들러
  const handleGoToProjects = () => {
    navigate('/project-post');
  };

  return (
    <div className="min-h-screen">
      <PageHeader
        title="관심있는 프로젝트"
        description="관심 프로젝트를 선별하셨군요. 이제 지원으로 한 걸음 더 나아가보세요"
      />

      <div className="mt-8">
        {isLoading ? (
          <ProjectListSkeleton />
        ) : projects.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-xl text-moas-gray-6 font-pretendard">
              북마크한 프로젝트가 없습니다.
            </p>
            {/* 프로젝트 찾으러 가기 버튼 추가 */}
            <button
              onClick={handleGoToProjects}
              className="mt-6 px-6 py-3 bg-moas-main text-white font-semibold rounded-lg hover:bg-moas-main-dark transition-colors duration-200 font-pretendard"
            >
              프로젝트 찾으러 가기 →
            </button>
          </div>
        ) : (
          <ProjectList projects={projects} onBookmark={handleBookmarkClick} />
        )}
      </div>

      <BookmarkConfirmationModal
        isOpen={showModal}
        onConfirm={handleConfirmRemove}
        onCancel={handleCancelRemove}
        type="remove"
      />
    </div>
  );
}

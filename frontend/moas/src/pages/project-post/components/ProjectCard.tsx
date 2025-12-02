// src/pages/project-post/components/ProjectCard.tsx
import { MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import { Card } from '@/components/ui/card';
import type { Project } from '@/types/project';
import { isProjectBookmarked } from '@/pages/project-post/bookmarkUtils';

// 이미지 import
import thumbnail1 from '../../../assets/project-post/project-thumbnail-dummy/thumbnail1.png';
import thumbnail2 from '../../../assets/project-post/project-thumbnail-dummy/thumbnail2.png';
import thumbnail3 from '../../../assets/project-post/project-thumbnail-dummy/thumbnail3.png';
import thumbnail4 from '../../../assets/project-post/project-thumbnail-dummy/thumbnail4.png';
import defaultProfile from '../../../assets/header/default_profile/default_profile_1.png';
import effectImg from '../../../assets/project-post/effect.png';
import bookmarkOn from '../../../assets/project-post/bookmarkOn.png';
import bookmarkOff from '../../../assets/project-post/bookmarkOff.png';

// 더미 썸네일 배열
const DUMMY_THUMBNAILS = [thumbnail1, thumbnail2, thumbnail3, thumbnail4];

interface ProjectCardProps {
  project: Project;
  onBookmark?: (id: number) => void;
}

export function ProjectCard({ project, onBookmark }: ProjectCardProps) {
  const navigate = useNavigate();
  const [isBookmarked, setIsBookmarked] = useState(false);

  // 북마크 상태 초기화 및 업데이트
  useEffect(() => {
    setIsBookmarked(isProjectBookmarked(project.id));
  }, [project.id]);

  // 로컬스토리지 변경 감지
  useEffect(() => {
    const handleStorageChange = () => {
      setIsBookmarked(isProjectBookmarked(project.id));
    };

    window.addEventListener('storage', handleStorageChange);

    // 커스텀 이벤트로도 업데이트 감지
    window.addEventListener('bookmarkUpdate', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('bookmarkUpdate', handleStorageChange);
    };
  }, [project.id]);

  const thumbnailSrc =
    project.thumbnail || project.thumbnailUrl || DUMMY_THUMBNAILS[project.id % 4];

  // API에서 받은 리더 정보 사용 (leaderProfileImageUrl, leaderNickname)
  const profileImgSrc = project.leaderProfileImageUrl || defaultProfile;
  const leaderName = project.leaderNickname || project.authorName || '알 수 없음';

  // 닉네임이 11글자 넘으면 ...처리
  const displayLeaderName = leaderName.length > 11 ? leaderName.slice(0, 11) + '...' : leaderName;

  // API에서 categoryName이 있으면 사용
  const mainCategory = project.categoryName || '미분류';

  // positions 배열에서 모든 positionName 추출
  const subCategories = project.positions ? project.positions.map((pos) => pos.positionName) : [];

  // 지역 표시 - district(구/군)만 표시, 띄어쓰기 있으면 뒷부분만
  const getDisplayRegion = () => {
    const region = project.district || project.region;
    if (!region) return '';

    // 띄어쓰기가 있으면 마지막 부분만 반환
    if (region.includes(' ')) {
      const parts = region.split(' ');
      return parts[parts.length - 1];
    }

    return region;
  };

  const regionDisplay = getDisplayRegion();

  const handleCardClick = () => {
    navigate(`/project-post/${project.id}`);
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBookmark?.(project.id);
  };

  return (
    <Card
      className="overflow-hidden cursor-pointer group p-0 font-pretendard transition-all duration-300 ease-out hover:-translate-y-1"
      onClick={handleCardClick}
    >
      {/* 썸네일 헤더 */}
      <div className="relative rounded-t-lg overflow-hidden h-48">
        <img
          src={thumbnailSrc}
          alt={project.title}
          className="w-full h-full object-cover rounded-t-lg"
        />
        {/* Effect 이미지 오버레이 */}
        <img
          src={effectImg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover pointer-events-none rounded-t-lg"
        />

        {/* 대분류 키워드 - 왼쪽 위 */}
        <div className="absolute top-3 left-3">
          <span className="bg-black/50 backdrop-blur-sm text-white text-sm font-semibold px-3 py-1 rounded">
            {mainCategory}
          </span>
        </div>

        {/* 금액 - 오른쪽 아래 */}
        <div className="absolute bottom-3 right-3">
          <span className="text-white text-xl font-bold">{project.price.toLocaleString()}원</span>
        </div>

        {/* 북마크 버튼 - 오른쪽 위 */}
        <button
          onClick={handleBookmarkClick}
          className="absolute top-0 right-3 bg-transparent p-0 border-none cursor-pointer"
        >
          <img src={isBookmarked ? bookmarkOn : bookmarkOff} alt="bookmark" className="w-6 h-8" />
        </button>
      </div>

      {/* 콘텐츠 */}
      <div className="px-2 pt-0 pb-2 space-y-3">
        {/* 소분류 키워드 */}
        {subCategories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {subCategories.map((tag, idx) => (
              <span key={idx} className="text-xs bg-moas-gray-2 text-moas-gray-7 px-2 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* 제목 */}
        <h3 className="text-base font-bold text-moas-text line-clamp-1 group-hover:text-moas-main transition-colors">
          {project.title}
        </h3>

        {/* 기간 */}
        <p className="text-sm text-moas-gray-6">
          {project.startDate} ~ {project.endDate}
        </p>

        {/* 하단 정보 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-moas-gray-6">
            <span className="text-xs bg-moas-gray-1 px-2 py-1 rounded">
              {project.isOnline ? '온라인' : '오프라인'}
            </span>
            {!project.isOnline && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span className="text-xs">{regionDisplay}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <img
              src={profileImgSrc}
              alt={leaderName}
              className="w-6 h-6 object-cover rounded-full"
            />
            <span className="text-xs text-moas-gray-7 font-medium">{displayLeaderName}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

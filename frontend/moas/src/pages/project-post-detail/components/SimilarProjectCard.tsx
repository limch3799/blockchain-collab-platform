// src/pages/project-post-detail/components/SimilarProjectCard.tsx
import { MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Card } from '@/components/ui/card';
import type { SimilarProjectItem } from '@/types/project';

// 이미지 import
import thumbnail1 from '../../../assets/project-post/project-thumbnail-dummy/thumbnail1.png';
import thumbnail2 from '../../../assets/project-post/project-thumbnail-dummy/thumbnail2.png';
import thumbnail3 from '../../../assets/project-post/project-thumbnail-dummy/thumbnail3.png';
import thumbnail4 from '../../../assets/project-post/project-thumbnail-dummy/thumbnail4.png';
import defaultProfile from '../../../assets/header/default_profile/default_profile_1.png';
import effectImg from '../../../assets/project-post/effect.png';

const DUMMY_THUMBNAILS = [thumbnail1, thumbnail2, thumbnail3, thumbnail4];

interface SimilarProjectCardProps {
  project: SimilarProjectItem;
}

export function SimilarProjectCard({ project }: SimilarProjectCardProps) {
  const navigate = useNavigate();

  const thumbnailSrc = project.thumbnailUrl || DUMMY_THUMBNAILS[project.projectId % 4];
  const profileImgSrc = project.leaderProfileImageUrl || defaultProfile;

  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  const startDate = formatDate(project.startAt);
  const endDate = formatDate(project.endAt);

  const positionNames = project.positions.map((pos) => pos.positionName);
  const isOnline = project.locationText === 'online';

  const handleCardClick = () => {
    navigate(`/project-post/${project.projectId}`);
  };

  return (
    <Card
      className="overflow-hidden cursor-pointer group p-0 font-pretendard transition-all duration-300 ease-out hover:-translate-y-1 flex-shrink-0 w-full max-w-[280px]"
      onClick={handleCardClick}
    >
      {/* 썸네일 헤더 */}
      <div className="relative rounded-t-lg overflow-hidden h-48">
        <img
          src={thumbnailSrc}
          alt={project.title}
          className="w-full h-full object-cover rounded-t-lg"
        />
        <img
          src={effectImg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover pointer-events-none rounded-t-lg"
        />

        {/* 대분류 키워드 - 왼쪽 위 */}
        <div className="absolute top-3 left-3">
          <span className="bg-black/50 backdrop-blur-sm text-white text-sm font-semibold px-3 py-1 rounded">
            {project.categoryName}
          </span>
        </div>

        {/* 금액 - 오른쪽 아래 */}
        <div className="absolute bottom-3 right-3">
          <span className="text-white text-xl font-bold">
            {project.totalBudget.toLocaleString()}원
          </span>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="px-2 pt-0 pb-2 space-y-3">
        {/* 소분류 키워드 */}
        {positionNames.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {positionNames.map((name, idx) => (
              <span key={idx} className="text-xs bg-moas-gray-2 text-moas-gray-7 px-2 py-1 rounded">
                {name}
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
          {startDate} ~ {endDate}
        </p>

        {/* 하단 정보 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-moas-gray-6">
            <span className="text-xs bg-moas-gray-1 px-2 py-1 rounded">
              {isOnline ? '온라인' : '오프라인'}
            </span>
            {!isOnline && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span className="text-xs">{project.locationText}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <img
              src={profileImgSrc}
              alt={project.leaderNickname}
              className="w-6 h-6 object-cover rounded-full"
            />
            <span className="text-xs text-moas-gray-7 font-medium">{project.leaderNickname}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

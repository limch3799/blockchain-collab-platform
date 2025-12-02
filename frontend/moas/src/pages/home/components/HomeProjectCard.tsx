// src/pages/Home/components/HomeProjectCard.tsx
import { MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { SimilarProjectItem } from '@/types/project';

// 이미지 import
import thumbnail1 from '../../../assets/project-post/project-thumbnail-dummy/thumbnail1.png';
import thumbnail2 from '../../../assets/project-post/project-thumbnail-dummy/thumbnail2.png';
import thumbnail3 from '../../../assets/project-post/project-thumbnail-dummy/thumbnail3.png';
import thumbnail4 from '../../../assets/project-post/project-thumbnail-dummy/thumbnail4.png';
import defaultProfile from '../../../assets/header/default_profile/default_profile_1.png';
import effectImg from '../../../assets/project-post/effect.png';

// 더미 썸네일 배열
const DUMMY_THUMBNAILS = [thumbnail1, thumbnail2, thumbnail3, thumbnail4];

interface HomeProjectCardProps {
  project: SimilarProjectItem;
}

export function HomeProjectCard({ project }: HomeProjectCardProps) {
  const navigate = useNavigate();

  const thumbnailSrc = project.thumbnailUrl || DUMMY_THUMBNAILS[project.projectId % 4];
  const profileImgSrc = project.leaderProfileImageUrl || defaultProfile;

  // ISO 8601 형식을 YYYY.MM.DD 형식으로 변환
  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  const startDate = formatDate(project.startAt);
  const endDate = formatDate(project.endAt);

  // positions 배열에서 모든 positionName 추출
  const positionNames = project.positions.map((pos) => pos.positionName);

  // 온라인/오프라인 판단
  const isOnline = project.locationText === 'online';

  // 지역 텍스트에서 마지막 띄어쓰기 이후 문자열만 추출
  const getShortLocation = (locationText: string): string => {
    const lastSpaceIndex = locationText.lastIndexOf(' ');
    return lastSpaceIndex !== -1 ? locationText.substring(lastSpaceIndex + 1) : locationText;
  };

  const shortLocation = !isOnline ? getShortLocation(project.locationText) : '';

  // 제목 15자 제한
  const truncateTitle = (title: string) => {
    return title.length > 20 ? title.slice(0, 20) + '...' : title;
  };

  const handleCardClick = () => {
    navigate(`/project-post/${project.projectId}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-xl overflow-hidden cursor-pointer group transition-all duration-300 ease-out hover:-translate-y-2 font-pretendard"
    >
      {/* 썸네일 */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={thumbnailSrc}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Effect 이미지 오버레이 */}
        <img
          src={effectImg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* 카테고리 배지 */}
        <div className="absolute top-3 left-3">
          <span className="bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full">
            {project.categoryName}
          </span>
        </div>

        {/* 금액 */}
        <div className="absolute bottom-3 right-3">
          <span className="text-white text-lg font-bold drop-shadow-lg">
            {project.totalBudget.toLocaleString()}원
          </span>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="p-0 pt-4 space-y-2">
        {/* 포지션 태그 */}
        {positionNames.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {positionNames.slice(0, 3).map((name, idx) => (
              <span
                key={idx}
                className="text-xs bg-moas-gray-2 text-moas-gray-7 px-2.5 py-1 rounded-full font-medium"
              >
                {name}
              </span>
            ))}
            {positionNames.length > 3 && (
              <span className="text-xs bg-moas-gray-2 text-moas-gray-7 px-2.5 py-1 rounded-full font-medium">
                +{positionNames.length - 3}
              </span>
            )}
          </div>
        )}

        {/* 제목 - 15자 제한 */}
        <h3 className="text-base font-bold text-moas-text group-hover:text-moas-main transition-colors">
          {truncateTitle(project.title)}
        </h3>

        {/* 기간 */}
        <p className="text-sm text-moas-gray-6">
          {startDate} ~ {endDate}
        </p>

        {/* 하단 정보 */}
        <div className="flex items-center justify-between pt-0 ">
          {/* 온라인/오프라인 & 위치 */}
          <div className="flex items-center gap-2">
            <span className="text-xs bg-moas-gray-1 text-moas-gray-7 px-2.5 py-1 rounded-full font-medium">
              {isOnline ? '온라인' : '오프라인'}
            </span>
            {!isOnline && (
              <div className="flex items-center gap-1 text-moas-gray-6">
                <MapPin className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">{shortLocation}</span>
              </div>
            )}
          </div>

          {/* 리더 정보 */}
          <div className="flex items-center gap-2">
            <img
              src={profileImgSrc}
              alt={project.leaderNickname}
              className="w-6 h-6 object-cover rounded-full border border-moas-gray-2"
            />
            <span className="text-xs text-moas-gray-7 font-medium">{project.leaderNickname}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// src/pages/project-post-detail/components/ProjectLeaderInfo.tsx
import { Star, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import defaultProfile from '@/assets/header/default_profile/default_profile_1.png';

interface Leader {
  id: number;
  profileImg: string;
  name: string;
  projectCount?: number; // optional로 변경
  rating: number;
  reviewCount?: number; // 추가
}

interface ProjectLeaderInfoProps {
  leader: Leader;
  onChat: () => void;
}

export function ProjectLeaderInfo({ leader, onChat }: ProjectLeaderInfoProps) {
  const navigate = useNavigate();

  const profileImgSrc = leader.profileImg || defaultProfile;

  const handleLeaderProfileClick = () => {
    navigate(`/profile/${leader.id}`);
  };

  return (
    <div className="bg-white rounded-lg border-1 border-moas-gray-2 p-6">
      <h2 className="text-xl font-bold text-moas-text mb-4">프로젝트 리더</h2>

      <div className="flex items-center gap-4 mb-4" onClick={handleLeaderProfileClick}>
        <img
          src={profileImgSrc}
          alt={leader.name}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div>
          <p className="text-lg font-semibold text-moas-text">{leader.name}</p>
          <div className="flex items-center gap-3 text-sm text-moas-gray-6">
            {leader.projectCount !== undefined && <span>프로젝트 {leader.projectCount}개</span>}
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{leader.rating.toFixed(1)}</span>
              {leader.reviewCount !== undefined && (
                <span className="text-moas-gray-5">({leader.reviewCount})</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onChat}
        className="w-full flex items-center justify-center gap-2 bg-moas-main text-white py-3 rounded-lg hover:bg-moas-main/90 transition-colors font-semibold"
      >
        <MessageCircle className="h-5 w-5" />
        채팅 문의하기
      </button>
    </div>
  );
}

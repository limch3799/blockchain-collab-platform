// src/pages/project-post-detail/components/ProjectPostApply.tsx
import { useState, useEffect } from 'react';
import { Calendar, Wallet, MapPin, Wifi, Building, Clock } from 'lucide-react';
import { ApplyCheckModal } from './ApplyCheckModal';

interface ProjectPosition {
  projectPositionId: number;
  positionId: number;
  categoryId: number;
  categoryName: string;
  positionName: string;
  budget: number;
}

interface ProjectPostApplyProps {
  project: {
    projectId: number;
    title: string;
    summary: string;
    description: string;
    thumbnailUrl: string | null;
    isOnline: boolean;
    province: string;
    district: string;
    startAt: string; // ISO 8601
    endAt: string; // ISO 8601
    applyDeadline: string; // ISO 8601
    positions: ProjectPosition[];
    totalBudget: number;
    viewCount: number;
    createdAt: string;
    updatedAt: string;
  };
}

export function ProjectPostApply({ project }: ProjectPostApplyProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 사용자 정보 확인
  useEffect(() => {
    const checkUserStatus = () => {
      const accessToken = localStorage.getItem('accessToken');
      const userInfoStr = localStorage.getItem('userInfo');

      if (!accessToken) {
        setIsLoggedIn(false);
        return;
      }

      setIsLoggedIn(true);

      if (userInfoStr) {
        try {
          const userInfo = JSON.parse(userInfoStr);
          setUserRole(userInfo.role);
        } catch (error) {
          console.error('사용자 정보 파싱 실패:', error);
          setUserRole(null);
        }
      }
    };

    checkUserStatus();
  }, []);

  const handleApplyClick = () => {
    // 로그인하지 않은 경우
    if (!isLoggedIn) {
      alert('로그인이 필요합니다.');
      return;
    }

    // 로그인은 했지만 리더인 경우 (버튼이 보이지 않아야 하지만 안전장치)
    if (userRole === 'LEADER') {
      alert('리더는 프로젝트에 지원할 수 없습니다');
      return;
    }

    // 정상적으로 모달 열기
    setIsModalOpen(true);
  };

  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}.${month}.${day} ${hours}:${minutes}`;
  };

  const startDate = formatDate(project.startAt);
  const endDate = formatDate(project.endAt);
  const applyDeadline = formatDate(project.applyDeadline);

  // 리더인 경우 버튼을 숨김
  const showApplyButton = userRole !== 'LEADER';

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6 sticky top-6">
        <h2 className="text-xl font-bold text-moas-text">프로젝트 정보</h2>

        {/* 프로젝트 기간 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-moas-gray-6">
            <Calendar className="h-5 w-5" />
            <span className="font-semibold">프로젝트 기간</span>
          </div>
          <div className="pl-7 text-moas-text flex items-center gap-1">
            <span>{startDate}</span>
            <span className="text-moas-gray-6">~</span>
            <span>{endDate}</span>
          </div>
        </div>

        {/* 지원 마감일 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-moas-gray-6">
            <Clock className="h-5 w-5" />
            <span className="font-semibold">지원 마감일</span>
          </div>
          <div className="pl-7 text-moas-text ">{applyDeadline}</div>
        </div>

        {/* 금액 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-moas-gray-6">
            <Wallet className="h-5 w-5" />
            <span className="font-semibold">총 예산</span>
          </div>
          <div className="pl-7 text-xl font-bold text-moas-text">
            {project.totalBudget.toLocaleString()}원
          </div>
        </div>

        {/* 온오프라인 여부 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-moas-gray-6">
            {project.isOnline ? <Wifi className="h-5 w-5" /> : <Building className="h-5 w-5" />}
            <span className="font-semibold">진행 방식</span>
          </div>
          <div className="pl-7">
            <span
              className={`inline-block px-3 py-1 rounded text-sm font-semibold ${
                project.isOnline ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
              }`}
            >
              {project.isOnline ? '온라인' : '오프라인'}
            </span>
          </div>
        </div>

        {/* 장소 (오프라인인 경우만) */}
        {!project.isOnline && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-moas-gray-6">
              <MapPin className="h-5 w-5" />
              <span className="font-semibold">장소</span>
            </div>
            <div className="pl-7 text-moas-text">
              {project.district || project.province || '미정'}
            </div>
          </div>
        )}

        {/* 지원하기 버튼 - 리더가 아닌 경우에만 표시 */}
        {showApplyButton && (
          <button
            onClick={handleApplyClick}
            className="w-full bg-moas-main font-bold text-base py-2 rounded-lg hover:bg-moas-main/90 transition-colors"
          >
            프로젝트 지원하기
          </button>
        )}
      </div>

      <ApplyCheckModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        project={project}
      />
    </>
  );
}

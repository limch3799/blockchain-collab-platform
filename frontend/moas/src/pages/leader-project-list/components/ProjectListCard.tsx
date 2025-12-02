/**
 * ProjectListCard Component
 *
 * Props:
 * - project (object): 프로젝트 정보
 * - onDelete (function): 삭제 버튼 클릭 콜백
 *
 * Description:
 * 리더의 프로젝트 목록에서 사용되는 카드 컴포넌트
 */

import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { ProjectItem } from '@/types/project';

import calendarIcon from '@/assets/icons/calendar.svg';
import edit from '@/assets/icons/edit.svg';
import mapPinIcon from '@/assets/icons/map-pin.svg';
import moneyBagIcon from '@/assets/icons/money-bag.svg';
import xCircle from '@/assets/icons/x-circle.svg';
import thumbnailImg from '@/assets/project-post/project-thumbnail-dummy/thumbnail2.png';

interface ProjectListCardProps {
  project: ProjectItem;
  onDelete: (id: number) => void;
  onCloseProject?: () => void;
  onEdit?: (id: number) => void;
}

const CATEGORY_STYLES: Record<string, string> = {
  '사진/영상/미디어': 'bg-moas-main text-white w-[118px]',
  '음악/공연': 'bg-moas-artist text-white w-[76px]',
  디자인: 'bg-moas-leader text-white w-[58px]',
};

export function ProjectListCard({ project, onDelete, onCloseProject, onEdit }: ProjectListCardProps) {
  const navigate = useNavigate();

  const getCategoryStyle = (category: string) => {
    return CATEGORY_STYLES[category] || '';
  };

  // 모집 상태 (isClosed 사용)
  const status = project.isClosed ? 'closed' : 'recruiting';

  // 카테고리 추출 (중복 제거)
  const uniqueCategories = Array.from(
    new Set(project.positions.map((pos) => pos.categoryName))
  );

  // 날짜 포맷팅 (Unix timestamp를 날짜로 변환)
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000); // Unix timestamp는 초 단위이므로 1000을 곱함
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).replace(/\. /g, '.').replace(/\.$/, '');
  };

  const dateRange = `${formatDate(project.startAt)} - ${formatDate(project.endAt)}`;
  const location = project.province && project.district
    ? `${project.province} ${project.district}`
    : '온라인';

  // 총 예산 포맷팅
  const formatBudget = (budget: number) => {
    return budget.toLocaleString('ko-KR') + '원';
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(project.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(project.id);
  };

  const handleViewApplicants = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/applicant-list?projectId=${project.id}`);
  };

  const handleCloseProject = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCloseProject) {
      onCloseProject();
    }
  };

  const handleCardClick = () => {
    navigate(`/project-post/${project.id}`);
  };

  return (
    <Card
      className="group cursor-pointer overflow-hidden bg-moas-gray-1 p-4 transition-all duration-300 ease-out hover:-translate-y-1"
      onClick={handleCardClick}
    >
      <div className="flex gap-4">
        {/* 썸네일 */}
        <div className="relative shrink-0">
          <img
            src={project.thumbnailUrl || thumbnailImg}
            alt={project.title}
            className="h-52 w-[288px] rounded-2xl object-cover"
          />
          {/* 마감된 공고 오버레이 */}
          {status === 'closed' && (
            <div className="absolute inset-0 h-52 w-[288px] flex items-center justify-center rounded-2xl bg-black/80">
              <span className="font-pretendard text-[32px] font-bold text-white">모집 마감</span>
            </div>
          )}
        </div>

        {/* 프로젝트 정보 */}
        <div className="flex flex-1 flex-col justify-between">
          <div className="flex flex-1 justify-between">
            {/* 좌측: 프로젝트 정보 */}
            <div className="flex flex-col justify-between">
              {/* 상단 정보 */}
              <div>
                {/* 카테고리 뱃지 */}
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {uniqueCategories.map((category) => (
                    <Badge
                      key={category}
                      className={`h-[22px] rounded-[20px] px-2.5 font-pretendard text-xs font-medium ${getCategoryStyle(category)}`}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>

                {/* 프로젝트명 */}
                <h3 className="mb-2 font-pretendard text-xl font-bold leading-tight text-moas-black transition-colors group-hover:text-moas-main">
                  {project.title}
                </h3>

                {/* 프로젝트 요약 */}
                <p className="mb-3 font-pretendard text-sm font-normal leading-snug text-moas-gray-8">
                  {project.summary}
                </p>

                {/* 날짜/지역/예산 정보 */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <img src={calendarIcon} alt="날짜" className="size-4" />
                    <span className="font-pretendard text-xs font-normal text-moas-text">
                      {dateRange}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <img src={mapPinIcon} alt="지역" className="size-4" />
                    <span className="font-pretendard text-xs font-normal text-moas-text">
                      {location}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <img src={moneyBagIcon} alt="예산" className="size-4" />
                    <span className="font-pretendard text-xs font-normal text-moas-text">
                      {formatBudget(project.totalBudget)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 우측: 수정/삭제 아이콘 */}
            <div className="flex items-start gap-2">
              {status === 'recruiting' && (
                <button
                  onClick={handleEdit}
                  className="flex size-5 items-center justify-center transition-transform hover:scale-110"
                >
                  <img src={edit} alt="수정하기" className="size-5" />
                </button>
              )}
              <button
                onClick={handleDelete}
                className="flex size-5 items-center justify-center transition-transform hover:scale-110"
              >
                <img src={xCircle} alt="삭제하기" className="size-5" />
              </button>
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="mt-4 flex gap-2">

            {status === 'recruiting' && (
              <Button
                onClick={handleCloseProject}
                className="h-9 flex-1 rounded-lg bg-white font-pretendard text-sm font-bold text-moas-black hover:bg-moas-gray-1"
              >
                공고 마감하기
              </Button>
            )}
            <Button
              onClick={handleViewApplicants}
              className="h-9 flex-1 rounded-lg bg-moas-main font-pretendard text-sm font-bold text-moas-black hover:bg-moas-main/90"
            >
              지원서 보기
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

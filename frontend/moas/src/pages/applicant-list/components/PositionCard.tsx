/**
 * PositionCard Component
 *
 * Props:
 * - position (object): 포지션 정보
 * - isExpanded (boolean): 확장 여부
 * - onToggle (function): 토글 핸들러
 * - children (ReactNode): 지원자 리스트
 *
 * Description:
 * 포지션별 지원자 목록을 표시하는 확장 가능한 카드 컴포넌트
 */

import { useState, type ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { ConfirmModal } from '@/components/common/ConfirmModal';

interface Position {
  id: number;
  category: string;
  position: string;
  status: 'recruiting' | 'closed';
  recruitCount: string;
  applicants: unknown[];
}

interface PositionCardProps {
  position: Position;
  isExpanded: boolean;
  onToggle: () => void;
  onCloseRecruit?: (positionId: number) => void;
  children?: ReactNode;
}

export function PositionCard({
  position,
  isExpanded,
  onToggle,
  onCloseRecruit,
  children,
}: PositionCardProps) {
  const [showCloseModal, setShowCloseModal] = useState(false);

  const handleCloseRecruitClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 확장/축소 방지
    setShowCloseModal(true);
  };

  const handleCloseRecruitConfirm = () => {
    if (onCloseRecruit) {
      onCloseRecruit(position.id);
    }
    setShowCloseModal(false);
  };

  const handleCloseRecruitCancel = () => {
    setShowCloseModal(false);
  };

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-moas-gray-2 bg-white">
      {/* 포지션 헤더 */}
      <div className="flex w-full items-center justify-between px-8 py-6 transition-colors hover:bg-moas-gray-1">
        <button onClick={onToggle} className="flex flex-1 items-center gap-4">
          <h3 className="text-[24px] font-bold text-moas-text">
            {position.category} - {position.position}
          </h3>
          <Badge
            className={`h-8 rounded-full px-3 font-medium text-base ${
              position.status === 'recruiting'
                ? 'bg-moas-leader text-white'
                : 'bg-moas-gray-3 text-moas-gray-7'
            }`}
          >
            {position.status === 'recruiting' ? '모집중' : '모집 마감'}
          </Badge>
          <span className="text-[16px] font-medium text-moas-gray-6">
            지원자 {position.applicants.length}명
          </span>
        </button>

        <div className="flex items-center gap-3">
          {/* 모집 마감 버튼 */}
          {position.status === 'recruiting' && (
            <button
              onClick={handleCloseRecruitClick}
              className="h-10 rounded-lg border-2 border-moas-gray-2 bg-white px-4 text-[14px] font-bold text-moas-text transition-colors hover:bg-moas-gray-1"
            >
              모집 마감하기
            </button>
          )}

          <button
            onClick={onToggle}
            className="flex items-center justify-center"
            aria-label={isExpanded ? '접기' : '펼치기'}
          >
            {isExpanded ? (
              <ChevronUp className="h-6 w-6 text-moas-gray-6" />
            ) : (
              <ChevronDown className="h-6 w-6 text-moas-gray-6" />
            )}
          </button>
        </div>
      </div>

      {/* 지원자 리스트 */}
      {isExpanded && (
        <div className="border-t-2 border-moas-gray-2 bg-moas-gray-1 px-8 py-6">
          {position.applicants.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">{children}</div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <p className="text-base font-medium text-moas-gray-6">
                해당하는 아티스트가 없습니다.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 모집 마감 확인 모달 */}
      {showCloseModal && (
        <ConfirmModal
          title="모집 마감"
          message={`${position.position} 포지션의 모집을 마감하시겠습니까?`}
          confirmText="예"
          cancelText="아니오"
          type="warning"
          onConfirm={handleCloseRecruitConfirm}
          onCancel={handleCloseRecruitCancel}
        />
      )}
    </div>
  );
}

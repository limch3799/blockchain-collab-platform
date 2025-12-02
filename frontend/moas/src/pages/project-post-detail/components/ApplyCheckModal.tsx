// src/pages/project-post-detail/components/ApplyCheckModal.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { getMyApplicationsForCheck } from '@/api/apply';

interface ProjectPosition {
  projectPositionId: number;
  positionId: number;
  categoryId: number;
  categoryName: string;
  positionName: string;
  budget: number;
  isClosed?: boolean;
}

interface ApplyCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: {
    projectId: number;
    title: string;
    positions: ProjectPosition[];
  };
}

export function ApplyCheckModal({ isOpen, onClose, project }: ApplyCheckModalProps) {
  const navigate = useNavigate();
  const [selectedPosition, setSelectedPosition] = useState<ProjectPosition | null>(null);
  const [appliedPositionIds, setAppliedPositionIds] = useState<Set<number>>(new Set());
  const [isLoadingApplications, setIsLoadingApplications] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAllApplications();
    }
  }, [isOpen]);

  const fetchAllApplications = async () => {
    try {
      setIsLoadingApplications(true);
      const appliedIds = new Set<number>();
      let page = 0;
      const size = 10;
      let hasMore = true;

      while (hasMore) {
        const response = await getMyApplicationsForCheck({ page, size });

        // 현재 페이지의 지원 내역에서 projectPositionId 수집
        response.applications.forEach((app) => {
          appliedIds.add(app.projectPositionId);
        });

        // 다음 페이지가 있는지 확인
        const { totalPages } = response.pageInfo;
        page += 1;
        hasMore = page < totalPages;
      }

      setAppliedPositionIds(appliedIds);
    } catch (error) {
      console.error('지원 내역 조회 실패:', error);
    } finally {
      setIsLoadingApplications(false);
    }
  };

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (
      selectedPosition &&
      !selectedPosition.isClosed &&
      !appliedPositionIds.has(selectedPosition.projectPositionId)
    ) {
      console.log('Selected position:', selectedPosition);
      console.log('Position ID (for category mapping):', selectedPosition.positionId);
      console.log('Project Position ID (for API):', selectedPosition.projectPositionId);

      navigate('/project-apply', {
        state: {
          projectId: project.projectId,
          projectTitle: project.title,
          position: selectedPosition.positionName,
          positionId: selectedPosition.positionId,
          projectPositionId: selectedPosition.projectPositionId,
          budget: selectedPosition.budget,
        },
      });
    }
  };

  const isPositionDisabled = (position: ProjectPosition) => {
    return position.isClosed || appliedPositionIds.has(position.projectPositionId);
  };

  const getPositionLabel = (position: ProjectPosition) => {
    if (position.isClosed) return '모집마감';
    if (appliedPositionIds.has(position.projectPositionId)) return '지원완료';
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6 space-y-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-moas-gray-6 hover:text-moas-text transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Title */}
        <h2 className="text-xl font-bold text-moas-text">프로젝트 지원</h2>

        {/* Project Name */}
        <div className="space-y-1">
          <p className="text-sm font-semibold text-moas-gray-6">프로젝트 명</p>
          <p className="text-moas-text break-words">{project.title}</p>
        </div>

        {/* Message */}
        <p className="text-moas-text">이 프로젝트에 지원하시겠습니까?</p>

        {/* Position Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-moas-gray-6">지원 포지션 선택</label>

          {isLoadingApplications ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-moas-main"></div>
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
              {project.positions.length > 0 ? (
                project.positions.map((position) => {
                  const disabled = isPositionDisabled(position);
                  const label = getPositionLabel(position);

                  return (
                    <button
                      key={position.projectPositionId}
                      onClick={() => !disabled && setSelectedPosition(position)}
                      disabled={disabled}
                      className={`w-full px-4 py-3 rounded-lg border-2 font-semibold transition-all text-left ${
                        disabled
                          ? 'border-moas-gray-3 bg-moas-gray-1 cursor-not-allowed opacity-60'
                          : selectedPosition?.projectPositionId === position.projectPositionId
                            ? 'border-moas-main bg-moas-main/10 text-moas-main'
                            : 'border-moas-gray-3 text-moas-gray-6 hover:border-moas-gray-4'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span>{position.positionName}</span>
                          {label && (
                            <span className="px-2 py-1 bg-moas-gray-7 text-white text-xs font-medium rounded">
                              {label}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-moas-gray-6">
                          {position.budget.toLocaleString()}원
                        </span>
                      </div>
                    </button>
                  );
                })
              ) : (
                <p className="text-sm text-moas-gray-6 text-center py-4">
                  지원 가능한 포지션이 없습니다.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-moas-gray-3 text-moas-gray-6 rounded-lg hover:bg-moas-gray-1 transition-colors font-semibold"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedPosition || isPositionDisabled(selectedPosition)}
            className="flex-1 px-4 py-2 bg-moas-main text-white rounded-lg hover:bg-moas-main/90 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

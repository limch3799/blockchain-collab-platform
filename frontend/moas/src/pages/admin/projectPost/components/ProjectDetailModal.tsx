// src/pages/admin/projectPost/components/ProjectDetailModal.tsx
import { useState, useEffect } from 'react';
import { X, Trash2, Loader2 } from 'lucide-react';
import { getProjectDetail, deleteProject, type ProjectDetail } from '@/api/admin/project';
import { MarkdownViewer } from '@/components/ui/MarkdownViewer';

interface ProjectDetailModalProps {
  projectId: number;
  onClose: () => void;
  onUpdate: () => void;
}

export const ProjectDetailModal = ({ projectId, onClose, onUpdate }: ProjectDetailModalProps) => {
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProjectDetail();
  }, [projectId]);

  const fetchProjectDetail = async () => {
    try {
      setIsLoading(true);
      const response = await getProjectDetail(projectId);
      setProject(response.projectDetail);
    } catch (error) {
      console.error('프로젝트 상세 조회 실패:', error);
      alert('프로젝트 상세 정보를 불러오는데 실패했습니다.');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('정말로 이 프로젝트를 삭제하시겠습니까?')) return;

    try {
      await deleteProject(projectId);
      alert('프로젝트가 삭제되었습니다.');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('프로젝트 삭제 실패:', error);
      alert('프로젝트 삭제에 실패했습니다.');
    }
  };

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return '-';
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 font-pretendard">
        <div className="bg-white rounded-2xl p-8">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
        </div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 font-pretendard">
      <div className="bg-white rounded-2xl w-[900px] max-h-[90vh] flex flex-col shadow-xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">프로젝트 상세</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 font-medium"
            >
              <Trash2 className="w-4 h-4" />
              프로젝트 삭제
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* 내용 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* 기본 정보 */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  프로젝트 ID
                </label>
                <p className="text-gray-900">{project.projectId || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">조회수</label>
                <p className="text-gray-900">{(project.viewCount || 0).toLocaleString()}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">제목</label>
              <p className="text-gray-900">{project.title || '-'}</p>
            </div>

            {project.summary && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">요약</label>
                <p className="text-gray-900">{project.summary}</p>
              </div>
            )}

            {project.description && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">상세 설명</label>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <MarkdownViewer content={project.description} />
                </div>
              </div>
            )}

            {/* 썸네일 */}
            {project.thumbnailUrl && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">썸네일</label>
                <img
                  src={project.thumbnailUrl}
                  alt="프로젝트 썸네일"
                  className="w-full max-w-md rounded-lg border border-gray-200"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* 위치 정보 */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">진행 방식</label>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    project.isOnline ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                  }`}
                >
                  {project.isOnline ? '온라인' : '오프라인'}
                </span>
              </div>
              {!project.isOnline && (project.province || project.district) && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">지역</label>
                  <p className="text-gray-900">
                    {[project.province, project.district].filter(Boolean).join(' ') || '-'}
                  </p>
                </div>
              )}
            </div>

            {/* 포지션 정보 */}
            {project.positions && project.positions.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  모집 포지션
                </label>
                <div className="space-y-2">
                  {project.positions.map((position) => (
                    <div
                      key={position.projectPositionId}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">카테고리</p>
                          <p className="text-sm font-medium text-gray-900">
                            {position.categoryName || '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">포지션</p>
                          <p className="text-sm font-medium text-gray-900">
                            {position.positionName || '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">예산</p>
                          <p className="text-sm font-medium text-gray-900">
                            {(position.budget || 0).toLocaleString()}원
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 일정 정보 */}
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  지원 마감일
                </label>
                <p className="text-sm text-gray-900">{formatDateTime(project.applyDeadline)}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">시작일</label>
                <p className="text-sm text-gray-900">{formatDateTime(project.startAt)}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">종료일</label>
                <p className="text-sm text-gray-900">{formatDateTime(project.endAt)}</p>
              </div>
            </div>

            {/* 리더 정보 */}
            {project.leader && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <label className="block text-sm font-semibold text-gray-700 mb-3">리더 정보</label>
                <div className="flex items-center gap-4">
                  <img
                    src={project.leader.profileImageUrl || '/default-profile.png'}
                    alt={project.leader.nickname || '리더'}
                    className="w-16 h-16 rounded-full object-cover border-2 border-white shadow"
                    onError={(e) => {
                      e.currentTarget.src = '/default-profile.png';
                    }}
                  />
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">
                      {project.leader.nickname || '-'}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      평점: {(project.leader.averageRating || 0).toFixed(1)} (
                      {project.leader.reviewCount || 0}개 리뷰)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 생성/수정 정보 */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">생성일</label>
                <p className="text-sm text-gray-900">{formatDateTime(project.createdAt)}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">수정일</label>
                <p className="text-sm text-gray-900">{formatDateTime(project.updatedAt)}</p>
              </div>
            </div>

            {/* 마감 상태 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">모집 상태</label>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  project.isClosed ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}
              >
                {project.isClosed ? '마감' : '모집중'}
              </span>
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

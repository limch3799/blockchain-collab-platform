// src/pages/admin/projectPost/components/ArtistApplicationModal.tsx
import { X } from 'lucide-react';
import type { ArtistApplication } from '@/api/admin/project';

interface ArtistApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: ArtistApplication | null;
}

export const ArtistApplicationModal = ({
  isOpen,
  onClose,
  application,
}: ArtistApplicationModalProps) => {
  if (!isOpen || !application) return null;

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      PENDING: { label: '대기중', className: 'bg-yellow-100 text-yellow-700' },
      OFFERED: { label: '제안됨', className: 'bg-blue-100 text-blue-700' },
      REJECTED: { label: '거절됨', className: 'bg-red-100 text-red-700' },
      COMPLETED: { label: '완료', className: 'bg-green-100 text-green-700' },
    };

    const statusInfo = statusMap[status] || {
      label: status,
      className: 'bg-gray-100 text-gray-700',
    };

    return (
      <span
        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusInfo.className}`}
      >
        {statusInfo.label}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 font-pretendard">
      <div className="bg-white rounded-2xl w-[700px] max-h-[90vh] flex flex-col shadow-xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">지원 상세</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 내용 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* 기본 정보 */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">지원 ID</label>
                <p className="text-gray-900">{application.applicationId}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  프로젝트 ID
                </label>
                <p className="text-gray-900">{application.projectId}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                프로젝트 제목
              </label>
              <p className="text-gray-900 font-medium">{application.projectTitle}</p>
            </div>

            {/* 회원 정보 */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">회원 ID</label>
                <p className="text-gray-900">{application.memberId}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  회원 닉네임
                </label>
                <p className="text-gray-900">{application.memberNickname}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                포트폴리오 ID
              </label>
              <p className="text-gray-900">{application.portfolioId}</p>
            </div>

            {/* 지원 메시지 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">지원 메시지</label>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-900 whitespace-pre-wrap">{application.message}</p>
              </div>
            </div>

            {/* 상태 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">상태</label>
              {getStatusBadge(application.status)}
            </div>

            {/* 날짜 정보 */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">지원일</label>
                <p className="text-gray-900">{formatDateTime(application.createdAt)}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">수정일</label>
                <p className="text-gray-900">{formatDateTime(application.updatedAt)}</p>
              </div>
            </div>

            {application.deletedAt && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">취소일</label>
                <p className="text-red-600">{formatDateTime(application.deletedAt)}</p>
              </div>
            )}
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

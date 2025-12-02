// src/pages/project-post/components/BookmarkModal.tsx
import { X } from 'lucide-react';

interface BookmarkModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  type: 'add' | 'remove';
}

export default function BookmarkConfirmationModal({
  isOpen,
  onConfirm,
  onCancel,
  type,
}: BookmarkModalProps) {
  if (!isOpen) return null;

  const title = type === 'add' ? '북마크 등록' : '북마크 해제';
  const message =
    type === 'add'
      ? '이 프로젝트를 북마크에 추가하시겠습니까?'
      : '이 프로젝트를 북마크에서 제거하시겠습니까?';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 font-pretendard">
      <div className="bg-white rounded-2xl w-[400px] flex flex-col shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-moas-gray-3">
          <h2 className="text-xl font-semibold text-moas-text">{title}</h2>
          <button
            onClick={onCancel}
            className="text-moas-gray-6 hover:text-moas-text transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-moas-text text-center">{message}</p>
        </div>

        <div className="p-6 border-t border-moas-gray-3 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 rounded-lg border border-moas-gray-3 text-moas-gray-7 font-medium hover:bg-moas-gray-1 transition-colors"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 rounded-lg bg-moas-main text-white font-medium hover:opacity-90 transition-opacity"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

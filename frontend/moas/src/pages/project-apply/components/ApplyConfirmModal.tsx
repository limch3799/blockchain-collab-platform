// src/pages/project-apply/components/ApplyConfirmModal.tsx
import { X } from 'lucide-react';

interface ApplyConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ApplyConfirmModal({ isOpen, onClose, onConfirm }: ApplyConfirmModalProps) {
  if (!isOpen) return null;

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

        {/* Message */}
        <p className="text-moas-text">정말 지원하시겠습니까?</p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-moas-gray-3 text-moas-gray-6 rounded-lg hover:bg-moas-gray-1 transition-colors font-semibold"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-moas-main text-white rounded-lg hover:bg-moas-main/90 transition-colors font-semibold"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

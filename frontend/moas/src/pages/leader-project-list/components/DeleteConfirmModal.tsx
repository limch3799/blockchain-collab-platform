/**
 * DeleteConfirmModal Component
 *
 * Props:
 * - isOpen (boolean): 모달 열림 상태
 * - onConfirm (function): 삭제 확인 콜백
 * - onCancel (function): 삭제 취소 콜백
 *
 * Description:
 * 공고 삭제 확인 모달 컴포넌트
 */

import { Button } from '@/components/ui/button';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({ isOpen, onConfirm, onCancel }: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[400px] rounded-lg bg-white p-6">
        <h3 className="mb-4 font-pretendard text-lg font-bold text-moas-black">
          공고를 삭제하시겠습니까?
        </h3>
        <div className="flex gap-3">
          <Button
            onClick={onConfirm}
            className="h-10 flex-1 rounded-lg bg-moas-main font-pretendard text-sm font-bold text-moas-black hover:bg-moas-main/90"
          >
            네
          </Button>
          <Button
            onClick={onCancel}
            className="h-10 flex-1 rounded-lg bg-moas-gray-2 font-pretendard text-sm font-bold text-moas-black hover:bg-moas-gray-3"
          >
            아니오
          </Button>
        </div>
      </div>
    </div>
  );
}

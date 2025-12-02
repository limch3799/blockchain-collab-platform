// src/pages/admin/settlement/components/FeeChangeModal.tsx
interface FeeChangeModalProps {
  feeRate: number;
  startAt: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const FeeChangeModal = ({ feeRate, startAt, onConfirm, onCancel }: FeeChangeModalProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-gray-800 mb-4">수수료 변경 확인</h3>
        <p className="text-gray-600 mb-4">수수료를 변경하시겠습니까?</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-semibold text-gray-700">변경 수수료:</span>
            <span className="text-sm font-bold text-blue-600">{feeRate}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-semibold text-gray-700">시작 일자:</span>
            <span className="text-sm font-semibold text-gray-800">{formatDate(startAt)}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            변경
          </button>
        </div>
      </div>
    </div>
  );
};

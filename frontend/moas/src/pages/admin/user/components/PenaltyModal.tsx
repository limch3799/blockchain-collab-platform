// src/pages/admin/user/components/PenaltyModal.tsx
import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { updateMemberPenalty } from '@/api/admin/member';

interface PenaltyModalProps {
  memberId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const PenaltyModal = ({ memberId, onClose, onSuccess }: PenaltyModalProps) => {
  const [penaltyScore, setPenaltyScore] = useState<string>('');
  const [reason, setReason] = useState('');
  const [contractId, setContractId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const score = parseInt(penaltyScore);

    if (isNaN(score)) {
      setError('페널티 점수를 올바르게 입력해주세요.');
      return;
    }

    if (!reason.trim()) {
      setError('페널티 사유를 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await updateMemberPenalty(memberId, {
        penaltyScore: score,
        reason: reason.trim(),
        ...(contractId && { contractId: parseInt(contractId) }),
      });

      onSuccess();
    } catch (err) {
      setError('페널티 등록에 실패했습니다.');
      console.error('페널티 등록 실패:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">페널티 등록</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 내용 */}
        <div className="p-6 space-y-4">
          {/* 페널티 점수 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              페널티 점수 <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={penaltyScore}
              onChange={(e) => setPenaltyScore(e.target.value)}
              placeholder="양수는 증가, 음수는 감소 (예: 5 또는 -5)"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">양수는 증가, 음수는 감소를 의미합니다</p>
          </div>

          {/* 사유 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              사유 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="페널티 사유를 입력하세요"
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none resize-none"
            />
          </div>

          {/* 계약 ID */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              계약 ID <span className="text-gray-500">(선택)</span>
            </label>
            <input
              type="number"
              value={contractId}
              onChange={(e) => setContractId(e.target.value)}
              placeholder="관련 계약 ID (선택사항)"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
            />
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* 버튼 */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                등록 중...
              </>
            ) : (
              '등록'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

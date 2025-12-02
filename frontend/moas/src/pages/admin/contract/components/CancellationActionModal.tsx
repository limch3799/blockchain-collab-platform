// src/pages/admin/contract/components/CancellationActionModal.tsx
import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { approveCancellation, rejectCancellation } from '@/api/admin/contract';

interface CancellationActionModalProps {
  contractId: number;
  action: 'approve' | 'reject';
  onClose: () => void;
  onSuccess: () => void;
}

export const CancellationActionModal = ({
  contractId,
  action,
  onClose,
  onSuccess,
}: CancellationActionModalProps) => {
  const [adminMemo, setAdminMemo] = useState('');
  const [artistWorkingRatio, setArtistWorkingRatio] = useState<string>('0');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!adminMemo.trim()) {
      setError('관리자 메모를 입력해주세요.');
      return;
    }

    if (action === 'approve') {
      const ratio = parseInt(artistWorkingRatio);
      if (isNaN(ratio) || ratio < 0 || ratio > 100) {
        setError('작업 진행률은 0~100 사이의 숫자여야 합니다.');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      setError(null);

      if (action === 'approve') {
        await approveCancellation(contractId, {
          adminMemo: adminMemo.trim(),
          artistWorkingRatio: parseInt(artistWorkingRatio),
        });
      } else {
        await rejectCancellation(contractId, {
          adminMemo: adminMemo.trim(),
        });
      }

      onSuccess();
    } catch (err) {
      setError(action === 'approve' ? '취소 승인에 실패했습니다.' : '취소 반려에 실패했습니다.');
      console.error('취소 요청 처리 실패:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">
            {action === 'approve' ? '취소 요청 승인' : '취소 요청 반려'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 내용 */}
        <div className="p-6 space-y-4">
          {/* 관리자 메모 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              관리자 메모 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={adminMemo}
              onChange={(e) => setAdminMemo(e.target.value)}
              placeholder={
                action === 'approve' ? '승인 사유를 입력하세요' : '반려 사유를 입력하세요'
              }
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none resize-none"
            />
          </div>

          {/* 아티스트 작업 진행률 (승인시에만) */}
          {action === 'approve' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                아티스트 작업 진행률 (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={artistWorkingRatio}
                onChange={(e) => setArtistWorkingRatio(e.target.value)}
                placeholder="0~100 사이의 숫자 입력"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                작업 진행률에 따라 환불 금액이 자동 계산됩니다.
                <br />
                0% = 전액 환불, 100% = 환불 불가
              </p>
            </div>
          )}

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
            className={`px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
              action === 'approve' ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                처리 중...
              </>
            ) : action === 'approve' ? (
              '승인'
            ) : (
              '반려'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

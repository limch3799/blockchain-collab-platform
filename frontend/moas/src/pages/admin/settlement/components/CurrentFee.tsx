// src/pages/admin/settlement/components/CurrentFee.tsx
import type { FeePolicy } from '@/api/admin/settlement';

interface CurrentFeeProps {
  policy: FeePolicy | null;
}

export const CurrentFee = ({ policy }: CurrentFeeProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  if (!policy) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">현재 수수료</h2>
        <p className="text-gray-500">수수료 정보를 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">현재 수수료</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500 mb-1">수수료율</p>
          <p className="text-3xl font-bold text-blue-600">{policy.feeRate}%</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">적용 시작일</p>
          <p className="text-xl font-semibold text-gray-800">{formatDate(policy.startAt)}</p>
        </div>
      </div>
    </div>
  );
};

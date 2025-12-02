// src/pages/admin/settlement/components/FeeHistory.tsx
import type { FeePolicy } from '@/api/admin/settlement';

interface FeeHistoryProps {
  policies: FeePolicy[];
}

export const FeeHistory = ({ policies }: FeeHistoryProps) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '현재';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">수수료 변경 내역</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">정책 ID</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">수수료율</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                적용 시작일
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                적용 종료일
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                변경 관리자
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {policies.map((policy) => (
              <tr key={policy.policyId} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-700">{policy.policyId}</td>
                <td className="px-4 py-3 text-sm font-semibold text-blue-600">{policy.feeRate}%</td>
                <td className="px-4 py-3 text-sm text-gray-700">{formatDate(policy.startAt)}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{formatDate(policy.endAt)}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{policy.adminName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

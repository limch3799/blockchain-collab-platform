// src/pages/admin/user/components/PenaltyList.tsx
import type { PenaltyItem } from '@/api/admin/member';

interface PenaltyListProps {
  penalties: PenaltyItem[];
}

export const PenaltyList = ({ penalties }: PenaltyListProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (penalties.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">페널티 이력이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b-2 border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">ID</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">계약 ID</th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-800">점수</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">처리자</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">등록일</th>
          </tr>
        </thead>
        <tbody>
          {penalties.map((penalty) => (
            <tr key={penalty.id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-4 py-3 text-sm text-gray-700">{penalty.id}</td>
              <td className="px-4 py-3 text-sm text-gray-700">
                {penalty.contractId || (
                  <span className="text-gray-500 italic">계약 ID 정보 없음</span>
                )}
              </td>
              <td className="px-4 py-3 text-center">
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    penalty.penaltyScore > 0
                      ? 'bg-red-100 text-red-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {penalty.penaltyScore > 0 ? '+' : ''}
                  {penalty.penaltyScore}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-700">관리자 #{penalty.changedBy}</td>
              <td className="px-4 py-3 text-sm text-gray-700">{formatDate(penalty.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// src/pages/admin/contract/components/ContractLogList.tsx
import type { ContractLog } from '@/api/admin/contract';

interface ContractLogListProps {
  logs: ContractLog[];
}

export const ContractLogList = ({ logs }: ContractLogListProps) => {
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

  const parseDetails = (details: string) => {
    try {
      return JSON.parse(details);
    } catch {
      return {};
    }
  };

  if (logs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">계약 변경 이력이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => {
        const details = parseDetails(log.details);

        return (
          <div key={log.logId} className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-semibold text-gray-800">{log.actionType}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {log.actorNickname} (ID: {log.actorMemberId})
                </p>
              </div>
              <span className="text-xs text-gray-500">{formatDate(log.createdAt)}</span>
            </div>

            {Object.keys(details).length > 0 && (
              <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                <p className="text-xs font-semibold text-gray-700 mb-2">상세 정보</p>
                <div className="space-y-1">
                  {Object.entries(details).map(([key, value]) => (
                    <div key={key} className="flex items-start gap-2">
                      <span className="text-xs text-gray-600 min-w-[120px]">{key}:</span>
                      <span className="text-xs text-gray-800 font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

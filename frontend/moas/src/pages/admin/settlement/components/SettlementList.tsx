// src/pages/admin/settlement/components/SettlementList.tsx
interface Settlement {
  id: number;
  amount: number;
  date: string;
  contractId: number;
  leaderProfile: {
    id: number;
    nickname: string;
    profileUrl: string | null;
  };
  artistProfile: {
    id: number;
    nickname: string;
    profileUrl: string | null;
  };
}

interface SettlementListProps {
  settlements: Settlement[];
}

export const SettlementList = ({ settlements }: SettlementListProps) => {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">정산 ID</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">금액</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">정산 날짜</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">리더</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">아티스트</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">계약 ID</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {settlements.map((settlement) => (
            <tr key={settlement.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm text-gray-700">{settlement.id}</td>
              <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                {formatAmount(settlement.amount)}원
              </td>
              <td className="px-4 py-3 text-sm text-gray-700">{formatDate(settlement.date)}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {settlement.leaderProfile.profileUrl ? (
                    <img
                      src={settlement.leaderProfile.profileUrl}
                      alt={settlement.leaderProfile.nickname}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-xs text-blue-600">L</span>
                    </div>
                  )}
                  <span className="text-sm text-gray-700">{settlement.leaderProfile.nickname}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {settlement.artistProfile.profileUrl ? (
                    <img
                      src={settlement.artistProfile.profileUrl}
                      alt={settlement.artistProfile.nickname}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <span className="text-xs text-purple-600">A</span>
                    </div>
                  )}
                  <span className="text-sm text-gray-700">{settlement.artistProfile.nickname}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-700">{settlement.contractId}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

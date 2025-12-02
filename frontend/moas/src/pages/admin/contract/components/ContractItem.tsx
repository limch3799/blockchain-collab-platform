// src/pages/admin/contract/components/ContractItem.tsx
import type { ContractListItem } from '@/api/admin/contract';
import { CONTRACT_STATUS_MAP, CONTRACT_STATUS_COLORS } from '../contract';

interface ContractItemProps {
  contract: ContractListItem & { leaderProfileUrl?: string; artistProfileUrl?: string };
  index: number;
  onClick: () => void;
}

export const ContractItem = ({ contract, index, onClick }: ContractItemProps) => {
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`;
  };

  const formatDateOnly = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}.${month}.${day}`;
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  // 상태에 따른 텍스트 크기 결정
  const getTextSize = (status: string) => {
    return status === 'ARTIST_SIGNED' || status === 'DECLINED' ? 'text-[0.6rem]' : 'text-xs';
  };

  return (
    <>
      {/* 계약 정보 행 */}
      <tr onClick={onClick} className="hover:bg-gray-50 cursor-pointer transition-colors">
        {/* 인덱스 */}
        <td className="px-4 py-4 text-center">
          <div className="inline-flex items-center justify-center w-8 h-8  text-black text-lg font-semibold rounded">
            {index}
          </div>
        </td>
        <td className="px-4 py-4 text-sm text-gray-700">{contract.contractId}</td>
        <td className="px-4 py-4">
          <p className="text-sm font-semibold text-gray-800">{contract.title}</p>
          <p className="text-xs text-gray-500 mt-1 whitespace-nowrap">
            생성일: {formatDateTime(contract.createdAt)}
          </p>
        </td>
        <td className="px-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {contract.leaderProfileUrl ? (
                <img
                  src={contract.leaderProfileUrl}
                  alt={contract.leader.nickname}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-xs text-blue-600">L</span>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500">리더</p>
                <p className="text-sm text-gray-800">{contract.leader.nickname}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {contract.artistProfileUrl ? (
                <img
                  src={contract.artistProfileUrl}
                  alt={contract.artist.nickname}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-xs text-purple-600">A</span>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500">아티스트</p>
                <p className="text-sm text-gray-800">{contract.artist.nickname}</p>
              </div>
            </div>
          </div>
        </td>
        <td className="px-4 py-4 text-center">
          <p className="text-sm font-semibold text-gray-800">{formatAmount(contract.amount)}원</p>
        </td>
        <td className="px-4 py-4">
          <div className="flex justify-center">
            <span
              className={`px-2 py-1 ${getTextSize(contract.status)} font-semibold rounded-full border ${CONTRACT_STATUS_COLORS[contract.status]} whitespace-pre-line leading-tight`}
            >
              {CONTRACT_STATUS_MAP[contract.status]}
            </span>
          </div>
        </td>
        <td className="px-4 py-4 text-center">
          <p className="text-xs text-gray-600 whitespace-nowrap">
            {formatDateOnly(contract.startAt)}
          </p>
          <p className="text-xs text-gray-400">~</p>
          <p className="text-xs text-gray-600 whitespace-nowrap">
            {formatDateOnly(contract.endAt)}
          </p>
        </td>
      </tr>

      {/* 프로젝트명 행 */}
      <tr className="border-b border-gray-200 bg-white">
        <td className="px-4 py-2"></td>
        <td colSpan={6} className="px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-gray-800 text-white text-xs font-semibold rounded">
              프로젝트명
            </span>
            <span className="text-sm text-gray-800">{contract.project.title}</span>
            <span className="text-xs text-gray-400">ID: {contract.project.id}</span>
          </div>
        </td>
      </tr>
    </>
  );
};

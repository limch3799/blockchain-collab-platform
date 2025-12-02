// src/pages/admin/contract/components/ContractList.tsx
import type { ContractListItem } from '@/api/admin/contract';
import { ContractItem } from './ContractItem';

interface ContractListProps {
  contracts: (ContractListItem & { leaderProfileUrl?: string; artistProfileUrl?: string })[];
  onContractClick: (
    contractId: number,
    leaderProfileUrl?: string,
    artistProfileUrl?: string,
  ) => void;
}

export const ContractList = ({ contracts, onContractClick }: ContractListProps) => {
  if (contracts.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-20 text-center">
        <p className="text-gray-600">계약이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b-2 border-gray-200">
          <tr>
            <th className="px-4 py-4 text-left text-sm font-semibold text-gray-800 w-16"></th>
            <th className="px-4 py-4 text-left text-sm font-semibold text-gray-800 w-20">ID</th>
            <th className="px-4 py-4 text-left text-sm font-semibold text-gray-800">계약 정보</th>
            <th className="px-4 py-4 text-left text-sm font-semibold text-gray-800">참여자</th>
            <th className="px-4 py-4 text-center text-sm font-semibold text-gray-800 w-32">금액</th>
            <th className="px-4 py-4 text-center text-sm font-semibold text-gray-800 w-32">상태</th>
            <th className="px-4 py-4 text-center text-sm font-semibold text-gray-800 w-40">기간</th>
          </tr>
        </thead>
        <tbody>
          {contracts.map((contract, index) => (
            <ContractItem
              key={contract.contractId}
              contract={contract}
              index={index + 1}
              onClick={() =>
                onContractClick(
                  contract.contractId,
                  contract.leaderProfileUrl,
                  contract.artistProfileUrl,
                )
              }
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

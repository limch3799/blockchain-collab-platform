// src/pages/admin/contract/components/AllContracts.tsx
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { getMemberDetail } from '@/api/admin/member';
import { getContractList } from '@/api/admin/contract';
import type { ContractListItem } from '@/api/admin/contract';
import type { ContractStatus } from '../contract';
import { IN_PROGRESS_STATUSES, COMPLETED_STATUSES } from '../contract';
import { ContractListHeader } from './ContractListHeader';
import { ContractList } from './ContractList';
import { ContractDetailModal } from './ContractDetailModal';
import { Pagination } from '../../components/Pagination';

type StatusFilter = 'all' | 'in_progress' | 'completed' | 'cancellation';

interface ContractWithProfiles extends ContractListItem {
  leaderProfileUrl?: string;
  artistProfileUrl?: string;
}

interface AllContractsProps {
  hasCancellationRequests: boolean;
  initialStatusFilter?: StatusFilter;
}

export const AllContracts = ({
  hasCancellationRequests,
  initialStatusFilter,
}: AllContractsProps) => {
  const [contracts, setContracts] = useState<ContractWithProfiles[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // initialStatusFilter가 있으면 그것을 초기값으로, 없으면 'all'
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialStatusFilter || 'all');
  const [selectedContractId, setSelectedContractId] = useState<number | null>(null);
  const [selectedLeaderProfile, setSelectedLeaderProfile] = useState<string | undefined>();
  const [selectedArtistProfile, setSelectedArtistProfile] = useState<string | undefined>();

  useEffect(() => {
    loadContracts();
  }, [currentPage, statusFilter]);

  const loadContracts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let statuses: ContractStatus[] | undefined;
      if (statusFilter === 'in_progress') {
        statuses = IN_PROGRESS_STATUSES;
      } else if (statusFilter === 'completed') {
        statuses = COMPLETED_STATUSES;
      } else if (statusFilter === 'cancellation') {
        statuses = ['CANCELLATION_REQUESTED'];
      }

      let allContracts: ContractListItem[] = [];
      if (statuses) {
        for (const status of statuses) {
          const data = await getContractList(currentPage, 20, status);
          allContracts = [...allContracts, ...data.content];
        }
      } else {
        const data = await getContractList(currentPage, 20);
        allContracts = data.content;
      }

      const contractsWithProfiles = await Promise.all(
        allContracts.map(async (contract) => {
          try {
            const [leaderProfile, artistProfile] = await Promise.all([
              getMemberDetail(contract.leader.id),
              getMemberDetail(contract.artist.id),
            ]);
            return {
              ...contract,
              leaderProfileUrl: leaderProfile.profileImageUrl || undefined,
              artistProfileUrl: artistProfile.profileImageUrl || undefined,
            };
          } catch {
            return {
              ...contract,
              leaderProfileUrl: undefined,
              artistProfileUrl: undefined,
            };
          }
        }),
      );

      setContracts(contractsWithProfiles);
      setTotalPages(Math.ceil(contractsWithProfiles.length / 20));
    } catch (err) {
      setError('계약 목록을 불러오는데 실패했습니다.');
      console.error('계약 목록 로드 실패:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContractClick = (
    contractId: number,
    leaderProfileUrl?: string,
    artistProfileUrl?: string,
  ) => {
    setSelectedContractId(contractId);
    setSelectedLeaderProfile(leaderProfileUrl);
    setSelectedArtistProfile(artistProfileUrl);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 bg-moas-navy2" />
          <p className="text-gray-600">계약 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <>
      <div>
        <ContractListHeader
          statusFilter={statusFilter}
          hasCancellationRequests={hasCancellationRequests}
          onStatusFilterChange={(filter) => {
            setStatusFilter(filter);
            setCurrentPage(1);
          }}
        />

        <ContractList contracts={contracts} onContractClick={handleContractClick} />

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {selectedContractId && (
        <ContractDetailModal
          contractId={selectedContractId}
          leaderProfileUrl={selectedLeaderProfile}
          artistProfileUrl={selectedArtistProfile}
          onClose={() => setSelectedContractId(null)}
          onUpdate={loadContracts}
        />
      )}
    </>
  );
};

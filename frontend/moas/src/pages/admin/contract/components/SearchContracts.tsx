// src/pages/admin/contract/components/SearchContracts.tsx
import { useState } from 'react';
import { Loader2, Search } from 'lucide-react';
import { getMemberDetail } from '@/api/admin/member';
import { getContractList } from '@/api/admin/contract';
import type { ContractListItem } from '@/api/admin/contract';
import { ContractList } from './ContractList';
import { ContractDetailModal } from './ContractDetailModal';
import { Pagination } from '../../components/Pagination';

interface ContractWithProfiles extends ContractListItem {
  leaderProfileUrl?: string;
  artistProfileUrl?: string;
}

export const SearchContracts = () => {
  const [searchType, setSearchType] = useState<'MEMBER_ID' | 'NICKNAME' | 'TITLE'>('NICKNAME');
  const [keyword, setKeyword] = useState('');
  const [contracts, setContracts] = useState<ContractWithProfiles[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<number | null>(null);
  const [selectedLeaderProfile, setSelectedLeaderProfile] = useState<string | undefined>();
  const [selectedArtistProfile, setSelectedArtistProfile] = useState<string | undefined>();

  const handleSearch = async () => {
    if (!keyword.trim()) {
      setError('검색어를 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setHasSearched(true);

      const data =
        searchType === 'TITLE'
          ? await getContractList(currentPage, 20, undefined, undefined, undefined, keyword.trim())
          : await getContractList(currentPage, 20, undefined, searchType, keyword.trim());

      const contractsWithProfiles = await Promise.all(
        data.content.map(async (contract) => {
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
            return contract;
          }
        }),
      );

      setContracts(contractsWithProfiles);
      setTotalPages(data.pageInfo.totalPages);
    } catch (err) {
      setError('계약 검색에 실패했습니다.');
      console.error('계약 검색 실패:', err);
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

  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
    try {
      setIsLoading(true);
      setError(null);

      const data =
        searchType === 'TITLE'
          ? await getContractList(page, 20, undefined, undefined, undefined, keyword.trim())
          : await getContractList(page, 20, undefined, searchType, keyword.trim());

      const contractsWithProfiles = await Promise.all(
        data.content.map(async (contract) => {
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
    } catch (err) {
      setError('계약 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">계약 검색</h3>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">검색 유형</label>
            <div className="flex items-center gap-4">
              {[
                { value: 'NICKNAME' as const, label: '닉네임' },
                { value: 'MEMBER_ID' as const, label: '회원 ID' },
                { value: 'TITLE' as const, label: '계약 제목' },
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="searchType"
                    value={option.value}
                    checked={searchType === option.value}
                    onChange={(e) =>
                      setSearchType(e.target.value as 'MEMBER_ID' | 'NICKNAME' | 'TITLE')
                    }
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={
                searchType === 'MEMBER_ID'
                  ? '회원 ID를 입력하세요'
                  : searchType === 'NICKNAME'
                    ? '닉네임을 입력하세요'
                    : '계약 제목을 입력하세요'
              }
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
            />
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              검색
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">검색 중...</p>
            </div>
          </div>
        ) : hasSearched ? (
          <>
            {contracts.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-20 text-center">
                <p className="text-gray-600">검색 결과가 없습니다.</p>
              </div>
            ) : (
              <>
                <ContractList contracts={contracts} onContractClick={handleContractClick} />
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}
          </>
        ) : null}
      </div>

      {selectedContractId && (
        <ContractDetailModal
          contractId={selectedContractId}
          leaderProfileUrl={selectedLeaderProfile}
          artistProfileUrl={selectedArtistProfile}
          onClose={() => setSelectedContractId(null)}
          onUpdate={handleSearch}
        />
      )}
    </>
  );
};

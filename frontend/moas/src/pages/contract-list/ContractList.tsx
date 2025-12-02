/**
 * ContractList Page
 *
 * Description:
 * 리더가 자신의 계약을 관리하는 페이지
 * - 전체/진행 전/진행중/완료된 필터링
 * - 페이지네이션
 */

import { useState, useEffect } from 'react';
import { LeaderSidebar } from '../leader-project-list/components/LeaderSidebar';
import { Pagination } from '../leader-project-list/components/Pagination';
import { NFTCardSimple } from './components/NFTCardSimple';
import { getContracts } from '@/api/contract';
import { getProjectById } from '@/api/project';
import type { Contract, ContractListStatus } from '@/types/contract';

export type ContractFilterType = 'all' | 'BEFORE_START' | 'IN_PROGRESS' | 'COMPLETED';

const ITEMS_PER_PAGE = 12;

// 썸네일 정보를 포함한 계약 타입
interface ContractWithThumbnail extends Contract {
  projectThumbnailUrl?: string | null;
}

function ContractList() {
  // 상태 관리
  const [activeFilter, setActiveFilter] = useState<ContractFilterType>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [contracts, setContracts] = useState<ContractWithThumbnail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // API 호출: 계약 목록 조회 + 프로젝트 썸네일 조회
  useEffect(() => {
    const fetchContracts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 1. 계약 목록 조회
        const status: ContractListStatus | undefined =
          activeFilter === 'all' ? undefined : activeFilter;

        const response = await getContracts(status);

        // 2. 각 계약의 프로젝트 썸네일 조회
        const contractsWithThumbnails: ContractWithThumbnail[] = await Promise.all(
          response.contracts.map(async (contract): Promise<ContractWithThumbnail> => {
            try {
              const projectDetail = await getProjectById(contract.project.projectId);
              return {
                ...contract,
                projectThumbnailUrl: projectDetail.thumbnailUrl || null,
              };
            } catch (error) {
              console.error(`프로젝트 ${contract.project.projectId} 썸네일 조회 실패:`, error);
              return {
                ...contract,
                projectThumbnailUrl: null,
              };
            }
          }),
        );

        setContracts(contractsWithThumbnails);
      } catch (err) {
        console.error('계약 목록 조회 실패:', err);
        setError('계약 목록을 불러오는 데 실패했습니다.');
        setContracts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContracts();
  }, [activeFilter]);

  // 필터링된 계약 (API에서 이미 필터링되어 오므로 그대로 사용)
  const filteredContracts = contracts;

  // 페이지네이션
  const totalPages = Math.ceil(filteredContracts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedContracts = filteredContracts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 필터 변경 핸들러
  const handleFilterChange = (filter: string) => {
    // LeaderSidebar에서 오는 프로젝트 필터는 무시하고, 계약 필터만 처리
    if (filter === 'all' || filter === 'recruiting' || filter === 'closed') {
      return;
    }
    setActiveFilter(filter as ContractFilterType);
    setCurrentPage(1);
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* 좌측 사이드바 */}
      <LeaderSidebar
        activeFilter="all"
        onFilterChange={handleFilterChange}
        contractFilter={activeFilter}
        onContractFilterChange={setActiveFilter}
      />

      {/* 메인 콘텐츠 */}
      <main className="flex-1 px-16 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-moas-text">
            전체 계약
            <span className="ml-3 text-xl font-normal text-moas-gray-6">
              ({filteredContracts.length})
            </span>
          </h1>
        </div>

        {/* 로딩 상태 */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-lg text-moas-gray-6">계약 목록을 불러오는 중...</p>
          </div>
        ) : error ? (
          /* 에러 상태 */
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-lg text-moas-error">{error}</p>
          </div>
        ) : paginatedContracts.length > 0 ? (
          /* 계약 NFT 카드 그리드 */
          <>
            <div className="grid grid-cols-4 gap-4">
              {paginatedContracts.map((contract) => (
                <NFTCardSimple key={contract.contractId} contract={contract} />
              ))}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        ) : (
          /* 빈 상태 */
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-lg text-moas-gray-6">계약 내역이 없습니다.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default ContractList;

// src/pages/artist-project-list/ArtistProjectList.tsx
import { useState, useEffect, useMemo } from 'react';
import { ProjectListCard } from './components/ProjectListCard';
import { NFTCardSimple } from '../contract-list/components/NFTCardSimple';
import { ContractStatusGuide } from './components/ContractStatusGuide';
import { ContractDetailModal } from './components/ContractDetailModal';
import { ApplicationViewModal } from './components/ApplicationViewModal';
import { SectionTabs } from './components/SectionTabs';
import { Pagination } from './components/Pagination';
import { FilterButton } from './components/FilterButton';
import type { Section, ApplicationStatus, ContractFilterType, ApplicationProject } from './types';
import { APPLICATION_FILTERS, CONTRACT_FILTERS } from './types';
import { PageHeader } from '../../components/layout/PageHeader';
import { getMyApplications, cancelApplication } from '@/api/apply';
import { getContracts } from '@/api/contract';
import type { Contract, ContractListStatus } from '@/types/contract';
import { getProjectById } from '@/api/project';
import { ApplicationStatusGuide } from './components/ApplicationStatusGuide';

const ITEMS_PER_PAGE = 10;
interface ContractWithThumbnail extends Contract {
  projectThumbnailUrl?: string | null;
}

function ArtistProjectList() {
  const [activeSection, setActiveSection] = useState<Section>('applications');
  const [applicationFilter, setApplicationFilter] = useState<ApplicationStatus>('all');
  const [contractFilter, setContractFilter] = useState<ContractFilterType>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const [applications, setApplications] = useState<ApplicationProject[]>([]);
  const [allApplications, setAllApplications] = useState<ApplicationProject[]>([]);
  const [contracts, setContracts] = useState<ContractWithThumbnail[]>([]);
  const [_allContracts, setAllContracts] = useState<ContractWithThumbnail[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [_isLoading, setIsLoading] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [skeletonShowTime, setSkeletonShowTime] = useState<number | null>(null);
  const [contractCountsData, setContractCountsData] = useState({
    all: 0,
    BEFORE_START: 0,
    IN_PROGRESS: 0,
    COMPLETED: 0,
  });

  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<number | null>(null);

  const [applicationModalOpen, setApplicationModalOpen] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null);

  const handleViewApplication = (applicationId: number) => {
    setSelectedApplicationId(applicationId);
    setApplicationModalOpen(true);
  };

  const handleCloseApplicationModal = () => {
    setApplicationModalOpen(false);
    setSelectedApplicationId(null);
  };

  const applicationCounts = useMemo(() => {
    return {
      all: allApplications.length,
      PENDING: allApplications.filter((app) => app.status === 'PENDING').length,
      OFFERED: allApplications.filter((app) => app.status === 'OFFERED').length,
      REJECTED: allApplications.filter((app) => app.status === 'REJECTED').length,
    };
  }, [allApplications]);

  const contractCounts = contractCountsData;

  // 초기 로드 - 전체 데이터
  useEffect(() => {
    fetchAllApplications();
    fetchAllContracts();
  }, []);

  // 섹션 변경 시 페이지 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [activeSection, applicationFilter, contractFilter]);

  // 지원 데이터 로드
  useEffect(() => {
    if (activeSection === 'applications') {
      fetchApplications();
    }
  }, [activeSection, applicationFilter, currentPage]);

  // 계약 데이터 로드
  useEffect(() => {
    if (activeSection === 'contracts') {
      fetchContracts();
    }
  }, [activeSection, contractFilter, currentPage]);

  const fetchAllApplications = async () => {
    try {
      const response = await getMyApplications({
        status: 'all',
        page: 0,
        size: 1000,
      });
      setAllApplications(response.applications);
    } catch (error) {
      console.error('전체 지원 데이터 조회 실패:', error);
    }
  };

  const fetchAllContracts = async () => {
    try {
      const [allResponse, beforeResponse, inProgressResponse, completedResponse] =
        await Promise.all([
          getContracts(),
          getContracts('BEFORE_START'),
          getContracts('IN_PROGRESS'),
          getContracts('COMPLETED'),
        ]);

      const allContractsWithThumbnails: ContractWithThumbnail[] = await Promise.all(
        (allResponse.contracts || []).map(async (contract): Promise<ContractWithThumbnail> => {
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

      setAllContracts(allContractsWithThumbnails);

      setContractCountsData({
        all: allResponse.contracts?.length || 0,
        BEFORE_START: beforeResponse.contracts?.length || 0,
        IN_PROGRESS: inProgressResponse.contracts?.length || 0,
        COMPLETED: completedResponse.contracts?.length || 0,
      });
    } catch (error) {
      console.error('전체 계약 데이터 조회 실패:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      setIsLoading(true);

      // 200ms 후에 스켈레톤 표시
      const skeletonTimer = setTimeout(() => {
        setShowSkeleton(true);
        setSkeletonShowTime(Date.now());
      }, 200);

      const response = await getMyApplications({
        status: applicationFilter,
        page: currentPage - 1,
        size: ITEMS_PER_PAGE,
      });

      setApplications(response.applications);
      setTotalPages(response.pageInfo.totalPages);

      clearTimeout(skeletonTimer);

      // 스켈레톤이 표시되었다면 최소 500ms 유지
      if (showSkeleton && skeletonShowTime) {
        const elapsed = Date.now() - skeletonShowTime;
        const remaining = Math.max(0, 500 - elapsed);

        setTimeout(() => {
          setIsLoading(false);
          setShowSkeleton(false);
          setSkeletonShowTime(null);
        }, remaining);
      } else {
        setIsLoading(false);
        setShowSkeleton(false);
        setSkeletonShowTime(null);
      }
    } catch (error) {
      console.error('지원 현황 조회 실패:', error);
      alert('지원 현황을 불러오는데 실패했습니다.');
      setIsLoading(false);
      setShowSkeleton(false);
      setSkeletonShowTime(null);
    }
  };

  const fetchContracts = async () => {
    try {
      setIsLoading(true);

      // 200ms 후에 스켈레톤 표시
      const skeletonTimer = setTimeout(() => {
        setShowSkeleton(true);
        setSkeletonShowTime(Date.now());
      }, 200);

      const status: ContractListStatus | undefined =
        contractFilter === 'all' ? undefined : contractFilter;

      const response = await getContracts(status);

      // 각 계약의 프로젝트 썸네일 조회
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

      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const paginatedContracts = contractsWithThumbnails.slice(startIndex, endIndex);

      setContracts(paginatedContracts);
      setTotalPages(Math.ceil(contractsWithThumbnails.length / ITEMS_PER_PAGE));

      clearTimeout(skeletonTimer);

      // 스켈레톤이 표시되었다면 최소 500ms 유지
      if (showSkeleton && skeletonShowTime) {
        const elapsed = Date.now() - skeletonShowTime;
        const remaining = Math.max(0, 500 - elapsed);

        setTimeout(() => {
          setIsLoading(false);
          setShowSkeleton(false);
          setSkeletonShowTime(null);
        }, remaining);
      } else {
        setIsLoading(false);
        setShowSkeleton(false);
        setSkeletonShowTime(null);
      }
    } catch (error) {
      console.error('계약 현황 조회 실패:', error);
      alert('계약 현황을 불러오는데 실패했습니다.');
      setIsLoading(false);
      setShowSkeleton(false);
      setSkeletonShowTime(null);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSectionChange = (section: Section) => {
    setActiveSection(section);
    setCurrentPage(1);
    if (section === 'applications') {
      setApplicationFilter('all');
    } else {
      setContractFilter('all');
    }
  };

  const handleFilterChange = (filter: ApplicationStatus | ContractFilterType) => {
    if (activeSection === 'applications') {
      setApplicationFilter(filter as ApplicationStatus);
    } else {
      setContractFilter(filter as ContractFilterType);
    }
    setCurrentPage(1);
  };

  const handleCancelApplication = async (applicationId: number) => {
    if (!confirm('정말 지원을 취소하시겠습니까?')) {
      return;
    }

    try {
      await cancelApplication(applicationId);
      alert('지원이 취소되었습니다.');
      fetchAllApplications();
      fetchApplications();
    } catch (error) {
      console.error('지원 취소 실패:', error);
      alert('지원 취소에 실패했습니다.');
    }
  };

  const currentFilters = activeSection === 'applications' ? APPLICATION_FILTERS : CONTRACT_FILTERS;
  const currentFilter = activeSection === 'applications' ? applicationFilter : contractFilter;
  const currentCounts = activeSection === 'applications' ? applicationCounts : contractCounts;

  return (
    <div className="min-h-screen bg-white">
      <header className="w-full py-0 px-0">
        <PageHeader
          title="내 프로젝트"
          description="지원한 프로젝트와 체결된 계약 현황을 확인해보세요."
        />
      </header>

      <div className="px-0 pt-8">
        <SectionTabs activeSection={activeSection} onSectionChange={handleSectionChange} />

        <main className="py-0">
          <div className="mb-4 flex gap-2">
            {currentFilters.map((filter) => (
              <FilterButton
                key={filter.value}
                label={filter.label}
                count={currentCounts[filter.value as keyof typeof currentCounts]}
                isActive={currentFilter === filter.value}
                onClick={() => handleFilterChange(filter.value)}
              />
            ))}
          </div>
          {/* ⭐ 지원 현황 가이드 추가 */}
          {activeSection === 'applications' && (
            <ApplicationStatusGuide currentFilter={applicationFilter} />
          )}

          {activeSection === 'contracts' && <ContractStatusGuide currentFilter={contractFilter} />}

          {/* 로딩 스켈레톤 - 지원 현황 */}
          {showSkeleton && activeSection === 'applications' && (
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden bg-moas-gray-1 p-6 rounded-xl animate-pulse"
                >
                  <div className="space-y-4">
                    <div className="h-6 w-3/4 rounded bg-gray-300" />
                    <div className="h-4 w-1/2 rounded bg-gray-300" />
                    <div className="flex gap-2">
                      <div className="h-8 w-20 rounded bg-gray-300" />
                      <div className="h-8 w-20 rounded bg-gray-300" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 로딩 스켈레톤 - 계약 현황 */}
          {showSkeleton && activeSection === 'contracts' && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="relative h-[450px] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-gray-300 to-gray-400">
                    <div className="relative z-10 flex h-full flex-col p-5">
                      <div className="mb-2 h-6 w-20 rounded-full bg-gray-200" />
                      <div className="mb-3 h-5 w-3/4 rounded bg-gray-200" />
                      <div className="mb-4 h-32 w-full rounded-xl bg-gray-200" />
                      <div className="space-y-2">
                        <div className="h-4 w-full rounded bg-gray-200" />
                        <div className="h-4 w-full rounded bg-gray-200" />
                        <div className="h-4 w-2/3 rounded bg-gray-200" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!showSkeleton && activeSection === 'applications' && (
            <>
              {applications.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-moas-gray-6">지원한 프로젝트가 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((application) => (
                    <ProjectListCard
                      key={application.applicationId}
                      application={application}
                      section={activeSection}
                      onCancelApplication={handleCancelApplication}
                      onViewApplication={handleViewApplication}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {!showSkeleton && activeSection === 'contracts' && (
            <>
              {contracts.length === 0 ? (
                <div className="text-center py-20 font-pretendard">
                  <p className="text-moas-gray-6">계약 내역이 없습니다.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {contracts.map((contract) => (
                    <NFTCardSimple key={contract.contractId} contract={contract} />
                  ))}
                </div>
              )}
            </>
          )}

          {!showSkeleton && totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </main>
      </div>

      <ContractDetailModal
        isOpen={contractModalOpen}
        contractId={selectedContractId}
        onClose={() => {
          setContractModalOpen(false);
          setSelectedContractId(null);
        }}
      />

      <ApplicationViewModal
        isOpen={applicationModalOpen}
        applicationId={selectedApplicationId}
        onClose={handleCloseApplicationModal}
      />
    </div>
  );
}

export default ArtistProjectList;

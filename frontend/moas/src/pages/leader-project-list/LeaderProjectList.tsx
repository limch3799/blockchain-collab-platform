/**
 * LeaderProjectList Page
 *
 * Description:
 * 리더의 프로젝트와 계약 현황을 통합 관리하는 페이지
 * - 통계 카드: 모집중 프로젝트, 체결된 계약, 정산 대기 계약
 * - 전체 공고 섹션: 전체/모집중/마감됨 필터링
 * - 전체 계약 섹션: 전체/진행전/진행중/완료됨 필터링
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { SectionTabs, type Section } from './components/SectionTabs';
import { FilterButton } from './components/FilterButton';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { Pagination } from './components/Pagination';
import { ProjectListCard } from './components/ProjectListCard';
import { NFTCardSimple } from '../contract-list/components/NFTCardSimple';
import { LeaderContractStatusGuide } from './components/LeaderContractStatusGuide';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { PageHeader } from '@/components/layout/PageHeader';
import { getMyProjects, deleteProject, closeProject, getProjectById } from '@/api/project';
import { getContracts } from '@/api/contract';
import type { ProjectItem } from '@/types/project';
import type { Contract, ContractListStatus } from '@/types/contract';

type ProjectFilterType = 'all' | 'recruiting' | 'closed';
type ContractFilterType = 'all' | 'BEFORE_START' | 'IN_PROGRESS' | 'COMPLETED';
interface ContractWithThumbnail extends Contract {
  projectThumbnailUrl?: string | null;
}

const ITEMS_PER_PAGE = 10;

const PROJECT_FILTERS = [
  { value: 'all' as ProjectFilterType, label: '전체' },
  { value: 'recruiting' as ProjectFilterType, label: '모집 중' },
  { value: 'closed' as ProjectFilterType, label: '마감됨' },
];

const CONTRACT_FILTERS = [
  { value: 'all' as ContractFilterType, label: '전체 계약' },
  { value: 'BEFORE_START' as ContractFilterType, label: '계약 체결' },
  { value: 'IN_PROGRESS' as ContractFilterType, label: '수행 중' },
  { value: 'COMPLETED' as ContractFilterType, label: '정산 완료' },
];

function LeaderProjectList() {
  const navigate = useNavigate();

  // 섹션 상태
  const [activeSection, setActiveSection] = useState<Section>('projects');
  const [projectFilter, setProjectFilter] = useState<ProjectFilterType>('all');
  const [contractFilter, setContractFilter] = useState<ContractFilterType>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  // 프로젝트 상태
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [allProjects, setAllProjects] = useState<ProjectItem[]>([]);
  const [totalProjectPages, setTotalProjectPages] = useState(1);

  // 계약 상태
  const [contracts, setContracts] = useState<ContractWithThumbnail[]>([]);
  const [allContracts, setAllContracts] = useState<ContractWithThumbnail[]>([]);
  const [totalContractPages, setTotalContractPages] = useState(1);
  const [contractCountsData, setContractCountsData] = useState({
    all: 0,
    BEFORE_START: 0,
    IN_PROGRESS: 0,
    COMPLETED: 0,
  });

  // 공통 상태
  const [, setLoading] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [skeletonShowTime, setSkeletonShowTime] = useState<number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null);
  const [closeConfirmModalOpen, setCloseConfirmModalOpen] = useState(false);
  const [projectToClose, setProjectToClose] = useState<number | null>(null);
  const [closeSuccessModalOpen, setCloseSuccessModalOpen] = useState(false);
  const [closeErrorMessage, setCloseErrorMessage] = useState('');

  // 통계 계산
  useMemo(() => {
    const recruitingProjects = allProjects.filter((p) => !p.isClosed).length;
    const completedContracts = allContracts.filter((c) => c.status === 'COMPLETED').length;
    const pendingPaymentContracts = allContracts.filter(
      (c) => c.status === 'PAYMENT_PENDING',
    ).length;

    return {
      recruitingProjects,
      completedContracts,
      pendingPaymentContracts,
    };
  }, [allProjects, allContracts]);

  // 프로젝트 필터별 개수
  const projectCounts = useMemo(() => {
    return {
      all: allProjects.length,
      recruiting: allProjects.filter((p) => !p.isClosed).length,
      closed: allProjects.filter((p) => p.isClosed).length,
    };
  }, [allProjects]);

  // 계약 필터별 개수
  const contractCounts = contractCountsData;

  // 초기 로드 - 전체 데이터 (통계용)
  useEffect(() => {
    fetchAllProjects();
    fetchAllContracts();
  }, []);

  // 섹션 변경 시 페이지 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [activeSection, projectFilter, contractFilter]);

  // 프로젝트 데이터 로드
  useEffect(() => {
    if (activeSection === 'projects') {
      fetchProjects();
    }
  }, [activeSection, projectFilter, currentPage]);

  // 계약 데이터 로드
  useEffect(() => {
    if (activeSection === 'contracts') {
      fetchContracts();
    }
  }, [activeSection, contractFilter, currentPage]);

  // 전체 프로젝트 조회 (통계용)
  const fetchAllProjects = async () => {
    try {
      const response = await getMyProjects({
        page: 1,
        size: 10,
      });
      setAllProjects(response.items || []);
    } catch (error) {
      console.error('전체 프로젝트 조회 실패:', error);
    }
  };

  // 전체 계약 조회 (통계용)
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

      // 카운트 직접 설정
      setContractCountsData({
        all: allResponse.contracts?.length || 0,
        BEFORE_START: beforeResponse.contracts?.length || 0,
        IN_PROGRESS: inProgressResponse.contracts?.length || 0,
        COMPLETED: completedResponse.contracts?.length || 0,
      });
    } catch (error) {
      console.error('전체 계약 조회 실패:', error);
    }
  };

  // 프로젝트 목록 조회
  const fetchProjects = async () => {
    try {
      setLoading(true);

      // 200ms 후에 스켈레톤 표시
      const skeletonTimer = setTimeout(() => {
        setShowSkeleton(true);
        setSkeletonShowTime(Date.now());
      }, 200);

      const status = projectFilter === 'all' ? undefined : projectFilter;

      const response = await getMyProjects({
        page: currentPage,
        size: ITEMS_PER_PAGE,
        status: status as 'recruiting' | 'closed' | undefined,
      });

      setProjects(response.items || []);
      setTotalProjectPages(Math.ceil((response.total || 0) / ITEMS_PER_PAGE));

      clearTimeout(skeletonTimer);

      // 스켈레톤이 표시되었다면 최소 500ms 유지
      if (showSkeleton && skeletonShowTime) {
        const elapsed = Date.now() - skeletonShowTime;
        const remaining = Math.max(0, 500 - elapsed);

        setTimeout(() => {
          setLoading(false);
          setShowSkeleton(false);
          setSkeletonShowTime(null);
        }, remaining);
      } else {
        setLoading(false);
        setShowSkeleton(false);
        setSkeletonShowTime(null);
      }
    } catch (error: any) {
      console.error('프로젝트 목록 조회 실패:', error);
      setLoading(false);
      setShowSkeleton(false);
      setSkeletonShowTime(null);
    }
  };

  // 계약 목록 조회
  const fetchContracts = async () => {
    try {
      setLoading(true);

      // 200ms 후에 스켈레톤 표시
      const skeletonTimer = setTimeout(() => {
        setShowSkeleton(true);
        setSkeletonShowTime(Date.now());
      }, 200);

      const status: ContractListStatus | undefined =
        contractFilter === 'BEFORE_START' ||
        contractFilter === 'IN_PROGRESS' ||
        contractFilter === 'COMPLETED'
          ? contractFilter
          : undefined;

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
      setTotalContractPages(Math.ceil(contractsWithThumbnails.length / ITEMS_PER_PAGE));

      clearTimeout(skeletonTimer);

      // 스켈레톤이 표시되었다면 최소 500ms 유지
      if (showSkeleton && skeletonShowTime) {
        const elapsed = Date.now() - skeletonShowTime;
        const remaining = Math.max(0, 500 - elapsed);

        setTimeout(() => {
          setLoading(false);
          setShowSkeleton(false);
          setSkeletonShowTime(null);
        }, remaining);
      } else {
        setLoading(false);
        setShowSkeleton(false);
        setSkeletonShowTime(null);
      }
    } catch (error: any) {
      console.error('계약 목록 조회 실패:', error);
      setLoading(false);
      setShowSkeleton(false);
      setSkeletonShowTime(null);
    }
  };

  // 페이지 변경
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // 섹션 변경
  const handleSectionChange = (section: Section) => {
    setActiveSection(section);
    setCurrentPage(1);
    setShouldAnimate(true);
  };

  // 필터 변경
  const handleFilterChange = (filter: ProjectFilterType | ContractFilterType) => {
    if (activeSection === 'projects') {
      setProjectFilter(filter as ProjectFilterType);
    } else {
      setContractFilter(filter as ContractFilterType);
    }
    setCurrentPage(1);
    setShouldAnimate(false);
  };

  // 프로젝트 삭제
  const handleDeleteClick = (projectId: number) => {
    setProjectToDelete(projectId);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (projectToDelete !== null) {
      try {
        await deleteProject(projectToDelete);
        fetchAllProjects();
        fetchProjects();
      } catch (error: any) {
        console.error('프로젝트 삭제 실패:', error);

        let errorMessage = '프로젝트 삭제에 실패했습니다.';

        if (error.response) {
          const { status } = error.response;

          switch (status) {
            case 403:
              errorMessage = '프로젝트 리더만 삭제할 수 있습니다.';
              break;
            case 404:
              errorMessage = '프로젝트를 찾을 수 없습니다.';
              break;
            case 409:
              errorMessage =
                '현재 상태에서는 삭제할 수 없습니다.\\n(모집 중이거나 지원자가 있는 경우)';
              break;
            case 500:
              errorMessage = '서버 오류가 발생했습니다.\\n잠시 후 다시 시도해주세요.';
              break;
            default:
              errorMessage = error.response.data?.message || errorMessage;
          }
        }

        alert(errorMessage);
      } finally {
        setDeleteModalOpen(false);
        setProjectToDelete(null);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setProjectToDelete(null);
  };

  // 프로젝트 마감
  const handleCloseProject = (projectId: number) => {
    setProjectToClose(projectId);
    setCloseConfirmModalOpen(true);
  };

  const handleCloseConfirm = async () => {
    if (projectToClose !== null) {
      try {
        await closeProject(projectToClose);
        fetchAllProjects();
        fetchProjects();
        setCloseSuccessModalOpen(true);
      } catch (error: any) {
        console.error('프로젝트 마감 실패:', error);

        let errorMessage = '프로젝트 마감에 실패했습니다.';

        if (error.response) {
          const { status } = error.response;

          switch (status) {
            case 401:
              errorMessage = '인증이 필요합니다.';
              break;
            case 403:
              errorMessage = '프로젝트 소유자만 마감할 수 있습니다.';
              break;
            case 404:
              errorMessage = '요청한 리소스를 찾을 수 없습니다.';
              break;
            case 409:
              errorMessage = '마감 또는 종료된 프로젝트는 수정할 수 없습니다.';
              break;
            case 500:
              errorMessage = '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
              break;
            default:
              errorMessage = error.response.data?.message || errorMessage;
          }
        }

        setCloseErrorMessage(errorMessage);
      } finally {
        setCloseConfirmModalOpen(false);
        setProjectToClose(null);
      }
    }
  };

  const handleCloseCancel = () => {
    setCloseConfirmModalOpen(false);
    setProjectToClose(null);
  };

  // 프로젝트 수정
  const handleEditClick = (projectId: number) => {
    navigate(`/leader-project-edit/${projectId}`);
  };

  const currentFilters = activeSection === 'projects' ? PROJECT_FILTERS : CONTRACT_FILTERS;
  const currentFilter = activeSection === 'projects' ? projectFilter : contractFilter;
  const currentCounts = activeSection === 'projects' ? projectCounts : contractCounts;
  const totalPages = activeSection === 'projects' ? totalProjectPages : totalContractPages;

  return (
    <div className="min-h-screen bg-white">
      {/* 페이지 헤더 */}
      <header className="mx-auto max-w-[1400px] px-8 py-0">
        <PageHeader title="내 프로젝트" description="프로젝트 공고와 계약 현황을 관리해보세요." />
      </header>

      <div className="mx-auto max-w-[1400px] px-8 py-6">
        {/* 섹션 탭 */}
        <SectionTabs activeSection={activeSection} onSectionChange={handleSectionChange} />

        {/* 필터 버튼 + 프로젝트 등록 버튼 */}
        <div className="mb-6 flex items-center justify-between animate-fadeIn">
          <div className="flex gap-2">
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

          {activeSection === 'projects' && (
            <button
              onClick={() => navigate('/leader-project-post')}
              className="flex items-center gap-2 rounded-xl bg-moas-main px-3 py-2 text-[14px] font-bold text-moas-text transition-all hover:bg-moas-main/90 hover:scale-105 font-pretendard"
            >
              <span>+</span>
              <span>프로젝트 등록</span>
            </button>
          )}
        </div>

        {/* 계약 상태 가이드 */}
        {activeSection === 'contracts' && (
          <LeaderContractStatusGuide currentFilter={contractFilter} />
        )}

        {/* 로딩 스켈레톤 - 프로젝트 */}
        {showSkeleton && activeSection === 'projects' && (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="overflow-hidden bg-moas-gray-1 p-4 rounded-xl animate-pulse"
              >
                <div className="flex gap-4">
                  {/* 썸네일 */}
                  <div className="relative shrink-0">
                    <div className="h-52 w-[288px] rounded-2xl bg-gray-300" />
                  </div>

                  {/* 프로젝트 정보 */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex flex-1 justify-between">
                      {/* 좌측: 프로젝트 정보 */}
                      <div className="flex flex-col justify-between">
                        {/* 상단 정보 */}
                        <div>
                          {/* 카테고리 뱃지 */}
                          <div className="mb-2 flex flex-wrap gap-1.5">
                            <div className="h-[22px] w-[76px] rounded-[20px] bg-gray-300" />
                            <div className="h-[22px] w-[58px] rounded-[20px] bg-gray-300" />
                          </div>

                          {/* 프로젝트명 */}
                          <div className="mb-2 h-6 w-80 rounded bg-gray-300" />

                          {/* 프로젝트 요약 */}
                          <div className="mb-3 h-4 w-96 rounded bg-gray-300" />

                          {/* 날짜/지역/예산 정보 */}
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5">
                              <div className="size-4 rounded bg-gray-300" />
                              <div className="h-3 w-40 rounded bg-gray-300" />
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="size-4 rounded bg-gray-300" />
                              <div className="h-3 w-24 rounded bg-gray-300" />
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="size-4 rounded bg-gray-300" />
                              <div className="h-3 w-32 rounded bg-gray-300" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 우측: 수정/삭제 아이콘 */}
                      <div className="flex items-start gap-2">
                        <div className="size-5 rounded bg-gray-300" />
                        <div className="size-5 rounded bg-gray-300" />
                      </div>
                    </div>

                    {/* 하단 버튼 */}
                    <div className="mt-4 flex gap-2">
                      <div className="h-9 flex-1 rounded-lg bg-gray-300" />
                      <div className="h-9 flex-1 rounded-lg bg-gray-300" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 로딩 스켈레톤 - 계약 */}
        {showSkeleton && activeSection === 'contracts' && (
          <div className="grid grid-cols-4 gap-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="relative h-[600px] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-gray-300 to-gray-400">
                  {/* 카드 내용 */}
                  <div className="relative z-10 flex h-full flex-col p-8">
                    {/* 카테고리 배지 */}
                    <div className="mb-2 h-9 w-24 rounded-full bg-gray-200" />

                    {/* 프로젝트명 */}
                    <div className="mb-4 h-6 w-3/4 rounded bg-gray-200" />

                    {/* 프로젝트 이미지 */}
                    <div className="mb-8">
                      <div className="h-48 w-full rounded-xl bg-gray-200" />
                    </div>

                    {/* 참여자 정보 */}
                    <div className="mb-8 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-24 rounded bg-gray-200" />
                        <div className="h-4 w-20 rounded bg-gray-200" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-20 rounded bg-gray-200" />
                        <div className="h-4 w-20 rounded bg-gray-200" />
                      </div>
                    </div>

                    {/* 금액 및 기간 */}
                    <div className="mb-8 space-y-4">
                      <div>
                        <div className="mb-1 h-3 w-10 rounded bg-gray-200" />
                        <div className="mb-1 h-7 w-32 rounded bg-gray-200" />
                        <div className="h-3 w-24 rounded bg-gray-200" />
                      </div>

                      <div>
                        <div className="mb-1 h-3 w-10 rounded bg-gray-200" />
                        <div className="h-4 w-48 rounded bg-gray-200" />
                      </div>
                    </div>

                    {/* NFT 블록체인 정보 */}
                    <div className="mt-auto rounded-2xl bg-white/10 p-5 backdrop-blur-sm">
                      <div className="mb-3 flex items-center gap-2">
                        <div className="h-4 w-4 rounded bg-gray-200" />
                        <div className="h-4 w-24 rounded bg-gray-200" />
                      </div>
                      <div className="rounded-lg bg-white/10 px-3 py-2">
                        <div className="h-4 w-full rounded bg-gray-200" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 프로젝트 목록 */}
        {!showSkeleton && activeSection === 'projects' && (
          <div className={shouldAnimate ? 'animate-fadeIn' : ''}>
            {projects.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <p className="text-lg text-moas-gray-6">등록된 프로젝트가 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
                  <ProjectListCard
                    key={project.id}
                    project={project}
                    onDelete={handleDeleteClick}
                    onCloseProject={() => handleCloseProject(project.id)}
                    onEdit={() => handleEditClick(project.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 계약 목록 */}
        {!showSkeleton && activeSection === 'contracts' && (
          <div className={shouldAnimate ? 'animate-fadeIn' : ''}>
            {contracts.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <p className="text-lg text-moas-gray-6">계약 내역이 없습니다.</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-4">
                {contracts.map((contract) => (
                  <NFTCardSimple key={contract.contractId} contract={contract} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 페이지네이션 */}
        {!showSkeleton && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* 삭제 확인 모달 */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      {/* 공고 마감 확인 모달 */}
      {closeConfirmModalOpen && (
        <ConfirmModal
          title="공고 마감"
          message="정말 이 공고를 마감하시겠습니까?&#10;마감 후에는 되돌릴 수 없습니다."
          confirmText="마감하기"
          cancelText="취소"
          onConfirm={handleCloseConfirm}
          onCancel={handleCloseCancel}
          type="danger"
        />
      )}

      {/* 공고 마감 성공 모달 */}
      {closeSuccessModalOpen && (
        <ConfirmModal
          title="마감 완료"
          message="공고가 성공적으로 마감되었습니다."
          confirmText="확인"
          onConfirm={() => setCloseSuccessModalOpen(false)}
        />
      )}

      {/* 공고 마감 에러 모달 */}
      {closeErrorMessage && (
        <ConfirmModal
          title="마감 실패"
          message={closeErrorMessage}
          confirmText="확인"
          onConfirm={() => setCloseErrorMessage('')}
          type="danger"
        />
      )}
    </div>
  );
}

export default LeaderProjectList;

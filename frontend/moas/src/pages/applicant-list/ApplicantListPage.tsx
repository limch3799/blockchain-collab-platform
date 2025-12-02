/**
 * ApplicantListPage
 *
 * Description:
 * 리더가 프로젝트별 계약 현황을 확인하는 페이지
 * - 프로젝트 ID로 필터링된 포지션별 계약 현황 표시
 * - 상태별 통계 카드 (제안됨, 진행중, 거절/취소, 완료)
 * - 포지션별 계약 목록 확장/축소
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getProjectApplications } from '@/api/contract';
import { getProjectById, closeProjectPosition } from '@/api/project';
import type { ProjectApplicationItem } from '@/types/contract';

import defaultProfile from '@/assets/header/default_profile/default_profile_1.png';
import checkIcon from '@/assets/icons/check.svg';
import filterIcon from '@/assets/icons/filter.svg';
import hourglassIcon from '@/assets/icons/hourglass.svg';
import xMarkIcon from '@/assets/icons/x-mark.svg';

import { FilterModal } from '@/components/common/FilterModal';
import { ConfirmModal } from '@/components/common/ConfirmModal';

import { ApplicantCard } from './components/ApplicantCard';
import { PositionCard } from './components/PositionCard';
import { StatsCard } from './components/StatsCard';

interface Applicant {
  id: number;
  name: string;
  profileImage: string;
  rating: number;
  reviewCount: number;
  appliedDate: string;
  status: 'pending' | 'waiting' | 'rejected' | 'contracted';
  statusLabel: string;
  introduction: string;
  unreadMessageCount?: number;
  contractStatus?: string;
  contractId?: number;
  userId?: number;
  totalAmount?: number;
}

interface Position {
  id: number;
  category: string;
  position: string;
  status: 'recruiting' | 'closed';
  recruitCount: string;
  applicants: Applicant[];
}

interface ProjectData {
  id: number;
  name: string;
  positions: Position[];
}

function ApplicantListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');

  // 상태
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPositions, setExpandedPositions] = useState<number[]>([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [showNotImplementedModal, setShowNotImplementedModal] = useState(false);
  const [closeConfirmModalOpen, setCloseConfirmModalOpen] = useState(false);
  const [positionToClose, setPositionToClose] = useState<number | null>(null);
  const [closeSuccessModalOpen, setCloseSuccessModalOpen] = useState(false);
  const [closeErrorMessage, setCloseErrorMessage] = useState('');

  // applicationStatus를 UI 상태로 매핑 (통계 카드용)
  const mapApplicationStatusToUIStatus = (
    applicationStatus: string,
  ): 'pending' | 'waiting' | 'rejected' | 'contracted' => {
    switch (applicationStatus) {
      case 'PENDING':
        return 'pending'; // 미결정
      case 'OFFERED':
        return 'waiting'; // 협의중
      case 'REJECTED':
        return 'rejected'; // 거절
      case 'COMPLETED':
        return 'contracted'; // 계약완료
      default:
        return 'pending';
    }
  };

  // applicationStatus를 라벨로 변환
  const getApplicationStatusLabel = (applicationStatus: string): string => {
    switch (applicationStatus) {
      case 'PENDING':
        return '미결정';
      case 'OFFERED':
        return '협의중';
      case 'REJECTED':
        return '거절';
      case 'COMPLETED':
        return '계약완료';
      default:
        return '알 수 없음';
    }
  };

  // API 데이터 로드
  useEffect(() => {
    const loadContracts = async () => {
      if (!projectId) return;

      try {
        setIsLoading(true);
        setError(null);

        console.log('프로젝트 지원 목록 조회 시작:', projectId);

        // 프로젝트 상세 정보와 지원 목록을 동시에 조회
        const [projectInfo, applicationsResponse] = await Promise.all([
          getProjectById(Number(projectId)),
          getProjectApplications(Number(projectId)),
        ]);

        console.log('프로젝트 정보:', projectInfo);
        console.log('지원 목록:', applicationsResponse);

        // 포지션별로 그룹핑
        const positionMap = new Map<number, Position>();

        // 1. 먼저 지원 목록 API의 포지션 정보를 사용하여 초기화 (positionStatus 포함)
        applicationsResponse.positions.forEach((projectPosition) => {
          const mappedStatus = projectPosition.positionStatus === 'RECRUITING' ? 'recruiting' : 'closed';
          console.log('[ApplicantList] Position mapping:', {
            positionId: projectPosition.projectPositionId,
            positionName: projectPosition.positionName,
            apiStatus: projectPosition.positionStatus,
            mappedStatus,
          });
          positionMap.set(projectPosition.projectPositionId, {
            id: projectPosition.projectPositionId,
            category: projectPosition.categoryName,
            position: projectPosition.positionName,
            status: mappedStatus,
            recruitCount: '0/0',
            applicants: [],
          });
        });

        // 2. applications를 순회하면서 지원자 추가 및 상태 업데이트
        applicationsResponse.applications.forEach((application: ProjectApplicationItem) => {
          const positionId = application.position.projectPositionId;

          // 포지션이 이미 있으면 상태 업데이트, 없으면 새로 생성
          if (!positionMap.has(positionId)) {
            positionMap.set(positionId, {
              id: positionId,
              category: application.position.categoryName || '카테고리',
              position: application.position.positionName,
              status: application.position.positionStatus === 'RECRUITING' ? 'recruiting' : 'closed',
              recruitCount: '0/0',
              applicants: [],
            });
          }

          const position = positionMap.get(positionId)!;

          // 포지션 상태는 1단계에서 applicationsResponse.positions로 이미 설정됨
          // applications[].position에는 positionStatus 필드가 없으므로 여기서 업데이트하지 않음

          // applicationStatus를 기반으로 UI 상태 결정 (통계 카드용)
          const uiStatus = mapApplicationStatusToUIStatus(application.applicationStatus);
          const statusLabel = getApplicationStatusLabel(application.applicationStatus);

          position.applicants.push({
            id: application.applicationId,
            name: application.applicant.nickname,
            profileImage: application.applicant.profileImageUrl || defaultProfile,
            rating: application.applicant.averageRating,
            reviewCount: application.applicant.reviewCount,
            appliedDate: new Date(application.createdAt).toLocaleDateString('ko-KR'),
            status: uiStatus,
            statusLabel: statusLabel,
            introduction: application.message || '',
            contractStatus: application.contractStatus,
            contractId: application.contractId,
            userId: application.applicant.userId,
          });
        });

        // 포지션별 계약 수 업데이트
        positionMap.forEach((position) => {
          const total = position.applicants.length;
          const contracted = position.applicants.filter((a) => a.status === 'contracted').length;
          position.recruitCount = `${contracted}/${total}`;
        });

        setProjectData({
          id: Number(projectId),
          name: projectInfo.title,
          positions: Array.from(positionMap.values()),
        });

        // 첫 번째 포지션을 자동으로 확장
        if (positionMap.size > 0) {
          setExpandedPositions([Array.from(positionMap.keys())[0]]);
        }
      } catch (error: any) {
        console.error('계약 목록 조회 실패:', error);
        console.error('에러 상세:', error.response?.data);
        console.error('에러 상태:', error.response?.status);

        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          '계약 목록을 불러오는데 실패했습니다.';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadContracts();
  }, [projectId]);

  // 필터 옵션
  const STATUS_OPTIONS = ['전체', '미결정', '협의중', '거절', '계약완료'] as const;

  // 상태 매핑 (applicationStatus 기반)
  const STATUS_LABEL_MAP: Record<string, string> = {
    pending: '미결정',
    waiting: '협의중',
    rejected: '거절',
    contracted: '계약완료',
  };

  // 상태별 필터링
  const filteredPositions =
    projectData?.positions.map((position) => ({
      ...position,
      applicants: position.applicants.filter((applicant) => {
        if (selectedStatuses.length === 0 || selectedStatuses.includes('전체')) return true;
        const statusLabel = STATUS_LABEL_MAP[applicant.status];
        return selectedStatuses.includes(statusLabel);
      }),
    })) || [];

  // 총 계약 수 계산
  const totalApplicants = projectData?.positions.flatMap((p) => p.applicants).length || 0;

  // 통계 계산
  const stats = {
    pending:
      projectData?.positions.flatMap((p) => p.applicants).filter((a) => a.status === 'pending')
        .length || 0,
    waiting:
      projectData?.positions.flatMap((p) => p.applicants).filter((a) => a.status === 'waiting')
        .length || 0,
    rejected:
      projectData?.positions.flatMap((p) => p.applicants).filter((a) => a.status === 'rejected')
        .length || 0,
    contracted:
      projectData?.positions.flatMap((p) => p.applicants).filter((a) => a.status === 'contracted')
        .length || 0,
  };

  // 이벤트 핸들러
  const handleBack = () => {
    navigate(-1);
  };

  const handleTogglePosition = (positionId: number) => {
    setExpandedPositions((prev) =>
      prev.includes(positionId)
        ? prev.filter((id) => id !== positionId)
        : [...prev, positionId],
    );
  };

  const handleToggleFilter = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status],
    );
  };

  const handleApplyFilter = () => {
    setIsFilterModalOpen(false);
  };

  const handleCloseFilter = () => {
    setIsFilterModalOpen(false);
  };

  const handleCloseRecruit = (positionId: number) => {
    setPositionToClose(positionId);
    setCloseConfirmModalOpen(true);
  };

  // 포지션 마감 확인
  const handleClosePositionConfirm = async () => {
    if (positionToClose !== null && projectId) {
      try {
        await closeProjectPosition(Number(projectId), positionToClose);

        // 데이터 새로고침
        const [projectInfo, applicationsResponse] = await Promise.all([
          getProjectById(Number(projectId)),
          getProjectApplications(Number(projectId)),
        ]);

        // 포지션별로 그룹핑 (기존 로직 재사용)
        const positionMap = new Map<number, Position>();

        projectInfo.positions.forEach((projectPosition) => {
          positionMap.set(projectPosition.projectPositionId, {
            id: projectPosition.projectPositionId,
            category: projectPosition.categoryName,
            position: projectPosition.positionName,
            status: 'recruiting',
            recruitCount: '0/0',
            applicants: [],
          });
        });

        applicationsResponse.applications.forEach((application: ProjectApplicationItem) => {
          const posId = application.position.projectPositionId;

          if (!positionMap.has(posId)) {
            positionMap.set(posId, {
              id: posId,
              category: application.position.categoryName || '카테고리',
              position: application.position.positionName,
              status: application.position.positionStatus === 'RECRUITING' ? 'recruiting' : 'closed',
              recruitCount: '0/0',
              applicants: [],
            });
          }

          const position = positionMap.get(posId)!;
          position.status = application.position.positionStatus === 'RECRUITING' ? 'recruiting' : 'closed';

          const uiStatus = mapApplicationStatusToUIStatus(application.applicationStatus);
          const statusLabel = getApplicationStatusLabel(application.applicationStatus);

          position.applicants.push({
            id: application.applicationId,
            name: application.applicant.nickname,
            profileImage: application.applicant.profileImageUrl || defaultProfile,
            rating: application.applicant.averageRating,
            reviewCount: application.applicant.reviewCount,
            appliedDate: new Date(application.createdAt).toLocaleDateString('ko-KR'),
            status: uiStatus,
            statusLabel: statusLabel,
            introduction: application.message || '',
            contractStatus: application.contractStatus,
            contractId: application.contractId,
            userId: application.applicant.userId,
          });
        });

        positionMap.forEach((position) => {
          const total = position.applicants.length;
          const contracted = position.applicants.filter((a) => a.status === 'contracted').length;
          position.recruitCount = `${contracted}/${total}`;
        });

        setProjectData({
          id: Number(projectId),
          name: projectInfo.title,
          positions: Array.from(positionMap.values()),
        });

        setCloseSuccessModalOpen(true);
      } catch (error: any) {
        console.error('포지션 마감 실패:', error);

        let errorMessage = '포지션 마감에 실패했습니다.';

        if (error.response) {
          const { status } = error.response;

          switch (status) {
            case 400:
              errorMessage = '요청이 올바르지 않습니다. 입력 값을 다시 확인해주세요.';
              break;
            case 401:
              errorMessage = '인증이 필요합니다.';
              break;
            case 403:
              errorMessage = '프로젝트 소유자만 가능한 작업입니다.';
              break;
            case 404:
              errorMessage = '요청한 리소스를 찾을 수 없습니다.';
              break;
            case 409:
              errorMessage = '이미 마감된 포지션입니다.';
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
        setPositionToClose(null);
      }
    }
  };

  // 포지션 마감 취소
  const handleClosePositionCancel = () => {
    setCloseConfirmModalOpen(false);
    setPositionToClose(null);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-moas-main border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-lg font-bold text-moas-artist">에러가 발생했습니다</p>
        <p className="text-md text-moas-gray-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-lg bg-moas-main px-6 py-2 font-bold text-moas-text transition-opacity hover:opacity-90"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-moas-gray-6">프로젝트를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-[1200px] px-8 font-pretendard">
      {/* 헤더 */}
      <div className="mb-8 flex items-center gap-4">
        <button
          onClick={handleBack}
          className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-moas-gray-1"
        >
          <ArrowLeft className="h-6 w-6 text-moas-text" />
        </button>
        <h1 className="text-[32px] font-bold leading-none text-moas-text">{projectData.name}</h1>
      </div>

      {/* 통계 카드 */}
      <div className="mb-6 flex flex-nowrap items-center justify-center gap-6 rounded-2xl bg-white px-10 py-8 shadow-md">
        <StatsCard
          label="미결정"
          count={stats.pending}
          iconType="text"
          bgColor="bg-[#F5F5F5]"
          textColor="text-[#666666]"
        />

        <div className="h-16 w-0.5 shrink-0 self-center bg-moas-gray-3" />

        <StatsCard
          label="협의중"
          count={stats.waiting}
          iconType="image"
          iconSrc={hourglassIcon}
          bgColor="bg-[#E5F8FF]"
          textColor="text-[#47B8E0]"
        />

        <div className="h-16 w-0.5 shrink-0 self-center bg-moas-gray-3" />

        <StatsCard
          label="거절"
          count={stats.rejected}
          iconType="image"
          iconSrc={xMarkIcon}
          bgColor="bg-moas-error-bg"
          textColor="text-moas-artist"
        />

        <div className="h-16 w-0.5 shrink-0 self-center bg-moas-gray-3" />

        <StatsCard
          label="계약완료"
          count={stats.contracted}
          iconType="image"
          iconSrc={checkIcon}
          bgColor="bg-[#FFF9E6]"
          textColor="text-[#FEC713]"
        />
      </div>

      {/* 총 계약 수 & 필터 */}
      <div className="mb-4 flex items-center justify-between px-2">
        <p className="text-[16px] font-medium text-moas-gray-8">
          총 계약: <span className="font-bold text-moas-text">{totalApplicants}건</span>
        </p>
        <button
          onClick={() => setIsFilterModalOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-moas-gray-1"
        >
          <img src={filterIcon} alt="필터" className="h-5 w-5 object-contain" />
        </button>
      </div>

      {/* 포지션 리스트 */}
      <div className="space-y-4">
        {filteredPositions.map((position) => (
          <PositionCard
            key={position.id}
            position={position}
            isExpanded={expandedPositions.includes(position.id)}
            onToggle={() => handleTogglePosition(position.id)}
            onCloseRecruit={handleCloseRecruit}
          >
            {position.applicants.map((applicant) => (
              <ApplicantCard
                key={applicant.id}
                applicant={applicant}
                position={{
                  id: position.id,
                  category: position.category,
                  position: position.position
                }}
                projectId={Number(projectId)}
                projectTitle={projectData.name}
              />
            ))}
          </PositionCard>
        ))}
      </div>

      {/* 필터 모달 */}
      {isFilterModalOpen && (
        <FilterModal
          title="상태별 필터"
          options={STATUS_OPTIONS}
          selectedOptions={selectedStatuses}
          onToggle={handleToggleFilter}
          onClose={handleCloseFilter}
          onApply={handleApplyFilter}
        />
      )}

      {/* 포지션 마감 확인 모달 */}
      {closeConfirmModalOpen && (
        <ConfirmModal
          title="포지션 마감"
          message="정말 이 포지션 모집을 마감하시겠습니까?&#10;마감 후에는 되돌릴 수 없습니다."
          confirmText="마감하기"
          cancelText="취소"
          onConfirm={handleClosePositionConfirm}
          onCancel={handleClosePositionCancel}
          type="danger"
        />
      )}

      {/* 포지션 마감 성공 모달 */}
      {closeSuccessModalOpen && (
        <ConfirmModal
          title="마감 완료"
          message="포지션이 성공적으로 마감되었습니다."
          confirmText="확인"
          onConfirm={() => setCloseSuccessModalOpen(false)}
        />
      )}

      {/* 포지션 마감 에러 모달 */}
      {closeErrorMessage && (
        <ConfirmModal
          title="마감 실패"
          message={closeErrorMessage}
          confirmText="확인"
          onConfirm={() => setCloseErrorMessage('')}
          type="danger"
        />
      )}

      {/* 미구현 기능 모달 */}
      {showNotImplementedModal && (
        <ConfirmModal
          title="알림"
          message="아직 구현중인 기능입니다."
          confirmText="확인"
          onConfirm={() => setShowNotImplementedModal(false)}
        />
      )}
    </div>
  );
}

export default ApplicantListPage;

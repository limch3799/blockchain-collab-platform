/**
 * LeaderSidebar Component
 *
 * Props:
 * - activeFilter (string): 현재 활성화된 필터
 * - onFilterChange (function): 필터 변경 콜백
 *
 * Description:
 * 리더 프로젝트 관리 페이지의 좌측 사이드바 컴포넌트
 */

import { useNavigate, useLocation } from 'react-router-dom';

type FilterType = 'all' | 'recruiting' | 'closed';
type ContractFilterType = 'all' | 'BEFORE_START' | 'IN_PROGRESS' | 'COMPLETED';

interface LeaderSidebarProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  contractFilter?: ContractFilterType;
  onContractFilterChange?: (filter: ContractFilterType) => void;
}

export function LeaderSidebar({
  activeFilter,
  onFilterChange,
  contractFilter = 'all',
  onContractFilterChange,
}: LeaderSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isContractPage =
    location.pathname.includes('/contract-list') || location.pathname.includes('/contract/');
  const isProjectPage = location.pathname.includes('/leader-project-list');

  return (
    <aside className="w-60 shrink-0 border-r border-moas-gray-2 px-6 py-12">
      {/* 내 프로젝트 타이틀 */}
      <h1 className="mb-12 font-pretendard text-2xl font-medium leading-none text-moas-black">
        내 프로젝트
      </h1>

      {/* 전체 공고 섹션 */}
      <div className="mb-6">
        <h2
          onClick={() => {
            navigate('/leader-project-list');
            onFilterChange('all');
          }}
          className={`mb-4 cursor-pointer font-pretendard text-xl font-bold leading-none transition-colors hover:text-moas-main ${
            isProjectPage && activeFilter === 'all' ? 'text-moas-main' : 'text-moas-black'
          }`}
        >
          전체 공고
        </h2>
        <div className="space-y-3">
          <button
            onClick={() => {
              navigate('/leader-project-list');
              onFilterChange('recruiting');
            }}
            className={`block font-pretendard text-base font-medium leading-none transition-colors ${
              isProjectPage && activeFilter === 'recruiting'
                ? 'text-moas-main'
                : 'text-moas-gray-7 hover:text-moas-black'
            }`}
          >
            모집 중 공고
          </button>
          <button
            onClick={() => {
              navigate('/leader-project-list');
              onFilterChange('closed');
            }}
            className={`block font-pretendard text-base font-medium leading-none transition-colors ${
              isProjectPage && activeFilter === 'closed'
                ? 'text-moas-main'
                : 'text-moas-gray-7 hover:text-moas-black'
            }`}
          >
            마감된 공고
          </button>
          <button
            onClick={() => navigate('/leader-project-post')}
            className="block font-pretendard text-base font-medium leading-none text-moas-gray-7 transition-colors hover:text-moas-black"
          >
            새 공고 등록
          </button>
        </div>
      </div>

      {/* 구분선 */}
      <div className="my-6 h-px w-full bg-moas-gray-2" />

      {/* 전체 계약 섹션 */}
      <div>
        <h2
          onClick={() => {
            navigate('/contract-list');
            onContractFilterChange?.('all');
          }}
          className={`mb-4 cursor-pointer font-pretendard text-xl font-bold leading-none transition-colors hover:text-moas-main ${
            isContractPage && contractFilter === 'all' ? 'text-moas-main' : 'text-moas-black'
          }`}
        >
          전체 계약
        </h2>
        <div className="space-y-3">
          <button
            onClick={() => {
              navigate('/contract-list');
              onContractFilterChange?.('BEFORE_START');
            }}
            className={`block font-pretendard text-base font-medium leading-none transition-colors ${
              isContractPage && contractFilter === 'BEFORE_START'
                ? 'text-moas-main'
                : 'text-moas-gray-7 hover:text-moas-black'
            }`}
          >
            진행 전 계약
          </button>
          <button
            onClick={() => {
              navigate('/contract-list');
              onContractFilterChange?.('IN_PROGRESS');
            }}
            className={`block font-pretendard text-base font-medium leading-none transition-colors ${
              isContractPage && contractFilter === 'IN_PROGRESS'
                ? 'text-moas-main'
                : 'text-moas-gray-7 hover:text-moas-black'
            }`}
          >
            진행중 계약
          </button>
          <button
            onClick={() => {
              navigate('/contract-list');
              onContractFilterChange?.('COMPLETED');
            }}
            className={`block font-pretendard text-base font-medium leading-none transition-colors ${
              isContractPage && contractFilter === 'COMPLETED'
                ? 'text-moas-main'
                : 'text-moas-gray-7 hover:text-moas-black'
            }`}
          >
            완료된 계약
          </button>
        </div>
      </div>
    </aside>
  );
}

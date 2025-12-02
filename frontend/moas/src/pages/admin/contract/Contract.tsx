// src/pages/admin/contract/Contract.tsx
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AllContracts } from './components/AllContracts';
import { SearchContracts } from './components/SearchContracts';
import { ContractStatistics } from './components/ContractStatistics';
import { getContractList } from '@/api/admin/contract';

type TabType = 'all' | 'search' | 'statistics';

// 계약 상태 필터 타입 정의
type StatusFilterType = 'all' | 'in_progress' | 'completed' | 'cancellation' | undefined;

export const Contract = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [hasCancellationRequests, setHasCancellationRequests] = useState(false);

  // ⭐ 오류 수정 부분:
  // 1. 타입을 useState<StatusFilterType>처럼 꺾쇠 안에 명확하게 지정합니다.
  // 2. 초기값 (undefined)는 useState() 괄호 안에 넣습니다.
  const [initialStatusFilter, setInitialStatusFilter] = useState<StatusFilterType>(undefined);

  useEffect(() => {
    checkCancellationRequests();

    // 대시보드에서 전달된 상태 확인
    if (location.state?.statusFilter) {
      setInitialStatusFilter(location.state.statusFilter);
      // state 초기화
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const checkCancellationRequests = async () => {
    try {
      const data = await getContractList(1, 1, 'CANCELLATION_REQUESTED');
      setHasCancellationRequests(data.content.length > 0);
    } catch (err) {
      console.error('취소 요청 확인 실패:', err);
    }
  };

  const tabs = [
    { id: 'all' as TabType, label: '전체 계약' },
    { id: 'search' as TabType, label: '계약 검색' },
    { id: 'statistics' as TabType, label: '통계' },
  ];

  return (
    <div className="p-8 font-pretendard">
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'bg-moas-navy2 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'all' && (
        <AllContracts
          hasCancellationRequests={hasCancellationRequests}
          initialStatusFilter={initialStatusFilter}
        />
      )}
      {activeTab === 'search' && <SearchContracts />}
      {activeTab === 'statistics' && <ContractStatistics />}
    </div>
  );
};

// src/pages/admin/user/Users.tsx
import { useState } from 'react';
import { AllMembers } from './components/AllMembers';
import { SearchMembers } from './components/SearchMembers';
import { MemberStatistics } from './components/MemberStatistics';

type TabType = 'all' | 'search' | 'statistics';

export const Users = () => {
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const tabs = [
    { id: 'all' as TabType, label: '전체 회원' },
    { id: 'search' as TabType, label: '회원 검색' },
    { id: 'statistics' as TabType, label: '통계' },
  ];

  return (
    <div className="p-8 font-pretendard">
      {/* <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">사용자 관리</h1>
      </div> */}

      {/* 탭 메뉴 */}
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

      {/* 탭 컨텐츠 */}
      {activeTab === 'all' && <AllMembers />}
      {activeTab === 'search' && <SearchMembers />}
      {activeTab === 'statistics' && <MemberStatistics />}
    </div>
  );
};

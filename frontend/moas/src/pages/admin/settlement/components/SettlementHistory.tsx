// src/pages/admin/settlement/components/SettlementHistory.tsx
import { useState } from 'react';
import { AllSettlements } from './AllSettlements';
import { SearchSettlements } from './SearchSettlements';

type SubTabType = 'all' | 'search';

export const SettlementHistory = () => {
  const [activeSubTab, setActiveSubTab] = useState<SubTabType>('all');

  const subTabs = [
    { id: 'all' as SubTabType, label: '정산 내역 조회' },
    { id: 'search' as SubTabType, label: '정산 내역 검색' },
  ];

  return (
    <div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-4">
          {subTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                activeSubTab === tab.id
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeSubTab === 'all' && <AllSettlements />}
      {activeSubTab === 'search' && <SearchSettlements />}
    </div>
  );
};

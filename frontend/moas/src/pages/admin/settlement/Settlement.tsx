// src/pages/admin/settlement/Settlement.tsx
import { useState } from 'react';
import { FeeManagement } from './components/FeeManagement';
import { SettlementHistory } from './components/SettlementHistory';

type TabType = 'fee' | 'history';

export const Settlement = () => {
  const [activeTab, setActiveTab] = useState<TabType>('history');

  const tabs = [
    { id: 'history' as TabType, label: '정산 내역' },
    { id: 'fee' as TabType, label: '수수료 관리' },
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

      {activeTab === 'fee' && <FeeManagement />}
      {activeTab === 'history' && <SettlementHistory />}
    </div>
  );
};

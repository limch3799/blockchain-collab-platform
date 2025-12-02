// src/pages/admin/inquiry/components/InquiryHeader.tsx
import { useState } from 'react';
import { Search } from 'lucide-react';

type TabType = 'all' | 'pending' | 'answered';
type CategoryType = 'all' | 'MEMBER' | 'CONTRACT' | 'PAYMENT' | 'OTHERS';

interface InquiryHeaderProps {
  activeTab: TabType;
  activeCategory: CategoryType;
  onTabChange: (tab: TabType) => void;
  onCategoryChange: (category: CategoryType) => void;
  onSearch: (keyword: string) => void;
  counts: {
    all: number;
    pending: number;
    answered: number;
  };
}

export const InquiryHeader = ({
  activeTab,
  activeCategory,
  onTabChange,
  onCategoryChange,
  onSearch,
  counts,
}: InquiryHeaderProps) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchInput);
  };

  const tabs = [
    { id: 'all' as TabType, label: '전체', count: counts.all },
    { id: 'pending' as TabType, label: '답변 대기중', count: counts.pending },
    { id: 'answered' as TabType, label: '답변 완료', count: counts.answered },
  ];

  const categories = [
    { id: 'all' as CategoryType, label: '전체 유형' },
    { id: 'MEMBER' as CategoryType, label: '사용자관리' },
    { id: 'CONTRACT' as CategoryType, label: '계약관리' },
    { id: 'PAYMENT' as CategoryType, label: '정산관리' },
    { id: 'OTHERS' as CategoryType, label: '기타' },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      {/* 상태 탭 */}
      <div className="flex items-center gap-4 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === tab.id
                ? 'bg-moas-navy2 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* 카테고리 필터 */}
      <div className="flex items-center gap-3 mb-6">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`px-4 py-1.5 rounded-3xl text-sm font-medium transition-colors ${
              activeCategory === category.id
                ? 'bg-gray-800 text-white'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* 검색창 */}
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="제목 또는 내용으로 검색"
          className="w-full pl-4 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-600 hover:text-blue-600"
        >
          <Search className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

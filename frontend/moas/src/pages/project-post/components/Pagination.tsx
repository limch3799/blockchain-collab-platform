// src/pages/project-post/components/ResultHeader.tsx
import type { SortOption } from '../ProjectPostMain';

interface ResultHeaderProps {
  totalCount: number;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export function ResultHeader({ totalCount, sortBy, onSortChange }: ResultHeaderProps) {
  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'popular', label: '인기순' },
    { value: 'latest', label: '등록순' },
    { value: 'startDate', label: '시작일순' },
    { value: 'reward', label: '금액순' },
  ];

  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-semibold text-moas-text">
        총 <span className="text-moas-main">{totalCount.toLocaleString()}</span>개의 프로젝트
      </h2>

      <div className="flex items-center gap-2">
        {sortOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onSortChange(option.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              sortBy === option.value
                ? 'bg-moas-main text-moas-text'
                : 'bg-moas-gray-1 text-moas-gray-7 hover:bg-moas-gray-2'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

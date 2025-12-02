// src/pages/project-post/components/ResultHeader.tsx
import type { SortOption } from '../ProjectPostMain';

interface ResultHeaderProps {
  totalCount: number;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export function ResultHeader({ totalCount, sortBy, onSortChange }: ResultHeaderProps) {
  return (
    <div className="flex items-end justify-between py-6 font-pretendard">
      <h2 className="text-2xl font-semibold text-moas-text text-moas-text">
        검색 결과 <span className="text-moas-main">{totalCount}</span>건
      </h2>
      <div className="flex gap-4">
        <button
          onClick={() => onSortChange('popular')}
          className={`text-sm font-medium transition-colors ${
            sortBy === 'popular' ? 'text-moas-text' : 'text-moas-gray-5 hover:text-moas-text'
          }`}
        >
          인기순
        </button>
        <button
          onClick={() => onSortChange('latest')}
          className={`text-sm font-medium transition-colors ${
            sortBy === 'latest' ? 'text-moas-text' : 'text-moas-gray-5 hover:text-moas-text'
          }`}
        >
          등록순
        </button>
        <button
          onClick={() => onSortChange('startDate')}
          className={`text-sm font-medium transition-colors ${
            sortBy === 'startDate' ? 'text-moas-text' : 'text-moas-gray-5 hover:text-moas-text'
          }`}
        >
          시작일순
        </button>
        <button
          onClick={() => onSortChange('reward')}
          className={`text-sm font-medium transition-colors ${
            sortBy === 'reward' ? 'text-moas-text' : 'text-moas-gray-5 hover:text-moas-text'
          }`}
        >
          금액순
        </button>
      </div>
    </div>
  );
}

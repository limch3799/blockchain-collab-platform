// src/pages/project-post/components/FilterButtons.tsx

interface FilterButtonsProps {
  onSearch: () => void;
  onReset: () => void;
}

export function FilterButtons({ onSearch, onReset }: FilterButtonsProps) {
  return (
    <div className="flex gap-3 justify-end font-pretendard font-medium">
      <button
        onClick={onReset}
        className="px-4 py-2 rounded-lg border border-moas-gray-3 text-moas-gray-7 font-medium hover:bg-moas-gray-1 transition-colors"
      >
        초기화
      </button>
      <button
        onClick={onSearch}
        className="px-6 py-2 rounded-lg bg-moas-main text-moas-text font-medium hover:opacity-90 transition-opacity"
      >
        검색
      </button>
    </div>
  );
}

// src/pages/artist-project-list/components/FilterButton.tsx

interface FilterButtonProps {
  label: string;
  count?: number;
  isActive: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export function FilterButton({ label, count, isActive, onClick }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-full px-3 py-1.5 font-semibold text-[14px] transition-all duration-200 font-pretendard  ${
        isActive
          ? 'bg-moas-main text-moas-text'
          : 'bg-moas-gray-1 text-moas-gray-6 hover:bg-moas-gray-2 '
      }`}
    >
      {label}
      {count !== undefined && (
        <span
          className={`rounded-full px-2.5 py-0.5 text-[12px] font-bold transition-colors ${
            isActive ? 'bg-white text-moas-text' : 'bg-moas-gray-3 text-moas-gray-6'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

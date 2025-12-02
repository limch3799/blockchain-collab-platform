// src/pages/admin/contract/components/ContractListHeader.tsx
type StatusFilter = 'all' | 'in_progress' | 'completed' | 'cancellation';

interface ContractListHeaderProps {
  statusFilter: StatusFilter;
  hasCancellationRequests: boolean;
  onStatusFilterChange: (filter: StatusFilter) => void;
}

export const ContractListHeader = ({
  statusFilter,
  hasCancellationRequests,
  onStatusFilterChange,
}: ContractListHeaderProps) => {
  const filters = [
    { value: 'all' as StatusFilter, label: '전체', color: 'bg-gray-800 text-white' },
    {
      value: 'in_progress' as StatusFilter,
      label: '진행 중',
      color: 'bg-gray-800 text-white',
    },
    { value: 'completed' as StatusFilter, label: '완료', color: 'bg-gray-800 text-white' },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between gap-3">
        {/* 왼쪽: 전체, 진행 중, 완료 */}
        <div className="flex items-center gap-3">
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => onStatusFilterChange(filter.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === filter.value
                  ? filter.color
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* 오른쪽: 취소 요청 */}
        <div className="relative">
          <button
            onClick={() => onStatusFilterChange('cancellation')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'cancellation'
                ? 'bg-red-600 text-white'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            취소 요청
          </button>
          {hasCancellationRequests && (
            <div className="absolute -top-2 -right-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
              </span>
            </div>
          )}
        </div>
      </div>

      {hasCancellationRequests && (
        <div className="mt-4 flex items-center justify-end gap-2">
          <div className="animate-bounce">
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <p className="text-sm font-semibold text-red-600 animate-pulse">
            새 취소 요청이 있습니다
          </p>
        </div>
      )}
    </div>
  );
};

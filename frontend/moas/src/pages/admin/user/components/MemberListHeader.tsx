// src/pages/admin/user/components/MemberListHeader.tsx
type RoleFilter = 'all' | 'LEADER' | 'ARTIST';

interface MemberListHeaderProps {
  roleFilter: RoleFilter;
  onRoleFilterChange: (filter: RoleFilter) => void;
}

export const MemberListHeader = ({ roleFilter, onRoleFilterChange }: MemberListHeaderProps) => {
  const roleFilters = [
    { value: 'all' as RoleFilter, label: '전체' },
    { value: 'LEADER' as RoleFilter, label: '리더' },
    { value: 'ARTIST' as RoleFilter, label: '아티스트' },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between">
        {/* 역할 필터 */}
        <div className="flex items-center gap-3">
          {roleFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => onRoleFilterChange(filter.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                roleFilter === filter.value
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

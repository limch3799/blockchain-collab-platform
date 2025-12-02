// src/pages/admin/user/components/AllMembers.tsx
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { getMemberList } from '@/api/admin/member';
import type { MemberListItem } from '@/api/admin/member';
import { MemberListHeader } from './MemberListHeader';
import { MemberList } from './MemberList';
import { MemberDetailModal } from './MemberDetailModal';
import { Pagination } from '../../components/Pagination';

type RoleFilter = 'all' | 'LEADER' | 'ARTIST';

export const AllMembers = () => {
  const [members, setMembers] = useState<MemberListItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);

  const pageSize = 20;

  useEffect(() => {
    loadMembers();
  }, [currentPage, roleFilter]);

  const loadMembers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const role = roleFilter === 'all' ? undefined : roleFilter;

      // 가입일자 높은 순으로 정렬 (desc)
      const data = await getMemberList(currentPage, pageSize, role, undefined, 'desc');

      setMembers(data.content);
      setTotalPages(data.pageInfo.totalPages);
    } catch (err) {
      setError('회원 목록을 불러오는데 실패했습니다.');
      console.error('회원 목록 로드 실패:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMemberClick = (memberId: number) => {
    setSelectedMemberId(memberId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">회원 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <>
      <div>
        <MemberListHeader
          roleFilter={roleFilter}
          onRoleFilterChange={(role) => {
            setRoleFilter(role);
            setCurrentPage(1);
          }}
        />

        <MemberList
          members={members}
          currentPage={currentPage}
          pageSize={pageSize}
          onMemberClick={handleMemberClick}
        />

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {selectedMemberId && (
        <MemberDetailModal memberId={selectedMemberId} onClose={() => setSelectedMemberId(null)} />
      )}
    </>
  );
};

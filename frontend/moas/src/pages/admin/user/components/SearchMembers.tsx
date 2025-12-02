// src/pages/admin/user/components/SearchMembers.tsx
import { useState } from 'react';
import { Loader2, Search } from 'lucide-react';
import { getMemberList } from '@/api/admin/member';
import type { MemberListItem } from '@/api/admin/member';
import { MemberList } from './MemberList';
import { MemberDetailModal } from './MemberDetailModal';
import { Pagination } from '../../components/Pagination';

type RoleFilter = 'all' | 'LEADER' | 'ARTIST';

export const SearchMembers = () => {
  const [keyword, setKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [members, setMembers] = useState<MemberListItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);

  const pageSize = 20;

  const handleSearch = async () => {
    if (!keyword.trim()) {
      setError('검색어를 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setHasSearched(true);
      setCurrentPage(1);

      const role = roleFilter === 'all' ? undefined : roleFilter;
      const data = await getMemberList(1, pageSize, role, keyword.trim());

      setMembers(data.content);
      setTotalPages(data.pageInfo.totalPages);
    } catch (err) {
      setError('회원 검색에 실패했습니다.');
      console.error('회원 검색 실패:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMemberClick = (memberId: number) => {
    setSelectedMemberId(memberId);
  };

  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
    try {
      setIsLoading(true);
      setError(null);

      const role = roleFilter === 'all' ? undefined : roleFilter;
      const data = await getMemberList(page, pageSize, role, keyword.trim());

      setMembers(data.content);
    } catch (err) {
      setError('회원 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">회원 검색</h3>

          {/* 역할 필터 */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">회원 역할</label>
            <div className="flex items-center gap-4">
              {[
                { value: 'all' as RoleFilter, label: '전체' },
                { value: 'LEADER' as RoleFilter, label: '리더' },
                { value: 'ARTIST' as RoleFilter, label: '아티스트' },
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value={option.value}
                    checked={roleFilter === option.value}
                    onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 검색 입력 */}
          <div className="flex gap-2">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="회원 닉네임을 입력하세요"
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
            />
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              검색
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* 검색 결과 */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">검색 중...</p>
            </div>
          </div>
        ) : hasSearched ? (
          <>
            {members.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-20 text-center">
                <p className="text-gray-600">검색 결과가 없습니다.</p>
              </div>
            ) : (
              <>
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
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}
          </>
        ) : null}
      </div>

      {selectedMemberId && (
        <MemberDetailModal memberId={selectedMemberId} onClose={() => setSelectedMemberId(null)} />
      )}
    </>
  );
};

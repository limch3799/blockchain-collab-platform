// src/pages/admin/projectPost/components/SearchProjects.tsx
import { useState } from 'react';
import { Loader2, Search } from 'lucide-react';
import { getLeaderProjects, type LeaderProject } from '@/api/admin/project';
import { ProjectList } from './ProjectList';
import { ProjectDetailModal } from './ProjectDetailModal';
import { Pagination } from '../../components/Pagination';

type SearchType = 'memberId' | 'keyword';

export const SearchProjects = () => {
  const [searchType, setSearchType] = useState<SearchType>('keyword');
  const [keyword, setKeyword] = useState('');
  const [projects, setProjects] = useState<LeaderProject[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  const handleSearch = async () => {
    if (!keyword.trim()) {
      setError('검색어를 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setHasSearched(true);

      const params: any = {
        page: 0,
        size: 20,
      };

      if (searchType === 'memberId') {
        params.memberId = parseInt(keyword.trim());
      } else {
        params.keyword = keyword.trim();
      }

      const data = await getLeaderProjects(params);
      setProjects(data.content);
      setCurrentPage(1);
      setTotalPages(data.pageInfo.totalPages);
    } catch (err) {
      setError('프로젝트 검색에 실패했습니다.');
      console.error('프로젝트 검색 실패:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectClick = (projectId: number) => {
    setSelectedProjectId(projectId);
  };

  const handlePageChange = async (page: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const params: any = {
        page: page - 1,
        size: 20,
      };

      if (searchType === 'memberId') {
        params.memberId = parseInt(keyword.trim());
      } else {
        params.keyword = keyword.trim();
      }

      const data = await getLeaderProjects(params);
      setProjects(data.content);
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError('프로젝트 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = () => {
    handleSearch();
  };

  return (
    <>
      <div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">프로젝트 검색</h3>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">검색 유형</label>
            <div className="flex items-center gap-4">
              {[
                { value: 'keyword' as const, label: '프로젝트 제목' },
                { value: 'memberId' as const, label: '회원 ID' },
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="searchType"
                    value={option.value}
                    checked={searchType === option.value}
                    onChange={(e) => setSearchType(e.target.value as SearchType)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type={searchType === 'memberId' ? 'number' : 'text'}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={
                searchType === 'memberId' ? '회원 ID를 입력하세요' : '프로젝트 제목을 입력하세요'
              }
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

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">검색 중...</p>
            </div>
          </div>
        ) : hasSearched ? (
          <>
            {projects.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-20 text-center">
                <p className="text-gray-600">검색 결과가 없습니다.</p>
              </div>
            ) : (
              <>
                <ProjectList projects={projects} onProjectClick={handleProjectClick} />
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

      {selectedProjectId && (
        <ProjectDetailModal
          projectId={selectedProjectId}
          onClose={() => setSelectedProjectId(null)}
          onUpdate={handleUpdate}
        />
      )}
    </>
  );
};

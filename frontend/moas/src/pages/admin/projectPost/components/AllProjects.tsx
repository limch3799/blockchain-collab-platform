// src/pages/admin/projectPost/components/AllProjects.tsx
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { getLeaderProjects, type LeaderProject } from '@/api/admin/project';
import { ProjectList } from './ProjectList';
import { ProjectDetailModal } from './ProjectDetailModal';
import { Pagination } from '../../components/Pagination';

export const AllProjects = () => {
  const [projects, setProjects] = useState<LeaderProject[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  useEffect(() => {
    fetchProjects(currentPage);
  }, []);

  const fetchProjects = async (page: number) => {
    try {
      setIsLoading(true);
      const data = await getLeaderProjects({
        page: page - 1,
        size: 20,
      });
      setProjects(data.content);
      setCurrentPage(page);
      setTotalPages(data.pageInfo.totalPages);
    } catch (err) {
      console.error('프로젝트 목록 조회 실패:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectClick = (projectId: number) => {
    setSelectedProjectId(projectId);
  };

  const handlePageChange = (page: number) => {
    fetchProjects(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdate = () => {
    fetchProjects(currentPage);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ProjectList projects={projects} onProjectClick={handleProjectClick} />

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

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

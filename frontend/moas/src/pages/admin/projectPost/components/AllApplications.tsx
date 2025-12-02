// src/pages/admin/projectPost/components/AllApplications.tsx
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { getArtistApplications, type ArtistApplication } from '@/api/admin/project';
import { ApplicationList } from './ApplicationList';
import { ApplicationDetailModal } from './ApplicationDetailModal';
import { Pagination } from '../../components/Pagination';

export const AllApplications = () => {
  const [applications, setApplications] = useState<ArtistApplication[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<ArtistApplication | null>(null);

  useEffect(() => {
    fetchApplications(currentPage);
  }, []);

  const fetchApplications = async (page: number) => {
    try {
      setIsLoading(true);
      const data = await getArtistApplications({
        page: page - 1,
        size: 20,
      });
      setApplications(data.content);
      setCurrentPage(page);
      setTotalPages(data.pageInfo.totalPages);
    } catch (err) {
      console.error('지원 목록 조회 실패:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplicationClick = (application: ArtistApplication) => {
    setSelectedApplication(application);
  };

  const handlePageChange = (page: number) => {
    fetchApplications(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      <ApplicationList applications={applications} onApplicationClick={handleApplicationClick} />

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {selectedApplication && (
        <ApplicationDetailModal
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
        />
      )}
    </>
  );
};

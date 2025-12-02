// src/pages/portfolio/my-portfolio/MyPortfolio.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { PortfolioGuide } from './components/PortfolioGuide';
import { PortfolioListHeader } from './components/PortfolioListHeader';
import { PortfolioList } from './components/PortfolioList';
import { getMyPortfolios, deletePortfolio } from '@/api/portfolio';
import type { MyPortfolioItem } from '@/types/portfolio';

function MyPortfolio() {
  const navigate = useNavigate();
  const [portfolios, setPortfolios] = useState<MyPortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPortfolios();
  }, []);

  const loadPortfolios = async () => {
    try {
      setIsLoading(true);

      const [response] = await Promise.all([
        getMyPortfolios(),
        new Promise((resolve) => setTimeout(resolve, 1000)),
      ]);

      setPortfolios(response.data || []);
    } catch (error) {
      console.error('포트폴리오 목록 조회 실패:', error);
      setPortfolios([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWrite = () => {
    navigate('/write-portfolio');
  };

  const handleEdit = (id: number) => {
    navigate(`/write-portfolio/${id}`);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      await deletePortfolio(id);
      setPortfolios((prev) => prev.filter((p) => p.portfolioId !== id));
      alert('삭제되었습니다.');
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen">
      <PageHeader
        title="나의 포트폴리오"
        description="작업물을 공유하고 나만의 포트폴리오를 만들어보세요"
      />

      <div className="mt-4">
        <PortfolioGuide />
      </div>

      <div className="h-6"></div>

      <div className="mt-8">
        <PortfolioListHeader />
        <PortfolioList
          portfolios={portfolios}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onWrite={handleWrite}
        />
      </div>

      <div className="h-24"></div>
    </div>
  );
}

export default MyPortfolio;

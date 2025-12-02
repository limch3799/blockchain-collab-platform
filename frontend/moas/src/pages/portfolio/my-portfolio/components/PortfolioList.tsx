// src/pages/portfolio/my-portfolio/components/PortfolioList.tsx
import { useState } from 'react';
import { PortfolioCard } from './PortfolioCard';
import { PortfolioWriteCard } from './PortfolioWriteCard';
import { PortfolioSkeletonCard } from './PortfolioSkeletonCard';
import { EmptyPortfolioState } from './EmptyPortfolioState';
import { PortfolioDetailModal } from '@/pages/portfolio/portfolio-detail/PortfolioDetailModal';
import type { MyPortfolioItem } from '@/types/portfolio';

interface PortfolioListProps {
  portfolios: MyPortfolioItem[];
  isLoading: boolean;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onWrite: () => void;
}

export function PortfolioList({
  portfolios,
  isLoading,
  onEdit,
  onDelete,
  onWrite,
}: PortfolioListProps) {
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<number | null>(null);

  const handleCardClick = (id: number) => {
    setSelectedPortfolioId(id);
  };

  const handleCloseModal = () => {
    setSelectedPortfolioId(null);
  };

  const handleWriteClick = () => {
    if (portfolios.length >= 10) {
      alert('포트폴리오는 10개까지 등록 가능합니다.');
      return;
    }
    onWrite();
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-0">
        {[...Array(8)].map((_, index) => (
          <PortfolioSkeletonCard key={index} />
        ))}
      </div>
    );
  }

  if (portfolios.length === 0) {
    return <EmptyPortfolioState onWrite={onWrite} />;
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-0">
        {/* 포트폴리오 작성 카드를 맨 앞에 배치 */}
        <PortfolioWriteCard onWrite={handleWriteClick} totalCount={portfolios.length} />

        {portfolios.map((portfolio) => (
          <PortfolioCard
            key={portfolio.portfolioId}
            id={portfolio.portfolioId}
            image={portfolio.thumbnailImageUrl}
            title={portfolio.title}
            positionId={portfolio.positionId}
            positionName={portfolio.positionName}
            createdAt={portfolio.createdAt}
            onEdit={onEdit}
            onDelete={onDelete}
            onClick={handleCardClick}
          />
        ))}
      </div>

      {selectedPortfolioId && (
        <PortfolioDetailModal
          isOpen={!!selectedPortfolioId}
          onClose={handleCloseModal}
          portfolioId={selectedPortfolioId}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    </>
  );
}

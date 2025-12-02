/**
 * ArtistPortfolioModal Component
 */

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { PortfolioDetailModal } from '@/pages/portfolio/portfolio-detail/PortfolioDetailModal';
import { getApplicationDetail } from '@/api/apply';

interface PortfolioItem {
  portfolioId: number;
  positionName: string;
  title: string;
  thumbnailUrl: string;
}

interface ArtistPortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: number;
  artistName: string;
}

export function ArtistPortfolioModal({
  isOpen,
  onClose,
  applicationId,
  artistName,
}: ArtistPortfolioModalProps) {
  const [portfolio, setPortfolio] = useState<PortfolioItem | null>(null);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && applicationId) {
      loadPortfolio();
    }
  }, [isOpen, applicationId]);

  const loadPortfolio = async () => {
    try {
      setIsLoading(true);
      const data = await getApplicationDetail(applicationId);

      if (data.portfolio) {
        setPortfolio({
          portfolioId: data.portfolio.portfolioId,
          positionName: data.portfolio.positionName,
          title: data.portfolio.title,
          thumbnailUrl: data.portfolio.thumbnailImageUrl,
        });
      }
    } catch (error) {
      console.error('포트폴리오 조회 실패:', error);
      alert('포트폴리오를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePortfolioClick = (portfolioId: number) => {
    setSelectedPortfolioId(portfolioId);
  };

  const handleCloseDetail = () => {
    setSelectedPortfolioId(null);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 font-pretendard">
        <div className="w-[90vw] max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-xl">
          {/* 헤더 */}
          <div className="flex items-center justify-between border-b border-moas-gray-3 p-6">
            <div>
              <h2 className="text-2xl font-bold text-moas-text">{artistName}님의 포트폴리오</h2>
              <p className="mt-1 text-sm text-moas-gray-6">
                {portfolio ? '제출된 포트폴리오' : '포트폴리오 없음'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="ml-4 text-moas-gray-6 transition-colors hover:text-moas-text"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* 본문 */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <p className="text-lg text-moas-gray-6">로딩 중...</p>
              </div>
            ) : !portfolio ? (
              <div className="flex flex-col items-center justify-center py-20">
                <p className="text-lg text-moas-gray-6">등록된 포트폴리오가 없습니다.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div
                  onClick={() => handlePortfolioClick(portfolio.portfolioId)}
                  className="group cursor-pointer overflow-hidden rounded-lg border border-moas-gray-3 bg-white transition-all hover:shadow-lg"
                >
                  {/* 썸네일 */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-moas-gray-1">
                    <img
                      src={portfolio.thumbnailUrl}
                      alt={portfolio.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>

                  {/* 정보 */}
                  <div className="p-4">
                    <div className="mb-2">
                      <span className="rounded-full bg-moas-main px-3 py-1 text-xs font-medium text-moas-text">
                        {portfolio.positionName}
                      </span>
                    </div>
                    <h3 className="line-clamp-2 text-base font-bold text-moas-text">
                      {portfolio.title}
                    </h3>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 포트폴리오 상세 모달 */}
      {selectedPortfolioId && (
        <PortfolioDetailModal
          isOpen={true}
          onClose={handleCloseDetail}
          portfolioId={selectedPortfolioId}
          isReadOnly={true}
        />
      )}
    </>
  );
}

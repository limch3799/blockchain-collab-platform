// src/pages/project-apply/components/PortfolioSelection.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Calendar, AlertCircle, ArrowRight } from 'lucide-react';
import { PortfolioSelectModal } from './PortfolioSelectModal';
import type { MyPortfolioItem } from '@/types/portfolio';

interface PortfolioSelectionProps {
  selectedPortfolio: MyPortfolioItem | null;
  onPortfolioChange: (portfolio: MyPortfolioItem) => void;
  allPortfolios: MyPortfolioItem[];
  isLoading: boolean;
  hasPositionPortfolio: boolean;
}

export function PortfolioSelection({
  selectedPortfolio,
  onPortfolioChange,
  allPortfolios,
  isLoading,
  hasPositionPortfolio,
}: PortfolioSelectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleCreatePortfolio = () => {
    navigate('/write-portfolio');
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        <h2 className="text-xl font-bold text-moas-text">포트폴리오 선택</h2>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-moas-main"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-moas-text">포트폴리오 선택</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-moas-main text-black rounded-lg hover:bg-moas-main/90 transition-colors font-semibold"
          >
            포트폴리오 변경
          </button>
        </div>

        {/* 해당 포지션 포트폴리오 없을 때 안내 메시지 */}
        {!hasPositionPortfolio && allPortfolios.length > 0 && (
          <div className="mt-2 flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />

            <div className="flex-1">
              <p className="text-sm font-semibold text-yellow-800">
                해당 포지션의 포트폴리오가 존재하지 않습니다
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                다른 포트폴리오가 선택되었습니다. 위 버튼을 눌러 변경 가능합니다.
              </p>
            </div>

            {/* 버튼 + 텍스트 세로 배치 */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-2xs text-yellow-700">해당 포지션 포트폴리오 작성</span>

              <button
                onClick={handleCreatePortfolio}
                className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-white transition-colors"
                title="포트폴리오 작성하기"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* 선택된 포트폴리오 정보 */}
        {selectedPortfolio ? (
          <div className="border-2 border-moas-gray-3 rounded-lg p-4 space-y-3">
            <div className="flex gap-4">
              {/* 썸네일 이미지 */}
              <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={selectedPortfolio.thumbnailImageUrl}
                  alt={selectedPortfolio.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-portfolio.png';
                  }}
                />
              </div>

              {/* 포트폴리오 정보 */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-moas-gray-6" />
                  <span className="text-sm font-semibold text-moas-gray-6">
                    {selectedPortfolio.positionName}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-moas-text">{selectedPortfolio.title}</h3>
                <div className="flex items-center gap-2 text-sm text-moas-gray-6">
                  <Calendar className="h-4 w-4" />
                  <span>등록일: {selectedPortfolio.createdAt}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-moas-gray-3 rounded-lg p-8 text-center space-y-2">
            <FileText className="h-12 w-12 text-moas-gray-4 mx-auto" />
            <p className="text-moas-gray-6 font-semibold">
              {allPortfolios.length === 0
                ? '등록된 포트폴리오가 없습니다.'
                : '포트폴리오를 선택해주세요.'}
            </p>
            {allPortfolios.length > 0 ? (
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-moas-main hover:underline font-semibold"
              >
                포트폴리오 선택하기
              </button>
            ) : (
              <button
                onClick={handleCreatePortfolio}
                className="text-moas-main hover:underline font-semibold"
              >
                포트폴리오 작성하기
              </button>
            )}
          </div>
        )}
      </div>

      <PortfolioSelectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={(portfolio) => {
          onPortfolioChange(portfolio);
          setIsModalOpen(false);
        }}
        currentSelected={selectedPortfolio?.portfolioId || null}
        portfolios={allPortfolios}
      />
    </>
  );
}

// src/pages/project-apply/components/PortfolioSelectModal.tsx
import { X, FileText, Calendar } from 'lucide-react';
import type { MyPortfolioItem } from '@/types/portfolio';

interface PortfolioSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (portfolio: MyPortfolioItem) => void;
  currentSelected: number | null;
  portfolios: MyPortfolioItem[];
}

export function PortfolioSelectModal({
  isOpen,
  onClose,
  onSelect,
  currentSelected,
  portfolios,
}: PortfolioSelectModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 p-6 space-y-6 max-h-[80vh] flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-moas-gray-6 hover:text-moas-text transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Title */}
        <h2 className="text-xl font-bold text-moas-text">포트폴리오 선택</h2>

        {/* Portfolio List */}
        <div className="flex-1 overflow-y-auto space-y-3">
          {portfolios.length > 0 ? (
            portfolios.map((portfolio) => (
              <button
                key={portfolio.portfolioId}
                onClick={() => onSelect(portfolio)}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  currentSelected === portfolio.portfolioId
                    ? 'border-moas-main bg-moas-main/10'
                    : 'border-moas-gray-3 hover:border-moas-gray-4'
                }`}
              >
                <div className="flex gap-4">
                  {/* 썸네일 이미지 */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={portfolio.thumbnailImageUrl}
                      alt={portfolio.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-portfolio.png';
                      }}
                    />
                  </div>

                  {/* 포트폴리오 정보 */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-moas-gray-6" />
                      <span className="text-sm font-semibold text-moas-gray-6">
                        {portfolio.positionName}
                      </span>
                    </div>
                    <h3 className="font-bold text-moas-text">{portfolio.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-moas-gray-6">
                      <Calendar className="h-4 w-4" />
                      <span>등록일: {portfolio.createdAt}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="py-12 text-center">
              <FileText className="h-12 w-12 text-moas-gray-4 mx-auto mb-4" />
              <p className="text-moas-gray-6">등록된 포트폴리오가 없습니다.</p>
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full px-4 py-2 border border-moas-gray-3 text-moas-gray-6 rounded-lg hover:bg-moas-gray-1 transition-colors font-semibold"
        >
          닫기
        </button>
      </div>
    </div>
  );
}

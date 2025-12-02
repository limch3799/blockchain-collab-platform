// src/pages/portfolio/my-portfolio/components/EmptyPortfolioState.tsx
import { FileText } from 'lucide-react';

interface EmptyPortfolioStateProps {
  onWrite: () => void;
}

export function EmptyPortfolioState({ onWrite }: EmptyPortfolioStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="bg-moas-gray-2 rounded-full p-6 mb-6">
        <FileText className="w-12 h-12 text-moas-gray-6" />
      </div>

      <h3 className="text-xl font-bold text-moas-text mb-2">아직 작성된 포트폴리오가 없습니다</h3>

      <p className="text-moas-gray-6 text-center mb-8 max-w-md">
        첫 포트폴리오를 작성하고 당신의 작업물을 세상에 공유해보세요
      </p>

      <button
        onClick={onWrite}
        className="px-8 py-3 bg-moas-main text-moas-text font-semibold rounded-lg hover:opacity-90 transition-opacity"
      >
        포트폴리오 작성하기
      </button>
    </div>
  );
}

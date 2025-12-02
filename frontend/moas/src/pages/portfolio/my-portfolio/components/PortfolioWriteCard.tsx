// src/pages/portfolio/my-portfolio/components/PortfolioWriteCard.tsx
import { Plus } from 'lucide-react';

interface PortfolioWriteCardProps {
  onWrite: () => void;
  totalCount: number;
}

export function PortfolioWriteCard({ onWrite, totalCount }: PortfolioWriteCardProps) {
  return (
    <div
      onClick={onWrite}
      className="border-2 border-[#E8E8EA] bg-[#FBFCFC] rounded-3xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 min-h-[320px] font-pretendard"
    >
      <button className="w-12 h-12 rounded-full flex items-center justify-center transition-colors mt-8">
        <Plus className="w-10 h-10 text-gray-400" />
      </button>
      <br></br>
      <p className="text-gray-500 text-center mb-4 text-xl">새 포트폴리오 등록</p>
      <p className="text-gray-500 text-center mb-4 text-xl">{totalCount} / 10</p>
    </div>
  );
}

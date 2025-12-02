// src/pages/portfolio/my-portfolio/components/PortfolioSkeletonCard.tsx
import { Card } from '@/components/ui/card';

export function PortfolioSkeletonCard() {
  return (
    <Card className="overflow-hidden p-0 font-pretendard animate-pulse">
      {/* 썸네일 스켈레톤 */}
      <div className="relative rounded-t-lg overflow-hidden h-48 bg-gradient-to-r from-moas-gray-2 via-moas-gray-3 to-moas-gray-2 bg-[length:200%_100%] animate-shimmer">
        {/* 카테고리 스켈레톤 */}
        <div className="absolute top-3 left-3">
          <div className="bg-moas-gray-4 h-7 w-20 rounded"></div>
        </div>
      </div>

      {/* 콘텐츠 스켈레톤 */}
      <div className="px-2 pt-0 pb-2 space-y-3">
        {/* 제목 */}
        <div className="h-6 bg-moas-gray-3 rounded w-3/4"></div>

        {/* 날짜 */}
        <div className="h-4 bg-moas-gray-2 rounded w-1/2"></div>

        {/* 버튼들 */}
        <div className="flex gap-2">
          <div className="flex-1 h-9 bg-moas-gray-2 rounded"></div>
          <div className="flex-1 h-9 bg-moas-gray-2 rounded"></div>
        </div>
      </div>
    </Card>
  );
}

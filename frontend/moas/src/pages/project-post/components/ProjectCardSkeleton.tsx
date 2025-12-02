// src/pages/project-post/components/ProjectCardSkeleton.tsx

import { Card } from '@/components/ui/card';

export function ProjectCardSkeleton() {
  return (
    <Card className="overflow-hidden p-0 font-pretendard animate-pulse">
      {/* 썸네일 스켈레톤 */}
      <div className="relative rounded-t-lg overflow-hidden h-48 bg-gradient-to-r from-moas-gray-2 via-moas-gray-3 to-moas-gray-2 bg-[length:200%_100%] animate-shimmer">
        {/* 상단 왼쪽 라벨 */}
        <div className="absolute top-3 left-3">
          <div className="bg-moas-gray-4 h-7 w-20 rounded" />
        </div>
        {/* 상단 오른쪽 라벨 */}
        <div className="absolute top-3 right-3">
          <div className="bg-moas-gray-4 h-7 w-16 rounded" />
        </div>
      </div>

      {/* 콘텐츠 스켈레톤 */}
      <div className="px-2 pt-2 pb-2 space-y-3">
        {/* 키워드 */}
        <div className="flex flex-wrap gap-2">
          <div className="bg-moas-gray-3 h-6 w-16 rounded"></div>
          <div className="bg-moas-gray-3 h-6 w-20 rounded"></div>
        </div>

        {/* 제목 */}
        <div className="h-6 bg-moas-gray-3 rounded w-3/4"></div>

        {/* 기간 */}
        <div className="h-4 bg-moas-gray-2 rounded w-1/2"></div>

        {/* 하단 버튼/정보 */}
        <div className="flex gap-2">
          <div className="flex-1 h-9 bg-moas-gray-2 rounded"></div>
          <div className="flex-1 h-9 bg-moas-gray-2 rounded"></div>
        </div>
      </div>
    </Card>
  );
}

export function ProjectListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6 py-0">
      {[...Array(8)].map((_, idx) => (
        <ProjectCardSkeleton key={idx} />
      ))}
    </div>
  );
}

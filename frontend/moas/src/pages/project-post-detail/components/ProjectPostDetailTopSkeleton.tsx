// src/pages/project-post-detail/components/ProjectPostDetailTopSkeleton.tsx
export function ProjectPostDetailTopSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 왼쪽: 썸네일 스켈레톤 */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-r from-moas-gray-2 via-moas-gray-3 to-moas-gray-2 bg-[length:200%_100%] animate-shimmer rounded-lg h-[500px]" />
        </div>

        {/* 오른쪽: 정보 스켈레톤 */}
        <div className="space-y-6">
          {/* 카테고리 배지 */}
          <div className="bg-moas-gray-3 h-7 w-24 rounded-full animate-pulse" />

          {/* 제목 */}
          <div className="space-y-3">
            <div className="bg-moas-gray-3 h-8 w-full rounded animate-pulse" />
            <div className="bg-moas-gray-3 h-8 w-3/4 rounded animate-pulse" />
          </div>

          {/* 등록일, 조회수 */}
          <div className="flex gap-4">
            <div className="bg-moas-gray-2 h-5 w-32 rounded animate-pulse" />
            <div className="bg-moas-gray-2 h-5 w-24 rounded animate-pulse" />
          </div>

          <div className="border-t border-moas-gray-2 pt-6 space-y-4">
            {/* 프로젝트 리더 */}
            <div className="bg-white rounded-lg border border-moas-gray-2 p-6">
              <div className="bg-moas-gray-3 h-6 w-32 rounded mb-4 animate-pulse" />
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-moas-gray-3 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="bg-moas-gray-3 h-5 w-24 rounded animate-pulse" />
                  <div className="bg-moas-gray-2 h-4 w-32 rounded animate-pulse" />
                </div>
              </div>
              <div className="bg-moas-gray-3 h-12 rounded-lg animate-pulse" />
            </div>

            {/* 북마크/공유 버튼 */}
            <div className="flex gap-3">
              <div className="flex-1 bg-moas-gray-3 h-12 rounded-lg animate-pulse" />
              <div className="flex-1 bg-moas-gray-3 h-12 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

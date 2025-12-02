// src/pages/project-post-detail/components/ProjectPostDetailBottomSkeleton.tsx
export function ProjectPostDetailBottomSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 왼쪽: 프로젝트 정보 */}
        <div className="lg:col-span-2 space-y-8">
          {/* 프로젝트 개요 */}
          <div className="bg-white rounded-lg border border-moas-gray-2 p-6">
            <div className="bg-moas-gray-3 h-6 w-32 rounded mb-4 animate-pulse" />
            <div className="space-y-3">
              <div className="bg-moas-gray-2 h-4 w-full rounded animate-pulse" />
              <div className="bg-moas-gray-2 h-4 w-full rounded animate-pulse" />
              <div className="bg-moas-gray-2 h-4 w-3/4 rounded animate-pulse" />
            </div>
          </div>

          {/* 프로젝트 상세 설명 */}
          <div className="bg-white rounded-lg border border-moas-gray-2 p-6">
            <div className="bg-moas-gray-3 h-6 w-40 rounded mb-4 animate-pulse" />
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-moas-gray-2 h-4 rounded animate-pulse"
                  style={{ width: `${Math.random() * 30 + 70}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 오른쪽: 모집 정보 */}
        <div className="space-y-6">
          {/* 프로젝트 정보 */}
          <div className="bg-white rounded-lg border border-moas-gray-2 p-6">
            <div className="bg-moas-gray-3 h-6 w-32 rounded mb-4 animate-pulse" />
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="bg-moas-gray-2 h-4 w-20 rounded animate-pulse" />
                  <div className="bg-moas-gray-2 h-4 w-32 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* 모집 아티스트 */}
          <div className="bg-white rounded-lg border border-moas-gray-2 p-6">
            <div className="bg-moas-gray-3 h-6 w-32 rounded mb-4 animate-pulse" />
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-3 bg-moas-gray-1 rounded"
                >
                  <div className="bg-moas-gray-3 h-4 w-16 rounded animate-pulse" />
                  <div className="bg-moas-gray-3 h-4 w-24 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* 지원하기 버튼 */}
          <div className="bg-moas-gray-3 h-12 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
}

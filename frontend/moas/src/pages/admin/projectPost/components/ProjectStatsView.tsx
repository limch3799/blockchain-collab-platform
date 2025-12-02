// src/pages/admin/projectPost/components/ProjectStatistics.tsx
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getProjectStats, type ProjectStats } from '@/api/admin/project';

export const ProjectStatistics = () => {
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const data = await getProjectStats();
      setStats(data);
    } catch (error) {
      console.error('통계 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">통계를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-20 text-center">
        <p className="text-gray-600">통계를 불러올 수 없습니다.</p>
      </div>
    );
  }

  const chartData = [
    { label: '모집중', count: stats.recruitingCount, color: '#10B981' },
    { label: '마감', count: stats.closedCount, color: '#F59E0B' },
    { label: '삭제됨', count: stats.deletedCount, color: '#EF4444' },
  ];

  const total = stats.totalCount;
  const radius = 120;
  const centerX = 150;
  const centerY = 150;

  let currentAngle = -90;
  const paths = chartData.map((item) => {
    const percentage = (item.count / total) * 100;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;

    const startX = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
    const startY = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
    const endX = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
    const endY = centerY + radius * Math.sin((endAngle * Math.PI) / 180);

    const largeArcFlag = angle > 180 ? 1 : 0;

    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${startX} ${startY}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
      'Z',
    ].join(' ');

    currentAngle = endAngle;

    return {
      ...item,
      path: pathData,
      percentage: percentage.toFixed(1),
    };
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-8">프로젝트 통계</h2>

      <div className="flex items-center justify-center gap-16">
        {/* 도넛 차트 */}
        <div className="relative">
          <svg width="300" height="300" viewBox="0 0 300 300">
            {paths.map((item, index) => (
              <path key={index} d={item.path} fill={item.color} opacity="0.9" />
            ))}
            {/* 중앙 원 */}
            <circle cx={centerX} cy={centerY} r={80} fill="white" />
            {/* 중앙 텍스트 */}
            <text
              x={centerX}
              y={centerY - 10}
              textAnchor="middle"
              className="text-xl font-bold fill-gray-700"
            >
              전체
            </text>
            <text
              x={centerX}
              y={centerY + 20}
              textAnchor="middle"
              className="text-3xl font-bold fill-gray-900"
            >
              {total.toLocaleString()}
            </text>
          </svg>
        </div>

        {/* 범례 */}
        <div className="space-y-6">
          {chartData.map((item, index) => {
            const path = paths[index];
            return (
              <div key={item.label} className="flex items-center gap-4">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-8">
                    <span className="text-gray-700 font-medium">{item.label}</span>
                    <span className="text-gray-900 font-bold text-lg">
                      {item.count.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">{path.percentage}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

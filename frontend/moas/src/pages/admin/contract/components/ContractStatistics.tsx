// src/pages/admin/contract/components/ContractStatistics.tsx
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { getContractStatistics } from '@/api/admin/contract';
import type { ContractStatistics as ContractStatisticsType } from '@/api/admin/contract';
import type { ContractStatus } from '../contract';
import { CONTRACT_STATUS_MAP } from '../contract';

export const ContractStatistics = () => {
  const [statistics, setStatistics] = useState<ContractStatisticsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getContractStatistics();
      setStatistics(data);
    } catch (err) {
      setError('통계를 불러오는데 실패했습니다.');
      console.error('통계 로드 실패:', err);
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

  if (error || !statistics) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-red-500">{error || '통계를 불러올 수 없습니다.'}</p>
      </div>
    );
  }

  // COMPLETED와 CANCELED 분리
  const completedCount = statistics.statusCounts['COMPLETED'] || 0;
  const canceledCount = statistics.statusCounts['CANCELED'] || 0;

  // 순서대로 정렬 (COMPLETED, CANCELED 제외)
  const statusOrder: ContractStatus[] = [
    'PENDING',
    'DECLINED',
    'WITHDRAWN',
    'ARTIST_SIGNED',
    'PAYMENT_PENDING',
    'PAYMENT_COMPLETED',
    'CANCELLATION_REQUESTED',
  ];

  const chartStatuses = statusOrder
    .map((status) => {
      const count = statistics.statusCounts[status] || 0;
      return [status, count] as [ContractStatus, number];
    })
    .filter(([status]) => statistics.statusCounts[status] !== undefined);

  // 최대값 계산
  const counts = chartStatuses.map(([, count]) => count);
  const maxCount = Math.max(...counts, 1);

  const statusColors: Record<string, string> = {
    PENDING: '#3b82f6',
    DECLINED: '#ef4444',
    WITHDRAWN: '#64748b',
    ARTIST_SIGNED: '#8b5cf6',
    PAYMENT_PENDING: '#f59e0b',
    PAYMENT_COMPLETED: '#10b981',
    CANCELLATION_REQUESTED: '#ec4899',
  };

  return (
    <div className="space-y-8">
      {/* 수평 막대 그래프 + 완료/취소 통계 컨테이너 */}
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-8">상태별 계약 수</h3>

        <div className="flex gap-8">
          {/* 왼쪽: 막대 그래프 */}
          <div className="flex-[3]">
            <div className="space-y-6">
              {chartStatuses.map(([status, count], index) => {
                const widthPercent = maxCount > 0 ? (count / maxCount) * 100 : 0;

                return (
                  <div key={status} className="flex items-center gap-4">
                    {/* 상태 라벨 */}
                    <div className="w-40 text-right">
                      <p className="text-sm font-medium text-gray-700 whitespace-pre-line">
                        {CONTRACT_STATUS_MAP[status]}
                      </p>
                    </div>

                    {/* 막대 */}
                    <div className="flex-1 relative">
                      <div className="w-full h-12 relative">
                        <div
                          className="h-full rounded-lg transition-all duration-1000 ease-out flex items-center justify-end pr-3"
                          style={{
                            width: `${widthPercent}%`,
                            backgroundColor: statusColors[status] || '#64748b',
                            animation: `barGrowthHorizontal 1s ease-out ${index * 0.1}s backwards`,
                          }}
                        >
                          {widthPercent > 10 && (
                            <span className="text-sm font-semibold text-white">{count}건</span>
                          )}
                        </div>
                      </div>
                      {widthPercent <= 10 && count > 0 && (
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-700">
                          {count}건
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 오른쪽: 완료/취소 계약 수 */}
          <div className="flex-[1] flex flex-col gap-6">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-xs text-green-700 font-medium mb-1 whitespace-nowrap">
                정산 완료된 계약
              </p>
              <p className="text-2xl font-bold text-green-800">{completedCount}건</p>
            </div>

            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-xs text-red-700 font-medium mb-1 whitespace-nowrap">취소된 계약</p>
              <p className="text-2xl font-bold text-red-800">{canceledCount}건</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes barGrowthHorizontal {
          from {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
};

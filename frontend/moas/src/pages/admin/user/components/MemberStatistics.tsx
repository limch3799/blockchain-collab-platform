// src/pages/admin/user/components/MemberStatistics.tsx
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { getMemberStatistics } from '@/api/admin/member';
import type { MemberStatistics as MemberStatisticsType } from '@/api/admin/member';

export const MemberStatistics = () => {
  const [statistics, setStatistics] = useState<MemberStatisticsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getMemberStatistics();
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

  const total = statistics.totalMembers;
  const leaderPercent = total > 0 ? (statistics.roleDistribution.leader / total) * 100 : 0;
  const artistPercent = total > 0 ? (statistics.roleDistribution.artist / total) * 100 : 0;
  const pendingPercent = total > 0 ? (statistics.roleDistribution.pending / total) * 100 : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8">
      <h3 className="text-2xl font-bold text-gray-800 mb-8">회원 통계</h3>

      <div className="flex gap-16 items-center">
        {/* 왼쪽: 원형 차트 */}
        <div className="flex-shrink-0 ml-8">
          {' '}
          {/* ml-8을 추가하여 차트를 오른쪽으로 이동 */}
          <div className="relative w-80 h-80">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
              {/* 배경 원 */}
              <circle cx="100" cy="100" r="80" fill="none" stroke="#f3f4f6" strokeWidth="40" />

              {/* 리더 */}
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="40"
                strokeDasharray={`${(leaderPercent / 100) * 502.65} 502.65`}
                strokeDashoffset="0"
                className="transition-all duration-1000 ease-out"
                style={{ animation: 'dashAnimation 1s ease-out' }}
              />

              {/* 아티스트 */}
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="40"
                strokeDasharray={`${(artistPercent / 100) * 502.65} 502.65`}
                strokeDashoffset={`-${(leaderPercent / 100) * 502.65}`}
                className="transition-all duration-1000 ease-out"
                style={{ animation: 'dashAnimation 1s ease-out 0.2s backwards' }}
              />

              {/* 미결정 */}
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#94a3b8"
                strokeWidth="40"
                strokeDasharray={`${(pendingPercent / 100) * 502.65} 502.65`}
                strokeDashoffset={`-${((leaderPercent + artistPercent) / 100) * 502.65}`}
                className="transition-all duration-1000 ease-out"
                style={{ animation: 'dashAnimation 1s ease-out 0.4s backwards' }}
              />
            </svg>

            {/* 중앙 텍스트 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">전체 회원</p>
                <p className="text-4xl font-bold text-gray-800">{total}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 오른쪽: 상세 정보 (간소화) */}
        <div className="flex-1 space-y-6 pr-8">
          {' '}
          {/* pr-8을 추가하여 오른쪽 여백 확보 */}
          {/* 리더 */}
          <div className="flex items-end gap-3">
            <div className="w-4 h-4 bg-blue-500 rounded-full flex-shrink-0"></div>
            <p className="text-base font-semibold text-gray-700 w-20 flex-shrink-0">리더</p>
            <div className="flex-grow border-b border-gray-300 border-dotted mb-1 max-w-[50px]"></div>{' '}
            {/* max-w를 줄여 선 길이 조절 */}
            <p className="text-xl font-bold text-blue-600 flex-shrink-0">
              {statistics.roleDistribution.leader}
            </p>
            <p className="text-base text-gray-600 flex-shrink-0">({leaderPercent.toFixed(1)}%)</p>
          </div>
          {/* 아티스트 */}
          <div className="flex items-end gap-3">
            <div className="w-4 h-4 bg-purple-500 rounded-full flex-shrink-0"></div>
            <p className="text-base font-semibold text-gray-700 w-20 flex-shrink-0">아티스트</p>
            <div className="flex-grow border-b border-gray-300 border-dotted mb-1 max-w-[50px]"></div>{' '}
            {/* max-w를 줄여 선 길이 조절 */}
            <p className="text-xl font-bold text-purple-600 flex-shrink-0">
              {statistics.roleDistribution.artist}
            </p>
            <p className="text-base text-gray-600 flex-shrink-0">({artistPercent.toFixed(1)}%)</p>
          </div>
          {/* 미결정 */}
          <div className="flex items-end gap-3">
            <div className="w-4 h-4 bg-gray-400 rounded-full flex-shrink-0"></div>
            <p className="text-base font-semibold text-gray-700 w-20 flex-shrink-0">미결정</p>
            <div className="flex-grow border-b border-gray-300 border-dotted mb-1 max-w-[50px]"></div>{' '}
            {/* max-w를 줄여 선 길이 조절 */}
            <p className="text-xl font-bold text-gray-600 flex-shrink-0">
              {statistics.roleDistribution.pending}
            </p>
            <p className="text-base text-gray-600 flex-shrink-0">({pendingPercent.toFixed(1)}%)</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes dashAnimation {
          from {
            stroke-dasharray: 0 502.65;
          }
        }
      `}</style>
    </div>
  );
};

// src/pages/admin/dashboard/components/DashboardAlerts.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, MessageSquare } from 'lucide-react';
import { getContractList } from '@/api/admin/contract';
import { getAdminInquiryList } from '@/api/admin/inquiry';

export const DashboardAlerts = () => {
  const navigate = useNavigate();
  const [cancellationCount, setCancellationCount] = useState(0);
  const [pendingInquiryCount, setPendingInquiryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setIsLoading(true);

      const [contractData, inquiryData] = await Promise.all([
        getContractList(1, 100, 'CANCELLATION_REQUESTED'),
        getAdminInquiryList(0, 100),
      ]);

      setCancellationCount(contractData.content.length);
      setPendingInquiryCount(
        inquiryData.content.filter((inquiry) => inquiry.status === 'PENDING').length,
      );
    } catch (err) {
      console.error('알림 데이터 로드 실패:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancellationClick = () => {
    navigate('/admin/contract', { state: { statusFilter: 'cancellation' } });
  };

  const handleInquiryClick = () => {
    navigate('/admin/inquiry', { state: { activeTab: 'pending' } });
  };

  if (isLoading) {
    return null;
  }

  if (cancellationCount === 0 && pendingInquiryCount === 0) {
    return null;
  }

  return (
    // 전체 컨테이너는 유지 (오른쪽 정렬 유지)
    <div className="flex justify-start gap-8 mb-8 bg-white rounded-xl  px-6 py-2">
      {/* 취소 요청 알림 */}
      {cancellationCount > 0 && (
        <button
          onClick={handleCancellationClick}
          // 버튼 스타일 유지
          className="flex items-center justify-end p-4 rounded-lg bg-white hover:bg-red-50 transition-colors text-right relative overflow-hidden group"
        >
          {/* 아이콘을 왼쪽에 배치하기 위해 텍스트/숫자보다 먼저 둡니다. */}
          <div className="flex items-center gap-4">
            {/* 1. 아이콘 섹션 (왼쪽) */}
            <div className="relative">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="absolute -top-1 -right-1">
                <span className="relative flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                </span>
              </div>
            </div>

            {/* 2. 텍스트/숫자 섹션 (오른쪽) */}
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm text-red-600 font-medium mb-1">취소 요청</p>
                <p className="text-3xl font-bold text-red-700">{cancellationCount}</p>
              </div>
            </div>
          </div>
          {/* 오른쪽 화살표 */}
          <div className="ml-2 text-red-600 group-hover:translate-x-1 transition-transform pb-10">
            →
          </div>
        </button>
      )}

      {/* 답변 대기 문의 알림 */}
      {pendingInquiryCount > 0 && (
        <button
          onClick={handleInquiryClick}
          // border-blue-200 제거 및 스타일 유지
          className="flex items-center justify-end p-4 rounded-lg bg-white hover:bg-blue-50 transition-colors text-right relative overflow-hidden group"
        >
          {/* 아이콘을 왼쪽에 배치하기 위해 텍스트/숫자보다 먼저 둡니다. */}
          <div className="flex items-center gap-4">
            {/* 1. 아이콘 섹션 (왼쪽) */}
            <div className="relative">
              <div className="p-3 bg-blue-100 rounded-lg">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <div className="absolute -top-1 -right-1">
                <span className="relative flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500"></span>
                </span>
              </div>
            </div>

            {/* 2. 텍스트/숫자 섹션 (오른쪽) */}
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm text-blue-600 font-medium mb-1">대기중 문의</p>
                <p className="text-3xl font-bold text-blue-700">{pendingInquiryCount}</p>
              </div>
            </div>
          </div>
          {/* 오른쪽 화살표 */}
          <div className="ml-2 text-blue-600 group-hover:translate-x-1 transition-transform pb-10">
            →
          </div>
        </button>
      )}
    </div>
  );
};

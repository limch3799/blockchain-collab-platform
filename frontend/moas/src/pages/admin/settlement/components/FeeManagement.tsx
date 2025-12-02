// src/pages/admin/settlement/components/FeeManagement.tsx
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { getCurrentFeePolicy, getFeePolicyHistory, updateFeePolicy } from '@/api/admin/settlement';
import type { FeePolicy } from '@/api/admin/settlement';
import { CurrentFee } from './CurrentFee';
import { FeeChangeForm } from './FeeChangeForm';
import { FeeHistory } from './FeeHistory';
import { FeeChangeModal } from './FeeChangeModal';

export const FeeManagement = () => {
  const [currentPolicy, setCurrentPolicy] = useState<FeePolicy | null>(null);
  const [policyHistory, setPolicyHistory] = useState<FeePolicy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingFee, setPendingFee] = useState<{ feeRate: number; startAt: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [current, history] = await Promise.all([getCurrentFeePolicy(), getFeePolicyHistory()]);

      setCurrentPolicy(current);
      setPolicyHistory(history);
    } catch (err) {
      setError('데이터를 불러오는데 실패했습니다.');
      console.error('데이터 로드 실패:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeeChangeRequest = (feeRate: number, startAt: string) => {
    setPendingFee({ feeRate, startAt });
    setIsModalOpen(true);
  };

  const handleConfirmChange = async () => {
    if (!pendingFee) return;

    try {
      await updateFeePolicy(pendingFee.feeRate, pendingFee.startAt);
      setIsModalOpen(false);
      setPendingFee(null);
      await loadData();
    } catch (err) {
      console.error('수수료 변경 실패:', err);
      alert('수수료 변경에 실패했습니다.');
    }
  };

  const handleCancelChange = () => {
    setIsModalOpen(false);
    setPendingFee(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <CurrentFee policy={currentPolicy} />
        <FeeChangeForm onSubmit={handleFeeChangeRequest} />
        <FeeHistory policies={policyHistory} />
      </div>

      {isModalOpen && pendingFee && (
        <FeeChangeModal
          feeRate={pendingFee.feeRate}
          startAt={pendingFee.startAt}
          onConfirm={handleConfirmChange}
          onCancel={handleCancelChange}
        />
      )}
    </>
  );
};

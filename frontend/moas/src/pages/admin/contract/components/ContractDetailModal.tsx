// src/pages/admin/contract/components/ContractDetailModal.tsx
import { useEffect, useState } from 'react';
import { Loader2, X, FileText, Calendar, DollarSign, AlertTriangle } from 'lucide-react';
import { getContractDetail, getContractLogs } from '@/api/admin/contract';
import type { ContractDetail, ContractLog } from '@/api/admin/contract';
import { CONTRACT_STATUS_MAP, CONTRACT_STATUS_COLORS } from '../contract';
import { ContractLogList } from './ContractLogList';
import { CancellationActionModal } from './CancellationActionModal';
import { MarkdownViewer } from '@/components/ui/MarkdownViewer';

interface ContractDetailModalProps {
  contractId: number;
  leaderProfileUrl?: string;
  artistProfileUrl?: string;
  onClose: () => void;
  onUpdate: () => void;
}

export const ContractDetailModal = ({
  contractId,
  leaderProfileUrl,
  artistProfileUrl,
  onClose,
  onUpdate,
}: ContractDetailModalProps) => {
  const [contract, setContract] = useState<ContractDetail | null>(null);
  const [logs, setLogs] = useState<ContractLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [cancellationAction, setCancellationAction] = useState<'approve' | 'reject'>('approve');

  useEffect(() => {
    loadContractData();
  }, [contractId]);

  const loadContractData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [contractData, logsData] = await Promise.all([
        getContractDetail(contractId),
        getContractLogs(contractId),
      ]);

      setContract(contractData);
      setLogs(logsData.logs);
    } catch (err) {
      setError('계약 정보를 불러오는데 실패했습니다.');
      console.error('계약 정보 로드 실패:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const handleCancellationSuccess = () => {
    setShowCancellationModal(false);
    loadContractData();
    onUpdate();
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">계약 정보를 불러오는 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error || '계약을 찾을 수 없습니다.'}</p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
          {/* 헤더 */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">계약 상세</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            {/* 계약 기본 정보 */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 mb-6">
              <div className="flex items-start justify-between mb-6 pb-6 border-b border-gray-200">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-6 h-6 text-gray-600" />
                    <h3 className="text-2xl font-bold text-gray-800">{contract.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-2">계약 ID: {contract.contractId}</p>
                  <div className="text-gray-700 mt-2">
                    <MarkdownViewer content={contract.description} />
                  </div>
                </div>
                <span
                  className={`px-4 py-2 text-sm font-semibold rounded-full border ${CONTRACT_STATUS_COLORS[contract.status]}`}
                >
                  {CONTRACT_STATUS_MAP[contract.status]}
                </span>
              </div>

              {/* 상세 정보 그리드 */}
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-600 mb-1">계약 금액</p>
                    <p className="text-lg font-bold text-gray-800">
                      {formatAmount(contract.totalAmount)}원
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-600 mb-1">수수료율</p>
                    <p className="text-lg font-bold text-gray-800">{contract.appliedFeeRate}%</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-600 mb-1">시작일</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {formatDate(contract.startAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-600 mb-1">종료일</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {formatDate(contract.endAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-600 mb-1">프로젝트</p>
                    <p className="text-sm font-semibold text-gray-800">{contract.project.title}</p>
                    <p className="text-xs text-gray-500">ID: {contract.project.projectId}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-600 mb-1">계약 생성일</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {formatDate(contract.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 참여자 정보 */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">참여자 정보</h4>

              <div className="grid grid-cols-2 gap-6">
                {/* 리더 */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-600 mb-3">리더</p>
                  <div className="flex items-center gap-3">
                    {leaderProfileUrl ? (
                      <img
                        src={leaderProfileUrl}
                        alt={contract.leader.nickname}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">L</span>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {contract.leader.nickname}
                      </p>
                      <p className="text-xs text-gray-500">ID: {contract.leader.userId}</p>
                    </div>
                  </div>
                </div>

                {/* 아티스트 */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-600 mb-3">아티스트</p>
                  <div className="flex items-center gap-3">
                    {artistProfileUrl ? (
                      <img
                        src={artistProfileUrl}
                        alt={contract.artist.nickname}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <span className="text-purple-600 font-semibold">A</span>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {contract.artist.nickname}
                      </p>
                      <p className="text-xs text-gray-500">ID: {contract.artist.userId}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 취소 요청 알림 */}
            {contract.status === 'CANCELLATION_REQUESTED' && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                    <div>
                      <p className="text-lg font-bold text-red-800">취소 요청이 도착했습니다.</p>
                      <p className="text-sm text-red-600 mt-1">
                        취소 요청을 승인하거나 반려할 수 있습니다.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setCancellationAction('approve');
                        setShowCancellationModal(true);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
                    >
                      승인하기
                    </button>
                    <button
                      onClick={() => {
                        setCancellationAction('reject');
                        setShowCancellationModal(true);
                      }}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-semibold"
                    >
                      반려하기
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 계약 이력 */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">계약 변경 이력</h4>
              <ContractLogList logs={logs} />
            </div>
          </div>
        </div>
      </div>

      {/* 취소 요청 처리 모달 */}
      {showCancellationModal && (
        <CancellationActionModal
          contractId={contractId}
          action={cancellationAction}
          onClose={() => setShowCancellationModal(false)}
          onSuccess={handleCancellationSuccess}
        />
      )}
    </>
  );
};

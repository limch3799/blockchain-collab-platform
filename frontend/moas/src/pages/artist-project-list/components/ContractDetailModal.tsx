// src/pages/artist-project-list/components/ContractDetailModal.tsx

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { getContractDetail, type ContractDetail } from '@/api/apply';

interface ContractDetailModalProps {
  isOpen: boolean;
  contractId: number | null;
  onClose: () => void;
}

export function ContractDetailModal({ isOpen, contractId, onClose }: ContractDetailModalProps) {
  const [contract, setContract] = useState<ContractDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && contractId) {
      fetchContractDetail();
    }
  }, [isOpen, contractId]);

  const fetchContractDetail = async () => {
    if (!contractId) return;

    try {
      setIsLoading(true);
      const response = await getContractDetail(contractId);
      setContract(response);
    } catch (error) {
      console.error('계약서 조회 실패:', error);
      alert('계약서를 불러오는데 실패했습니다.');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b border-moas-gray-3 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-moas-text">계약서</h2>
          <button
            onClick={onClose}
            className="text-moas-gray-6 hover:text-moas-text transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* 내용 */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-moas-main" />
            </div>
          ) : contract ? (
            <div className="space-y-6">
              {/* 계약 제목 */}
              <div>
                <label className="block text-sm font-semibold text-moas-gray-6 mb-2">
                  계약 제목
                </label>
                <p className="text-lg font-medium text-moas-text">{contract.title}</p>
              </div>

              {/* 프로젝트 정보 */}
              <div>
                <label className="block text-sm font-semibold text-moas-gray-6 mb-2">
                  프로젝트명
                </label>
                <p className="text-base text-moas-text">{contract.project.title}</p>
              </div>

              {/* 계약 설명 */}
              <div>
                <label className="block text-sm font-semibold text-moas-gray-6 mb-2">
                  계약 내용
                </label>
                <div className="bg-moas-gray-1 rounded-lg p-4">
                  <p className="text-base text-moas-text whitespace-pre-wrap leading-relaxed">
                    {contract.description}
                  </p>
                </div>
              </div>

              {/* 계약 기간 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-moas-gray-6 mb-2">
                    시작일
                  </label>
                  <p className="text-base text-moas-text">{formatDate(contract.startAt)}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-moas-gray-6 mb-2">
                    종료일
                  </label>
                  <p className="text-base text-moas-text">{formatDate(contract.endAt)}</p>
                </div>
              </div>

              {/* 계약 금액 */}
              <div>
                <label className="block text-sm font-semibold text-moas-gray-6 mb-2">
                  계약 금액
                </label>
                <p className="text-xl font-bold text-moas-main">
                  {contract.totalAmount.toLocaleString()}원
                </p>
              </div>

              {/* 당사자 정보 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-moas-gray-6 mb-2">리더</label>
                  <p className="text-base text-moas-text">{contract.leader.nickname}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-moas-gray-6 mb-2">
                    아티스트
                  </label>
                  <p className="text-base text-moas-text">{contract.artist.nickname}</p>
                </div>
              </div>

              {/* 서명 정보 */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-moas-gray-6 mb-2">
                    리더 서명
                  </label>
                  <p className="text-xs text-moas-gray-7 font-mono break-all bg-moas-gray-1 p-3 rounded">
                    {contract.leaderSignature}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-moas-gray-6 mb-2">
                    아티스트 서명
                  </label>
                  <p className="text-xs text-moas-gray-7 font-mono break-all bg-moas-gray-1 p-3 rounded">
                    {contract.artistSignature || '서명 대기 중'}
                  </p>
                </div>
              </div>

              {/* 구현 중 메시지 */}
              <div className="bg-moas-gray-1 rounded-lg p-4 text-center">
                <p className="text-moas-gray-6 font-medium">구현 중...</p>
              </div>
            </div>
          ) : null}
        </div>

        {/* 하단 버튼 */}
        <div className="sticky bottom-0 bg-white border-t border-moas-gray-3 p-6">
          <button
            onClick={onClose}
            className="w-full py-3 bg-moas-main rounded-lg font-pretendard text-base font-bold text-moas-black hover:bg-moas-main/90 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * ContractCard Component
 *
 * Props:
 * - contract (object): 계약 정보
 *
 * Description:
 * 리더의 계약 목록에서 사용되는 카드 컴포넌트
 */

import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Calendar, Coins, User } from 'lucide-react';
import type { Contract } from '@/types/contract';

interface ContractCardProps {
  contract: Contract;
}

const STATUS_STYLES = {
  ACCEPTED: { label: '진행중', className: 'bg-moas-state-1-bg text-moas-state-1 border-moas-state-1-bg' },
  COMPLETED: { label: '완료', className: 'bg-moas-state-3-bg text-moas-state-3 border-moas-state-3-bg' },
  SETTLED: { label: '정산 완료', className: 'bg-moas-main text-moas-text border-moas-main' },
  PENDING: { label: '제안됨', className: 'bg-[#E5F8FF] text-moas-leader border-[#E5F8FF]' },
  REJECTED: { label: '거절됨', className: 'bg-moas-error-bg text-moas-error border-moas-error-bg' },
} as const;

export function ContractCard({ contract }: ContractCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/contract/${contract.contractId}`);
  };

  const statusStyle = STATUS_STYLES[contract.status as keyof typeof STATUS_STYLES] || STATUS_STYLES.PENDING;

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).replace(/\. /g, '.').replace(/\.$/, '');
  };

  // 금액 포맷팅
  const formatAmount = (amount: number) => {
    return amount.toLocaleString('ko-KR');
  };

  return (
    <Card
      onClick={handleClick}
      className="group cursor-pointer overflow-hidden bg-white p-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="flex items-start justify-between">
        {/* 왼쪽: 계약 정보 */}
        <div className="flex-1">
          {/* 제목과 상태 */}
          <div className="mb-3 flex items-start justify-between">
            <div className="flex-1">
              <h3 className="mb-2 text-xl font-bold text-moas-text transition-colors group-hover:text-moas-main">
                {contract.title}
              </h3>
              <Badge className={statusStyle.className}>
                {statusStyle.label}
              </Badge>
            </div>
          </div>

          {/* 프로젝트 정보 */}
          <p className="mb-4 text-sm text-moas-gray-6">
            프로젝트: {contract.project.title}
          </p>

          {/* 상세 정보 그리드 */}
          <div className="grid grid-cols-2 gap-4">
            {/* 기간 */}
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-moas-gray-5" />
              <span className="text-moas-gray-7">
                {formatDate(contract.startAt)} ~ {formatDate(contract.endAt)}
              </span>
            </div>

            {/* 계약 금액 */}
            <div className="flex items-center gap-2 text-sm">
              <Coins className="h-4 w-4 text-moas-gray-5" />
              <span className="font-semibold text-moas-text">
                {formatAmount(contract.totalAmount)}원
              </span>
            </div>

            {/* 아티스트 */}
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-moas-gray-5" />
              <span className="text-moas-gray-7">
                아티스트: {contract.artist.nickname}
              </span>
            </div>

            {/* 생성일 */}
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-moas-gray-5" />
              <span className="text-moas-gray-7">
                계약일: {formatDate(contract.createdAt)}
              </span>
            </div>
          </div>

          {/* 설명 */}
          {contract.description && (
            <p className="mt-4 line-clamp-2 text-sm text-moas-gray-6">
              {contract.description}
            </p>
          )}
        </div>

        {/* 오른쪽: NFT 정보 (있을 경우) */}
        {contract.nftInfo && (
          <div className="ml-6 flex flex-col items-end gap-2">
            <div className="rounded-lg bg-moas-gray-1 px-3 py-2">
              <p className="text-xs text-moas-gray-6">NFT Token ID</p>
              <p className="font-mono text-sm font-semibold text-moas-text">
                {contract.nftInfo.tokenId}
              </p>
            </div>
            <span className="text-xs text-moas-leader">🔗 블록체인 인증</span>
          </div>
        )}
      </div>
    </Card>
  );
}

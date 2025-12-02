// src/pages/admin/settlement/components/PaymentList.tsx
import { useState, useEffect } from 'react';
import type { PaymentItem } from '@/api/admin/settlement_history';
import { getMemberDetail } from '@/api/admin/member';
import { PaymentDetailModal } from './PaymentDetailModal';
import {
  getPaymentTypeLabel,
  getPaymentTypeBadge,
  getPaymentStatusLabel,
  getPaymentStatusBadge,
} from '../paymentStatus';

interface PaymentListProps {
  payments: PaymentItem[];
  currentPage: number;
  pageSize: number;
}

interface PaymentWithNicknames extends PaymentItem {
  primaryMemberNickname: string;
  payerMemberNickname: string;
}

export const PaymentList = ({ payments, currentPage, pageSize }: PaymentListProps) => {
  const [paymentsWithNicknames, setPaymentsWithNicknames] = useState<PaymentWithNicknames[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<PaymentWithNicknames | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNicknames();
  }, [payments]);

  const loadNicknames = async () => {
    setIsLoading(true);
    try {
      const memberIds = new Set<number>();
      payments.forEach((payment) => {
        memberIds.add(payment.primaryMemberId);
        memberIds.add(payment.payerMemberId);
      });

      const nicknameMap = new Map<number, string>();
      await Promise.all(
        Array.from(memberIds).map(async (memberId) => {
          try {
            const member = await getMemberDetail(memberId);
            nicknameMap.set(memberId, member.nickname);
          } catch (error) {
            console.error(`회원 ${memberId} 정보 로드 실패:`, error);
            nicknameMap.set(memberId, `회원${memberId}`);
          }
        }),
      );

      const enrichedPayments = payments.map((payment) => ({
        ...payment,
        primaryMemberNickname:
          nicknameMap.get(payment.primaryMemberId) || `회원${payment.primaryMemberId}`,
        payerMemberNickname:
          nicknameMap.get(payment.payerMemberId) || `회원${payment.payerMemberId}`,
      }));

      setPaymentsWithNicknames(enrichedPayments);
    } catch (error) {
      console.error('닉네임 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
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

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-20 text-center">
        <p className="text-gray-600">데이터를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">No.</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">정산 ID</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">거래 유형</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">상태</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                수령인(아티스트)
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                지불인(리더)
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">금액</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">생성일시</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paymentsWithNicknames.map((payment, index) => {
              const displayIndex = (currentPage - 1) * pageSize + index + 1;
              return (
                <tr
                  key={payment.paymentId}
                  onClick={() => setSelectedPayment(payment)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-4 py-3 text-sm text-gray-700">{displayIndex}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{payment.paymentId}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${getPaymentTypeBadge(payment.paymentType)}`}
                    >
                      {getPaymentTypeLabel(payment.paymentType)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${getPaymentStatusBadge(payment.paymentStatus)}`}
                    >
                      {getPaymentStatusLabel(payment.paymentStatus)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {payment.primaryMemberNickname}
                    <span className="text-xs text-gray-500 ml-1">
                      (ID {payment.primaryMemberId})
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {payment.payerMemberNickname}
                    <span className="text-xs text-gray-500 ml-1">(ID {payment.payerMemberId})</span>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                    {formatAmount(payment.paymentAmount)}원
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {formatDate(payment.createdAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedPayment && (
        <PaymentDetailModal payment={selectedPayment} onClose={() => setSelectedPayment(null)} />
      )}
    </>
  );
};

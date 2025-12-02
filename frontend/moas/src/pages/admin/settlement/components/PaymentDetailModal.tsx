// src/pages/admin/settlement/components/PaymentDetailModal.tsx
import { X } from 'lucide-react';
import {
  getPaymentTypeLabel,
  getPaymentStatusLabel,
  getPaymentStatusColor,
  getOrderStatusLabel,
} from '../paymentStatus';

interface PaymentDetailModalProps {
  payment: {
    paymentId: number;
    paymentType: string;
    paymentStatus: string;
    paymentAmount: number;
    createdAt: string;
    completedAt: string | null;
    primaryMemberId: number;
    primaryMemberNickname: string;
    orderId: string;
    contractId: number;
    orderStatus: string;
    payerMemberId: number;
    payerMemberNickname: string;
  };
  onClose: () => void;
}

export const PaymentDetailModal = ({ payment, onClose }: PaymentDetailModalProps) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">정산 내역 상세</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">정산 ID</label>
              <p className="text-gray-800">{payment.paymentId}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">거래 유형</label>
              <p className="text-gray-800">{getPaymentTypeLabel(payment.paymentType)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">상태</label>
              <p className={`font-semibold ${getPaymentStatusColor(payment.paymentStatus)}`}>
                {getPaymentStatusLabel(payment.paymentStatus)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">금액</label>
              <p className="text-gray-800 font-semibold">{formatAmount(payment.paymentAmount)}원</p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">회원 정보</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">수령인(아티스트) ID</p>
                <p className="text-gray-800">{payment.primaryMemberId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">수령인 닉네임</p>
                <p className="text-gray-800">{payment.primaryMemberNickname}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">지불인(리더) ID</p>
                <p className="text-gray-800">{payment.payerMemberId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">지불인 닉네임</p>
                <p className="text-gray-800">{payment.payerMemberNickname}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">거래 정보</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">주문 ID</p>
                <p className="text-gray-800 break-all">{payment.orderId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">계약 ID</p>
                <p className="text-gray-800">{payment.contractId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">주문 상태</p>
                <p className="text-gray-800">{getOrderStatusLabel(payment.orderStatus)}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">일시</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">생성일시</p>
                <p className="text-gray-800">{formatDate(payment.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">완료일시</p>
                <p className="text-gray-800">{formatDate(payment.completedAt)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-semibold"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

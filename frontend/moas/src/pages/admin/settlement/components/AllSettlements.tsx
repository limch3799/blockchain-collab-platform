// src/pages/admin/settlement/components/AllSettlements.tsx
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { getPaymentList } from '@/api/admin/settlement_history';
import type { PaymentType, PaymentStatus, PaymentItem } from '@/api/admin/settlement_history';
import { PaymentList } from './PaymentList';
import { Pagination } from '../../components/Pagination';
import { PAYMENT_TYPE_LABELS, PAYMENT_STATUS_LABELS } from '../paymentStatus';

export const AllSettlements = () => {
  const [selectedType, setSelectedType] = useState<'ALL' | PaymentType>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | PaymentStatus>('ALL');
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1); // UI는 1부터 시작
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const pageSize = 20;

  useEffect(() => {
    loadPayments();
  }, [currentPage, selectedType, selectedStatus]);

  const loadPayments = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page: currentPage - 1, // API는 0부터 시작하므로 -1
        size: pageSize,
      };

      if (selectedType !== 'ALL') {
        params.types = selectedType;
      }

      if (selectedStatus !== 'ALL') {
        params.statuses = selectedStatus;
      }

      console.log('API 호출 파라미터:', params);
      const response = await getPaymentList(params);
      console.log('API 응답:', response);

      setPayments(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error('정산 내역 조회 실패:', error);
      alert('정산 내역을 불러오는데 실패했습니다.');
      setPayments([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTypeChange = (type: 'ALL' | PaymentType) => {
    setSelectedType(type);
    setCurrentPage(1);
  };

  const handleStatusChange = (status: 'ALL' | PaymentStatus) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  return (
    <div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">거래 유형</label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                value="ALL"
                checked={selectedType === 'ALL'}
                onChange={() => handleTypeChange('ALL')}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm text-gray-700">전체</span>
            </label>
            {Object.entries(PAYMENT_TYPE_LABELS).map(([value, label]) => (
              <label key={value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value={value}
                  checked={selectedType === value}
                  onChange={() => handleTypeChange(value as PaymentType)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">상태</label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="ALL"
                checked={selectedStatus === 'ALL'}
                onChange={() => handleStatusChange('ALL')}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm text-gray-700">전체</span>
            </label>
            {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
              <label key={value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value={value}
                  checked={selectedStatus === value}
                  onChange={() => handleStatusChange(value as PaymentStatus)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">총 {totalElements}건</p>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">데이터를 불러오는 중...</p>
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-20 text-center">
          <p className="text-gray-600">정산 내역이 없습니다.</p>
        </div>
      ) : (
        <>
          <PaymentList payments={payments} currentPage={currentPage} pageSize={pageSize} />
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}
    </div>
  );
};

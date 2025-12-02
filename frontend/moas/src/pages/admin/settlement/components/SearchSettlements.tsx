// src/pages/admin/settlement/components/SearchSettlements.tsx
import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { getPaymentList } from '@/api/admin/settlement_history';
import type { PaymentType, PaymentStatus, PaymentItem } from '@/api/admin/settlement_history';
import { PaymentList } from './PaymentList';
import { Pagination } from '../../components/Pagination';
import { PAYMENT_TYPE_LABELS, PAYMENT_STATUS_LABELS } from '../paymentStatus';

type SearchFieldType = 'paymentId' | 'primaryMemberId' | 'contractId' | 'payerMemberId';

const SEARCH_FIELD_LABELS: Record<SearchFieldType, string> = {
  paymentId: '정산 ID',
  primaryMemberId: '수령인(아티스트) ID',
  contractId: '계약 ID',
  payerMemberId: '지불인(리더) ID',
};

export const SearchSettlements = () => {
  const [selectedType, setSelectedType] = useState<'ALL' | PaymentType>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | PaymentStatus>('ALL');
  const [searchField, setSearchField] = useState<SearchFieldType>('paymentId');
  const [keyword, setKeyword] = useState('');
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // UI는 1부터 시작
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const pageSize = 20;

  const handleSearch = async () => {
    // 키워드가 비어있지 않은 경우 숫자인지 검증
    if (keyword.trim()) {
      const numericKeyword = parseInt(keyword.trim());
      if (isNaN(numericKeyword)) {
        alert('숫자를 입력해주세요.');
        return;
      }
    }

    setIsLoading(true);
    try {
      const params: any = {
        page: 0, // 검색 시작은 항상 0페이지부터
        size: pageSize,
      };

      if (selectedType !== 'ALL') {
        params.types = selectedType;
      }

      if (selectedStatus !== 'ALL') {
        params.statuses = selectedStatus;
      }

      // 키워드가 입력된 경우에만 검색 필드 적용
      if (keyword.trim()) {
        const numericKeyword = parseInt(keyword.trim());

        if (searchField === 'paymentId') {
          // paymentId는 API에서 직접 지원하지 않으므로 전체 조회 후 필터링
          const response = await getPaymentList(params);
          const filtered = response.content.filter(
            (payment) => payment.paymentId === numericKeyword,
          );
          setPayments(filtered);
          setTotalPages(filtered.length > 0 ? 1 : 0);
          setTotalElements(filtered.length);
        } else if (searchField === 'primaryMemberId') {
          params.memberId = numericKeyword;
          const response = await getPaymentList(params);
          setPayments(response.content);
          setTotalPages(response.totalPages);
          setTotalElements(response.totalElements);
        } else if (searchField === 'contractId') {
          params.contractId = numericKeyword;
          const response = await getPaymentList(params);
          setPayments(response.content);
          setTotalPages(response.totalPages);
          setTotalElements(response.totalElements);
        } else if (searchField === 'payerMemberId') {
          // payerMemberId는 API에서 직접 지원하지 않으므로 전체 조회 후 필터링
          const response = await getPaymentList(params);
          const filtered = response.content.filter(
            (payment) => payment.payerMemberId === numericKeyword,
          );
          setPayments(filtered);
          setTotalPages(filtered.length > 0 ? 1 : 0);
          setTotalElements(filtered.length);
        }
      } else {
        // 키워드가 없으면 필터만 적용하여 조회
        const response = await getPaymentList(params);
        setPayments(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
      }

      setHasSearched(true);
      setCurrentPage(1); // UI는 1페이지로 리셋
    } catch (error) {
      console.error('검색 실패:', error);
      alert('검색에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = async (page: number) => {
    // 클라이언트 필터링의 경우 페이지 변경 불가
    if (keyword.trim() && (searchField === 'paymentId' || searchField === 'payerMemberId')) {
      return;
    }

    setIsLoading(true);
    try {
      const params: any = {
        page: page - 1, // API는 0부터 시작하므로 -1
        size: pageSize,
      };

      if (selectedType !== 'ALL') {
        params.types = selectedType;
      }

      if (selectedStatus !== 'ALL') {
        params.statuses = selectedStatus;
      }

      if (keyword.trim()) {
        const numericKeyword = parseInt(keyword.trim());
        if (searchField === 'primaryMemberId') {
          params.memberId = numericKeyword;
        } else if (searchField === 'contractId') {
          params.contractId = numericKeyword;
        }
      }

      const response = await getPaymentList(params);
      setPayments(response.content);
      setCurrentPage(page); // UI 페이지 번호 업데이트
    } catch (error) {
      console.error('페이지 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">정산 내역 검색</h3>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">거래 유형</label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="searchType"
                value="ALL"
                checked={selectedType === 'ALL'}
                onChange={() => setSelectedType('ALL')}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm text-gray-700">전체</span>
            </label>
            {Object.entries(PAYMENT_TYPE_LABELS).map(([value, label]) => (
              <label key={value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="searchType"
                  value={value}
                  checked={selectedType === value}
                  onChange={() => setSelectedType(value as PaymentType)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">상태</label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="searchStatus"
                value="ALL"
                checked={selectedStatus === 'ALL'}
                onChange={() => setSelectedStatus('ALL')}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm text-gray-700">전체</span>
            </label>
            {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
              <label key={value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="searchStatus"
                  value={value}
                  checked={selectedStatus === value}
                  onChange={() => setSelectedStatus(value as PaymentStatus)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">검색 필드</label>
          <div className="flex items-center gap-4">
            {Object.entries(SEARCH_FIELD_LABELS).map(([value, label]) => (
              <label key={value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="searchField"
                  value={value}
                  checked={searchField === value}
                  onChange={(e) => setSearchField(e.target.value as SearchFieldType)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="숫자를 입력하세요 (선택사항)"
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
          />
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:bg-gray-400"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
            검색
          </button>
        </div>
      </div>

      {hasSearched && (
        <>
          {isLoading ? (
            <div className="bg-white rounded-xl border border-gray-200 p-20 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">검색 중...</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-20 text-center">
              <p className="text-gray-600">검색 결과가 없습니다.</p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
                <p className="text-sm text-gray-600">총 {totalElements}건</p>
              </div>
              <PaymentList payments={payments} currentPage={currentPage} pageSize={pageSize} />
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, AlertCircle, XCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

import apiClient from '@/api/axios';
import { useAuth } from '@/hooks/useAuth';
import type { Pagination, Summary, Transaction, TransactionsResponse } from '@/types/account';
import { formatFullDateAndTime } from '@/lib/dateUtils';
import { formatAmount } from '@/lib/numberUtils';

const PAGE_SIZE = 10;
const FIRST_PAGE = 0;

interface CanceledContract {
  contractId: number;
  title: string;
  totalAmount: number;
  startAt: string;
  endAt: string;
  status: 'CANCELLATION_REQUESTED' | 'CANCELED';
  createdAt: string;
  project: {
    projectId: number;
    title: string;
    positionName: string;
  };
  leader: {
    userId: number;
    nickname: string;
  };
  artist: {
    userId: number;
    nickname: string;
  };
}

interface CanceledContractsResponse {
  contracts: CanceledContract[];
  pagination: Pagination;
}

type TabType = 'transactions' | 'canceled';
type CanceledFilterType = 'ALL' | 'CANCELLATION_REQUESTED' | 'CANCELED';

const AccountSection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getUserInfoFromStorage } = useAuth();
  const userInfo = getUserInfoFromStorage();
  const role = userInfo?.role;

  // Determine active tab from URL
  const getActiveTabFromPath = (): TabType => {
    if (location.pathname.includes('/my-account/canceled-contracts')) {
      return 'canceled';
    }
    return 'transactions';
  };

  const [activeTab, setActiveTab] = useState<TabType>(getActiveTabFromPath());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: FIRST_PAGE,
    size: PAGE_SIZE,
    totalElements: 0,
    totalPages: 0,
  });

  const [currentPage, setCurrentPage] = useState(FIRST_PAGE);

  // Canceled contracts state
  const [canceledContracts, setCanceledContracts] = useState<CanceledContract[]>([]);
  const [canceledPagination, setCanceledPagination] = useState<Pagination>({
    page: FIRST_PAGE,
    size: PAGE_SIZE,
    totalElements: 0,
    totalPages: 0,
  });
  const [canceledCurrentPage, setCanceledCurrentPage] = useState(FIRST_PAGE);
  const [canceledFilter, setCanceledFilter] = useState<CanceledFilterType>('ALL');
  const [canceledLoading, setCanceledLoading] = useState(false);

  // Update active tab when URL changes
  useEffect(() => {
    const newTab = getActiveTabFromPath();
    if (newTab !== activeTab) {
      setActiveTab(newTab);
    }
  }, [location.pathname]);

  // 거래 내역 조회
  const fetchTransactions = async (page: number = FIRST_PAGE) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get<TransactionsResponse>('/members/me/transactions', {
        params: {
          page,
          size: PAGE_SIZE,
        },
      });

      const { summary, transactions, pagination } = response.data;

      setSummary(summary);
      setTransactions(transactions);
      setPagination(pagination);
      setCurrentPage(page);
    } catch (err: any) {
      console.error('Failed to fetch transactions:', err);
      setError(err.response?.data?.message || '거래 내역을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 취소된 계약 조회
  const fetchCanceledContracts = async (page: number = FIRST_PAGE, status?: string) => {
    try {
      setCanceledLoading(true);
      setError(null);

      const params: any = {
        page,
        size: PAGE_SIZE,
      };

      if (status && status !== 'ALL') {
        params.status = status;
      }

      const response = await apiClient.get<CanceledContractsResponse>('/contracts/canceled', {
        params,
      });

      setCanceledContracts(response.data.contracts);

      // If pagination exists in response, use it; otherwise create default
      if (response.data.pagination) {
        setCanceledPagination(response.data.pagination);
        setCanceledCurrentPage(page);
      } else {
        // Fallback if API doesn't return pagination
        setCanceledPagination({
          page,
          size: PAGE_SIZE,
          totalElements: response.data.contracts.length,
          totalPages: 1,
        });
        setCanceledCurrentPage(FIRST_PAGE);
      }
    } catch (err: any) {
      console.error('Failed to fetch canceled contracts:', err);
      setError(err.response?.data?.message || '취소된 계약을 불러올 수 없습니다.');
    } finally {
      setCanceledLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'transactions') {
      fetchTransactions(FIRST_PAGE);
    } else {
      fetchCanceledContracts(FIRST_PAGE, canceledFilter === 'ALL' ? undefined : canceledFilter);
    }
  }, [activeTab, canceledFilter]);

  // Tab change handler - updates URL
  const handleTabChange = (tab: TabType) => {
    if (tab === 'transactions') {
      navigate('/my-account/account');
    } else {
      navigate('/my-account/canceled-contracts');
    }
  };

  // 페이지 변경 핸들러 (거래 내역)
  const handlePageChange = (newPage: number) => {
    if (newPage >= FIRST_PAGE && newPage < pagination.totalPages) {
      fetchTransactions(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 페이지 변경 핸들러 (취소된 계약)
  const handleCanceledPageChange = (newPage: number) => {
    if (newPage >= FIRST_PAGE && newPage < canceledPagination.totalPages) {
      fetchCanceledContracts(newPage, canceledFilter === 'ALL' ? undefined : canceledFilter);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 거래 타입에 따른 배지 스타일
  const getTypeBadge = (type: string) => {
    const badges: Record<string, { text: string; color: string }> = {
      payment: { text: '입금', color: 'bg-blue-100 text-blue-700' },
      fee: { text: '수수료', color: 'bg-orange-100 text-orange-700' },
      settlement: { text: '정산', color: 'bg-green-100 text-green-700' },
    };
    return badges[type] || { text: '기타', color: 'bg-gray-100 text-gray-700' };
  };

  // 계약 상태 배지
  const getStatusBadge = (status: string) => {
    return status === 'CANCELLATION_REQUESTED'
      ? { text: '취소 요청됨', color: 'bg-orange-100 text-orange-700', icon: AlertCircle }
      : { text: '취소됨', color: 'bg-red-100 text-red-700', icon: XCircle };
  };

  // 페이지 번호 배열 생성 (거래 내역)
  const getPageNumbers = () => {
    const pages = [];
    const showPages = 5;
    let startPage = Math.max(FIRST_PAGE, currentPage - Math.floor(showPages / 2));
    let endPage = Math.min(pagination.totalPages - 1, startPage + showPages - 1);

    if (endPage - startPage < showPages - 1) {
      startPage = Math.max(FIRST_PAGE, endPage - showPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  // 페이지 번호 배열 생성 (취소된 계약)
  const getCanceledPageNumbers = () => {
    const pages = [];
    const showPages = 5;
    let startPage = Math.max(FIRST_PAGE, canceledCurrentPage - Math.floor(showPages / 2));
    let endPage = Math.min(canceledPagination.totalPages - 1, startPage + showPages - 1);

    if (endPage - startPage < showPages - 1) {
      startPage = Math.max(FIRST_PAGE, endPage - showPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (loading && activeTab === 'transactions') {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">거래 내역을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error && activeTab === 'transactions') {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => fetchTransactions(FIRST_PAGE)}
            className="px-4 py-2 bg-primary-yellow text-white rounded-lg hover:bg-amber-400"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col space-y-6 font-pretendard">
      <h1 className="text-3xl font-bold mb-6">내 계좌</h1>
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => handleTabChange('transactions')}
            className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
              activeTab === 'transactions'
                ? 'text-primary-yellow border-b-2 border-primary-yellow'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            거래 내역
          </button>
          <button
            onClick={() => handleTabChange('canceled')}
            className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
              activeTab === 'canceled'
                ? 'text-primary-yellow border-b-2 border-primary-yellow'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            취소된 계약
          </button>
        </div>
      </div>

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <>
          {/* 요약 정보 카드 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">거래 요약</h2>

            {role === 'LEADER' && summary?.leaderSummary && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">총 정산 예정 금액</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatAmount(summary.leaderSummary.totalDepositAmount)}원
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">총 정산 완료 금액</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatAmount(summary.leaderSummary.totalAmount)}원
                  </p>
                </div>
              </div>
            )}

            {role === 'ARTIST' && summary?.artistSummary && (
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">총 정산 금액</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatAmount(summary.artistSummary.totalAmount)}원
                </p>
              </div>
            )}
          </div>

          {/* 거래 내역 목록 */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold">거래 내역</h2>
              <p className="text-sm text-gray-600 mt-1">
                총 {formatAmount(pagination.totalElements)}건의 거래 내역
              </p>
            </div>

            {transactions.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500">거래 내역이 없습니다.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {transactions.map((transaction) => {
                  const badge = getTypeBadge(transaction.type);
                  return (
                    <div
                      key={transaction.transactionId}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${badge.color}`}
                            >
                              {badge.text}
                            </span>
                            <span className="text-sm text-gray-500">
                              {formatFullDateAndTime(transaction.createdAt)}
                            </span>
                          </div>
                          <p className="text-base font-medium text-gray-900 mb-1">
                            {transaction.description}
                          </p>
                          <p className="text-sm text-gray-600">
                            거래 ID: {transaction.transactionId}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <p
                            className={`text-xl font-bold ${
                              (role === 'LEADER' && transaction.type === 'payment') ||
                              (role === 'ARTIST' && transaction.type === 'settlement')
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {(role === 'LEADER' && transaction.type === 'payment') ||
                            (role === 'ARTIST' && transaction.type === 'settlement')
                              ? '+'
                              : '-'}
                            {formatAmount(transaction.amount)}원
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 페이지네이션 */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pb-8">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === FIRST_PAGE}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {getPageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 rounded-lg border border-gray-200 transition-colors ${
                    currentPage === page
                      ? 'bg-primary-yellow text-white border-primary-yellow'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {page + 1}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= pagination.totalPages - 1}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Canceled Contracts Tab */}
      {activeTab === 'canceled' && (
        <>
          {/* Filter buttons */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex gap-2">
              <button
                onClick={() => setCanceledFilter('ALL')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  canceledFilter === 'ALL'
                    ? 'bg-primary-yellow text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                전체
              </button>
              <button
                onClick={() => setCanceledFilter('CANCELLATION_REQUESTED')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  canceledFilter === 'CANCELLATION_REQUESTED'
                    ? 'bg-primary-yellow text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                취소 요청됨
              </button>
              <button
                onClick={() => setCanceledFilter('CANCELED')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  canceledFilter === 'CANCELED'
                    ? 'bg-primary-yellow text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                취소됨
              </button>
            </div>
          </div>

          {/* Canceled contracts list */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold">취소된 계약</h2>
              <p className="text-sm text-gray-600 mt-1">
                총 {formatAmount(canceledPagination?.totalElements || canceledContracts.length)}건의
                취소된 계약
              </p>
            </div>

            {canceledLoading ? (
              <div className="p-12 text-center">
                <div className="w-8 h-8 border-4 border-primary-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">취소된 계약을 불러오는 중...</p>
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() =>
                    fetchCanceledContracts(
                      FIRST_PAGE,
                      canceledFilter === 'ALL' ? undefined : canceledFilter,
                    )
                  }
                  className="px-4 py-2 bg-primary-yellow text-white rounded-lg hover:bg-yellow-500"
                >
                  다시 시도
                </button>
              </div>
            ) : canceledContracts.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500">취소된 계약이 없습니다.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {canceledContracts.map((contract) => {
                  const statusBadge = getStatusBadge(contract.status);
                  const StatusIcon = statusBadge.icon;

                  return (
                    <div
                      key={contract.contractId}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${statusBadge.color}`}
                            >
                              <StatusIcon className="w-3 h-3" />
                              {statusBadge.text}
                            </span>
                            <span className="text-sm text-gray-500">
                              {formatFullDateAndTime(contract.createdAt)}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">{contract.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">
                            프로젝트: {contract.project.title} ({contract.project.positionName})
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>리더: {contract.leader.nickname}</span>
                            <span>아티스트: {contract.artist.nickname}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                            <span>시작: {formatFullDateAndTime(contract.startAt)}</span>
                            <span>종료: {formatFullDateAndTime(contract.endAt)}</span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-xl font-bold text-gray-900">
                            {formatAmount(contract.totalAmount)}원
                          </p>
                          <p className="text-xs text-gray-500 mt-1">계약 금액</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 페이지네이션 (취소된 계약) */}
          {canceledPagination && canceledPagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pb-8">
              <button
                onClick={() => handleCanceledPageChange(canceledCurrentPage - 1)}
                disabled={canceledCurrentPage === FIRST_PAGE}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {getCanceledPageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => handleCanceledPageChange(page)}
                  className={`px-4 py-2 rounded-lg border border-gray-200 transition-colors ${
                    canceledCurrentPage === page
                      ? 'bg-primary-yellow text-white border-primary-yellow'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {page + 1}
                </button>
              ))}

              <button
                onClick={() => handleCanceledPageChange(canceledCurrentPage + 1)}
                disabled={canceledCurrentPage >= canceledPagination.totalPages - 1}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AccountSection;

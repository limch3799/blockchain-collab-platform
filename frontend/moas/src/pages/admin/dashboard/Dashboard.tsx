// src/pages/admin/dashboard/Dashboard.tsx
import { useState, useEffect } from 'react';
import { Users, Package, ShoppingCart, Wallet, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardAlerts } from './components/DashboardAlerts';
import { RecentUsers } from './components/RecentUsers';
import { getMemberList } from '@/api/admin/member';
import { getContractList } from '@/api/admin/contract';
import { getLeaderProjects } from '@/api/admin/project';
import { getPaymentList } from '@/api/admin/settlement_history';
import type { ContractListItem } from '@/api/admin/contract';

const Dashboard = () => {
  const navigate = useNavigate();
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalContracts, setTotalContracts] = useState<number>(0);
  const [recruitingProjects, setRecruitingProjects] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [recentContracts, setRecentContracts] = useState<ContractListItem[]>([]);
  const [isLoadingRevenue, setIsLoadingRevenue] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [usersData, contractsData, projectsData] = await Promise.all([
        getMemberList(1, 1),
        getContractList(1, 1),
        getLeaderProjects({ page: 0, size: 1 }),
      ]);

      setTotalUsers(usersData.pageInfo.totalElements);
      setTotalContracts(contractsData.pageInfo.totalElements);
      setRecruitingProjects(projectsData.pageInfo.totalElements);

      // 최근 계약 5개 조회
      const recentContractsData = await getContractList(1, 5);
      setRecentContracts(recentContractsData.content);

      // 총 매출 계산
      calculateTotalRevenue();
    } catch (err) {
      console.error('대시보드 데이터 조회 실패:', err);
    }
  };

  const calculateTotalRevenue = async () => {
    setIsLoadingRevenue(true);
    try {
      let totalAmount = 0;
      let currentPage = 0; // API는 0부터 시작
      let hasMoreData = true;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      while (hasMoreData) {
        const paymentData = await getPaymentList({
          types: 'PAYMENT',
          statuses: 'COMPLETED',
          page: currentPage,
          size: 20,
        });

        if (paymentData.content.length === 0) {
          hasMoreData = false;
          break;
        }

        for (const payment of paymentData.content) {
          const paymentDate = new Date(payment.createdAt);
          paymentDate.setHours(0, 0, 0, 0);

          if (paymentDate.getTime() === today.getTime()) {
            totalAmount += payment.paymentAmount;
          } else if (paymentDate < today) {
            // 오늘보다 이전 날짜면 더 이상 조회 불필요
            hasMoreData = false;
            break;
          }
        }

        // 마지막 아이템이 오늘 날짜인지 확인
        const lastPayment = paymentData.content[paymentData.content.length - 1];
        const lastPaymentDate = new Date(lastPayment.createdAt);
        lastPaymentDate.setHours(0, 0, 0, 0);

        if (lastPaymentDate < today) {
          hasMoreData = false;
        } else if (paymentData.last) {
          // 마지막 페이지면 종료
          hasMoreData = false;
        } else {
          currentPage++;
        }
      }

      setTotalRevenue(totalAmount);
    } catch (err) {
      console.error('매출 계산 실패:', err);
    } finally {
      setIsLoadingRevenue(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const stats = [
    {
      icon: Users,
      label: '총 사용자',
      value: totalUsers.toLocaleString(),
      change: '',
      changeType: 'increase',
      onClick: () => navigate('/admin/users'),
    },
    {
      icon: Package,
      label: '모집 중 프로젝트',
      value: recruitingProjects.toLocaleString(),
      change: '',
      changeType: 'increase',
      onClick: () => navigate('/admin/project'),
    },
    {
      icon: ShoppingCart,
      label: '진행 중 계약',
      value: totalContracts.toLocaleString(),
      change: '',
      changeType: 'increase',
      onClick: () => navigate('/admin/contract'),
    },
    {
      icon: Wallet,
      label: '오늘 매출',
      value: isLoadingRevenue ? '...' : totalRevenue.toLocaleString(),
      unit: '원',
      change: '',
      changeType: 'increase',
      onClick: () => navigate('/admin/settlement'),
    },
  ];

  return (
    <div className="p-8">
      {/* 알림 섹션 */}
      <DashboardAlerts />

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              onClick={stat.onClick}
              className="bg-white px-6 py-8 rounded-xl cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                {/* 1. 아이콘 섹션 (왼쪽) */}
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>

                  {/* 2. 텍스트/숫자 섹션 (아이콘의 오른쪽) */}
                  <div>
                    <p className="text-base text-gray-600 mb-1">{stat.label}</p>
                    <p className={`font-bold text-gray-800 ${stat.unit ? 'text-2xl' : 'text-3xl'}`}>
                      {stat.value}
                      {stat.unit && <span className="text-base ml-1">{stat.unit}</span>}
                    </p>
                  </div>
                </div>

                {/* 3. 변화율 섹션 (오른쪽 끝) */}
                {stat.change && (
                  <span className="text-sm font-medium text-green-600 self-start">
                    {stat.change}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 최근 활동 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">최근 계약</h2>
            <button
              onClick={() => navigate('/admin/contract')}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ArrowRight className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
            </button>
          </div>
          <div className="space-y-4">
            {recentContracts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">최근 계약이 없습니다.</div>
            ) : (
              recentContracts.map((contract) => (
                <div
                  key={contract.contractId}
                  onClick={() => navigate('/admin/contract')}
                  className="flex items-center justify-between py-3 border-b border-gray-300 last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors -mx-2 px-2"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-800">{contract.leader.nickname}</span>
                      <span className="bg-moas-leader text-white text-xs px-2 py-0.5 rounded-full font-medium">
                        리더
                      </span>
                      <span className="text-gray-400">↔</span>
                      <span className="font-medium text-gray-800">{contract.artist.nickname}</span>
                      <span className="bg-moas-artist text-white text-xs px-2 py-0.5 rounded-full font-medium">
                        아티스트
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{formatDateTime(contract.createdAt)}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-semibold text-gray-800">
                      {contract.amount.toLocaleString()}원
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <RecentUsers />
      </div>
    </div>
  );
};

export default Dashboard;

// src/components/layout/AdminLayout.tsx
import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutGrid,
  UserCog,
  FileSignature,
  Wallet,
  Paperclip,
  MessageCircle,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import favicon from '@/assets/favicon.png';
import { adminApi } from '@/api/admin/auth';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const menuItems = [
    { icon: LayoutGrid, label: '홈', path: '/admin/dashboard' },
    { icon: UserCog, label: '사용자 관리', path: '/admin/users' },
    { icon: Paperclip, label: '프로젝트 관리', path: '/admin/project' },
    { icon: FileSignature, label: '계약 관리', path: '/admin/contract' },
    { icon: Wallet, label: '정산 관리', path: '/admin/settlement' },
    { icon: MessageCircle, label: '이용문의', path: '/admin/inquiry' },

    // { icon: Settings, label: '설정', path: '/admin/settings' },
  ];

  const handleLogout = async () => {
    if (isLoggingOut) return;

    const confirmLogout = window.confirm('로그아웃 하시겠습니까?');
    if (!confirmLogout) return;

    setIsLoggingOut(true);

    try {
      const accessToken = localStorage.getItem('adminAccessToken');
      const refreshToken = localStorage.getItem('adminRefreshToken');

      if (accessToken && refreshToken) {
        // 로그아웃 API 호출
        await adminApi.logout({ refreshToken }, accessToken);
      }
    } catch (error) {
      console.error('Logout API failed:', error);
      // API 실패해도 로컬 스토리지는 정리
    } finally {
      // 로컬 스토리지에서 토큰 제거
      localStorage.removeItem('adminAccessToken');
      localStorage.removeItem('adminRefreshToken');
      localStorage.removeItem('adminName');
      localStorage.removeItem('adminId');

      setIsLoggingOut(false);
      navigate('/admin/login');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-pretendard">
      {/* 사이드바 */}
      <aside className="w-64 bg-moas-navy2 flex flex-col">
        {/* 로고 */}
        <div className="h-16 flex items-center gap-4 px-6 border-b border-moas-gray-1/30">
          <img src={favicon} alt="MOAS logo" className="w-8 h-8 object-contain" />
          <h1 className="text-xl font-bold text-moas-gray-1 tracking-tight">MOAS Admin</h1>
        </div>

        {/* 메뉴 */}
        <nav className="flex-1 overflow-y-auto py-4 px-0">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  // cursor-pointer 추가
                  'flex items-center gap-3 pr-0 py-3 text-left transition-colors cursor-pointer',
                  isActive
                    ? // 활성화 스타일
                      'w-full bg-moas-gray-1 text-moas-navy2 rounded-l-lg ml-0 pl-6'
                    : // 비활성화 스타일 (호버 효과 제거: hover:bg-moas-gray-1/10 삭제됨)
                      'w-[calc(100%-8px)] text-moas-gray-1 ml-2 pl-4',
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* 관리자 정보 & 로그아웃 */}
        <div className="border-t border-moas-gray-1/30">
          {/* 관리자 정보 */}
          <div className="px-6 py-4">
            <p className="text-sm text-moas-gray-1/70">관리자 명</p>
            <p className="font-medium text-moas-gray-1">
              {localStorage.getItem('adminName') || '관리자'}
            </p>
          </div>

          {/* 로그아웃 버튼 */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-3 px-6 py-3 text-red-400 hover:bg-moas-gray-1/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed justify-end cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">{isLoggingOut ? '로그아웃 중...' : '로그아웃'}</span>
          </button>
        </div>
      </aside>

      {/* 메인 컨텐츠 */}
      <main className="flex-1 overflow-y-auto bg-moas-gray-1">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

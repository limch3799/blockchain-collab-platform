// src/components/layout/Header.tsx
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import logoImage from '@/assets/header/logo.png';
import { HeaderProfile } from './HeaderProfile';
import { HeaderIcon } from './HeaderIcon';
import { ProfileModal } from './ProfileModal';
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  useWeb3Auth,
  useWeb3AuthConnect,
  useWeb3AuthDisconnect,
  useWeb3AuthUser,
} from '@web3auth/modal/react';
// import web3authLogo from '@/assets/web3auth.png';
import { useSSEStore } from '@/store/sseStore';
import { useAuth } from '@/hooks/useAuth';
import { useAccount } from 'wagmi';
import { getMyBookmarks } from '@/api/bookmark';
import {
  saveBookmarksToStorage,
  clearBookmarksFromStorage,
} from '@/pages/project-post/bookmarkUtils';

// 알림 관련 로컬스토리지 키
const NOTIFICATION_FETCH_KEY = 'lastNotificationFetch';
const NOTIFICATION_CACHE_KEY = 'cachedNotifications';

export function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isWeb3AuthModalOpen, setIsWeb3AuthModalOpen] = useState(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const { web3Auth } = useWeb3Auth();

  const { connect, isConnected } = useWeb3AuthConnect();
  const { disconnect } = useWeb3AuthDisconnect();
  const { getUserInfo } = useWeb3AuthUser();
  const { address: wagmiAddress, isConnected: isWagmiConnected } = useAccount();

  const { handleWeb3AuthLogin, handleLogout, isAuthenticated, getUserInfoFromStorage } = useAuth();

  const [backendLoginAttempted, setBackendLoginAttempted] = useState(false);

  const hideSearchBar = location.pathname === '/project-post';

  const floatingBoxConfig = {
    zIndex: 2147483647,
    width: '370px',
    height: '250px',
    padding: '32px',
    xOffset: '8px',
    yOffset: '90px',
  };

  const handleSignUp = async () => {
    console.log('🟢 로그인 모달 열기 시도...');
    await connect();
  };

  const handleLogoutClick = async () => {
    const disconnectSSE = useSSEStore.getState().disconnect;
    // Disconnect SSE
    disconnectSSE();

    setIsLoggedIn(false);
    if (isConnected) {
      await disconnect();
    }
    handleLogout();

    // 알림 관련 로컬스토리지 삭제
    localStorage.removeItem(NOTIFICATION_FETCH_KEY);
    localStorage.removeItem(NOTIFICATION_CACHE_KEY);

    // 북마크 로컬스토리지 삭제
    clearBookmarksFromStorage();

    setBackendLoginAttempted(false);
    navigate('/');
    window.location.reload();
  };

  const handleHeaderSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && headerSearchQuery.trim()) {
      navigate('/project-post', { state: { searchQuery: headerSearchQuery.trim() } });
      setHeaderSearchQuery('');
    }
  };

  const handleHelpClick = (e: React.MouseEvent) => {
    if (!userLoggedIn) {
      e.preventDefault();
      alert('로그인 후 이용 가능합니다.');
    }
  };

  const isActive = (path: string) => location.pathname === path;
  const userLoggedIn = isLoggedIn || isConnected || isAuthenticated;

  const userInfo = getUserInfoFromStorage();
  const userRole = userInfo?.role;

  const myProjectLink = userRole === 'LEADER' ? '/leader-project-list' : '/artist-project-list';

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const storedUser = getUserInfoFromStorage();
        const hasToken = localStorage.getItem('accessToken');

        if (storedUser && hasToken) {
          setIsLoggedIn(true);

          // 로그인 상태면 북마크 목록 로드
          try {
            clearBookmarksFromStorage();
            const bookmarks = await getMyBookmarks();
            saveBookmarksToStorage(bookmarks);
            // console.log('북마크 목록 로드 완료:', bookmarks);
          } catch (error) {
            console.error('북마크 목록 로드 실패:', error);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (!web3Auth) return;

    const handleModalVisibility = (isVisible: boolean) => {
      if (isVisible) {
        console.log('🪟 Web3Auth 로그인 모달이 열렸습니다.');
        setIsWeb3AuthModalOpen(true);
      } else {
        console.log('❌ Web3Auth 로그인 모달이 닫혔습니다.');
        setIsWeb3AuthModalOpen(false);
      }
    };

    web3Auth.on('MODAL_VISIBILITY', handleModalVisibility);

    return () => {
      web3Auth.off('MODAL_VISIBILITY', handleModalVisibility);
    };
  }, [web3Auth]);

  // ✅ Web3Auth 로그인 후 백엔드 처리 + 리다이렉트
  useEffect(() => {
    const allReady = isConnected && isWagmiConnected && wagmiAddress && !backendLoginAttempted;

    if (allReady) {
      setBackendLoginAttempted(true);

      getUserInfo()
        .then(async (info) => {
          console.log('📱 Web3Auth 사용자 정보:', info);
          console.log('✅ Wagmi 지갑 주소:', wagmiAddress);
          if (info?.idToken && wagmiAddress) {
            const result = await handleWeb3AuthLogin(info.idToken, wagmiAddress);

            if (result.success) {
              console.log('🎉 전체 로그인 프로세스 완료!');

              // 로그인 성공 시 북마크 목록 로드
              try {
                clearBookmarksFromStorage();
                const bookmarks = await getMyBookmarks();
                saveBookmarksToStorage(bookmarks);
                //console.log('북마크 목록 로드 완료:', bookmarks);
              } catch (error) {
                console.error('북마크 목록 로드 실패:', error);
              }

              // ✅ 로그인 성공 시 모달 닫기
              setIsWeb3AuthModalOpen(false);

              // ✅ 역할 선택이 필요한 경우 리다이렉트
              if (result.needsRoleSelection) {
                console.log('🔄 역할 선택 페이지로 이동...');
                navigate('/select-role');
              }
            } else {
              console.error('❌ 백엔드 로그인 실패:', result.error);
              setIsWeb3AuthModalOpen(false);
              await disconnect();
            }
          } else {
            console.error('❌ idToken 또는 wagmiAddress가 없습니다.');
            setIsWeb3AuthModalOpen(false);
            await disconnect();
          }
        })
        .catch(async (err) => {
          console.error('❌ 로그인 프로세스 실패:', err);
          setIsWeb3AuthModalOpen(false);
          await disconnect();
        });
    }
  }, [
    isConnected,
    isWagmiConnected,
    wagmiAddress,
    getUserInfo,
    handleWeb3AuthLogin,
    disconnect,
    backendLoginAttempted,
    navigate,
  ]);

  useEffect(() => {
    if (isAuthenticated) {
      setIsLoggedIn(true);
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return null;
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b-0 font-pretendard">
        <div className="mx-auto w-[80%]">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center">
                <img src={logoImage} alt="Moas Logo" className="h-7 w-auto" />
              </Link>

              {!hideSearchBar && (
                <div className="relative w-72">
                  <Search className="absolute left-3 top-[8px] h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="찾고있는 프로젝트가 있으신가요?"
                    className="pl-10 placeholder:text-gray-400 font-medium bg-white"
                    value={headerSearchQuery}
                    onChange={(e) => setHeaderSearchQuery(e.target.value)}
                    onKeyPress={handleHeaderSearchKeyPress}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-8">
              <nav className="flex gap-6 text-base font-medium">
                <Link
                  to="/project-post"
                  className={`hover:text-main transition-colors ${
                    isActive('/project-post') ? 'text-moas-main' : ''
                  }`}
                >
                  프로젝트 찾기
                </Link>
                {userLoggedIn && (
                  <Link
                    to={myProjectLink}
                    className={`hover:text-main transition-colors ${
                      isActive('/my-project') || isActive(myProjectLink) ? 'text-moas-main' : ''
                    }`}
                  >
                    내 프로젝트
                  </Link>
                )}
                <Link
                  to="/help"
                  onClick={handleHelpClick}
                  className={`hover:text-moas-main transition-colors ${
                    isActive('/help') ? 'text-moas-main' : ''
                  }`}
                >
                  이용 문의
                </Link>
              </nav>

              {userLoggedIn ? (
                <div className="flex items-center gap-6">
                  <HeaderIcon />
                  <div className="relative">
                    <div onClick={() => setIsProfileModalOpen(!isProfileModalOpen)}>
                      <HeaderProfile />
                    </div>
                    <ProfileModal
                      isOpen={isProfileModalOpen}
                      onClose={() => setIsProfileModalOpen(false)}
                      onLogout={handleLogoutClick}
                    />
                  </div>
                </div>
              ) : (
                <nav className="flex gap-6 items-center text-base font-medium font-pretendard">
                  <button
                    onClick={handleSignUp}
                    className="bg-moas-main px-5 py-2 flex items-center justify-center rounded-md hover:opacity-90 transition-opacity text-white font-medium"
                  >
                    로그인
                  </button>
                </nav>
              )}
            </div>
          </div>
        </div>
      </header>

      {isWeb3AuthModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-between bg-black/60 text-white font-semibold text-2xl z-[9999] px-32"
          style={{
            backdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.4s ease-out',
          }}
        >
          <p className="animate-slideUp font-pretendard text-3xl">
            별도의 회원가입 절차가
            <br />
            <span className="bg-red-500 text-white px-2 py-1 rounded">필요 없습니다</span>
          </p>

          <p className="animate-slideUp font-pretendard text-center leading-relaxed">
            소셜 로그인으로
            <br />
            <span className="text-3xl font-semibold text-white bg-moas-artist px-2 py-1 rounded">
              지갑 생성
            </span>{' '}
            과{' '}
            <span className="text-3xl font-semibold text-white bg-moas-leader px-2 py-1 rounded">
              회원가입
            </span>
            이 자동으로
          </p>

          <div
            className="absolute"
            style={{
              zIndex: floatingBoxConfig.zIndex,
              transform: `translate(${floatingBoxConfig.xOffset}, ${floatingBoxConfig.yOffset})`,
            }}
          />
        </div>
      )}

      <style>{`
  @keyframes slideUp {
    0% {
      transform: translateY(100%);
      opacity: 0;
    }
    100% {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .animate-slideUp {
    animation: slideUp 0.8s ease-out forwards;
  }
`}</style>

      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100vh);
            opacity: 1;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}

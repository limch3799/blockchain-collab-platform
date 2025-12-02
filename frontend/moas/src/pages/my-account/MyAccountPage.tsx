// src/pages/my-account/MyAccountPage.tsx
import { useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useMemberStore } from '@/store/memberStore';

// import { ProfileEditModal } from './components'; // ⚙️ 현재 사용하지 않으므로 주석 처리

import DefaultProfileImage1 from '@/assets/header/default_profile/default_profile_1.png';

const MyAccountPage = () => {
  // STATE
  // const [isModalOpen, setIsModalOpen] = useState(false); // ⚙️ 사용하지 않으므로 주석 처리
  // const [loading, setLoading] = useState<boolean>(true);
  // const [error, setError] = useState<string | null>(null);

  const { fetchMemberInfo, memberInfo } = useMemberStore();
  const { getUserInfoFromStorage } = useAuth();
  const navigate = useNavigate();

  const userInfo = getUserInfoFromStorage();
  const role = userInfo?.role ?? 'ARTIST';
  const isArtist = role === 'ARTIST'; // 아티스트 여부 변수 사용

  const nickname = memberInfo?.nickname || '사용자';
  const biography = memberInfo?.biography;
  // const phoneNumber = memberInfo?.phoneNumber;
  const profileImageUrl = memberInfo?.profileImageUrl || DefaultProfileImage1;

  // 역할 표시 텍스트 및 스타일 결정
  const getRoleDisplay = () => {
    if (role === 'ARTIST') {
      return {
        text: '아티스트',
        bgColor: 'bg-moas-artist',
      };
    } else if (role === 'LEADER') {
      return {
        text: '리더',
        bgColor: 'bg-moas-leader',
      };
    } else {
      return {
        text: '미설정',
        bgColor: 'bg-black',
      };
    }
  };

  const roleDisplay = getRoleDisplay();

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      // setLoading(true);
      fetchMemberInfo();
    } catch (err: any) {
      console.error('Failed to load user profile:', err);
      // setError(err.response?.data?.message || '채팅방 목록을 불러올 수 없습니다.');
    } finally {
      // setLoading(false);
    }
  };

  // FUNCTIONS
  // const openModal = () => setIsModalOpen(true);
  // const closeModal = () => setIsModalOpen(false);
  // const handleSaveProfile = (data: {
  //   nickname: string;
  //   biography: string;
  //   phoneNumber: string;
  //   profileImageUrl: string | null;
  // }) => {
  //   loadUserProfile();
  // };

  // 👉 프로필 수정 버튼 클릭 시 /setup-profile로 이동하도록 변경
  const handleNavigateToSetupProfile = () => {
    navigate('/setup-profile');
  };

  return (
    <div className="flex gap-8 min-h-screen font-pretendard">
      {/* Sidebar */}
      <div className="flex flex-col items-center w-50 space-y-6">
        {/* Profile */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <img src={profileImageUrl} alt="profile" className="rounded-full w-24 h-24" />
            <span
              className={`absolute top-0 right-0 translate-x-1/3 translate-y-1/3 ${roleDisplay.bgColor} text-white text-xs px-2 py-1 rounded-md font-medium`}
            >
              {roleDisplay.text}
            </span>
          </div>
          <h2 className="text-xl font-semibold text-center">{nickname}</h2>
          <p className="text-sm text-center">{biography || '사용자 소개가 없습니다.'}</p>
          <Button variant="outline" size="sm" onClick={handleNavigateToSetupProfile}>
            프로필 수정
          </Button>
        </div>

        {/* {isModalOpen && (
          <ProfileEditModal
            isOpen={isModalOpen}
            initialData={{
              nickname,
              biography: biography || '',
              phoneNumber: phoneNumber || '',
              profileImageUrl: memberInfo?.profileImageUrl || null,
            }}
            onClose={closeModal}
            onSave={handleSaveProfile}
          />
        )} */}

        {/* Tabs */}
        <div className="flex flex-col w-full text-gray-600 text-sm">
          <NavLink
            to="/my-account"
            end
            className={({ isActive }) =>
              `justify-start text-left px-2 py-2 rounded ${
                isActive ? 'font-bold text-black' : 'text-gray-600'
              }`
            }
          >
            마이 페이지
          </NavLink>
          <NavLink
            to="/my-account/account"
            className={({ isActive }) =>
              `justify-start text-left px-2 py-2 rounded ${
                isActive ? 'font-bold text-black' : 'text-gray-600'
              }`
            }
          >
            내 계좌
          </NavLink>
          {/* ARTIST 역할인 경우에만 '내 포트폴리오' 표시 */}
          {isArtist && (
            <NavLink
              to="/my-portfolio"
              className={({ isActive }) =>
                `justify-start text-left px-2 py-2 rounded ${
                  isActive ? 'font-bold text-black' : 'text-gray-600'
                }`
              }
            >
              내 포트폴리오
            </NavLink>
          )}
          <NavLink
            to="/my-account/reviews"
            className={({ isActive }) =>
              `justify-start text-left px-2 py-2 rounded ${
                isActive ? 'font-bold text-black' : 'text-gray-600'
              }`
            }
          >
            내 리뷰
          </NavLink>
        </div>
      </div>

      <Outlet />
    </div>
  );
};

export default MyAccountPage;

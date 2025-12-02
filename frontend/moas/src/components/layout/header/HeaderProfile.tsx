// src/components/layout/HeaderProfile.tsx
import DefaultProfileImage1 from '@/assets/header/default_profile/default_profile_1.png';
import { useAuth } from '@/hooks/useAuth';

export function HeaderProfile() {
  const { getUserInfoFromStorage } = useAuth();
  const userInfo = getUserInfoFromStorage();

  const profileImageUrl = userInfo?.profileImageUrl || DefaultProfileImage1;
  const nickname = userInfo?.nickname || '사용자';
  const role = userInfo?.role || 'ARTIST';

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

  return (
    <nav className="flex items-center gap-3 text-sm font-pretendard">
      {/* 프로필 이미지 */}
      <a className="flex items-center">
        <img
          src={profileImageUrl}
          alt="Profile Image"
          className="h-10 w-10 rounded-full object-cover"
        />
      </a>

      {/* 오른쪽 텍스트 영역 */}
      <div className="flex flex-col justify-between h-10 py-0.5">
        <span
          className={`${roleDisplay.bgColor} text-white text-[11px] px-[3px] py-[0.4px] rounded-md transition-opacity self-start font-medium`}
        >
          {roleDisplay.text}
        </span>
        <a>
          <span className="text-[17px] font-semibold">{nickname}</span>
          <span className="text-[13px] ml-[1px] font-medium">&nbsp;</span>
        </a>
      </div>
    </nav>
  );
}

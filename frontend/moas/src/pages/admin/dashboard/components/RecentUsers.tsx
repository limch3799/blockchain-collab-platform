// src/pages/admin/dashboard/components/RecentUsers.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowRight, Loader2 } from 'lucide-react';
import { getMemberList, getMemberDetail } from '@/api/admin/member';
import { MemberDetailModal } from '../../user/components/MemberDetailModal';

interface UserWithDetail {
  id: number;
  nickname: string;
  email: string | null;
  profileImageUrl: string | null;
  createdAt: string;
  role: 'LEADER' | 'ARTIST' | 'PENDING';
}

export const RecentUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserWithDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  useEffect(() => {
    loadRecentUsers();
  }, []);

  const loadRecentUsers = async () => {
    try {
      setIsLoading(true);

      // 최근 가입 순으로 5명 가져오기
      const memberListData = await getMemberList(1, 5, undefined, undefined, 'desc');

      // 각 사용자의 상세 정보 가져오기 (프로필 이미지 포함)
      const usersWithDetails = await Promise.all(
        memberListData.content.map(async (member) => {
          try {
            const detail = await getMemberDetail(member.id);
            return {
              id: member.id,
              nickname: member.nickname,
              email: member.email,
              profileImageUrl: detail.profileImageUrl,
              createdAt: member.createdAt,
              role: detail.role,
            };
          } catch {
            return {
              id: member.id,
              nickname: member.nickname,
              email: member.email,
              profileImageUrl: null,
              createdAt: member.createdAt,
              role: member.role,
            };
          }
        }),
      );

      setUsers(usersWithDetails);
    } catch (err) {
      console.error('신규 사용자 로드 실패:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSectionClick = () => {
    navigate('/admin/users');
  };

  const handleUserClick = (e: React.MouseEvent, userId: number) => {
    e.stopPropagation();
    setSelectedUserId(userId);
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - past.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return '방금 전';
    if (diffInHours < 24) return `${diffInHours}시간 전`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}일 전`;

    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}주 전`;
  };

  const getRoleBadge = (role: 'LEADER' | 'ARTIST' | 'PENDING') => {
    const roleMap = {
      LEADER: { label: '리더', bgColor: 'bg-moas-leader' },
      ARTIST: { label: '아티스트', bgColor: 'bg-moas-artist' },
      PENDING: { label: '미설정', bgColor: 'bg-gray-400' },
    };
    return roleMap[role];
  };

  return (
    <>
      <div onClick={handleSectionClick} className="bg-white p-6 rounded-xl  cursor-pointer ">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">신규 사용자</h2>
          <ArrowRight className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => {
              const roleBadge = getRoleBadge(user.role);
              return (
                <div
                  key={user.id}
                  onClick={(e) => handleUserClick(e, user.id)}
                  className="flex items-center justify-between py-3 border-b border-gray-300 last:border-b-0 hover:bg-gray-50 -mx-2 px-2 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    {user.profileImageUrl ? (
                      <img
                        src={user.profileImageUrl}
                        alt={user.nickname}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-800">{user.nickname}</p>
                        <span
                          className={`${roleBadge.bgColor} text-white text-xs px-2 py-0.5 rounded-full font-medium`}
                        >
                          {roleBadge.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{user.email || '이메일 없음'}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{getTimeAgo(user.createdAt)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedUserId && (
        <MemberDetailModal memberId={selectedUserId} onClose={() => setSelectedUserId(null)} />
      )}
    </>
  );
};

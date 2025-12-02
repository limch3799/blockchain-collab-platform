// src/pages/admin/user/components/MemberItem.tsx
import type { MemberListItem } from '@/api/admin/member';

interface MemberItemProps {
  member: MemberListItem;
  index: number;
  onClick: () => void;
}

export const MemberItem = ({ member, index, onClick }: MemberItemProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`;
  };

  const getRoleBadge = (role: 'LEADER' | 'ARTIST' | 'PENDING') => {
    const roleMap = {
      LEADER: { label: '리더', color: 'bg-blue-100 text-blue-700 border-blue-300' },
      ARTIST: { label: '아티스트', color: 'bg-purple-100 text-purple-700 border-purple-300' },
      PENDING: { label: '미결정', color: 'bg-gray-100 text-gray-700 border-gray-300' },
    };
    return roleMap[role];
  };

  const roleBadge = getRoleBadge(member.role);

  return (
    <tr
      onClick={onClick}
      className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
    >
      <td className="px-6 py-4">
        <div className="flex justify-center">
          <span className="w-6 h-6 flex items-center justify-center text-xs font-bold text-white bg-gray-500 rounded-md">
            {index}
          </span>
        </div>
      </td>

      <td className="px-6 py-4 text-sm text-gray-700">{member.id}</td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          {member.profileImageUrl ? (
            <img
              src={member.profileImageUrl}
              alt={member.nickname}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-sm font-semibold">
                {member.nickname.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-gray-800">{member.nickname}</p>
            <p className="text-xs text-gray-500">{member.email || '이메일 없음'}</p>
          </div>
        </div>
      </td>

      <td className="px-4 py-4">
        <div className="flex justify-start">
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full border ${roleBadge.color}`}
          >
            {roleBadge.label}
          </span>
        </div>
      </td>

      <td className="px-6 py-4 text-sm text-gray-700 text-center">
        {member.stats.averageRating.toFixed(1)}
      </td>

      <td className="px-6 py-4 text-sm text-gray-700 text-center">{member.stats.reviewCount}개</td>

      <td className="px-6 py-4 text-sm text-gray-700 text-center">
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            member.stats.penaltyScore > 0
              ? 'bg-red-100 text-red-700'
              : 'bg-green-100 text-green-700'
          }`}
        >
          {member.stats.penaltyScore}점
        </span>
      </td>

      <td className="px-6 py-4 text-sm text-gray-700 text-center font-semibold whitespace-nowrap">
        {formatDate(member.createdAt)}
      </td>
    </tr>
  );
};

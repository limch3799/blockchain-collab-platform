// src/pages/admin/user/components/MemberList.tsx
import type { MemberListItem } from '@/api/admin/member';
import { MemberItem } from './MemberItem';

interface MemberListProps {
  members: MemberListItem[];
  currentPage: number;
  pageSize: number;
  onMemberClick: (memberId: number) => void;
}

export const MemberList = ({ members, currentPage, pageSize, onMemberClick }: MemberListProps) => {
  if (members.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-20 text-center">
        <p className="text-gray-600">회원이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b-2 border-gray-200">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800 w-16">No.</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800 w-24">ID</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">회원 정보</th>
            <th className="px-4 py-4 text-left text-sm font-semibold text-gray-800 w-28">역할</th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-800 w-24">평가</th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-800 w-24">리뷰</th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-800 w-24">
              페널티
            </th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-800 w-48">
              가입일
            </th>
          </tr>
        </thead>
        <tbody>
          {members.map((member, index) => {
            const displayIndex = (currentPage - 1) * pageSize + index + 1;
            return (
              <MemberItem
                key={member.id}
                member={member}
                index={displayIndex}
                onClick={() => onMemberClick(member.id)}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

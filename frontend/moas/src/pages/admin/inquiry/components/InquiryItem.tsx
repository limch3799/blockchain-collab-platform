// src/pages/admin/inquiry/components/InquiryItem.tsx
import type { AdminInquiryListItem } from '@/api/admin/inquiry';

interface InquiryItemProps {
  inquiry: AdminInquiryListItem & { memberNickname?: string; profileImageUrl?: string };
  index: number;
  onClick: () => void;
}

export const InquiryItem = ({ inquiry, index, onClick }: InquiryItemProps) => {
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

  const getStatusText = (status: 'PENDING' | 'ANSWERED') => {
    return status === 'PENDING' ? '답변 대기중' : '답변 완료';
  };

  const getStatusColor = (status: 'PENDING' | 'ANSWERED') => {
    return status === 'PENDING'
      ? 'bg-gray-400 text-white border-gray-400'
      : 'bg-black text-white border-black';
  };

  const getCategoryText = (category: 'MEMBER' | 'CONTRACT' | 'PAYMENT' | 'OTHERS') => {
    const categoryMap = {
      MEMBER: '사용자관리',
      CONTRACT: '계약관리',
      PAYMENT: '정산관리',
      OTHERS: '기타',
    };
    return categoryMap[category];
  };

  return (
    <tr
      onClick={onClick}
      className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
    >
      <td className="px-8 py-4 text-sm text-gray-700">{index}</td>
      <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
        {formatDate(inquiry.createdAt)}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          {inquiry.profileImageUrl && (
            <img
              src={inquiry.profileImageUrl}
              alt={inquiry.memberNickname}
              className="w-8 h-8 rounded-full object-cover"
            />
          )}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-800 font-medium">{inquiry.title}</span>
              {inquiry.commentCount > 0 && (
                <span className="text-xs text-blue-600 font-semibold">
                  [{inquiry.commentCount}]
                </span>
              )}
            </div>
            <span className="text-xs text-gray-500">{inquiry.memberNickname}</span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex justify-center">
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 border border-gray-300">
            {getCategoryText(inquiry.category)}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex justify-center">
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(inquiry.status)} whitespace-nowrap`}
          >
            {getStatusText(inquiry.status)}
          </span>
        </div>
      </td>
    </tr>
  );
};

// src/pages/admin/inquiry/components/InquiryList.tsx
import { InquiryItem } from './InquiryItem';
import { Pagination } from '../../components/Pagination';
import type { AdminInquiryListItem } from '@/api/admin/inquiry';

interface InquiryListProps {
  inquiries: (AdminInquiryListItem & { memberNickname?: string; profileImageUrl?: string })[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onInquiryClick: (inquiryId: number, profileImageUrl?: string) => void;
}

export const InquiryList = ({
  inquiries,
  currentPage,
  totalPages,
  onPageChange,
  onInquiryClick,
}: InquiryListProps) => {
  if (inquiries.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-20 text-center">
        <p className="text-gray-600">문의가 없습니다.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800 w-20">순번</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800 w-32">
                등록일
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">제목</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-800 w-32">
                유형
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-800 w-32">
                상태
              </th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((inquiry, index) => (
              <InquiryItem
                key={inquiry.inquiryId}
                inquiry={inquiry}
                index={(currentPage - 1) * 10 + index + 1}
                onClick={() => onInquiryClick(inquiry.inquiryId, inquiry.profileImageUrl)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
      )}
    </div>
  );
};

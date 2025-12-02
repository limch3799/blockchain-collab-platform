// src/pages/help/Help.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Plus } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { getInquiryList } from '@/api/inquiry';
import type { InquiryListItem } from '@/api/inquiry';

const HelpPage = () => {
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState<InquiryListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInquiries();
  }, []);

  const loadInquiries = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getInquiryList(0, 30);
      setInquiries(data.content);
    } catch (err) {
      setError('문의 목록을 불러오는데 실패했습니다.');
      console.error('문의 목록 로드 실패:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getStatusText = (status: 'PENDING' | 'ANSWERED') => {
    return status === 'PENDING' ? '답변 대기 중' : '답변 완료';
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
    <div className="Home space-y-4 font-pretendard">
      <PageHeader
        title="이용 문의"
        description="관리자와 1:1 문의를 통해 문제를 해결할 수 있습니다."
      />

      <div className="flex justify-end pt-4">
        <button
          onClick={() => navigate('/inquiry-edit')}
          className="px-2 py-2 bg-moas-black text-moas-white font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">문의 작성</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-moas-gray-3 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-moas-main" />
              <p className="text-moas-gray-6">문의 목록을 불러오는 중...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-red-500">{error}</p>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-moas-gray-6">등록된 문의가 없습니다.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-moas-gray-1 border-b-2 border-moas-gray-3">
              <tr>
                <th className="px-6 py-2 text-left text-sm font-semibold text-moas-text w-20">
                  순번
                </th>
                <th className="px-6 py-2 text-left text-sm font-semibold text-moas-text w-32">
                  등록일
                </th>
                <th className="px-6 py-2 text-left text-sm font-semibold text-moas-text">제목</th>
                <th className="px-6 py-2 text-center text-sm font-semibold text-moas-text w-32">
                  유형
                </th>
                <th className="px-6 py-2 text-center text-sm font-semibold text-moas-text w-32">
                  상태
                </th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inquiry, index) => (
                <tr
                  key={inquiry.inquiryId}
                  onClick={() => navigate(`/inquiry/${inquiry.inquiryId}`)}
                  className="border-b border-moas-gray-3 hover:bg-moas-gray-1 cursor-pointer transition-colors"
                >
                  <td className="px-8 py-2 text-sm text-moas-gray-7">{index + 1}</td>
                  <td className="px-6 py-2 text-sm text-moas-gray-7">
                    {formatDate(inquiry.createdAt)}
                  </td>
                  <td className="px-6 py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-moas-text font-medium">{inquiry.title}</span>
                      {inquiry.commentCount > 0 && (
                        <span className="text-xs text-moas-main font-semibold">
                          [{inquiry.commentCount}]
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-2">
                    <div className="flex justify-center">
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 border border-gray-300 whitespace-nowrap">
                        {getCategoryText(inquiry.category)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-2">
                    <div className="flex justify-center">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(inquiry.status)} whitespace-nowrap`}
                      >
                        {getStatusText(inquiry.status)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default HelpPage;

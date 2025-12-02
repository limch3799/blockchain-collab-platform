// src/pages/help/InquiryDetail.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, FileText, Download, ArrowLeft, MessageSquare } from 'lucide-react';
import { getInquiryDetail } from '@/api/inquiry';
import type { InquiryDetail as InquiryDetailType } from '@/api/inquiry';
import faviconImage from '@/assets/favicon.png';

const InquiryDetail = () => {
  const { inquiryId } = useParams<{ inquiryId: string }>();
  const navigate = useNavigate();
  const [inquiry, setInquiry] = useState<InquiryDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (inquiryId) {
      loadInquiryDetail();
    }
  }, [inquiryId]);

  const loadInquiryDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getInquiryDetail(Number(inquiryId));
      setInquiry(data);
    } catch (err) {
      setError('문의 내용을 불러오는데 실패했습니다.');
      console.error('문의 상세 로드 실패:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
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

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-8 font-pretendard flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-moas-main" />
          <p className="text-moas-gray-6">문의 내용을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !inquiry) {
    return (
      <div className="max-w-5xl mx-auto p-8 font-pretendard flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || '문의를 찾을 수 없습니다.'}</p>
          <button
            onClick={() => navigate('/help')}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8 font-pretendard">
      <div className="w-full flex justify-between items-start mb-8">
        <div className="flex-1">
          <button
            onClick={() => navigate('/help')}
            className="flex items-center gap-2 text-moas-gray-7 hover:text-moas-text mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">목록으로</span>
          </button>
          <h1 className="text-3xl font-semibold text-moas-text leading-tight">문의 상세</h1>
        </div>
        <div className="flex-shrink-0 self-end mb-2">
          <img src={faviconImage} alt="Favicon" className="h-18 w-18 object-contain" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border-2 border-moas-gray-3 p-8 mb-6">
        <div className="flex items-start justify-between mb-6 pb-6 border-b border-moas-gray-3">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-moas-text mb-2">{inquiry.title}</h2>
            <div className="flex items-center gap-4 text-sm text-moas-gray-6 mb-2">
              <span>{inquiry.memberNickname}</span>
              <span>•</span>
              <span>{formatDate(inquiry.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 border border-gray-300">
                {getCategoryText(inquiry.category)}
              </span>
            </div>
          </div>
          <span
            className={`px-4 py-2 text-sm font-semibold rounded-full border ${getStatusColor(inquiry.status)}`}
          >
            {getStatusText(inquiry.status)}
          </span>
        </div>

        <div className="mb-6">
          <p className="text-moas-text whitespace-pre-wrap leading-relaxed">{inquiry.content}</p>
        </div>

        {inquiry.files && inquiry.files.length > 0 && (
          <div className="mt-6 pt-6 border-t border-moas-gray-3">
            <h3 className="text-sm font-semibold text-moas-text mb-3">첨부 파일</h3>
            <div className="space-y-2">
              {inquiry.files.map((file) => (
                <a
                  key={file.fileId}
                  href={file.storedFileUrl}
                  download={file.originalFileName}
                  className="flex items-center justify-between p-3 bg-moas-gray-1 rounded-lg border border-moas-gray-3 hover:bg-moas-gray-2 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-moas-gray-6" />
                    <span className="text-sm text-moas-text">{file.originalFileName}</span>
                  </div>
                  <Download className="w-5 h-5 text-moas-gray-6" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {inquiry.comments && inquiry.comments.length > 0 && (
        <div className="bg-white rounded-2xl border-2 border-moas-gray-3 p-8">
          <h3 className="text-lg font-semibold text-moas-text mb-6 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            답변 {inquiry.comments.length}
          </h3>

          <div className="space-y-4">
            {inquiry.comments.map((comment) => (
              <div
                key={comment.commentId}
                className={`p-4 rounded-lg border ${
                  comment.adminId
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-moas-gray-1 border-moas-gray-3'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-moas-text">
                      {comment.adminId ? comment.adminName : comment.memberNickname}
                    </span>
                    {comment.adminId && (
                      <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full font-semibold">
                        관리자
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-moas-gray-6">{formatDate(comment.createdAt)}</span>
                </div>
                <p className="text-sm text-moas-text whitespace-pre-wrap mb-3">{comment.content}</p>

                {comment.file && (
                  <a
                    href={comment.file.storedFileUrl}
                    download={comment.file.originalFileName}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-moas-gray-3 hover:bg-moas-gray-1 transition-colors text-sm"
                  >
                    <FileText className="w-4 h-4 text-moas-gray-6" />
                    <span className="text-moas-text">{comment.file.originalFileName}</span>
                    <Download className="w-4 h-4 text-moas-gray-6" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InquiryDetail;

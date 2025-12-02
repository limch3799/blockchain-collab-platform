// src/pages/artist-project-list/components/ApplicationViewModal.tsx

import { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import apiClient from '@/api/axios';
import type { ApplicationDetails } from '@/types/application';

interface ApplicationViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: number | null;
}

export function ApplicationViewModal({
  isOpen,
  onClose,
  applicationId,
}: ApplicationViewModalProps) {
  const [application, setApplication] = useState<ApplicationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // isDescriptionExpanded 상태는 사용되지 않으므로 제거합니다.
  // const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  useEffect(() => {
    if (isOpen && applicationId) {
      fetchApplicationDetails();
    }
  }, [isOpen, applicationId]);

  const fetchApplicationDetails = async () => {
    if (!applicationId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<ApplicationDetails>(`/applications/${applicationId}`);
      setApplication(response.data);
    } catch (err: any) {
      console.error('Failed to fetch application details:', err);
      setError(err.response?.data?.message || '지원서 정보를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setApplication(null);
    setError(null);
    // setIsDescriptionExpanded(false); // 사용되지 않으므로 제거합니다.
    onClose();
  };

  // truncateText 함수는 사용되지 않으므로 제거합니다.
  // const truncateText = (text: string, maxLength: number) => {
  //   if (text.length <= maxLength) return text;
  //   return text.slice(0, maxLength) + '...';
  // };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 font-pretendard">
      {/* 모달 크기 설정: h-[90vh]를 h-auto max-h-[90vh]로 변경하여 콘텐츠에 맞게 조절 */}
      <div className="bg-white rounded-2xl w-[90vw] max-w-4xl h-auto max-h-[90vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4  border-b border-moas-gray-3 shrink-0">
          <h1 className="text-2xl ms-2 font-bold text-gray-900">지원서 상세</h1>
          <button
            onClick={handleClose}
            className="text-moas-gray-6 hover:text-moas-text transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          )}
          {error && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
              </div>
            </div>
          )}
          {!loading && !error && application && (
            <main className="space-y-8">
              {/* 지원자 정보 */}
              <section>
                <h2 className="text-xl font-semibold mb-4 border-b pb-3">내 정보</h2>
                <div className="flex items-center gap-4">
                  <img
                    src={application.applicant.profileImageUrl}
                    alt={application.applicant.nickname}
                    className="w-20 h-20 rounded-full object-cover border"
                  />
                  <div>
                    <h3 className="text-lg font-bold">{application.applicant.nickname}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <span>⭐ {application.applicant.averageRating.toFixed(1)}</span>
                      <span>·</span>
                      <span>리뷰 {application.applicant.reviewCount}개</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* 한마디 */}
              <section>
                <h2 className="text-xl font-semibold mb-4 border-b pb-3">한마디</h2>
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {application.message}
                </p>
              </section>

              {/* 제출한 포트폴리오 */}
              <section>
                <h2 className="text-xl font-semibold mb-4 border-b pb-3">제출 포트폴리오</h2>
                <div className="mt-4 flex gap-6">
                  {/* 왼쪽: 이미지 */}
                  {application.portfolio.images?.length > 0 && (
                    <div className="flex-shrink-0">
                      <div className="grid grid-cols-1 gap-4">
                        {application.portfolio.images.map((img) => (
                          <img
                            key={img.imageId}
                            src={img.imageUrl}
                            alt={`portfolio-image-${img.imageId}`}
                            className="rounded-lg object-cover w-64 h-auto border"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 오른쪽: 텍스트 정보 */}
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-2">
                      {application.portfolio.categoryName} &gt; {application.portfolio.positionName}
                    </p>

                    {/* 포트폴리오명 라벨과 제목을 한 줄에 표시 */}
                    <div className="mb-4 flex items-baseline gap-2">
                      <span className="text-sm bg-gray-200 text-gray-800 px-3 py-1 rounded inline-block shrink-0">
                        제목
                      </span>
                      <h3 className="text-lg font-bold text-gray-900 leading-snug">
                        {application.portfolio.title}
                      </h3>
                    </div>

                    <div className="mb-4">
                      <span className="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded inline-block">
                        내용
                      </span>
                      <p className="text-gray-700 ms-2 whitespace-pre-wrap leading-relaxed mt-2">
                        {application.portfolio.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 첨부 파일 */}
                {application.portfolio.files?.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-md font-semibold mb-3">첨부 파일</h4>
                    <ul className="space-y-2">
                      {application.portfolio.files.map((file) => (
                        <li key={file.fileId} className="flex items-center">
                          <a
                            href={file.storedFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline hover:text-blue-800 transition-colors"
                          >
                            {file.originalFileName}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            </main>
          )}
        </div>
      </div>
    </div>
  );
}

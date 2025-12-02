// src/pages/portfolio/portfolio-detail/components/PortfolioDetailInfo.tsx
import { PortfolioDetailFiles } from './PortfolioDetailFiles';
import type { PortfolioFile } from '@/types/portfolio';

interface PortfolioDetailInfoProps {
  category: string;
  title: string;
  content: string;
  createdAt: string;
  files: PortfolioFile[];
}

export function PortfolioDetailInfo({
  category,
  title,
  content,
  createdAt,
  files,
}: PortfolioDetailInfoProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date
      .toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
      .replace(/\. /g, '.')
      .replace(/\.$/, '');
  };

  return (
    <div className="space-y-6">
      {/* 카테고리 */}
      <div>
        <h4 className="text-sm font-semibold text-moas-gray-6 mb-2">카테고리</h4>
        <span className="inline-block bg-moas-main/10 text-moas-main text-sm font-semibold px-3 py-1.5 rounded-lg">
          {category}
        </span>
      </div>

      {/* 제목 */}
      <div>
        <h4 className="text-sm font-semibold text-moas-gray-6 mb-2">제목</h4>
        <h2 className="text-2xl font-bold text-moas-text">{title}</h2>
      </div>

      {/* 본문 */}
      <div>
        <h4 className="text-sm font-semibold text-moas-gray-6 mb-2">본문</h4>
        <p className="text-base text-moas-text leading-relaxed whitespace-pre-line">{content}</p>
      </div>

      {/* 작성일자 */}
      <div>
        <h4 className="text-sm font-semibold text-moas-gray-6 mb-2">작성일자</h4>
        <p className="text-sm text-moas-gray-6">{formatDate(createdAt)}</p>
      </div>

      {/* 첨부파일 */}
      {files.length > 0 && <PortfolioDetailFiles files={files} />}
    </div>
  );
}

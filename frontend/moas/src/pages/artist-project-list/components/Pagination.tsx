// src/pages/artist-project-list/components/Pagination.tsx

import arrowLeftIcon from '@/assets/icons/arrow-left.svg';
import arrowRightIcon from '@/assets/icons/arrow-right.svg';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  // 페이지 번호 생성 (최대 7개 표시)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // 1 ... 3 4 [5] 6 7 ... 10
    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, 5, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(
        1,
        '...',
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      );
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }

    return pages;
  };

  return (
    <div className="mt-12 flex items-center justify-center gap-2">
      {/* 이전 페이지 */}
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-moas-gray-1 disabled:opacity-50"
      >
        <img src={arrowLeftIcon} alt="이전" className="size-6" />
      </button>

      {/* 페이지 번호 */}
      {getPageNumbers().map((page, index) =>
        typeof page === 'number' ? (
          <button
            key={index}
            onClick={() => onPageChange(page)}
            className={`flex size-10 items-center justify-center rounded-full font-pretendard text-base font-medium transition-colors ${
              currentPage === page
                ? 'bg-moas-main text-moas-black'
                : 'text-moas-gray-7 hover:bg-moas-gray-1'
            }`}
          >
            {page}
          </button>
        ) : (
          <span
            key={index}
            className="flex size-10 items-center justify-center font-pretendard text-base text-moas-gray-5"
          >
            {page}
          </span>
        ),
      )}

      {/* 다음 페이지 */}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-moas-gray-1 disabled:opacity-50"
      >
        <img src={arrowRightIcon} alt="다음" className="size-6" />
      </button>
    </div>
  );
}

// src/pages/admin/inquiry/components/Pagination.tsx
import arrowLeftIcon from '@/assets/icons/arrow-left.svg';
import arrowRightIcon from '@/assets/icons/arrow-right.svg';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

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
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-gray-100 disabled:opacity-50"
      >
        <img src={arrowLeftIcon} alt="이전" className="size-6" />
      </button>

      {getPageNumbers().map((page, index) =>
        typeof page === 'number' ? (
          <button
            key={index}
            onClick={() => onPageChange(page)}
            className={`flex size-10 items-center justify-center rounded-full font-pretendard text-base font-medium transition-colors ${
              currentPage === page ? 'bg-moas-navy2 text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {page}
          </button>
        ) : (
          <span
            key={index}
            className="flex size-10 items-center justify-center font-pretendard text-base text-gray-500"
          >
            {page}
          </span>
        ),
      )}

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-gray-100 disabled:opacity-50"
      >
        <img src={arrowRightIcon} alt="다음" className="size-6" />
      </button>
    </div>
  );
}

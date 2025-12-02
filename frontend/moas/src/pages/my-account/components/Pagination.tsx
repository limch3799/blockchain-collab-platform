import { Button } from '@/components/ui';
import { ChevronLeft } from 'lucide-react';

const FIRST_PAGE = 1;

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  const getPageNumbers = () => {
    const pages = [];
    const showPages = 5;

    // Calculate start page (centered around current page)
    let startPage = Math.max(FIRST_PAGE, currentPage - Math.floor(showPages / 2));

    // Calculate end page - should be totalPages, not totalPages - 1
    let endPage = Math.min(totalPages, startPage + showPages - 1);

    // Adjust start page if we don't have enough pages to show
    if (endPage - startPage < showPages - 1) {
      startPage = Math.max(FIRST_PAGE, endPage - showPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === FIRST_PAGE}
        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {/* 이전 */}
        <ChevronLeft className="w-5 h-5" />
      </Button>

      {getPageNumbers().map((page) => {
        return (
          <Button
            key={page}
            variant={currentPage === page ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPageChange(page)}
            className={`px-4 py-2 rounded-lg border border-gray-200 transition-colors ${
              currentPage === page
                ? 'bg-primary-yellow text-white border-primary-yellow'
                : 'hover:bg-gray-50'
            }`}
          >
            {page}
          </Button>
        );
      })}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        다음
      </Button>
    </div>
  );
};

export default Pagination;
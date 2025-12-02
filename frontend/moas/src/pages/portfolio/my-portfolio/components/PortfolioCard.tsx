// src/pages/portfolio/my-portfolio/components/PortfolioCard.tsx
import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { MoreVertical } from 'lucide-react';
import effectImg from '@/assets/project-post/effect.png';

// positionId로 카테고리 ID 매핑
const getCategoryIdByPositionId = (positionId: number): number => {
  if (positionId >= 1 && positionId <= 4) return 1; // 음악/공연
  if (positionId >= 5 && positionId <= 9) return 2; // 사진/영상/미디어
  if (positionId >= 10 && positionId <= 14) return 3; // 디자인
  if (positionId === 15) return 4; // 기타
  return 4; // 기본값
};

// 카테고리 ID로 카테고리명 가져오기
const getCategoryNameById = (categoryId: number): string => {
  const categories: Record<number, string> = {
    1: '음악/공연',
    2: '사진/영상/미디어',
    3: '디자인',
    4: '기타',
  };
  return categories[categoryId] || '기타';
};

interface PortfolioCardProps {
  id: number;
  image: string;
  title: string;
  positionId: number;
  positionName: string;
  createdAt: string;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onClick: (id: number) => void;
}

export function PortfolioCard({
  id,
  image,
  title,
  positionId,
  positionName,
  createdAt,
  onEdit,
  onDelete,
  onClick,
}: PortfolioCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const categoryId = getCategoryIdByPositionId(positionId);
  const categoryName = getCategoryNameById(categoryId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleCardClick = () => {
    if (!isMenuOpen) {
      onClick(id);
    }
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    onEdit(id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    onDelete(id);
  };

  return (
    <Card
      onClick={handleCardClick}
      className="overflow-hidden group p-0 font-pretendard transition-all duration-300 ease-out hover:-translate-y-1 cursor-pointer border-2 border-[#D9E7FF] hover:border-[#7AA7FF] bg-[#FAFCFF] rounded-3xl"
    >
      {/* 카테고리 정보 - 이미지 위에 배치 */}
      <div className="px-4 pt-4">
        <span className="inline-block text-base font-semibold text-[#428EFF] bg-[#EAF2FF] px-3 py-0 rounded">
          {categoryName} &gt; {positionName}
        </span>
      </div>

      {/* 이미지 섹션 */}
      <div className="relative overflow-hidden h-48 mx-4 rounded-lg">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover rounded-lg"
          loading="lazy"
        />
        <img
          src={effectImg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover pointer-events-none rounded-lg"
        />
      </div>

      {/* 컨텐츠 섹션 */}
      <div className="px-4 pt-0 pb-3 space-y-2 relative">
        <h3 className="text-xl font-bold text-moas-text line-clamp-1 transition-colors">{title}</h3>

        <p className="text-sm text-moas-gray-6">마지막 수정 {createdAt}</p>

        {/* 메뉴 버튼 */}
        <div className="absolute bottom-3 right-3" ref={menuRef}>
          <button
            onClick={handleMenuClick}
            className="p-1 rounded-full hover:bg-gray-200 transition-colors"
          >
            <MoreVertical className="w-6 h-6 text-gray-600" />
          </button>

          {/* 메뉴 드롭다운 */}
          {isMenuOpen && (
            <div className="absolute bottom-full right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-10 min-w-[100px]">
              <button
                onClick={handleEdit}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                수정
              </button>
              <button
                onClick={handleDelete}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                삭제
              </button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

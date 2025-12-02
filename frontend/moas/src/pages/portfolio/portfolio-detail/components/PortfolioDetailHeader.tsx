// src/pages/portfolio-detail/components/PortfolioDetailHeader.tsx

interface PortfolioDetailHeaderProps {
  profileImage: string;
  userName: string;
  onEdit: () => void;
  onDelete: () => void;
}

export function PortfolioDetailHeader({
  profileImage,
  userName,
  onEdit,
  onDelete,
}: PortfolioDetailHeaderProps) {
  return (
    <div className="flex items-center justify-between flex-1">
      {/* 왼쪽: 프로필 */}
      <div className="flex items-center gap-3">
        <img src={profileImage} alt={userName} className="w-11 h-11 rounded-full object-cover" />
        <span className="text-lg font-bold text-moas-text">{userName}</span>
      </div>

      {/* 오른쪽: 수정/삭제 버튼 */}
      <div className="flex gap-2">
        <button
          onClick={onEdit}
          className="px-4 py-2 bg-moas-gray-2 text-moas-gray-7 rounded-lg hover:bg-moas-gray-3 transition-colors text-sm font-medium"
        >
          수정
        </button>
        <button
          onClick={onDelete}
          className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
        >
          삭제
        </button>
      </div>
    </div>
  );
}

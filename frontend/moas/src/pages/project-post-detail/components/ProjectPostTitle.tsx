import bookmarkOn from '../../../assets/project-post/bookmarkOn.png';
import bookmarkOff from '../../../assets/project-post/bookmarkOff.png';

interface ProjectPostTitleProps {
  title: string;
  category: string;
  registeredDate: string;
  views: number;
  isBookmarked: boolean;
  onBookmark: () => void;
}

export function ProjectPostTitle({
  title,
  category,
  registeredDate,
  views,
  isBookmarked,
  onBookmark,
}: ProjectPostTitleProps) {
  return (
    <div className="space-y-4">
      {/* 카테고리 + 북마크 */}
      <div className="flex justify-between items-center">
        <span className="inline-block bg-moas-main/10 text-moas-main text-sm font-semibold px-3 py-1 rounded">
          {category}
        </span>

        {/* 북마크 버튼: 아이콘만 */}
        <button onClick={onBookmark}>
          <img src={isBookmarked ? bookmarkOn : bookmarkOff} alt="bookmark" className="w-8 h-10" />
        </button>
      </div>

      {/* 프로젝트명 */}
      <h1 className="text-3xl font-bold text-moas-text">{title}</h1>

      {/* 등록일자, 조회수 */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-moas-gray-4">
          등록일자 <span className="text-moas-gray-6">{registeredDate}</span>
        </span>
        <span className="text-moas-gray-4">
          조회수 <span className="text-moas-gray-6">{views.toLocaleString()}</span>
        </span>
      </div>

      {/* 컴포넌트 하단 스페이서 */}
      <div className="h-4" />
    </div>
  );
}

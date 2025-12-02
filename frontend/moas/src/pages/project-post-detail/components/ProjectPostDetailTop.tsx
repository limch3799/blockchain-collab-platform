import { ProjectPostTitle } from './ProjectPostTitle';
import { ProjectLeaderInfo } from './ProjectLeaderInfo';
import thumbnail1 from '../../../assets/project-post/project-thumbnail-dummy/thumbnail4.png';

interface Leader {
  id: number;
  profileImg: string;
  name: string;
  projectCount: number;
  rating: number;
}

interface ProjectTopProps {
  project: {
    id: number;
    title: string;
    category: string;
    registeredDate: string;
    views: number;
    isBookmarked: boolean;
    thumbnail: string;
    leader: Leader;
  };
  onBookmark: () => void;
  onChat: () => void;
}

export function ProjectPostDetailTop({ project, onBookmark, onChat }: ProjectTopProps) {
  const thumbnailSrc = project.thumbnail || thumbnail1;

  return (
    <div className="bg-white rounded-lg p-0 mb-0">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-x-8">
        {/* 좌측: 프로젝트 정보 */}
        <div className="flex flex-col justify-between gap-0">
          <ProjectPostTitle
            title={project.title}
            category={project.category}
            registeredDate={project.registeredDate}
            views={project.views}
            isBookmarked={project.isBookmarked}
            onBookmark={onBookmark}
          />

          <ProjectLeaderInfo leader={project.leader} onChat={onChat} />
        </div>

        {/* 우측: 프로젝트 썸네일 */}
        <div className="rounded-lg overflow-hidden h-80 lg:h-full">
          <img src={thumbnailSrc} alt={project.title} className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  );
}

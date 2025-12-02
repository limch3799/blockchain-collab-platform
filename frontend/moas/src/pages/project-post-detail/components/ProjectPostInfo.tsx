// src/pages/project-post-detail/components/ProjectPostInfo.tsx
import { Users } from 'lucide-react';
import { MarkdownViewer } from '@/components/ui/MarkdownViewer';

interface RecruitArtist {
  role: string;
  budget: number;
  isClosed?: boolean;
}

interface ProjectPostInfoProps {
  description: string;
  recruitArtists: RecruitArtist[];
}

export function ProjectPostInfo({ description, recruitArtists }: ProjectPostInfoProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-8">
      {/* 프로젝트 소개 */}
      <div>
        <h2 className="text-2xl font-bold text-moas-text mb-4">프로젝트 소개</h2>
        <MarkdownViewer content={description} />
      </div>

      {/* 모집 아티스트 */}
      <div>
        <h2 className="text-2xl font-bold text-moas-text mb-4 flex items-center gap-2">
          <Users className="h-6 w-6" />
          모집 분야
        </h2>
        <div className="space-y-3">
          {recruitArtists.map((artist, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 bg-moas-gray-1 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-moas-text">{artist.role}</span>
                {artist.isClosed && (
                  <span className="px-2 py-1 bg-moas-gray-7 text-white text-xs font-medium rounded">
                    모집마감
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-moas-text font-bold">
                <span>{artist.budget.toLocaleString()}원</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// src/pages/project-apply/components/ProjectInfo.tsx
import { Wallet2, MapPin, Wifi, Building, Users, Briefcase } from 'lucide-react';
import { MarkdownViewer } from '@/components/ui/MarkdownViewer';

interface ProjectInfoProps {
  project: {
    name: string;
    description: string;
    price: number;
    isOnline: boolean;
    location: string;
    recruitFields: string;
    selectedField: string;
  };
}

export function ProjectInfo({ project }: ProjectInfoProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
      <h2 className="text-xl font-bold text-moas-text">프로젝트 정보</h2>

      {/* 프로젝트명 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-moas-gray-6">
          <Briefcase className="h-5 w-5" />
          <span className="font-semibold">프로젝트명</span>
        </div>
        <div className="pl-7 text-moas-text break-words">{project.name}</div>
      </div>

      {/* 프로젝트 설명 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-moas-gray-6">
          <span className="font-semibold">프로젝트 설명</span>
        </div>
        <MarkdownViewer content={project.description} className="pl-7" />
      </div>

      {/* 금액 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-moas-gray-6">
          <Wallet2 className="h-5 w-5" />
          <span className="font-semibold">금액</span>
        </div>
        <div className="pl-7 text-xl font-bold text-moas-text">
          {project.price.toLocaleString()}원
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 온오프라인 여부 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-moas-gray-6">
            {project.isOnline ? <Wifi className="h-5 w-5" /> : <Building className="h-5 w-5" />}
            <span className="font-semibold">진행 방식</span>
          </div>
          <div className="pl-7">
            <span
              className={`inline-block px-3 py-1 rounded text-sm font-semibold ${
                project.isOnline ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
              }`}
            >
              {project.isOnline ? '온라인' : '오프라인'}
            </span>
          </div>
        </div>

        {/* 지역 (오프라인인 경우만) */}
        {!project.isOnline && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-moas-gray-6">
              <MapPin className="h-5 w-5" />
              <span className="font-semibold">장소</span>
            </div>
            <div className="pl-7 text-moas-text">{project.location}</div>
          </div>
        )}
      </div>

      {/* 모집 아티스트 분야 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-moas-gray-6">
          <Users className="h-5 w-5" />
          <span className="font-semibold">모집 아티스트 분야</span>
        </div>
        <div className="pl-7 text-moas-text">{project.recruitFields}</div>
      </div>

      {/* 내가 선택한 분야 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-moas-gray-6">
          <span className="font-semibold">내가 선택한 분야</span>
        </div>
        <div className="pl-7">
          <span className="inline-block px-4 py-2 bg-moas-main/10 text-moas-main rounded-lg font-semibold">
            {project.selectedField}
          </span>
        </div>
      </div>
    </div>
  );
}

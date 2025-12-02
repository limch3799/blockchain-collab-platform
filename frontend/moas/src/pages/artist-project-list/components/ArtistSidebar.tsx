// src/pages/artist-project-list/components/ArtistSidebar.tsx

import { ChevronRight } from 'lucide-react';
import type { Section } from '../types';

interface ArtistSidebarProps {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
  applicationCount: number;
  contractCount: number;
}

export function ArtistSidebar({ activeSection, onSectionChange }: ArtistSidebarProps) {
  return (
    <aside className="w-56 shrink-0 px-0 pr-8 py-20">
      {/* 지원한 프로젝트 섹션 */}
      <div className="mb-6">
        <h2
          onClick={() => onSectionChange('applications')}
          className={`mb-4 cursor-pointer font-pretendard text-lg font-semibold leading-none transition-colors flex items-center justify-between ${
            activeSection === 'applications' ? 'text-moas-main' : 'text-moas-gray-9'
          }`}
        >
          <span>지원 현황</span>
          <ChevronRight className="h-5 w-5" />
        </h2>
      </div>

      {/* 나의 계약 섹션 */}
      <div>
        <h2
          onClick={() => onSectionChange('contracts')}
          className={`mb-4 cursor-pointer font-pretendard text-lg font-semibold leading-none transition-colors flex items-center justify-between ${
            activeSection === 'contracts' ? 'text-moas-main' : 'text-moas-gray-9'
          }`}
        >
          <span>계약 현황</span>
          <ChevronRight className="h-5 w-5" />
        </h2>
      </div>
    </aside>
  );
}

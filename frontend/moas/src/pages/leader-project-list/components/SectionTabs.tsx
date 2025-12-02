/**
 * SectionTabs Component
 *
 * Props:
 * - activeSection: 현재 활성화된 섹션
 * - onSectionChange: 섹션 변경 핸들러
 *
 * Description:
 * 전체 공고/전체 계약 탭 전환 컴포넌트
 */

import { useRef, useEffect, useState } from 'react';

export type Section = 'projects' | 'contracts';

interface SectionTabsProps {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
}

export function SectionTabs({ activeSection, onSectionChange }: SectionTabsProps) {
  const tabs = [
    { value: 'projects' as Section, label: '나의 공고' },
    { value: 'contracts' as Section, label: '전체 계약' },
  ];

  const containerRef = useRef<HTMLDivElement>(null);
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });

  const selectedTabIndex = tabs.findIndex((tab) => tab.value === activeSection);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const selectedButton = container.children[selectedTabIndex] as HTMLElement;
    if (selectedButton) {
      const fullWidth = selectedButton.offsetWidth;
      const underlineWidth = fullWidth * 0.75;
      const left = selectedButton.offsetLeft + fullWidth * 0.125;
      setUnderlineStyle({ left, width: underlineWidth });
    }
  }, [selectedTabIndex]);

  return (
    <div className="relative mb-6 font-pretendard">
      <div className="flex items-center gap-8" ref={containerRef}>
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onSectionChange(tab.value)}
            className="relative pb-2 text-xl font-semibold text-moas-gray-5 hover:text-moas-gray-7 transition-colors"
          >
            <span className={activeSection === tab.value ? 'text-moas-text' : ''}>{tab.label}</span>
          </button>
        ))}
      </div>

      <div
        className="absolute bottom-0 h-1 bg-moas-main transition-all duration-300 ease-in-out"
        style={{ left: underlineStyle.left, width: underlineStyle.width }}
      />
    </div>
  );
}

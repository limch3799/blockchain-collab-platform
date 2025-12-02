// src/pages/artist-project-list/components/ApplicationStatusGuide.tsx

import { ChevronRight } from 'lucide-react';
import type { ApplicationStatus } from '../types';

interface StepItem {
  label: string;
  color: string;
  desc?: string;
}

interface ApplicationGuideConfig {
  title: string;
  description: string;
  steps: StepItem[];
}

interface ApplicationStatusGuideProps {
  currentFilter: ApplicationStatus;
}

export function ApplicationStatusGuide({ currentFilter }: ApplicationStatusGuideProps) {
  const guideConfig: Record<ApplicationStatus, ApplicationGuideConfig> = {
    all: {
      title: '전체 지원',
      description: '전체 지원 내역을 확인할 수 있습니다.',
      steps: [{ label: '', color: 'bg-moas-gray-5' }],
    },
    PENDING: {
      title: '대기 중',
      description: '지원이 완료되었으며, 리더의 검토를 기다리고 있습니다.',
      steps: [{ label: '', color: 'bg-moas-main' }],
    },
    OFFERED: {
      title: '계약 제안',
      description: '리더로부터 계약 제안을 받았습니다. 계약 체결 여부를 결정해주세요.',
      steps: [{ label: '', color: 'bg-moas-main' }],
    },
    REJECTED: {
      title: '거절됨',
      description: '지원이 거절되었습니다.',
      steps: [{ label: '', color: 'bg-moas-main' }],
    },
  };

  const config = guideConfig[currentFilter];

  if (!config) {
    return null;
  }

  return (
    <div className="mb-6 rounded-lg bg-white p-0 pt-4 pb-4 pl-2">
      {/* 제목 */}
      <div className="mb-3">
        <h3 className="font-pretendard text-base font-bold text-moas-text">{config.title}</h3>
        <p className="font-pretendard text-sm text-moas-gray-6 mt-1">{config.description}</p>
      </div>

      {/* 단계 표시 */}
      <div className="flex items-center gap-2">
        {config.steps.map((step, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className={`px-3 py-1.5 rounded-lg ${step.color} text-white font-pretendard text-xs font-medium`}
            >
              {step.label}
            </div>
            {index < config.steps.length - 1 && (
              <ChevronRight className="w-4 h-4 text-moas-gray-5" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

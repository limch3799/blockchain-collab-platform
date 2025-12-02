// src/pages/artist-project-list/components/ContractStatusGuide.tsx

import { ChevronRight } from 'lucide-react';
import type { ContractFilterType } from '../types';

interface StepItem {
  label: string;
  color: string;
  desc?: string;
}

interface ContractGuideConfig {
  title: string;
  description: string;
  steps: StepItem[];
}

interface ContractStatusGuideProps {
  currentFilter: ContractFilterType;
}

export function ContractStatusGuide({ currentFilter }: ContractStatusGuideProps) {
  const guideConfig: Record<ContractFilterType, ContractGuideConfig> = {
    all: {
      title: '전체 계약',
      description: '모든 상태의 계약을 확인할 수 있습니다.',
      steps: [{ label: '', color: 'bg-moas-gray-5' }],
    },
    BEFORE_START: {
      title: '계약 체결',
      description: '리더의 결제와 NFT발행이 완료되었습니다.',
      steps: [{ label: '', color: 'bg-moas-main' }],
    },
    IN_PROGRESS: {
      title: '수행 중',
      description: '아티스트가 계약내용을 수행하고 있습니다.',
      steps: [{ label: '', color: 'bg-moas-main' }],
    },
    COMPLETED: {
      title: '정산 완료',
      description: '프로젝트가 종료되었으며, 아티스트에게 정산이 완료되었습니다.',
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

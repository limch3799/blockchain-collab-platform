/**
 * AiPromptModal
 *
 * Description:
 * AI 계약서 생성을 위한 프롬프트 입력 모달
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface AiPromptModalProps {
  onConfirm: (prompt: string) => void;
  onCancel: () => void;
}

export function AiPromptModal({ onConfirm, onCancel }: AiPromptModalProps) {
  const [prompt, setPrompt] = useState('');

  const handleConfirm = () => {
    onConfirm(prompt.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-[600px] rounded-2xl bg-white p-8 shadow-2xl">
        {/* 헤더 */}
        <h2 className="mb-3 text-[24px] font-bold text-moas-text">
          AI 계약서 생성
        </h2>
        <p className="mb-6 text-[15px] leading-relaxed text-moas-gray-6">
          추가적인 계약 내용이나 주요 특약사항을 간단히 적어주시면,
          <br />
          AI가 이를 분석하여 상세하고 완결성 높은 설명으로 작성해 드립니다.
        </p>

        {/* 프롬프트 입력 */}
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="예시:&#10;- 저작권은 쌍방이 공동으로 소유합니다&#10;- 수정은 최대 2회까지 가능합니다&#10;- 결과물은 최종 검수 후 일괄 지급됩니다"
          className="mb-6 h-[200px] w-full resize-none rounded-xl border-2 border-moas-gray-3 px-4 py-3 text-[15px] outline-none transition-all focus:border-moas-main"
        />

        {/* 버튼 영역 */}
        <div className="flex justify-end gap-3">
          <Button
            onClick={onCancel}
            className="h-[48px] w-[120px] rounded-xl bg-moas-gray-3 text-[16px] font-bold text-moas-text hover:bg-moas-gray-4"
          >
            취소
          </Button>
          <Button
            onClick={handleConfirm}
            className="h-[48px] w-[120px] rounded-xl bg-moas-main text-[16px] font-bold text-white hover:bg-moas-main/90"
          >
            확인
          </Button>
        </div>
      </div>
    </div>
  );
}

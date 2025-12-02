/**
 * AiLoadingModal
 *
 * Description:
 * AI 생성 중 로딩 상태를 표시하는 모달
 */

import type { ReactNode } from 'react';
import Lottie from 'react-lottie-player';
import aiBotAnimation from '@/assets/ai_bot.json';

interface AiLoadingModalProps {
  message?: ReactNode;
}

export function AiLoadingModal({
  message
}: AiLoadingModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-12 shadow-2xl">
        {/* Lottie 애니메이션 */}
        <Lottie
          loop
          animationData={aiBotAnimation}
          play
          style={{
            width: 280,
            height: 280,
          }}
        />

        {/* 안내 문구 */}
        <p className="mt-6 text-center text-[18px] font-medium leading-relaxed text-moas-text">
          {message || (
            <>
              AI가 고객님의 요구사항에 맞춰
              <br />
              최적의 계약 내용을 구성 중입니다.
            </>
          )}
        </p>

        {/* 로딩 도트 애니메이션 */}
        <div className="mt-4 flex gap-2">
          <div className="h-2 w-2 animate-bounce rounded-full bg-moas-main" style={{ animationDelay: '0ms' }} />
          <div className="h-2 w-2 animate-bounce rounded-full bg-moas-main" style={{ animationDelay: '150ms' }} />
          <div className="h-2 w-2 animate-bounce rounded-full bg-moas-main" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

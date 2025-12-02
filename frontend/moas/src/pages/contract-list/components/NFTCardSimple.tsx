/**
 * NFTCardSimple Component
 *
 * Description:
 * NFT 계약서 카드 - 포켓몬 카드 스타일 (단면 버전)
 * 마우스 호버 시 확대 및 그림자 효과
 * 클릭 시 상세 페이지로 이동
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Contract } from '@/types/contract';
import { CATEGORY_CONFIG } from '@/types/contract';
import projectThumbnailPlaceholder from '@/assets/project-post/project-thumbnail-dummy/thumbnail2.png';

interface NFTCardSimpleProps {
  contract: Contract & { projectThumbnailUrl?: string | null };
}

export function NFTCardSimple({ contract }: NFTCardSimpleProps) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  // contract.project.categoryName 우선 사용, 없으면 '???' 표시
  const categoryName = contract.project.categoryName || '???';
  const categoryConfig = CATEGORY_CONFIG[categoryName] || CATEGORY_CONFIG['디자인'];

  // 프로젝트 썸네일 (API에서 가져온 URL 우선, 없으면 placeholder)
  const projectThumbnail = contract.projectThumbnailUrl || projectThumbnailPlaceholder;

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  // 금액 포맷팅
  const formatAmount = (amount: number) => {
    return amount.toLocaleString('ko-KR');
  };

  // 수정
  const handleCardClick = () => {
    // 상세 페이지로 이동하면서 썸네일 URL을 state로 전달
    navigate(`/contract/${contract.contractId}`, {
      state: {
        projectThumbnailUrl: contract.projectThumbnailUrl,
        projectTitle: contract.project.title,
      },
    });
  };

  return (
    <div
      className={`cursor-pointer transition-all duration-300 ease-out ${
        isHovered ? 'scale-110 z-50' : 'scale-100 z-0'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <div
        className={`relative h-[450px] w-full overflow-hidden rounded-2xl transition-shadow duration-300 ${
          isHovered ? 'shadow-2xl' : 'shadow-md'
        }`}
        style={{
          background: `linear-gradient(135deg, 
            ${categoryConfig.color}99 0%, 
            ${categoryConfig.color}88 15%, 
            ${categoryConfig.color}77 30%, 
            ${categoryConfig.color}66 45%, 
            ${categoryConfig.color}55 60%, 
            ${categoryConfig.color}44 75%, 
            ${categoryConfig.color}33 100%)`,
        }}
      >
        {/* 홀로그램 효과 - 호버 시에만 표시 */}
        {isHovered && (
          <div
            className="hologram-effect pointer-events-none absolute inset-0 rounded-2xl"
            style={{
              background:
                'linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.15) 25%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0.15) 75%, transparent 100%)',
              backgroundSize: '400% 400%',
            }}
          />
        )}

        {/* 반짝이 파티클 - 호버 시에만 표시 */}
        {isHovered && (
          <>
            <div className="pointer-events-none absolute left-[15%] top-[10%] h-2 w-2 animate-[sparkle_2s_ease-in-out_infinite] rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
            <div className="pointer-events-none absolute right-[20%] top-[30%] h-1.5 w-1.5 animate-[sparkle_2s_ease-in-out_infinite_0.3s] rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
            <div className="pointer-events-none absolute left-[25%] top-[60%] h-2.5 w-2.5 animate-[sparkle_2s_ease-in-out_infinite_0.6s] rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
            <div className="pointer-events-none absolute right-[15%] top-[75%] h-1.5 w-1.5 animate-[sparkle_2s_ease-in-out_infinite_0.9s] rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
          </>
        )}

        {/* 카드 내용 */}
        <div className="relative z-10 flex h-full flex-col p-5 text-moas-black">
          {/* 카테고리 배지 */}
          <div
            className="mb-2 inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
            style={{ background: categoryConfig.color }}
          >
            {categoryConfig.name}
          </div>

          {/* 프로젝트명 */}
          <h3 className="mb-3 text-base font-extrabold leading-tight line-clamp-2">
            {contract.project.title}
          </h3>

          {/* 프로젝트 이미지 */}
          <div className="mb-4">
            <img
              src={projectThumbnail}
              alt="프로젝트 썸네일"
              className="h-32 w-full rounded-xl object-cover shadow-lg"
              onError={(e) => {
                // 이미지 로드 실패 시 placeholder 사용
                e.currentTarget.src = projectThumbnailPlaceholder;
              }}
            />
          </div>

          {/* 참여자 정보 */}
          <div className="mb-2 space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="opacity-70">리더:</span>
              <span className="font-semibold truncate">{contract.leader.nickname}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="opacity-70">아티스트:</span>
              <span className="font-semibold truncate">{contract.artist.nickname}</span>
            </div>
          </div>

          {/* 금액 및 기간 */}
          <div className="mb-2 space-y-3">
            <div>
              <div className="mb-0.5 text-xs opacity-70">금액</div>
              <div className="text-lg font-bold">{formatAmount(contract.totalAmount)}원</div>
              <div className="text-xs opacity-70">(수수료 5% 포함)</div>
            </div>

            <div>
              <div className="mb-0.5 text-xs opacity-70">기간</div>
              <div className="text-sm font-semibold">
                {formatDate(contract.startAt)} ~ {formatDate(contract.endAt)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 애니메이션 스타일 */}
      <style>{`
        @keyframes hologram-sweep {
          0% {
            background-position: 200% center;
          }
          100% {
            background-position: -200% center;
          }
        }

        @keyframes sparkle {
          0%, 100% {
            opacity: 0;
            transform: scale(0);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .hologram-effect {
          animation: hologram-sweep 3s linear infinite;
          transition: opacity 0.3s ease;
        }
      `}</style>
    </div>
  );
}

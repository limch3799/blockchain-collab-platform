/**
 * NFTCard Component
 *
 * Description:
 * NFT 계약서 카드 - 포켓몬 카드 스타일
 * 마우스 호버 시 3D 효과와 홀로그램 애니메이션 표시
 * 클릭 시 앞뒤 반전
 */

import { useState } from 'react';
import type { Contract } from '@/types/contract';
import { CATEGORY_CONFIG } from '@/types/contract';
import projectThumbnailPlaceholder from '@/assets/project-post/project-thumbnail-dummy/thumbnail2.png';

interface NFTCardProps {
  contract: Contract & { projectThumbnailUrl?: string | null };
  thumbnailOverride?: string | null; // 추가
  titleOverride?: string; // 추가
}

export function NFTCard({ contract, thumbnailOverride, titleOverride }: NFTCardProps) {
  const [rotateStyle, setRotateStyle] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);

  // contract.project.categoryName 우선 사용, 없으면 '???' 표시
  const categoryName = contract.project.categoryName || '???';
  const categoryConfig = CATEGORY_CONFIG[categoryName] || CATEGORY_CONFIG['디자인'];

  // 프로젝트 썸네일 (API에서 가져온 URL 우선, 없으면 placeholder)
  const projectThumbnail =
    thumbnailOverride || contract.projectThumbnailUrl || projectThumbnailPlaceholder;
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

  // 마우스 움직임에 따른 3D 효과
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isFlipped) return;

    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -15;
    const rotateY = ((x - centerX) / centerX) * 15;

    setRotateStyle(`rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`);
  };

  const handleMouseLeave = () => {
    if (!isFlipped) {
      setRotateStyle('rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    }
  };

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
    setRotateStyle(isFlipped ? 'rotateY(0deg)' : 'rotateY(180deg)');
  };

  return (
    <div className="perspective-[1500px] w-full">
      <div
        className="relative h-[650px] w-full cursor-pointer transition-transform duration-700 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : rotateStyle,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleCardClick}
      >
        {/* 앞면 */}
        <div
          className="absolute inset-0 overflow-hidden rounded-2xl shadow-2xl hover-hologram"
          style={{
            backfaceVisibility: 'hidden',
            background: `linear-gradient(135deg, 
              ${categoryConfig.color}ff 0%, 
              ${categoryConfig.color}ee 15%, 
              ${categoryConfig.color}dd 30%, 
              ${categoryConfig.color}cc 45%, 
              ${categoryConfig.color}bb 60%, 
              ${categoryConfig.color}aa 75%, 
              ${categoryConfig.color}88 100%)`,
          }}
        >
          {/* 강력한 홀로그램 효과 */}
          <div
            className="hologram-effect pointer-events-none absolute inset-0 rounded-2xl"
            style={{
              background:
                'linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.15) 25%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0.15) 75%, transparent 100%)',
              backgroundSize: '400% 400%',
            }}
          />

          {/* 반짝이 파티클 - 크고 선명하게 */}
          <div className="pointer-events-none absolute left-[15%] top-[10%] h-3 w-3 animate-[sparkle_2s_ease-in-out_infinite] rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
          <div className="pointer-events-none absolute right-[20%] top-[30%] h-2.5 w-2.5 animate-[sparkle_2s_ease-in-out_infinite_0.3s] rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
          <div className="pointer-events-none absolute left-[25%] top-[60%] h-3.5 w-3.5 animate-[sparkle_2s_ease-in-out_infinite_0.6s] rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
          <div className="pointer-events-none absolute right-[15%] top-[75%] h-2 w-2 animate-[sparkle_2s_ease-in-out_infinite_0.9s] rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />

          {/* 카드 내용 */}
          <div className="relative z-10 flex h-full flex-col p-8 text-moas-black">
            {/* 카테고리 배지 */}
            <div
              className="mb-3 inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-base font-semibold"
              style={{ background: categoryConfig.color }}
            >
              {categoryConfig.name}
            </div>

            {/* 프로젝트명 / 계약 제목 */}
            <h3 className="mb-5 text-3xl font-extrabold leading-tight">
              {titleOverride ||
                (contract.status === 'PAYMENT_COMPLETED' || contract.status === 'COMPLETED'
                  ? contract.title
                  : contract.project.title)}
            </h3>

            {/* 프로젝트 이미지 */}
            <div className="mb-4">
              <img
                src={projectThumbnail}
                alt="프로젝트 썸네일"
                className="h-48 w-full rounded-xl object-cover shadow-lg"
                onError={(e) => {
                  // 이미지 로드 실패 시 placeholder 사용
                  e.currentTarget.src = projectThumbnailPlaceholder;
                }}
              />
            </div>

            {/* 참여자 정보 */}
            <div className="mb-5 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="opacity-70">프로젝트 리더:</span>
                <span className="font-semibold">{contract.leader.nickname}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="opacity-70">아티스트:</span>
                <span className="font-semibold">{contract.artist.nickname}</span>
              </div>
            </div>

            {/* 금액 및 기간 */}
            <div className="mb-6 space-y-4">
              <div>
                <div className="mb-1 text-sm opacity-70">계약금</div>
                <div className="text-2xl font-bold">{formatAmount(contract.totalAmount)}원</div>
                <div className="text-sm opacity-70">(수수료 5% 포함)</div>
              </div>

              <div>
                <div className="mb-1 text-sm opacity-70">계약 기간</div>
                <div className="text-base font-semibold">
                  {formatDate(contract.startAt)} ~ {formatDate(contract.endAt)}
                </div>
              </div>
            </div>
          </div>

          {/* 플립 힌트 */}
          <div className="absolute bottom-5 right-5 animate-pulse text-xs text-moas-gray-9">
            클릭하여 뒷면 보기 →
          </div>
        </div>

        {/* 뒷면 */}
        <div
          className="absolute inset-0 overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1825] to-[#34314C] shadow-2xl"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {/* 패턴 오버레이 */}
          <div
            className="pointer-events-none absolute inset-0 opacity-5"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          {/* 카드 내용 */}
          <div className="relative z-10 flex h-full flex-col p-8 text-white">
            {/* 뒷면 헤더 */}
            <div className="mb-8 text-center">
              <div className="mb-2 text-5xl"></div>
              <h3 className="mb-1 text-2xl font-bold">계약 상세 정보</h3>
              <p className="text-xs opacity-70">Contract Details</p>
            </div>

            {/* 블록체인 인증 정보 또는 대기 메시지 */}
            {contract.nftInfo && contract.nftInfo.onchainStatus === 'SUCCEEDED' ? (
              <div className="mb-6">
                <div className="mb-3 flex items-center gap-2 text-base font-semibold">
                  <span>🔐</span>
                  <span>블록체인 인증 정보</span>
                </div>
                <div className="space-y-4 rounded-2xl bg-white/5 p-4">
                  <div>
                    <div className="mb-1 text-xs opacity-70">Token ID</div>
                    <div className="break-all rounded-lg bg-white/10 px-3 py-2 font-mono text-xs leading-relaxed">
                      {contract.nftInfo.tokenId}
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 text-xs opacity-70">Transaction Hash</div>
                    <div className="break-all rounded-lg bg-white/10 px-3 py-2 font-mono text-xs leading-relaxed">
                      {contract.nftInfo.mintTxHash}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="mb-1 text-xs opacity-70">Network</div>
                      <div className="text-sm font-semibold">Ethereum Sepolia</div>
                    </div>
                    <div>
                      <div className="mb-1 text-xs opacity-70">NFT 발행일</div>
                      <div className="text-sm font-semibold">{formatDate(contract.createdAt)}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center">
                <div className="rounded-2xl bg-white/5 px-8 py-12 text-center">
                  <div className="mb-4 text-4xl">📜</div>
                  <p className="text-base leading-relaxed opacity-90">
                    NFT가 발행되면
                    <br />
                    NFT 정보가 표시됩니다
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 플립 힌트 */}
          <div className="absolute bottom-5 left-5 animate-pulse text-xs text-white/50">
            ← 클릭하여 앞면 보기
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
          opacity: 0.5;
          transition: opacity 0.3s ease;
        }

        .hover-hologram:hover .hologram-effect {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}

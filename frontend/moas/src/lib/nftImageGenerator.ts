/**
 * NFT Image Generator
 *
 * Canvas API를 사용하여 NFT 이미지를 생성하는 유틸리티
 */

import type { Contract } from '@/types/contract';

// 이미지 에셋 경로
import backgroundImg from '@/assets/img/nft/nft_background.png';
import designImg from '@/assets/img/nft/design.png';
import musicImg from '@/assets/img/nft/music.png';
import pictureImg from '@/assets/img/nft/picture.png';
import etcImg from '@/assets/img/nft/etc.png';
import completedOverlayImg from '@/assets/img/nft/nft_completed_overlay.png';
import canceledOverlayImg from '@/assets/img/nft/nft_cancled_overlay.png';
import activeOverlayImg from '@/assets/img/nft/nft_active_overlay.png';

// NFT 이미지 크기 (1:1 비율)
const NFT_WIDTH = 600;
const NFT_HEIGHT = 600;

// 텍스트 스타일
const TEXT_COLOR = '#111111';
const DATE_COLOR = '#77797E'; // moas-gray-7
const FONT_FAMILY = 'Pretendard';
const TITLE_FONT_SIZE = 48;
const TITLE_FONT_WEIGHT = 'bold';
const TITLE_LINE_HEIGHT = 60;
const TITLE_MAX_WIDTH = 520; // 텍스트 최대 너비 (좌우 여백 고려)
const TITLE_MAX_LINES = 2; // 최대 줄 수

const DATE_FONT_SIZE = 18;
const DATE_FONT_WEIGHT = '500';

const FOOTER_FONT_SIZE = 16;
const FOOTER_FONT_WEIGHT = '600';
const FOOTER_LINE_HEIGHT = 30;

// 레이아웃 위치
const CATEGORY_BADGE_Y = 40; // 카테고리 배지 Y 위치
const CATEGORY_BADGE_X = 40; // 카테고리 배지 X 위치 (왼쪽 여백)
const CATEGORY_BADGE_SCALE = 0.6; // 카테고리 배지 크기
const TEXT_LEFT_MARGIN = 40; // 텍스트 좌측 여백 (배지와 동일)
const TITLE_START_Y = 120; // 계약 이름 시작 Y 위치 (배지 밑)
const DATE_Y = 195; // 계약 기간 Y 위치 (제목 밑)
const FOOTER_START_Y = 520; // 하단 정보 시작 Y 위치 (리더/아티스트)

/**
 * 이미지 로드 함수
 */
const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * 카테고리에 따른 배지 이미지 경로 반환
 */
const getCategoryImagePath = (categoryName?: string): string => {
  switch (categoryName) {
    case '디자인':
      return designImg;
    case '음악/공연':
      return musicImg;
    case '사진/영상/미디어':
      return pictureImg;
    default:
      return etcImg; // 기타 모든 카테고리
  }
};

/**
 * 날짜 포맷팅 (YYYY.MM.DD)
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
};

/**
 * 텍스트를 단어 단위로 줄바꿈하고, 2줄 초과 시 말줄임 처리
 */
const wrapText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number = TITLE_MAX_LINES,
): string[] => {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth) {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        // 단어 하나가 너무 길면 그대로 추가
        lines.push(word);
        currentLine = '';
      }
    } else {
      currentLine = testLine;
    }

    // 최대 줄 수 체크
    if (lines.length >= maxLines) {
      break;
    }
  }

  // 마지막 줄 추가
  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }

  // 2줄 초과 시 말줄임 처리
  if (lines.length >= maxLines) {
    const lastLine = lines[maxLines - 1];
    const ellipsis = '...';
    let truncatedLine = lastLine;

    // "..." 포함하여 너비가 초과하지 않도록 조정
    while (ctx.measureText(truncatedLine + ellipsis).width > maxWidth && truncatedLine.length > 0) {
      truncatedLine = truncatedLine.slice(0, -1);
    }

    lines[maxLines - 1] = truncatedLine + ellipsis;
    return lines.slice(0, maxLines);
  }

  return lines;
};

/**
 * NFT 이미지 생성
 * @param contract - 계약 데이터
 * @param status - 이미지 상태 ('active' | 'completed' | 'canceled')
 * @returns Promise<Blob> - 생성된 이미지 Blob
 */
export const generateNFTImage = async (
  contract: Contract,
  status: 'active' | 'completed' | 'canceled',
): Promise<Blob> => {
  console.log(`[NFT Image Generator] Generating ${status} NFT image...`);

  // Canvas 생성
  const canvas = document.createElement('canvas');
  canvas.width = NFT_WIDTH;
  canvas.height = NFT_HEIGHT;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  try {
    // 1. 배경 이미지 로드 및 그리기
    const background = await loadImage(backgroundImg);
    ctx.drawImage(background, 0, 0, NFT_WIDTH, NFT_HEIGHT);

    // 2. 카테고리 배지 이미지 로드 및 그리기
    const categoryImagePath = getCategoryImagePath(contract.project.categoryName);
    const categoryBadge = await loadImage(categoryImagePath);

    // 카테고리 배지를 상단 왼쪽에 배치 (크기 축소)
    const badgeWidth = categoryBadge.width * CATEGORY_BADGE_SCALE;
    const badgeHeight = categoryBadge.height * CATEGORY_BADGE_SCALE;
    ctx.drawImage(categoryBadge, CATEGORY_BADGE_X, CATEGORY_BADGE_Y, badgeWidth, badgeHeight);

    // 3. 계약 이름 텍스트 그리기 (좌측 정렬)
    ctx.font = `${TITLE_FONT_WEIGHT} ${TITLE_FONT_SIZE}px ${FONT_FAMILY}`;
    ctx.fillStyle = TEXT_COLOR;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    const titleLines = wrapText(ctx, contract.title, TITLE_MAX_WIDTH);
    titleLines.forEach((line, index) => {
      const y = TITLE_START_Y + index * TITLE_LINE_HEIGHT;
      ctx.fillText(line, TEXT_LEFT_MARGIN, y);
    });

    // 4. 계약 기간 텍스트 그리기 (좌측 정렬, moas-gray-7 색상)
    ctx.font = `${DATE_FONT_WEIGHT} ${DATE_FONT_SIZE}px ${FONT_FAMILY}`;
    ctx.fillStyle = DATE_COLOR;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    const dateText = `${formatDate(contract.startAt)} ~ ${formatDate(contract.endAt)}`;
    ctx.fillText(dateText, TEXT_LEFT_MARGIN, DATE_Y);

    // 5. 하단 리더/아티스트 정보 그리기
    ctx.font = `${FOOTER_FONT_WEIGHT} ${FOOTER_FONT_SIZE}px ${FONT_FAMILY}`;
    ctx.fillStyle = TEXT_COLOR;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    const leaderText = `프로젝트 리더: ${contract.leader.nickname}`;
    const artistText = `아티스트: ${contract.artist.nickname}`;

    ctx.fillText(leaderText, 60, FOOTER_START_Y);
    ctx.fillText(artistText, 60, FOOTER_START_Y + FOOTER_LINE_HEIGHT);

    // 6. 상태별 오버레이 그리기
    if (status === 'active') {
      const activeOverlay = await loadImage(activeOverlayImg);
      ctx.drawImage(activeOverlay, 0, 0, NFT_WIDTH, NFT_HEIGHT);
    } else if (status === 'completed') {
      const completedOverlay = await loadImage(completedOverlayImg);
      ctx.drawImage(completedOverlay, 0, 0, NFT_WIDTH, NFT_HEIGHT);
    } else if (status === 'canceled') {
      const canceledOverlay = await loadImage(canceledOverlayImg);
      ctx.drawImage(canceledOverlay, 0, 0, NFT_WIDTH, NFT_HEIGHT);
    }

    // 7. Canvas를 Blob으로 변환
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert canvas to blob'));
          }
        },
        'image/png',
        1.0,
      );
    });

    console.log(`[NFT Image Generator] ${status} image generated successfully`);
    console.log(`  Image size: ${(blob.size / 1024).toFixed(2)} KB`);

    return blob;
  } catch (error) {
    console.error(`[NFT Image Generator] Failed to generate ${status} image:`, error);
    throw error;
  }
};

/**
 * NFT 이미지 번들 생성 (active/completed/canceled)
 * @param contract - 계약 데이터
 * @returns Promise<{ activeImage: Blob, completedImage: Blob, canceledImage: Blob }>
 */
export const generateNFTImageBundle = async (
  contract: Contract,
): Promise<{ activeImage: Blob; completedImage: Blob; canceledImage: Blob }> => {
  console.log('[NFT Image Generator] Generating NFT image bundle...');

  // 3가지 상태의 이미지를 병렬로 생성
  const [activeImage, completedImage, canceledImage] = await Promise.all([
    generateNFTImage(contract, 'active'),
    generateNFTImage(contract, 'completed'),
    generateNFTImage(contract, 'canceled'),
  ]);

  console.log('[NFT Image Generator] NFT image bundle generated successfully');

  return {
    activeImage,
    completedImage,
    canceledImage,
  };
};

// src/lib/contractPdfGenerator.ts

import jsPDF from 'jspdf';
import { marked } from 'marked';
import type { Contract } from '@/types/contract';
import { getStatusBadgeStyle } from '@/types/contract';
import { FONTS } from './fonts';
import moasStamp from '@/assets/img/moas_stamp.jpg';
import moasLogo from '@/assets/img/moas_logo_pdf.png';

/**
 * 날짜를 한글 형식으로 포맷팅
 * @param dateString - ISO 8601 형식의 날짜 문자열
 * @returns "YYYY년 MM월 DD일 HH:mm" 형식
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
};

/**
 * 금액을 한글 통화 형식으로 포맷팅
 * @param amount - 금액
 * @returns "₩ 1,000,000" 형식
 */
const formatCurrency = (amount: number): string => {
  return `₩ ${amount.toLocaleString('ko-KR')}`;
};

/**
 * 파일명에 사용할 수 없는 특수문자 제거
 */
const sanitizeFilename = (filename: string): string => {
  return filename.replace(/[/\\?%*:|"<>]/g, '-');
};

/**
 * BookkMyungjo 폰트를 jsPDF에 로드
 */
const loadCustomFonts = (doc: jsPDF): void => {
  // Normal weight 폰트 추가
  doc.addFileToVFS('BookkMyungjo-normal.ttf', FONTS['BookkMyungjo-normal']);
  doc.addFont('BookkMyungjo-normal.ttf', 'BookkMyungjo', 'normal');

  // Bold weight 폰트 추가
  doc.addFileToVFS('BookkMyungjo-bold.ttf', FONTS['BookkMyungjo-bold']);
  doc.addFont('BookkMyungjo-bold.ttf', 'BookkMyungjo', 'bold');
};

/**
 * 인라인 마크다운 스타일을 적용하여 텍스트 렌더링
 * @param doc - jsPDF 인스턴스
 * @param text - 마크다운 텍스트
 * @param startX - 시작 X 좌표
 * @param yPosition - 현재 Y 좌표
 * @param maxWidth - 최대 너비
 * @param pageHeight - 페이지 높이
 * @param margin - 여백
 * @returns 최종 Y 좌표
 */
const renderTextWithInlineStyles = (
  doc: jsPDF,
  text: string,
  startX: number,
  yPosition: number,
  maxWidth: number,
  pageHeight: number,
  margin: number
): number => {
  const fontSize = 10;
  const lineHeight = 5;

  // **굵게**, *이탤릭* 패턴을 분리
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);

  let currentX = startX;

  parts.forEach(part => {
    if (!part) return;

    let isBold = false;
    let cleanText = part;

    // 스타일 감지
    if (part.startsWith('**') && part.endsWith('**')) {
      isBold = true;
      cleanText = part.slice(2, -2);
    } else if (part.startsWith('*') && part.endsWith('*')) {
      isBold = false;
      cleanText = part.slice(1, -1);
    }

    // 폰트 스타일 설정
    doc.setFont('BookkMyungjo', isBold ? 'bold' : 'normal');
    doc.setFontSize(fontSize);

    // 단어 단위로 분리하여 줄바꿈 처리
    const words = cleanText.split(' ');

    words.forEach((word, index) => {
      const testWord = index < words.length - 1 ? word + ' ' : word;
      const wordWidth = doc.getTextWidth(testWord);

      // 줄바꿈 필요 여부 체크 (현재 줄이 비어있지 않을 때만)
      if (currentX + wordWidth > startX + maxWidth && currentX > startX) {
        // 다음 줄로 이동
        yPosition += lineHeight;
        currentX = startX;

        // 페이지 넘김 체크
        if (yPosition > pageHeight - margin - 20) {
          doc.addPage();
          yPosition = margin;
        }
      }

      // 단어 출력 (현재 폰트 스타일 유지)
      doc.text(testWord, currentX, yPosition);
      currentX += wordWidth;
    });
  });

  return yPosition + lineHeight + 2; // 단락 간격
};

/**
 * 마크다운 텍스트를 PDF에 렌더링
 * @param doc - jsPDF 인스턴스
 * @param markdown - 마크다운 텍스트
 * @param startX - 시작 X 좌표
 * @param startY - 시작 Y 좌표
 * @param maxWidth - 최대 너비
 * @param pageHeight - 페이지 높이
 * @param margin - 여백
 * @returns 최종 Y 좌표
 */
const renderMarkdownToPDF = (
  doc: jsPDF,
  markdown: string,
  startX: number,
  startY: number,
  maxWidth: number,
  pageHeight: number,
  margin: number
): number => {
  let yPosition = startY;

  // 마크다운을 토큰으로 파싱
  const tokens = marked.lexer(markdown);

  tokens.forEach((token) => {
    // 페이지 넘김 체크
    if (yPosition > pageHeight - margin - 20) {
      doc.addPage();
      yPosition = margin;
    }

    switch (token.type) {
      case 'heading': {
        // 제목 처리
        const headingLevel = token.depth;
        const fontSize = headingLevel === 1 ? 14 : headingLevel === 2 ? 12 : 11;

        doc.setFont('BookkMyungjo', 'bold');
        doc.setFontSize(fontSize);

        const headingLines = doc.splitTextToSize(token.text, maxWidth);
        headingLines.forEach((line: string) => {
          if (yPosition > pageHeight - margin - 20) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(line, startX, yPosition);
          yPosition += fontSize * 0.5;
        });
        yPosition += 3;
        break;
      }

      case 'paragraph': {
        // 단락 처리 - 인라인 스타일(굵게, 이탤릭) 적용
        yPosition = renderTextWithInlineStyles(
          doc,
          token.text,
          startX,
          yPosition,
          maxWidth,
          pageHeight,
          margin
        );
        break;
      }

      case 'list': {
        // 리스트 처리
        doc.setFont('BookkMyungjo', 'normal');
        doc.setFontSize(10);

        token.items.forEach((item: any, index: number) => {
          if (yPosition > pageHeight - margin - 20) {
            doc.addPage();
            yPosition = margin;
          }

          // 불릿 심볼만 표시 (텍스트는 포함하지 않음)
          const bulletSymbol = token.ordered ? `${index + 1}.` : '•';
          doc.text(bulletSymbol, startX, yPosition);

          // 항목 텍스트를 불릿 오른쪽에 표시 (인라인 스타일 적용)
          const indentX = startX + 5; // 불릿 다음 들여쓰기
          const itemMaxWidth = maxWidth - 10;

          // renderTextWithInlineStyles를 사용하여 인라인 마크다운 처리
          yPosition = renderTextWithInlineStyles(
            doc,
            item.text,
            indentX,
            yPosition,
            itemMaxWidth,
            pageHeight,
            margin
          );

          // renderTextWithInlineStyles는 단락 간격을 추가하므로, 이미 추가된 간격 고려
          // 여기서는 단락 간격 대신 항목 간격만 추가
          yPosition = yPosition - 2; // renderTextWithInlineStyles가 추가한 단락 간격 제거
        });
        yPosition += 2;
        break;
      }

      case 'space': {
        // 공백 처리
        yPosition += 3;
        break;
      }

      default: {
        // 기타 토큰은 일반 텍스트로 처리
        if ('text' in token && token.text) {
          doc.setFont('BookkMyungjo', 'normal');
          doc.setFontSize(10);
          const lines = doc.splitTextToSize(token.text, maxWidth);
          lines.forEach((line: string) => {
            if (yPosition > pageHeight - margin - 20) {
              doc.addPage();
              yPosition = margin;
            }
            doc.text(line, startX, yPosition);
            yPosition += 5;
          });
        }
        break;
      }
    }
  });

  return yPosition;
};

/**
 * 계약서 PDF 생성 및 다운로드
 * @param contract - 계약 상세 정보
 */
export const generateContractPDF = async (contract: Contract): Promise<void> => {
  try {
    // jsPDF 인스턴스 생성 (A4 크기)
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // 한글 폰트 로드
    loadCustomFonts(doc);

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    // ===== 헤더 영역 =====
    doc.setFont('BookkMyungjo', 'bold');
    doc.setFontSize(24);
    doc.text('MOAS 프로젝트 계약서', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;

    doc.setFont('BookkMyungjo', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text('Project Contract', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 12;

    // 구분선
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // ===== 계약 기본 정보 =====
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('BookkMyungjo', 'normal');

    const statusInfo = getStatusBadgeStyle(contract.status);
    doc.text(`계약 번호: ${contract.contractId}`, margin, yPosition);
    if (statusInfo) {
      doc.text(`상태: ${statusInfo.label}`, pageWidth - margin - 30, yPosition);
    }
    yPosition += 6;
    doc.text(`작성일: ${formatDate(contract.createdAt)}`, margin, yPosition);
    yPosition += 12;

    // ===== 프로젝트 정보 섹션 =====
    doc.setFontSize(14);
    doc.setFont('BookkMyungjo', 'bold');
    doc.text('프로젝트 정보', margin, yPosition);
    yPosition += 2;

    // 밑줄
    doc.setLineWidth(0.3);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;

    doc.setFontSize(11);
    doc.setFont('BookkMyungjo', 'normal');
    doc.text('프로젝트명', margin, yPosition);
    doc.text(contract.project.title, margin + 35, yPosition);
    yPosition += 6;

    if (contract.position) {
      doc.text('포지션', margin, yPosition);
      doc.text(contract.position.positionName, margin + 35, yPosition);
      yPosition += 6;
      doc.text('카테고리', margin, yPosition);
      doc.text(contract.position.categoryName, margin + 35, yPosition);
      yPosition += 6;
    }
    yPosition += 5;

    // ===== 계약 당사자 섹션 =====
    doc.setFontSize(14);
    doc.setFont('BookkMyungjo', 'bold');
    doc.text('계약 당사자', margin, yPosition);
    yPosition += 2;

    doc.setLineWidth(0.3);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;

    doc.setFontSize(11);
    doc.setFont('BookkMyungjo', 'normal');
    doc.text('리더', margin, yPosition);
    doc.text(`${contract.leader.nickname}`, margin + 35, yPosition);
    yPosition += 6;
    doc.text('아티스트', margin, yPosition);
    doc.text(`${contract.artist.nickname}`, margin + 35, yPosition);
    yPosition += 10;

    // ===== 계약 상세 정보 섹션 =====
    doc.setFontSize(14);
    doc.setFont('BookkMyungjo', 'bold');
    doc.text('계약 상세', margin, yPosition);
    yPosition += 2;

    doc.setLineWidth(0.3);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;

    doc.setFontSize(13);
    doc.setFont('BookkMyungjo', 'bold');
    doc.text(contract.title, margin, yPosition);
    yPosition += 8;

    doc.setFontSize(11);
    doc.setFont('BookkMyungjo', 'normal');
    doc.text('계약 기간', margin, yPosition);
    const periodText = `${formatDate(contract.startAt)} ~ ${formatDate(contract.endAt)}`;
    doc.text(periodText, margin + 35, yPosition);
    yPosition += 6;

    doc.text('계약 금액', margin, yPosition);
    doc.setFont('BookkMyungjo', 'bold');
    doc.setFontSize(13);
    doc.text(formatCurrency(contract.totalAmount), margin + 35, yPosition);
    yPosition += 10;

    // 계약 설명
    doc.setFontSize(11);
    doc.setFont('BookkMyungjo', 'bold');
    doc.text('계약 내용', margin, yPosition);
    yPosition += 6;

    // 마크다운 렌더링 함수 사용
    yPosition = renderMarkdownToPDF(
      doc,
      contract.description,
      margin,
      yPosition,
      pageWidth - margin * 2,
      pageHeight,
      margin
    );

    yPosition += 5;

    // ===== NFT 정보 (있는 경우) =====
    if (contract.nftInfo) {
      if (yPosition > pageHeight - margin - 60) {
        doc.addPage();
        yPosition = margin;
      }

      doc.setFontSize(14);
      doc.setFont('BookkMyungjo', 'bold');
      doc.text('NFT 정보', margin, yPosition);
      yPosition += 2;

      doc.setLineWidth(0.3);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont('BookkMyungjo', 'normal');

      doc.text('토큰 ID', margin, yPosition);
      doc.text(contract.nftInfo.tokenId, margin + 35, yPosition);
      yPosition += 6;

      doc.text('트랜잭션 해시', margin, yPosition);
      const txHashLines = doc.splitTextToSize(contract.nftInfo.mintTxHash, pageWidth - margin * 2 - 35);
      txHashLines.forEach((line: string, index: number) => {
        doc.text(line, margin + 35, yPosition);
        if (index < txHashLines.length - 1) {
          yPosition += 3;
        }
      });
      yPosition += 6;

      doc.text('NFT 등록 정보', margin, yPosition);
      // 클릭 가능한 링크 추가
      doc.setTextColor(0, 0, 255);
      doc.textWithLink(contract.nftInfo.explorerUrl, margin + 35, yPosition, {
        url: contract.nftInfo.explorerUrl,
      });
      doc.setTextColor(0, 0, 0);
      yPosition += 16;
    }

    // ===== 서명 섹션 =====
    if (contract.leaderSignature || contract.artistSignature) {
      if (yPosition > pageHeight - margin - 70) {
        doc.addPage();
        yPosition = margin;
      }

      doc.setFontSize(14);
      doc.setFont('BookkMyungjo', 'bold');
      doc.text('전자 서명', margin, yPosition);
      yPosition += 2;

      doc.setLineWidth(0.3);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;

      doc.setFontSize(9);
      doc.setFont('BookkMyungjo', 'normal');

      if (contract.leaderSignature) {
        doc.setFont('BookkMyungjo', 'bold');
        doc.text('리더 서명', margin, yPosition);
        yPosition += 5;

        doc.setFont('BookkMyungjo', 'normal');
        const leaderSigLines = doc.splitTextToSize(
          contract.leaderSignature,
          pageWidth - margin * 2 - 5,
        );
        leaderSigLines.forEach((line: string) => {
          if (yPosition > pageHeight - margin - 10) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(line, margin + 2, yPosition);
          yPosition += 4;
        });
        yPosition += 3;
      }

      if (contract.artistSignature) {
        if (yPosition > pageHeight - margin - 30) {
          doc.addPage();
          yPosition = margin;
        }

        doc.setFont('BookkMyungjo', 'bold');
        doc.text('아티스트 서명', margin, yPosition);
        yPosition += 5;

        doc.setFont('BookkMyungjo', 'normal');
        const artistSigLines = doc.splitTextToSize(
          contract.artistSignature,
          pageWidth - margin * 2 - 5,
        );
        artistSigLines.forEach((line: string) => {
          if (yPosition > pageHeight - margin - 10) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(line, margin + 2, yPosition);
          yPosition += 4;
        });
      }
    }

    // ===== 워터마크 및 푸터 =====
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);

      // 페이지 중앙에 로고 워터마크 추가
      try {
        const logoSize = 100; // 로고 크기 (mm)
        const logoX = (pageWidth - logoSize) / 2;
        const logoY = ((pageHeight - logoSize) / 2 ) - 10;

        // 투명도 설정
        doc.addImage(moasLogo, 'PNG', logoX, logoY, logoSize, logoSize);
        // 투명도 복원
        doc.setGState({ opacity: 1 });
      } catch (error) {
        console.warn('로고 워터마크 추가 실패:', error);
      }

      const footerY = pageHeight - 10;
      doc.setFontSize(8);
      doc.setFont('BookkMyungjo', 'normal');
      doc.setTextColor(150, 150, 150);
      const generatedAt = new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      doc.text(
        `본 계약서는 MOAS 플랫폼에서 ${generatedAt}에 생성되었습니다.`,
        pageWidth / 2,
        footerY,
        { align: 'center' },
      );
      doc.setTextColor(0, 0, 0);

      // 마지막 페이지 우측 하단에 도장 추가
      if (i === totalPages) {
        try {
          const stampSize = 30; // 도장 크기 (mm)
          const stampX = pageWidth - margin - stampSize;
          const stampY = pageHeight - margin - stampSize;
          doc.addImage(moasStamp, 'JPEG', stampX, stampY, stampSize, stampSize);
        } catch (error) {
          console.warn('도장 추가 실패:', error);
        }
      }
    }

    // ===== PDF 다운로드 =====
    const filename = sanitizeFilename(
      `계약서_${contract.project.title}_${contract.artist.nickname}.pdf`,
    );
    doc.save(filename);
  } catch (error) {
    console.error('PDF 생성 중 오류 발생:', error);
    throw error;
  }
};

/**
 * StatsCard Component
 *
 * Props:
 * - label (string): 통계 라벨 (예: "미결정", "응답 대기")
 * - count (number): 통계 수치
 * - iconSrc (string): 아이콘 이미지 경로
 * - iconType ('text' | 'image'): 아이콘 타입
 * - bgColor (string): 배경색 Tailwind 클래스
 * - textColor (string): 텍스트 색상 Tailwind 클래스
 *
 * Description:
 * 지원자 상태별 통계를 표시하는 카드 컴포넌트
 */

interface StatsCardProps {
  label: string;
  count: number;
  iconSrc?: string;
  iconType: 'text' | 'image';
  bgColor: string;
  textColor: string;
}

export function StatsCard({ label, count, iconSrc, iconType, bgColor, textColor }: StatsCardProps) {
  // 아이콘 크기 통일을 위해 label 별 크기 설정
  const getIconSize = () => {
    if (label === '계약 완료') return 'h-12 w-12';
    if (label === '거절 완료') return 'h-8 w-8';
    return 'h-10 w-10';
  };

  return (
    <div className="flex flex-1 items-center gap-5">
      <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full ${bgColor}`}>
        {iconType === 'text' ? (
          <span className={`font-pretendard text-[36px] font-bold leading-none ${textColor}`}>
            ?
          </span>
        ) : (
          <img src={iconSrc} alt={label} className={`${getIconSize()} object-contain`} />
        )}
      </div>
      <div className="flex flex-col items-start gap-1">
        <p className={`text-[16px] font-semibold whitespace-nowrap ${textColor}`}>{label}</p>
        <p className={`font-pretendard text-[40px] font-bold leading-none ${textColor}`}>{count}</p>
      </div>
    </div>
  );
}

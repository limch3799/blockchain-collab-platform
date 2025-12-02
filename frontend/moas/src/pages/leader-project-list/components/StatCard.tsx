/**
 * StatCard Component
 *
 * Props:
 * - label (string): 통계 라벨
 * - count (number): 통계 수치
 * - bgColor (string): 배경색 Tailwind 클래스
 *
 * Description:
 * 프로젝트/계약 통계를 표시하는 카드 컴포넌트
 */

interface StatCardProps {
  label: string;
  count: number;
  bgColor: string;
}

export function StatCard({ label, count, bgColor }: StatCardProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl ${bgColor} px-8 py-6 min-w-[200px]`}
    >
      <p className="mb-2 text-[16px] font-semibold text-white whitespace-nowrap">{label}</p>
      <p className="text-[48px] font-bold leading-none text-white">{count}</p>
    </div>
  );
}

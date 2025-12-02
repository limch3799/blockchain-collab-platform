// src/components/layout/PageHeader.tsx
import faviconImage from '@/assets/favicon.png';

interface PageHeaderProps {
  title: string;
  description: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="w-full flex justify-between items-start font-pretendard">
      {/* 왼쪽: 타이틀 + 설명 */}
      <div className="flex-1">
        <h1 className="text-3xl font-semibold text-moas-text leading-tight">{title}</h1>
        <p className="text-lg text-moas-gray-7 leading-snug mt-1">{description}</p>
      </div>

      <div className="flex-shrink-0 self-end mb-2">
        <img src={faviconImage} alt="Favicon" className="h-18 w-18 object-contain" />
      </div>
    </div>
  );
}

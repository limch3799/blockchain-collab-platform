// src/pages/portfolio/my-portfolio/components/PortfolioGuide.tsx

import portfolioIcon from '@/assets/portfolio_icon.png';

export function PortfolioGuide() {
  return (
    <div className="w-full h-32 rounded-3xl bg-moas-portfolio-1 overflow-hidden flex items-center justify-between px-8 font-pretendard">
      {/* 왼쪽 텍스트 */}
      <div className="flex flex-col justify-center gap-2">
        <h2 className="text-2xl font-bold text-moas-portfolio-2 ms-4 mt-0">
          나를 표현하는 포트폴리오를 만들어보세요
        </h2>
        <p className="text-lg font-semibold text-moas-portfolio-3 ms-4">
          이미지, 영상, 문서 등 다양한 자료 첨부로 더욱 완성도 높은 포트폴리오를 만들어보세요!
        </p>
      </div>

      {/* 오른쪽 이미지 */}
      <div className="flex-shrink-0 h-full flex items-end mr-16">
        <img
          src={portfolioIcon}
          alt="Portfolio Icon"
          className="h-28 object-contain object-bottom"
        />
      </div>
    </div>
  );
}

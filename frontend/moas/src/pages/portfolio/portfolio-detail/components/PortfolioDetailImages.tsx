// src/pages/portfolio/portfolio-detail/components/PortfolioDetailImages.tsx
interface PortfolioDetailImagesProps {
  images: string[];
}

export function PortfolioDetailImages({ images }: PortfolioDetailImagesProps) {
  if (images.length === 0) return null;

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-moas-gray-6">포트폴리오 이미지</h4>
      <div className="grid grid-cols-1 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative w-full rounded-lg overflow-hidden">
            <img
              src={image}
              alt={`Portfolio image ${index + 1}`}
              className="w-full h-auto object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

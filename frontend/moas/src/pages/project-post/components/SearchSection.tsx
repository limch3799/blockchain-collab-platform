// src/pages/project-post/components/SearchSection.tsx (수정)
import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search, ChevronDown, X } from 'lucide-react';
import { CategoryModal } from './CategoryModal';
import { RegionModal } from './RegionModal';
import { getCategoryList, getCategoryName } from '@/constants/categories';
import { PROVINCES, DISTRICTS } from '@/constants/regions';
import { isAllDistrictCode } from '@/constants/regionUtils';

const CATEGORY_TABS = [
  { name: '전체', positionIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] },
  { name: '음악 / 공연', positionIds: [1, 2, 3, 4] },
  { name: '사진 / 영상 / 미디어', positionIds: [5, 6, 7, 8, 9] },
  { name: '디자인', positionIds: [10, 11, 12, 13, 14] },
  { name: '기타', positionIds: [15] },
];

interface SearchSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedPositions: number[];
  onPositionsChange: (positions: number[]) => void;
  selectedRegions: Array<{ provinceCode: string; districtCode: string }>;
  onRegionsChange: (regions: Array<{ provinceCode: string; districtCode: string }>) => void;
  isOnlineSelected: boolean;
  onIsOnlineChange: (isOnline: boolean) => void;
  selectedTabIndex: number;
  onTabChange: (index: number) => void;
  isAIMode: boolean;
  onAIModeChange: (isAI: boolean) => void;
}

type ModalType = 'position' | 'region' | null;

export function SearchSection({
  searchQuery,
  onSearchChange,
  selectedPositions,
  onPositionsChange,
  selectedRegions,
  onRegionsChange,
  isOnlineSelected,
  onIsOnlineChange,
  selectedTabIndex,
  onTabChange,
  isAIMode,
  onAIModeChange,
}: SearchSectionProps) {
  const [openModal, setOpenModal] = useState<ModalType>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });

  const availablePositions = getCategoryList().filter((pos) =>
    CATEGORY_TABS[selectedTabIndex].positionIds.includes(pos.id),
  );

  useEffect(() => {
    if (isAIMode) return;

    const container = containerRef.current;
    if (!container) return;

    const selectedButton = container.children[selectedTabIndex] as HTMLElement;
    if (selectedButton) {
      const fullWidth = selectedButton.offsetWidth;
      const underlineWidth = fullWidth * 0.75;
      const left = selectedButton.offsetLeft + fullWidth * 0.125;
      setUnderlineStyle({ left, width: underlineWidth });
    }
  }, [selectedTabIndex, isAIMode]);

  const handleTabChange = (index: number) => {
    onTabChange(index);
    onAIModeChange(false);
    onPositionsChange([]);
    onRegionsChange([]);
    onIsOnlineChange(false);
  };

  const handleAIModeToggle = () => {
    onAIModeChange(!isAIMode);
  };

  const handlePositionSelect = (positionId: number) => {
    const newPositions = selectedPositions.includes(positionId)
      ? selectedPositions.filter((id) => id !== positionId)
      : [...selectedPositions, positionId];
    onPositionsChange(newPositions);
  };

  const handlePositionApply = () => {
    setOpenModal(null);
  };

  const handleRegionSelect = (region: { provinceCode: string; districtCode: string }) => {
    const exists = selectedRegions.some(
      (r) => r.provinceCode === region.provinceCode && r.districtCode === region.districtCode,
    );
    const newRegions = exists
      ? selectedRegions.filter(
          (r) =>
            !(r.provinceCode === region.provinceCode && r.districtCode === region.districtCode),
        )
      : [...selectedRegions, region];
    onRegionsChange(newRegions);
  };

  const handleRegionApply = () => {
    setOpenModal(null);
  };

  const removePosition = (positionId: number) => {
    onPositionsChange(selectedPositions.filter((id) => id !== positionId));
  };

  const removeRegion = (provinceCode: string, districtCode: string) => {
    onRegionsChange(
      selectedRegions.filter(
        (r) => !(r.provinceCode === provinceCode && r.districtCode === districtCode),
      ),
    );
  };

  const getRegionName = (provinceCode: string, districtCode: string) => {
    const province = PROVINCES.find((p) => p.code === provinceCode);

    if (isAllDistrictCode(districtCode)) {
      return `${province?.name} 전체`;
    }

    const district = DISTRICTS[provinceCode]?.find((d) => d.code === districtCode);
    return district ? `${province?.name} ${district.name}` : '';
  };

  return (
    <div className="w-full font-pretendard space-y-5">
      <div className="space-y-4">
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8" ref={containerRef}>
              {CATEGORY_TABS.map((tab, index) => (
                <button
                  key={tab.name}
                  onClick={() => handleTabChange(index)}
                  className="relative pb-2 text-xl font-semibold text-moas-gray-5 hover:text-moas-gray-7 transition-colors"
                >
                  <span className={!isAIMode && selectedTabIndex === index ? 'text-moas-text' : ''}>
                    {tab.name}
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={handleAIModeToggle}
              className={`relative px-3 py-1 rounded-3xl text-base font-semibold transition-all ${
                isAIMode
                  ? 'text-moas-artist border-2 border-moas-artist bg-white'
                  : 'text-moas-gray-5 border-1 border-moas-gray-3 bg-white hover:border-moas-artist hover:text-moas-artist'
              }`}
              style={{
                animation: isAIMode ? 'borderGlow 2s ease-in-out infinite' : 'none',
              }}
            >
              AI 추천
            </button>
          </div>

          {!isAIMode && (
            <div
              className="absolute bottom-0 h-1 bg-moas-main transition-all duration-300 ease-in-out"
              style={{ left: underlineStyle.left, width: underlineStyle.width }}
            />
          )}
        </div>
      </div>

      {!isAIMode && (
        <>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpenModal('position')}
              className={`px-2 py-1.5 rounded-lg border transition-all flex items-center gap-2 ${
                selectedPositions.length > 0 || openModal === 'position'
                  ? 'border-moas-main text-moas-text bg-moas-main/5'
                  : 'border-moas-gray-3 text-moas-gray-7 hover:border-moas-gray-4'
              }`}
            >
              <span className="font-medium">포지션</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            <button
              onClick={() => setOpenModal('region')}
              className={`px-2 py-1.5 rounded-lg border transition-all flex items-center gap-2 ${
                selectedRegions.length > 0 || isOnlineSelected || openModal === 'region'
                  ? 'border-moas-main text-moas-text bg-moas-main/5'
                  : 'border-moas-gray-3 text-moas-gray-7 hover:border-moas-gray-4'
              }`}
            >
              <span className="font-medium">지역</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {(selectedPositions.length > 0 || selectedRegions.length > 0 || isOnlineSelected) && (
            <div className="flex flex-wrap gap-2">
              {selectedPositions.map((positionId) => (
                <div
                  key={positionId}
                  className="flex items-center gap-1 px-3 py-1.5 bg-moas-main/10 text-moas-text rounded-lg text-sm font-medium"
                >
                  <span>{getCategoryName(positionId)}</span>
                  <button
                    onClick={() => removePosition(positionId)}
                    className="hover:bg-moas-main/20 rounded-full p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {isOnlineSelected && (
                <div className="flex items-center gap-1 px-3 py-1.5 bg-moas-main/10 text-moas-text rounded-lg text-sm font-medium">
                  <span>온라인</span>
                  <button
                    onClick={() => onIsOnlineChange(false)}
                    className="hover:bg-moas-main/20 rounded-full p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              {selectedRegions.map((region, index) => (
                <div
                  key={`${region.provinceCode}-${region.districtCode}-${index}`}
                  className="flex items-center gap-1 px-3 py-1.5 bg-moas-main/10 text-moas-text rounded-lg text-sm font-medium"
                >
                  <span>{getRegionName(region.provinceCode, region.districtCode)}</span>
                  <button
                    onClick={() => removeRegion(region.provinceCode, region.districtCode)}
                    className="hover:bg-moas-main/20 rounded-full p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-moas-gray-5 font-medium" />
            <Input
              type="text"
              placeholder="프로젝트 제목, 키워드로 검색하세요"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-12 h-12 text-xl placeholder:text-base placeholder:text-moas-gray-5 rounded-xl"
            />
          </div>

          {openModal === 'position' && (
            <CategoryModal
              title="포지션 선택"
              options={availablePositions}
              selectedOptions={selectedPositions}
              onSelect={handlePositionSelect}
              onClose={() => setOpenModal(null)}
              onApply={handlePositionApply}
            />
          )}

          {openModal === 'region' && (
            <RegionModal
              selectedRegions={selectedRegions}
              onSelect={handleRegionSelect}
              onClose={() => setOpenModal(null)}
              onApply={handleRegionApply}
              isOnlineSelected={isOnlineSelected}
              onIsOnlineChange={onIsOnlineChange}
            />
          )}
        </>
      )}

      <style>{`
        @keyframes borderGlow {
          0%, 100% {
            border-color: var(--color-moas-artist);
            box-shadow: 0 0 0 0 rgba(var(--color-moas-artist-rgb), 0);
          }
          50% {
            border-color: var(--color-moas-artist);
            box-shadow: 0 0 15px 2px rgba(var(--color-moas-artist-rgb), 0.5);
          }
        }
      `}</style>
    </div>
  );
}

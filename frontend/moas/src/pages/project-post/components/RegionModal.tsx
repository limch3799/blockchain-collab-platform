// src/pages/project-post/components/RegionModal.tsx
import { useState } from 'react';
import { X } from 'lucide-react';
import { PROVINCES, DISTRICTS } from '@/constants/regions';
import {
  ALL_DISTRICTS_BY_PROVINCE,
  makeAllDistrictCode,
  isAllDistrictCode,
} from '@/constants/regionUtils';

// 시/도 코드로 이름 찾기
const getProvinceName = (code: string): string => {
  return PROVINCES.find((p) => p.code === code)?.name || '';
};

interface RegionModalProps {
  selectedRegions: Array<{ provinceCode: string; districtCode: string }>;
  onSelect: (region: { provinceCode: string; districtCode: string }) => void;
  onClose: () => void;
  onApply: () => void;
  isOnlineSelected: boolean;
  onIsOnlineChange: (isOnline: boolean) => void;
}

export function RegionModal({
  selectedRegions,
  onSelect,
  onClose,
  onApply,
  isOnlineSelected,
  onIsOnlineChange,
}: RegionModalProps) {
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string>('');
  const [locationMode, setLocationMode] = useState<'offline' | 'online'>(
    isOnlineSelected ? 'online' : 'offline',
  );

  const availableDistricts = selectedProvinceCode ? DISTRICTS[selectedProvinceCode] || [] : [];

  const isDistrictSelected = (districtCode: string) => {
    return selectedRegions.some((r) => r.districtCode === districtCode);
  };

  // "전체" 옵션이 선택되었는지 확인
  const isAllSelected = (provinceCode: string) => {
    return selectedRegions.some(
      (r) => r.provinceCode === provinceCode && isAllDistrictCode(r.districtCode),
    );
  };

  const handleLocationModeChange = (mode: 'offline' | 'online') => {
    setLocationMode(mode);
    onIsOnlineChange(mode === 'online');
    if (mode === 'online') {
      setSelectedProvinceCode('');
    }
  };

  const handleDistrictClick = (districtCode: string) => {
    if (!selectedProvinceCode) return;

    // "전체" 옵션을 클릭한 경우
    if (isAllDistrictCode(districtCode)) {
      // 이미 "전체"가 선택되어 있다면 토글 (해제)
      if (isAllSelected(selectedProvinceCode)) {
        // 해당 시/도의 모든 선택 해제
        const allDistrictCodes = ALL_DISTRICTS_BY_PROVINCE[selectedProvinceCode];
        allDistrictCodes.forEach((code) => {
          if (isDistrictSelected(code)) {
            onSelect({ provinceCode: selectedProvinceCode, districtCode: code });
          }
        });
        // "전체" 옵션도 해제
        onSelect({ provinceCode: selectedProvinceCode, districtCode });
      } else {
        // "전체" 선택 시: 해당 시/도의 개별 구/군들을 모두 제거하고 "전체"만 추가
        const existingDistricts = selectedRegions.filter(
          (r) => r.provinceCode === selectedProvinceCode,
        );

        // 기존 개별 구/군들 제거
        existingDistricts.forEach((region) => {
          if (!isAllDistrictCode(region.districtCode)) {
            onSelect(region);
          }
        });

        // "전체" 추가
        onSelect({ provinceCode: selectedProvinceCode, districtCode });
      }
    } else {
      // 개별 구/군을 클릭한 경우
      // 만약 "전체"가 선택되어 있다면 먼저 "전체"를 해제
      if (isAllSelected(selectedProvinceCode)) {
        const allCode = makeAllDistrictCode(selectedProvinceCode);
        onSelect({ provinceCode: selectedProvinceCode, districtCode: allCode });
      }

      // 개별 구/군 토글
      onSelect({ provinceCode: selectedProvinceCode, districtCode });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 font-pretendard">
      <div className="bg-white rounded-2xl w-[900px] max-h-[90vh] flex flex-col shadow-xl">
        <div className="flex items-center justify-between ps-6 pt-4 pb-4 border-b border-moas-gray-3">
          <h2 className="text-xl font-semibold text-moas-text">지역 선택</h2>
          <button
            onClick={onClose}
            className="text-moas-gray-6 hover:text-moas-text transition-colors pr-4"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* 온라인/오프라인 선택 */}
            <div>
              <h3 className="text-base font-semibold text-moas-text mb-3">프로젝트 방식</h3>
              <div className="flex gap-3 w-fit">
                <button
                  onClick={() => handleLocationModeChange('offline')}
                  className={`px-4 py-1 rounded-lg text-base font-medium transition-all ${
                    locationMode === 'offline'
                      ? 'bg-moas-black text-moas-white '
                      : 'bg-moas-gray-1 text-moas-gray-7 border-2 border-transparent hover:border-moas-gray-3'
                  }`}
                >
                  오프라인
                </button>
                <button
                  onClick={() => handleLocationModeChange('online')}
                  className={`px-4 py-1 rounded-lg text-base font-medium transition-all ${
                    locationMode === 'online'
                      ? 'bg-moas-black text-moas-white'
                      : 'bg-moas-gray-1 text-moas-gray-7 border-2 border-transparent hover:border-moas-gray-3'
                  }`}
                >
                  온라인
                </button>
              </div>
            </div>

            {/* 오프라인 선택 시 시/도와 구/군 표시 */}
            {locationMode === 'offline' && (
              <div className="flex gap-6">
                {/* 시/도 (왼쪽) */}
                <div className="w-1/3">
                  <h3 className="text-base font-semibold text-moas-text mb-3">시/도</h3>
                  <div className="border border-moas-gray-3 rounded-lg h-[400px] overflow-y-auto">
                    <div className="p-3 space-y-2">
                      {PROVINCES.map((province) => (
                        <button
                          key={province.code}
                          onClick={() => setSelectedProvinceCode(province.code)}
                          className={`w-full px-4 py-3 rounded-lg text-sm font-medium text-left transition-all ${
                            selectedProvinceCode === province.code
                              ? 'bg-moas-main text-moas-text border-2 border-moas-main'
                              : 'bg-moas-gray-1 text-moas-gray-7 border-2 border-transparent hover:border-moas-gray-3'
                          }`}
                        >
                          {province.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 구/군 (오른쪽) */}
                <div className="w-2/3">
                  <h3 className="text-base font-semibold text-moas-text mb-3">구/군</h3>
                  {selectedProvinceCode ? (
                    <div className="border border-moas-gray-3 rounded-lg h-[400px] overflow-y-auto">
                      <div className="p-3 grid grid-cols-4 gap-2">
                        {/* "전체" 옵션 */}
                        <button
                          onClick={() =>
                            handleDistrictClick(makeAllDistrictCode(selectedProvinceCode))
                          }
                          className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                            isAllSelected(selectedProvinceCode)
                              ? 'bg-moas-main text-moas-text border-2 border-moas-main'
                              : 'bg-moas-gray-1 text-moas-gray-7 border-2 border-transparent hover:border-moas-gray-3'
                          }`}
                        >
                          {getProvinceName(selectedProvinceCode).slice(0, 2)} 전체
                        </button>

                        {/* 개별 구/군 목록 */}
                        {availableDistricts.map((district) => (
                          <button
                            key={district.code}
                            onClick={() => handleDistrictClick(district.code)}
                            className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                              isDistrictSelected(district.code)
                                ? 'bg-moas-main text-moas-text border-2 border-moas-main'
                                : 'bg-moas-gray-1 text-moas-gray-7 border-2 border-transparent hover:border-moas-gray-3'
                            }`}
                          >
                            {district.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="border border-moas-gray-3 rounded-lg h-[400px] flex items-center justify-center text-moas-gray-5">
                      시/도를 먼저 선택해주세요
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 온라인 선택 시 안내 메시지 */}
            {locationMode === 'online' && (
              <div className="flex items-center justify-center h-48 text-center">
                <div>
                  <p className="text-lg font-medium text-moas-text mb-2">온라인 프로젝트</p>
                  <p className="text-sm text-moas-gray-6">
                    온라인으로 진행되는 프로젝트를 검색합니다.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-moas-gray-3 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-lg border border-moas-gray-3 text-moas-gray-7 font-medium hover:bg-moas-gray-1 transition-colors"
          >
            취소
          </button>
          <button
            onClick={onApply}
            className="flex-1 px-4 py-3 rounded-lg bg-moas-main text-moas-text font-medium hover:opacity-90 transition-opacity"
          >
            적용하기
          </button>
        </div>
      </div>
    </div>
  );
}

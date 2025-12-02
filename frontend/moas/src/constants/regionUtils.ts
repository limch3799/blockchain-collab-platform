// src/utils/regionUtils.ts

import { DISTRICTS } from '@/constants/regions';

/**
 * 각 시/도의 모든 구/군 코드를 담고 있는 맵
 */
export const ALL_DISTRICTS_BY_PROVINCE: Record<string, string[]> = {
  '1100000000': DISTRICTS['1100000000'].map(d => d.code), // 서울
  '2600000000': DISTRICTS['2600000000'].map(d => d.code), // 부산
  '2700000000': DISTRICTS['2700000000'].map(d => d.code), // 대구
  '2800000000': DISTRICTS['2800000000'].map(d => d.code), // 인천
  '2900000000': DISTRICTS['2900000000'].map(d => d.code), // 광주
  '3000000000': DISTRICTS['3000000000'].map(d => d.code), // 대전
  '3100000000': DISTRICTS['3100000000'].map(d => d.code), // 울산
  '3600000000': DISTRICTS['3600000000'].map(d => d.code), // 세종
  '4100000000': DISTRICTS['4100000000'].map(d => d.code), // 경기
  '4300000000': DISTRICTS['4300000000'].map(d => d.code), // 충북
  '4400000000': DISTRICTS['4400000000'].map(d => d.code), // 충남
  '4600000000': DISTRICTS['4600000000'].map(d => d.code), // 전남
  '4700000000': DISTRICTS['4700000000'].map(d => d.code), // 경북
  '4800000000': DISTRICTS['4800000000'].map(d => d.code), // 경남
  '5000000000': DISTRICTS['5000000000'].map(d => d.code), // 제주
  '5100000000': DISTRICTS['5100000000'].map(d => d.code), // 강원
  '5200000000': DISTRICTS['5200000000'].map(d => d.code), // 전북
};

/**
 * "전체" 옵션인지 확인
 */
export const isAllDistrictCode = (districtCode: string): boolean => {
  return districtCode.endsWith('_ALL');
};

/**
 * 시/도 코드로부터 "전체" 옵션 코드 생성
 */
export const makeAllDistrictCode = (provinceCode: string): string => {
  return `${provinceCode}_ALL`;
};

/**
 * 특정 시/도의 모든 구/군이 선택되어 있는지 확인
 */
export const isAllDistrictsSelected = (
  provinceCode: string,
  selectedRegions: Array<{ provinceCode: string; districtCode: string }>
): boolean => {
  const allDistrictCodes = ALL_DISTRICTS_BY_PROVINCE[provinceCode] || [];
  const selectedDistrictCodes = selectedRegions
    .filter(r => r.provinceCode === provinceCode)
    .map(r => r.districtCode);
  
  return allDistrictCodes.every(code => selectedDistrictCodes.includes(code));
};
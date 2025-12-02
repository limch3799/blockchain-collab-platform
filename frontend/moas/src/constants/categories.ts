// src/constants/categories.ts

/**
 * 아티스트 포지션 카테고리
 * API positionId와 매핑되는 카테고리 목록
 */
export const CATEGORIES: Record<number, string> = {
  1: '음악/공연',
  2: '사진/영상/미디어',
  3: '디자인',
  4: '기타',
  
} as const;

export const POSITION_CATEGORIES: Record<number, string> = {
  // 음악 (category_id = 1)
  1: '댄서',
  2: '뮤지션',
  3: 'DJ',
  4: '가수',

  // 사진/영상/미디어 (category_id = 2)
  5: '포토그래퍼',
  6: '영상감독',
  7: '크리에이터',
  8: '배우',
  9: '모델',

  // 디자인 (category_id = 3)
  10: '디자이너',
  11: '그래피티 아티스트',
  12: '일러스트레이터',
  13: '그래픽 디자이너',
  14: '타투이스트',

  // 기타 (category_id = 4)
  15: '기타',
} as const;

/**
 * positionId로 카테고리명 조회
 */
export const getCategoryName = (positionId: number): string => {
  return POSITION_CATEGORIES[positionId] || '알 수 없음';
};

/**
 * 카테고리명으로 positionId 조회
 */
export const getPositionId = (categoryName: string): number | undefined => {
  const entry = Object.entries(POSITION_CATEGORIES).find(
    ([_, name]) => name === categoryName
  );
  return entry ? Number(entry[0]) : undefined;
};

/**
 * 모든 카테고리 목록 배열로 반환
 */
export const getCategoryList = () => {
  return Object.entries(POSITION_CATEGORIES).map(([id, name]) => ({
    id: Number(id),
    name,
  }));
};
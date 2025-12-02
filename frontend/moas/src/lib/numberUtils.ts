// 금액 포맷팅 (천 단위 콤마)
export const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('ko-KR').format(amount);
};

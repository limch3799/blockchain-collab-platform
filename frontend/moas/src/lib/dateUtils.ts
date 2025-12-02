// 날짜를 한국 형식(YYYY.MM.DD)으로 변환하는 함수
export function formatKoreanDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

// 날짜 + 시간 포맷팅
export const formatFullDateAndTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Calculate the difference in milliseconds
  const diffMs = today.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = today.getFullYear() - date.getFullYear();

  // Same day
  if (date.toDateString() === today.toDateString()) {
    return '오늘';
  }

  // Yesterday
  if (date.toDateString() === yesterday.toDateString()) {
    return '어제';
  }

  // 2-6 days ago
  if (diffDays >= 2 && diffDays < 7) {
    return `${diffDays}일 전`;
  }

  // 1 week ago (7-13 days)
  if (diffDays >= 7 && diffDays < 14) {
    return '일주일 전';
  }

  // 2 weeks ago (14-20 days)
  if (diffDays >= 14 && diffDays < 21) {
    return '2주 전';
  }

  // 3 weeks ago (21-29 days)
  if (diffDays >= 21 && diffDays < 30) {
    return '3주 전';
  }

  // 1 month ago (30-59 days)
  if (diffDays >= 30 && diffDays < 60) {
    return '한달 전';
  }

  // 2-11 months ago
  if (diffMonths >= 2 && diffMonths < 12) {
    return `${diffMonths}개월 전`;
  }

  // Same year but over a year's worth of days (edge case for dates in January when it's December)
  if (diffYears === 0) {
    return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
  }

  // 1 year ago
  if (diffYears === 1 && diffMonths < 18) {
    return '1년 전';
  }

  // Different year - show full date with year
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Helper function to convert Java LocalDateTime array to Date string
export const parseJavaLocalDateTime = (dateArray: number[] | string): string => {
  if (typeof dateArray === 'string') return dateArray;
  if (!Array.isArray(dateArray)) return new Date().toISOString();

  // dateArray format: [year, month, day, hour, minute, second, nanosecond]
  const [year, month, day, hour = 0, minute = 0, second = 0, nano = 0] = dateArray;
  const date = new Date(year, month - 1, day, hour, minute, second, Math.floor(nano / 1000000));
  return date.toISOString();
};

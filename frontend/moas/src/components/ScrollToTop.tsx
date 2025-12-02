// src/components/ScrollToTop.tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // 페이지 이동 시 or 새로고침 시 항상 맨 위로
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  // ✅ 새로고침 시 강제 실행
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return null;
}

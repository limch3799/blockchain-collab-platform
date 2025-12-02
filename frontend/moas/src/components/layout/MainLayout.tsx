// src/components/layout/MainLayout.tsx
import { Outlet } from 'react-router-dom';
import { ScrollToTop } from '../ScrollToTop';
import { Header } from './header/Header';
import { Footer } from './Footer';

export function MainLayout() {
  return (
    <>
      <ScrollToTop />
      <div className="flex min-h-screen flex-col">
        <Header />

        {/* 메인 콘텐츠 영역 */}
        <main className="flex-1">
          <div className="mx-auto py-8 w-[80%]">
            <Outlet /> {/* Router children 렌더링 */}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}

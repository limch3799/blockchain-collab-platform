import { Outlet } from 'react-router-dom';
import { ScrollToTop } from '../ScrollToTop';
import { Header } from './header/Header';

export default function ChatLayout() {
  return (
    <>
      <ScrollToTop />
      <div className="flex flex-col h-screen">
        <Header />

        {/* Chat content takes remaining height */}
        <main className="flex-1 overflow-hidden">
          <div className="mx-auto h-full w-[80%]">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
}

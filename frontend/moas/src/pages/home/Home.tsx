// src/pages/Home.tsx
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Lottie from 'react-lottie-player';
import blockchainAnimation from '@/assets/blockchain.json';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import menu_all from '@/assets/home/home_icon_all.png';
import menu_music from '@/assets/home/hom_icon_music.png';
import menu_camera from '@/assets/home/home_icon_camera.png';
import menu_design from '@/assets/home/home_icon_design.png';
import menu_etc from '@/assets/home/home_icon_etc.png';
import menu_ai2 from '@/assets/home/home_icon_ai2.png';
import homeBanner2 from '@/assets/home/home_banner_2.png';
import homeBanner3 from '@/assets/home/home_banner_3.png';
import { ProjectSlider } from './components/ProjectSlider';
import { PopularProjectSlider } from './components/PopularProjectSlider';
import { AIRecommendSlider } from './components/AIRecommendSlider';
import { useAuth } from '@/hooks/useAuth';

const Home = () => {
  const navigate = useNavigate();
  const { getUserInfoFromStorage } = useAuth();

  const totalSlides = 2; // 배너 2개
  const [currentSlide, setCurrentSlide] = useState(0);

  const userInfo = getUserInfoFromStorage();
  const userRole = userInfo?.role;
  const isLoggedIn = !!userInfo;
  const isArtist = userRole === 'ARTIST';

  const categories = [
    { name: '전체', tabIndex: 0, icon: menu_all, iconSize: 40 },
    { name: '음악/공연', tabIndex: 1, icon: menu_music, iconSize: 48 },
    { name: '사진/영상/미디어', tabIndex: 2, icon: menu_camera, iconSize: 44 },
    { name: '디자인', tabIndex: 3, icon: menu_design, iconSize: 48 },
    { name: '기타', tabIndex: 4, icon: menu_etc, iconSize: 42 },
    ...(userRole !== 'LEADER'
      ? [{ name: 'AI 추천', tabIndex: -1, icon: menu_ai2, iconSize: 48 }]
      : []),
  ];

  const handleCategoryClick = (tabIndex: number) => {
    if (tabIndex === -1) {
      if (!isLoggedIn) {
        alert('로그인 후 이용 가능합니다.');
        return;
      }
      navigate('/project-post', { state: { aiMode: true } });
      return;
    }
    navigate('/project-post', { state: { selectedTabIndex: tabIndex } });
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  useEffect(() => {
    const delay = currentSlide === 0 ? 7000 : 7000;
    const interval = setInterval(nextSlide, delay);
    return () => clearInterval(interval);
  }, [currentSlide]);

  const controls = useAnimation();
  const [_ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  useEffect(() => {
    if (inView) {
      controls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: 'easeOut' },
      });
    }
  }, [controls, inView]);

  return (
    <div className="Home">
      <div className="relative -mx-[calc((100vw-80vw)/2)] -mt-4 mb-8">
        <div className="relative overflow-hidden rounded-none">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{
              transform: `translateX(-${currentSlide * 100}%)`,
            }}
          >
            {/* 첫 번째 배너 */}
            <div
              className="min-w-full p-12 min-h-[360px] flex items-center justify-center"
              style={{
                backgroundColor: 'var(--color-moas-main)',
                fontFamily: 'PretendardStd-Medium, sans-serif',
              }}
            >
              <div className="w-full h-full flex items-center justify-center gap-12 text-white max-w-7xl mx-auto">
                <div className="flex-1 flex items-center justify-center">
                  <Lottie
                    loop
                    animationData={blockchainAnimation}
                    play
                    style={{
                      width: 280,
                      height: 280,
                      opacity: 0.7,
                    }}
                  />
                </div>
                <div className="flex-1 space-y-10">
                  <motion.h1
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{
                      duration: 0.8,
                      times: [0, 0.6, 1],
                      ease: 'easeOut',
                    }}
                    className="text-8xl font-bold"
                  >
                    MOAS
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="text-3xl font-medium text-[#704016]"
                  >
                    블록체인 기반 협업 매칭 플랫폼
                  </motion.p>
                </div>
              </div>
            </div>

            {/* 두 번째 배너 */}
            <div
              className="min-w-full p-12 min-h-[360px] flex items-center justify-center relative overflow-hidden"
              style={{
                backgroundColor: 'var(--color-moas-banner2-1)',
                fontFamily: 'PretendardStd-Medium, sans-serif',
              }}
            >
              <div className="w-full h-full flex items-center justify-between max-w-7xl mx-auto relative">
                {/* 왼쪽 이미지 */}
                <div className="flex-1 flex items-center justify-center">
                  <img
                    src={homeBanner2}
                    alt="Blockchain illustration"
                    className="w-[280px] h-[280px] object-contain -ml-24"
                  />
                </div>

                {/* 텍스트 영역 */}
                <div className="flex-[1.5] space-y-6 relative z-10 -ml-24">
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-6xl font-bold text-white mb-8"
                  >
                    1초만에 시작하는 블록체인
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="text-2xl font-semibold"
                    style={{ color: 'var(--color-moas-banner2-2)' }}
                  >
                    복잡한 가입절차없이 소셜로그인으로 지갑까지 한번에!
                  </motion.p>
                </div>

                {/* 오른쪽 상단 작은 이미지 */}
                <img
                  src={homeBanner3}
                  alt="Decoration"
                  className="absolute bottom-48 right-0 w-[180px] h-[180px] object-contain opacity-80"
                />
              </div>
            </div>
          </div>

          <div className="absolute bottom-3 right-3 font-pretendard">
            <div className="flex items-center gap-0 px-1.5 py-0.5 rounded-lg bg-gray-800/20">
              <button
                onClick={prevSlide}
                className="w-4 h-4 rounded-full flex items-center justify-center transition-all hover:bg-gray-700/30"
                aria-label="이전 슬라이드"
              >
                <ChevronLeft className="w-3 h-3 text-gray-500" />
              </button>
              <div className="px-2">
                <span className="inline-block text-xs font-medium text-gray-700 text-center min-w-[15px]">
                  {currentSlide + 1} / {totalSlides}
                </span>
              </div>
              <button
                onClick={nextSlide}
                className="w-4 h-4 rounded-full flex items-center justify-center transition-all hover:bg-gray-700/30"
                aria-label="다음 슬라이드"
              >
                <ChevronRight className="w-3 h-3 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex justify-center gap-8 mt-12">
          {categories.map((category, i) => (
            <button
              key={i}
              onClick={() => handleCategoryClick(category.tabIndex)}
              className="flex flex-col items-center gap-3 cursor-pointer group"
            >
              <div
                className="w-18 h-18 rounded-3xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                style={{ backgroundColor: '#f5f5f5' }}
              >
                <img
                  src={category.icon}
                  alt={category.name}
                  style={{
                    width: `${category.iconSize}px`,
                    height: `${category.iconSize}px`,
                  }}
                  className="object-contain transition-all duration-300 group-hover:scale-110"
                />
              </div>
              <span className="text-moas-gray-9 text-sm font-pretendard font-medium transition-all duration-300 group-hover:scale-110">
                {category.name}
              </span>
            </button>
          ))}
        </div>

        {isArtist && (
          <div className="mt-32 mb-24">
            <AIRecommendSlider />
          </div>
        )}

        <div className="mt-32 mb-24">
          <PopularProjectSlider />
        </div>

        <div className="mt-32 mb-24">
          <ProjectSlider />
        </div>
      </div>
    </div>
  );
};

export default Home;

// src/pages/Home/components/AIRecommendSlider.tsx
import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getProjectById } from '@/api/project';
import { getProjects } from '@/api/project';
import { getRecentApplicationProjectIds } from '@/api/apply';
import { ProjectCardSkeleton } from '@/pages/project-post/components/ProjectCardSkeleton';
import type { SimilarProjectItem } from '@/types/project';
import { HomeProjectCard } from './HomeProjectCard';

export function AIRecommendSlider() {
  const [projects, setProjects] = useState<SimilarProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = 4;

  // src/pages/Home/components/AIRecommendSlider.tsx (수정 부분만)

  useEffect(() => {
    const loadAIRecommendations = async () => {
      try {
        setIsLoading(true);

        // 1. 최근 지원 프로젝트 ID 가져오기 (최대 3개)
        let seedProjectIds = await getRecentApplicationProjectIds();

        // 2. 부족하면 북마크 프로젝트로 채우기
        if (seedProjectIds.length < 3) {
          const bookmarkResponse = await getProjects({
            bookmarked: true,
            page: 1,
            size: 3 - seedProjectIds.length,
            sort: 'created',
          });
          const bookmarkIds = bookmarkResponse.items.map((item) => item.id);
          seedProjectIds = [...seedProjectIds, ...bookmarkIds];
        }

        // 3. 프로젝트 ID가 하나도 없으면 종료
        if (seedProjectIds.length === 0) {
          setProjects([]);
          setIsLoading(false);
          return;
        }

        // 4. 각 프로젝트의 유사 프로젝트 가져오기 (20개 제한)
        const seenIds = new Set<number>(seedProjectIds);
        const uniqueProjects: SimilarProjectItem[] = [];
        const MAX_PROJECTS = 20;

        for (const id of seedProjectIds) {
          if (uniqueProjects.length >= MAX_PROJECTS) break;

          try {
            const detail = await getProjectById(id);

            for (const project of detail.similar) {
              if (uniqueProjects.length >= MAX_PROJECTS) break;

              if (!seenIds.has(project.projectId)) {
                seenIds.add(project.projectId);
                uniqueProjects.push(project);
              }
            }
          } catch (error) {
            console.error(`프로젝트 ${id} 조회 실패:`, error);
          }
        }

        setProjects(uniqueProjects);
      } catch (error) {
        console.error('AI 추천 프로젝트 로드 실패:', error);
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAIRecommendations();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      {
        threshold: 0.2,
      },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // 프로젝트가 없으면 렌더링 안 함
  if (!isLoading && projects.length === 0) {
    return null;
  }

  const totalPages = Math.ceil(projects.length / itemsPerPage);
  const currentProjects = projects.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage,
  );

  const handlePrev = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
  };

  return (
    <div
      ref={sectionRef}
      className={`mt-16 transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-32'
      }`}
    >
      <div className="flex items-center justify-between mb-0">
        <h2 className="text-2xl font-medium text-moas-text font-pretendard">
          회원님을 위한 맞춤 프로젝트
        </h2>
        {!isLoading && projects.length > itemsPerPage && (
          <div className="flex items-center gap-1 mt-3">
            <button
              onClick={handlePrev}
              className="w-10 h-6 rounded-md bg-moas-gray-2 flex items-center justify-center hover:bg-moas-gray-3 transition-colors"
              aria-label="이전"
            >
              <ChevronLeft className="w-5 h-5 text-moas-gray-7" />
            </button>
            <button
              onClick={handleNext}
              className="w-10 h-6 rounded-md bg-moas-gray-2 flex items-center justify-center hover:bg-moas-gray-3 transition-colors"
              aria-label="다음"
            >
              <ChevronRight className="w-5 h-5 text-moas-gray-7" />
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
          {[...Array(4)].map((_, idx) => (
            <ProjectCardSkeleton key={idx} />
          ))}
        </div>
      ) : (
        <div className="relative overflow-visible pt-4">
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-500 ease-in-out"
            key={currentPage}
            style={{
              animation: 'fadeIn 0.5s ease-in-out',
            }}
          >
            {currentProjects.map((project) => (
              <div key={project.projectId} className="w-full">
                <HomeProjectCard project={project} />
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

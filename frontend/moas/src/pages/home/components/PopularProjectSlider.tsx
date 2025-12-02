// src/pages/Home/components/PopularProjectSlider.tsx
import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getProjects } from '@/api/project';
import { ProjectCardSkeleton } from '@/pages/project-post/components/ProjectCardSkeleton';
import type { SimilarProjectItem } from '@/types/project';
import { HomeProjectCard } from './HomeProjectCard';

export function PopularProjectSlider() {
  const [projects, setProjects] = useState<SimilarProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = 4;

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setIsLoading(true);

        const [response] = await Promise.all([
          getProjects({
            page: 1,
            size: 20,
            sort: 'views',
          }),
          new Promise((resolve) => setTimeout(resolve, 1000)),
        ]);

        const transformedProjects: SimilarProjectItem[] = response.items.map((item) => ({
          projectId: item.id,
          title: item.title,
          thumbnailUrl: item.thumbnailUrl,
          categoryName: item.positions[0]?.categoryName || '기타',
          locationText: item.isOnline ? 'online' : item.district || item.province || 'offline',
          leaderNickname: item.leaderNickname,
          leaderProfileImageUrl: item.leaderProfileImageUrl,
          totalBudget: item.totalBudget,
          startAt: new Date(item.startAt * 1000).toISOString(),
          endAt: new Date(item.endAt * 1000).toISOString(),
          positions: item.positions.map((pos) => ({
            categoryName: pos.categoryName,
            positionName: pos.positionName,
            budget: pos.budget,
          })),
        }));

        setProjects(transformedProjects);
      } catch (error) {
        console.error('인기 프로젝트 목록 조회 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
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
          인기 프로젝트 TOP 20
        </h2>
        <div className="flex items-center gap-1 mt-3">
          <button
            onClick={handlePrev}
            disabled={isLoading}
            className="w-10 h-6 rounded-md bg-moas-gray-2 flex items-center justify-center hover:bg-moas-gray-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="이전"
          >
            <ChevronLeft className="w-5 h-5 text-moas-gray-7" />
          </button>
          <button
            onClick={handleNext}
            disabled={isLoading}
            className="w-10 h-6 rounded-md bg-moas-gray-2 flex items-center justify-center hover:bg-moas-gray-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="다음"
          >
            <ChevronRight className="w-5 h-5 text-moas-gray-7" />
          </button>
        </div>
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

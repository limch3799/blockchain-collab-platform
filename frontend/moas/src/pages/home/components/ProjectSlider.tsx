// src/pages/Home/components/ProjectSlider.tsx
import { useState, useEffect, useRef } from 'react';
import { getProjects } from '@/api/project';
import { ProjectCardSkeleton } from '@/pages/project-post/components/ProjectCardSkeleton';
import type { SimilarProjectItem } from '@/types/project';
import { HomeProjectCard } from './HomeProjectCard';

export function ProjectSlider() {
  const [projects, setProjects] = useState<SimilarProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [startScroll, setStartScroll] = useState(false);
  const [duplicatedProjects, setDuplicatedProjects] = useState<SimilarProjectItem[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setIsLoading(true);

        const [response] = await Promise.all([
          getProjects({
            page: 1,
            size: 16,
            sort: 'created',
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
        setDuplicatedProjects([...transformedProjects, ...transformedProjects]);
      } catch (error) {
        console.error('프로젝트 목록 조회 실패:', error);
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
            setTimeout(() => {
              setStartScroll(true);
            }, 1000);
          }
        });
      },
      {
        threshold: 0.1,
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

  const cardWidth = 280;
  const gap = 24;
  const totalWidth = (cardWidth + gap) * projects.length;
  const animationDuration = totalWidth / 25;

  return (
    <div
      ref={sectionRef}
      className={`mt-16 transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-32'
      }`}
    >
      <div className="flex items-center justify-between mb-0">
        <h2 className="text-2xl font-medium text-moas-text font-pretendard">
          방금 올라온 프로젝트
        </h2>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
          {[...Array(4)].map((_, idx) => (
            <ProjectCardSkeleton key={idx} />
          ))}
        </div>
      ) : (
        <div className="relative overflow-hidden w-full pt-4">
          <style>
            {`
              @keyframes scroll-left {
                0% {
                  transform: translateX(0);
                }
                100% {
                  transform: translateX(-${totalWidth}px);
                }
              }
              
              .animate-scroll {
                animation: scroll-left ${animationDuration}s linear infinite;
              }
              
              .animate-scroll:hover {
                animation-play-state: paused;
              }
            `}
          </style>
          <div
            className={`flex gap-6 ${startScroll ? 'animate-scroll' : ''}`}
            style={{
              width: 'fit-content',
            }}
          >
            {duplicatedProjects.map((project, index) => (
              <div key={`${project.projectId}-${index}`} style={{ width: '280px', flexShrink: 0 }}>
                <HomeProjectCard project={project} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

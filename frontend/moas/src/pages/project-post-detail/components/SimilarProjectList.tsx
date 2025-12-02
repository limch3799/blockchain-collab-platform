// src/pages/project-post-detail/components/SimilarProjectList.tsx
import { useEffect, useRef, useState } from 'react';
import type { SimilarProjectItem } from '@/types/project';
import { SimilarProjectCard } from './SimilarProjectCard';
import { ProjectCardSkeleton } from '../../project-post/components/ProjectCardSkeleton';

interface SimilarProjectListProps {
  projects: SimilarProjectItem[];
  isLoading?: boolean;
  showViewAll?: boolean;
  onViewAllClick?: () => void;
  isViewAllMode?: boolean;
}

export function SimilarProjectList({
  projects,
  isLoading,
  isViewAllMode = false,
}: SimilarProjectListProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [duplicatedProjects, setDuplicatedProjects] = useState<SimilarProjectItem[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [startScroll, setStartScroll] = useState(false);

  useEffect(() => {
    if (projects.length > 4 && !isViewAllMode) {
      setDuplicatedProjects([...projects, ...projects]);
    } else {
      setDuplicatedProjects(projects);
    }
  }, [projects, isViewAllMode]);

  useEffect(() => {
    if (isViewAllMode) {
      setIsVisible(true);
      return;
    }

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
  }, [isViewAllMode]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, idx) => (
          <ProjectCardSkeleton key={idx} />
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="py-20 text-center font-pretendard">
        <p className="text-moas-gray-6">유사한 프로젝트가 없습니다.</p>
      </div>
    );
  }

  // 전체보기 모드일 때는 그리드로 표시
  if (isViewAllMode) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {projects.map((project) => (
          <div key={project.projectId} className="flex justify-center">
            <SimilarProjectCard project={project} />
          </div>
        ))}
      </div>
    );
  }

  // 4개 이하일 때는 그리드로 표시
  if (projects.length <= 4) {
    return (
      <div
        ref={sectionRef}
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 transition-all duration-1000 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
        }`}
      >
        {projects.map((project) => (
          <div key={project.projectId} className="flex justify-center">
            <SimilarProjectCard project={project} />
          </div>
        ))}
      </div>
    );
  }

  // 애니메이션 지속 시간 계산
  const cardWidth = 280;
  const gap = 24;
  const totalWidth = (cardWidth + gap) * projects.length;
  const animationDuration = totalWidth / 25;

  // 4개 초과일 때는 무한 슬라이드
  return (
    <div
      ref={sectionRef}
      className={`relative overflow-hidden w-full transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
      }`}
    >
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
          <SimilarProjectCard key={`${project.projectId}-${index}`} project={project} />
        ))}
      </div>
    </div>
  );
}

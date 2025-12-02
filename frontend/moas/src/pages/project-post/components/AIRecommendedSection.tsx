// src/pages/project-post/components/AIRecommendedSection.tsx
import { useState, useEffect } from 'react';
import { getProjectById } from '@/api/project';
import { getProjects } from '@/api/project';
import { getRecentApplicationProjectIds } from '@/api/apply';
import { ProjectCardSkeleton } from './ProjectCardSkeleton';
import type { SimilarProjectItem } from '@/types/project';
import { AISectionCard } from './AISectionCard';
import { Pagination } from '@/pages/leader-project-list/components/Pagination';

const STORAGE_KEY = 'aiRecommendedProjects';
const ITEMS_PER_PAGE = 16;

export function AIRecommendedSection() {
  const [projects, setProjects] = useState<SimilarProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadAIRecommendations();
  }, []);

  const loadAIRecommendations = async () => {
    try {
      setIsLoading(true);

      // 로컬스토리지 확인
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const cachedData = JSON.parse(cached);
        setProjects(cachedData);
        setIsLoading(false);
        return;
      }

      // 새로 가져오기
      let seedProjectIds = await getRecentApplicationProjectIds();

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

      if (seedProjectIds.length === 0) {
        setProjects([]);
        setIsLoading(false);
        return;
      }

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

      // 로컬스토리지에 저장
      localStorage.setItem(STORAGE_KEY, JSON.stringify(uniqueProjects));
      setProjects(uniqueProjects);
    } catch (error) {
      console.error('AI 추천 프로젝트 로드 실패:', error);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.ceil(projects.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProjects = projects.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (projects.length === 0 && !isLoading) {
    return (
      <div className="py-20 text-center font-pretendard">
        <h3 className="text-xl font-medium text-moas-gray-7 mb-2">AI 추천 프로젝트가 없습니다.</h3>
        <p className="text-moas-gray-6">프로젝트에 지원하거나 북마크를 추가해보세요.</p>
      </div>
    );
  }

  return (
    <div className="mb-24 mt-16">
      <h2 className="text-2xl font-semibold text-moas-text mb-6 font-pretendard">
        AI 추천 프로젝트
      </h2>
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, idx) => (
            <ProjectCardSkeleton key={idx} />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {currentProjects.map((project) => (
              <AISectionCard key={project.projectId} project={project} />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
}

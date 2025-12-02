// src/pages/project-apply/ProjectApplyPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { ProjectInfo } from './components/ProjectInfo';
import { PortfolioSelection } from './components/PortfolioSelection';
import { MessageInput } from './components/MessageInput';
import { ApplyConfirmModal } from './components/ApplyConfirmModal';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { getMyPortfolios, getMyPortfolioByPosition } from '@/api/portfolio';
import type { MyPortfolioItem } from '@/types/portfolio';
import { applyToProject } from '@/api/apply';

interface LocationState {
  projectId: number;
  projectTitle: string;
  position: string;
  positionId: number;
  projectPositionId: number;
  budget: number;
}

export function ProjectApplyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | undefined;

  const [selectedPortfolio, setSelectedPortfolio] = useState<MyPortfolioItem | null>(null);
  const [allPortfolios, setAllPortfolios] = useState<MyPortfolioItem[]>([]);
  const [message, setMessage] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPositionPortfolio, setHasPositionPortfolio] = useState(true);

  useEffect(() => {
    console.log('ProjectApplyPage state:', state);

    if (!state || !state.projectId || !state.projectPositionId) {
      console.error('Missing required data:', state);
      alert('프로젝트 정보가 올바르지 않습니다.');
      navigate('/project-post');
      return;
    }

    const fetchPortfolios = async () => {
      try {
        setIsLoading(true);

        const allPortfoliosResponse = await getMyPortfolios();
        setAllPortfolios(allPortfoliosResponse.data);

        if (state.positionId) {
          try {
            const positionPortfolio = await getMyPortfolioByPosition(state.positionId);
            console.log('Position portfolio found:', positionPortfolio);

            setSelectedPortfolio(positionPortfolio);
            setHasPositionPortfolio(true);
          } catch (error) {
            console.log('No portfolio found for this position:', error);

            setHasPositionPortfolio(false);
            if (allPortfoliosResponse.data.length > 0) {
              setSelectedPortfolio(allPortfoliosResponse.data[0]);
            }
          }
        } else {
          if (allPortfoliosResponse.data.length > 0) {
            setSelectedPortfolio(allPortfoliosResponse.data[0]);
          }
        }
      } catch (error) {
        console.error('포트폴리오 조회 실패:', error);
        setHasPositionPortfolio(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolios();
  }, [state, navigate]);

  const handleApplyConfirm = async () => {
    if (!selectedPortfolio || !state) {
      alert('지원 정보가 올바르지 않습니다.');
      return;
    }

    if (!state.projectPositionId) {
      alert('포지션 정보가 올바르지 않습니다.');
      return;
    }

    try {
      console.log('Applying to project with:', {
        projectId: state.projectId,
        projectPositionId: state.projectPositionId,
        portfolioId: selectedPortfolio.portfolioId,
        message,
      });

      await applyToProject(state.projectId, {
        projectPositionId: state.projectPositionId,
        portfolioId: selectedPortfolio.portfolioId,
        message,
      });

      setIsConfirmModalOpen(false);
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error('프로젝트 지원 실패:', error);
      alert('프로젝트 지원에 실패했습니다.');
    }
  };

  const handleSuccessConfirm = () => {
    setIsSuccessModalOpen(false);
    navigate('/artist-project-list');
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (!state) {
    return null;
  }

  return (
    <>
      <div className="w-full min-h-screen font-pretendard">
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
          <PageHeader
            title="프로젝트 지원"
            description="프로젝트 정보를 확인하고 포트폴리오를 선택해주세요"
          />

          <div className="space-y-6">
            <ProjectInfo
              project={{
                name: state.projectTitle,
                description: `${state.position} 포지션으로 지원합니다.`,
                price: state.budget,
                isOnline: true,
                location: '',
                recruitFields: state.position,
                selectedField: state.position,
              }}
            />

            <PortfolioSelection
              selectedPortfolio={selectedPortfolio}
              onPortfolioChange={setSelectedPortfolio}
              allPortfolios={allPortfolios}
              isLoading={isLoading}
              hasPositionPortfolio={hasPositionPortfolio}
            />

            <MessageInput message={message} onMessageChange={setMessage} />
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleCancel}
              className="flex-1 px-6 py-3 border-2 border-moas-gray-3 text-moas-gray-6 rounded-lg hover:bg-moas-gray-2 transition-colors font-semibold"
            >
              취소
            </button>

            <button
              onClick={() => setIsConfirmModalOpen(true)}
              disabled={!selectedPortfolio}
              className="flex-1 px-6 py-3 bg-moas-main rounded-lg hover:bg-moas-main/90 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              지원하기
            </button>
          </div>
        </div>
      </div>

      <ApplyConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleApplyConfirm}
      />

      {isSuccessModalOpen && (
        <ConfirmModal
          message="프로젝트 지원이 완료되었습니다."
          confirmText="확인"
          onConfirm={handleSuccessConfirm}
          type="info"
        />
      )}
    </>
  );
}

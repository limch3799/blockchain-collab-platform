// src/pages/portfolio/portfolio-detail/PortfolioDetailModal.tsx
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { PortfolioDetailHeader } from './components/PortfolioDetailHeader';
import { PortfolioDetailInfo } from './components/PortfolioDetailInfo';
import { PortfolioDetailImages } from './components/PortfolioDetailImages';
import { getPortfolioById, deletePortfolio } from '@/api/portfolio';
import type { PortfolioDetail } from '@/types/portfolio';
import DefaultProfileImage1 from '@/assets/header/default_profile/default_profile_1.png';

interface PortfolioDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolioId: number;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  isReadOnly?: boolean;
  artistName?: string; // 아티스트 이름 (읽기 전용 모드에서 사용)
}

export function PortfolioDetailModal({
  isOpen,
  onClose,
  portfolioId,
  onEdit,
  onDelete,
  isReadOnly = false,
  artistName,
}: PortfolioDetailModalProps) {
  const [portfolio, setPortfolio] = useState<PortfolioDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && portfolioId) {
      loadPortfolio();
    }
  }, [isOpen, portfolioId]);

  const loadPortfolio = async () => {
    try {
      setIsLoading(true);
      const data = await getPortfolioById(portfolioId);
      setPortfolio(data);
    } catch (error) {
      console.error('포트폴리오 조회 실패:', error);
      alert('포트폴리오를 불러오는데 실패했습니다.');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const getProfileInfo = () => {
    if (portfolio?.nickname && portfolio?.profileImageUrl) {
      return {
        profileImage: portfolio.profileImageUrl,
        userName: portfolio.nickname,
      };
    }

    // 1. localStorage에서 문자열을 가져옵니다.
    const userInfoString = localStorage.getItem('userInfo');

    // 2. 문자열을 JSON 객체로 파싱(변환)합니다.
    const userInfo = userInfoString ? JSON.parse(userInfoString) : {};

    // 3. 이제 객체의 속성(property)에 접근할 수 있습니다.
    const storedNickname = userInfo.nickname || '사용자';
    const storedProfileImage = userInfo.profileImageUrl || DefaultProfileImage1;

    return {
      profileImage: storedProfileImage,
      userName: storedNickname,
    };
  };

  const handleEdit = () => {
    onEdit?.(portfolioId);
    onClose();
  };

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      await deletePortfolio(portfolioId);
      alert('삭제되었습니다.');
      onDelete?.(portfolioId);
      onClose();
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  if (!isOpen) return null;
  if (isLoading || !portfolio) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-2xl p-8">
          <p className="text-moas-text">로딩 중...</p>
        </div>
      </div>
    );
  }

  const { profileImage, userName } = getProfileInfo();
  const imageUrls = portfolio.images
    .sort((a, b) => a.imageOrder - b.imageOrder)
    .map((img) => img.originalImageUrl || img.imageUrl);

  // 읽기 전용 모드일 때는 전달받은 artistName 사용, 아니면 localStorage의 userName 사용
  const displayName = isReadOnly && artistName ? artistName : userName;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 font-pretendard">
      <div className="bg-white rounded-2xl w-[90vw] max-w-6xl max-h-[90vh] flex flex-col shadow-xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-moas-gray-3">
          {!isReadOnly && (
            <PortfolioDetailHeader
              profileImage={profileImage}
              userName={userName}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
          {isReadOnly && (
            <div className="flex items-center gap-3">
              <img
                src={profileImage}
                alt={displayName}
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="text-lg font-semibold text-moas-text">
                {displayName}님의 포트폴리오
              </span>
            </div>
          )}
          <button
            onClick={onClose}
            className="text-moas-gray-6 hover:text-moas-text transition-colors ml-4"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 스크롤 가능한 본문 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* 왼쪽: Info (1/3) */}
            <div className="lg:w-1/3">
              <PortfolioDetailInfo
                category={portfolio.positionName}
                title={portfolio.title}
                content={portfolio.description}
                createdAt={portfolio.createdAt}
                files={portfolio.files}
              />
            </div>

            {/* 오른쪽: Images (2/3) */}
            <div className="lg:w-2/3">
              <PortfolioDetailImages images={imageUrls} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

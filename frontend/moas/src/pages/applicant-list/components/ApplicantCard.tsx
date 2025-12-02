/**
 * ApplicantCard Component
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { PortfolioDetailModal } from '@/pages/portfolio/portfolio-detail/PortfolioDetailModal';
import { ReviewModal } from './ReviewModal';
import { rejectApplication, getApplicationDetail } from '@/api/apply';
import { getProjectById } from '@/api/project';
import chatIcon from '@/assets/icons/chat.svg';
import documentIcon from '@/assets/icons/document.svg';

interface Applicant {
  id: number;
  name: string;
  profileImage: string;
  rating: number;
  reviewCount: number;
  appliedDate: string;
  status: 'pending' | 'waiting' | 'rejected' | 'contracted';
  statusLabel: string;
  introduction: string;
  unreadMessageCount?: number;
  contractStatus?: string;
  contractId?: number;
  userId?: number;
  totalAmount?: number;
}

interface ApplicantCardProps {
  applicant: Applicant;
  position?: {
    id: number;
    category: string;
    position: string;
  };
  projectId: number;
  projectTitle: string;
}

const STATUS_STYLES = {
  pending: {
    badgeLabel: '미결정',
    badgeClass: 'bg-[#F5F5F5] text-[#666666] border-[#CCCCCC] font-semibold',
  },
  waiting: {
    badgeLabel: '협의중',
    badgeClass: 'bg-[#0091FF] text-white border-[#0091FF] font-semibold',
  },
  rejected: {
    badgeLabel: '거절',
    badgeClass: 'bg-[#FF4D4F] text-white border-[#FF4D4F] font-semibold',
  },
  contracted: {
    badgeLabel: '계약완료',
    badgeClass: 'bg-[#52C41A] text-white border-[#52C41A] font-semibold',
  },
};

export function ApplicantCard({
  applicant,
  position,
  projectId,
  projectTitle,
}: ApplicantCardProps) {
  const navigate = useNavigate();
  const statusStyle = STATUS_STYLES[applicant.status];
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showRejectSuccessModal, setShowRejectSuccessModal] = useState(false);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<number | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const handleProfileClick = () => {
    navigate(`/profile/${applicant.userId}`);
  };

  const handleRejectClick = () => {
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    try {
      console.log('지원 거절:', applicant.id);
      await rejectApplication(applicant.id);
      setShowRejectModal(false);
      setShowRejectSuccessModal(true);
    } catch (error: any) {
      console.error('지원 거절 실패:', error);
      alert(error.response?.data?.message || '지원 거절에 실패했습니다.');
      setShowRejectModal(false);
    }
  };

  const handleRejectSuccessConfirm = () => {
    setShowRejectSuccessModal(false);
    // 페이지 새로고침
    window.location.reload();
  };

  const handleRejectCancel = () => {
    setShowRejectModal(false);
  };

  const handleViewContract = async () => {
    if (applicant.contractId) {
      try {
        // 프로젝트 상세 정보 조회
        const projectDetail = await getProjectById(projectId);

        navigate(`/contract/${applicant.contractId}`, {
          state: {
            position,
            projectThumbnailUrl: projectDetail.thumbnailUrl,
            projectTitle: projectDetail.title,
          },
        });
      } catch (error) {
        console.error('프로젝트 정보 조회 실패:', error);
        // 실패해도 기본 정보로 이동
        navigate(`/contract/${applicant.contractId}`, {
          state: { position },
        });
      }
      return;
    }
    alert('계약서 정보를 찾을 수 없습니다.');
  };

  const handleContractOffer = () => {
    navigate('/contract-draft', {
      state: {
        applicationId: applicant.id,
        projectPositionId: position?.id,
      },
    });
  };

  const handleModifyContract = () => {
    if (applicant.contractId) {
      navigate(`/contract/${applicant.contractId}`, {
        state: { position },
      });
    }
  };

  const handlePortfolioClick = async () => {
    try {
      const data = await getApplicationDetail(applicant.id);
      if (data.portfolio) {
        setSelectedPortfolioId(data.portfolio.portfolioId);
      } else {
        alert('등록된 포트폴리오가 없습니다.');
      }
    } catch (error) {
      console.error('포트폴리오 조회 실패:', error);
      alert('포트폴리오를 불러오는데 실패했습니다.');
    }
  };

  const handleClosePortfolio = () => {
    setSelectedPortfolioId(null);
  };

  const handleChatClick = () => {
    navigate('/chat', {
      state: {
        projectId,
        otherMemberId: applicant.userId,
        projectTitle,
        otherMemberName: applicant.name,
        otherMemberProfileUrl: applicant.profileImage,
      },
    });
  };

  const renderStatusButtons = () => {
    switch (applicant.status) {
      case 'pending':
        return (
          <>
            <button
              onClick={handleRejectClick}
              className="h-10 rounded-lg border-2 border-moas-gray-2 bg-white px-6 text-[14px] font-bold text-moas-text transition-colors hover:bg-moas-gray-1"
            >
              지원 거절
            </button>
            <button
              onClick={handleContractOffer}
              className="h-10 rounded-lg bg-moas-main px-6 text-[14px] font-bold text-moas-text transition-opacity hover:opacity-90"
            >
              계약서 작성
            </button>
          </>
        );
      case 'waiting':
        switch (applicant.contractStatus) {
          case 'PENDING':
            return (
              <button
                onClick={handleViewContract}
                className="h-10 rounded-lg bg-moas-main px-6 text-[14px] font-bold text-moas-text transition-opacity hover:opacity-90"
              >
                계약서 보기
              </button>
            );
          case 'DECLINED':
            return (
              <>
                <button
                  onClick={handleModifyContract}
                  className="h-10 rounded-lg bg-moas-main px-6 text-[14px] font-bold text-moas-text transition-opacity hover:opacity-90"
                >
                  계약서 보기
                </button>
              </>
            );
          case 'WITHDRAWN':
            return (
              <button
                disabled
                className="h-10 rounded-lg bg-moas-gray-1 px-6 text-[14px] font-bold text-moas-gray-8 cursor-not-allowed"
              >
                거절 완료
              </button>
            );
          case 'ARTIST_SIGNED':
            return (
              <button
                onClick={handleViewContract}
                className="h-10 rounded-lg bg-moas-main px-6 text-[14px] font-bold text-moas-text transition-opacity hover:opacity-90"
              >
                계약서 보기
              </button>
            );
          case 'PAYMENT_PENDING':
            return (
              <button
                onClick={handleViewContract}
                className="h-10 rounded-lg bg-moas-main px-6 text-[14px] font-bold text-moas-text transition-opacity hover:opacity-90"
              >
                계약서 보기
              </button>
            );
          default:
            return (
              <button
                onClick={handleViewContract}
                className="h-10 rounded-lg bg-moas-main px-6 text-[14px] font-bold text-moas-text transition-opacity hover:opacity-90"
              >
                계약서 보기
              </button>
            );
        }
      case 'rejected':
        return (
          <button className="h-10 rounded-lg bg-moas-gray-1 px-6 text-[14px] font-bold text-moas-gray-8 transition-color">
            거절됨
          </button>
        );
      case 'contracted':
        return (
          <button
            onClick={handleViewContract}
            className="h-10 rounded-lg bg-moas-main px-6 text-[14px] font-bold text-moas-text transition-opacity hover:opacity-90"
          >
            계약서 보기
          </button>
        );
    }
  };

  return (
    <div className="rounded-xl bg-white px-6 py-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-4" onClick={handleProfileClick}>
          <img
            src={applicant.profileImage}
            alt={applicant.name}
            className="h-12 w-12 rounded-full object-cover"
          />

          <div>
            <div className="flex flex-nowrap items-center gap-2">
              <h4 className="text-[18px] font-bold text-moas-text">{applicant.name}</h4>

              {applicant.status === 'waiting' && applicant.contractStatus && (
                <>
                  {applicant.contractStatus === 'PENDING' && (
                    <>
                      <div className="h-2 w-2 rounded-full bg-[#FFA940] animate-pulse"></div>
                      <span className="text-[13px] font-medium text-[#FFA940]">
                        아티스트 응답 대기중
                      </span>
                    </>
                  )}
                  {applicant.contractStatus === 'DECLINED' && (
                    <>
                      <div className="h-2 w-2 rounded-full bg-[#FF4D4F]"></div>
                      <span className="text-[13px] font-medium text-[#FF4D4F]">
                        아티스트가 제안을 거절함
                      </span>
                    </>
                  )}
                  {applicant.contractStatus === 'ARTIST_SIGNED' && (
                    <>
                      <div className="h-2 w-2 rounded-full bg-[#52C41A]"></div>
                      <span className="text-[13px] font-medium text-[#52C41A]">
                        아티스트 계약 수락
                      </span>
                    </>
                  )}
                  {applicant.contractStatus === 'PAYMENT_PENDING' && (
                    <>
                      <div className="h-2 w-2 rounded-full bg-moas-state-3"></div>
                      <span className="text-[13px] font-medium text-moas-state-3">
                        예산 결제 대기중
                      </span>
                    </>
                  )}
                </>
              )}
            </div>
            <div className="flex flex-nowrap items-center gap-2 text-[14px] text-moas-gray-6">
              <span>⭐ {applicant.rating}</span>
              <span className="text-moas-gray-4">|</span>
              <button
                onClick={() => setShowReviewModal(true)}
                className="hover:underline hover:text-moas-main transition-colors cursor-pointer"
              >
                리뷰 {applicant.reviewCount}개
              </button>
              <span className="text-moas-gray-4">|</span>
              <span>{applicant.appliedDate} 지원</span>
              <span className="text-moas-gray-4">|</span>
              <Badge
                className={`shrink-0 ${
                  applicant.contractStatus === 'WITHDRAWN'
                    ? 'bg-[#FF4D4F] text-white border-[#FF4D4F] font-semibold'
                    : statusStyle.badgeClass
                } text-[11px] px-2 py-0.5`}
              >
                {applicant.contractStatus === 'WITHDRAWN' ? '거절됨' : applicant.statusLabel}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <p className="mb-4 text-[15px] leading-relaxed text-moas-gray-8">
        " {applicant.introduction} "
      </p>

      <div className="mb-4 border-t border-moas-gray-3"></div>

      <div className="flex items-center justify-end gap-3">
        <button
          onClick={handleChatClick}
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-moas-gray-1 transition-colors hover:bg-moas-gray-2"
        >
          <img src={chatIcon} alt="채팅" className="h-4.5 w-4.5 object-contain" />
          {applicant.unreadMessageCount !== undefined && applicant.unreadMessageCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-moas-artist text-[11px] font-bold text-white">
              {applicant.unreadMessageCount}
            </span>
          )}
        </button>

        <button
          onClick={handlePortfolioClick}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-moas-gray-1 transition-colors hover:bg-moas-gray-2"
        >
          <img src={documentIcon} alt="포트폴리오" className="h-6 w-6 object-contain" />
        </button>

        {renderStatusButtons()}
      </div>

      {showRejectModal && (
        <ConfirmModal
          title="지원 거절"
          message={`${applicant.name}님의 지원을 거절하시겠습니까?`}
          confirmText="네"
          cancelText="아니오"
          type="danger"
          onConfirm={handleRejectConfirm}
          onCancel={handleRejectCancel}
        />
      )}

      {/* 거절 성공 모달 */}
      {showRejectSuccessModal && (
        <ConfirmModal
          title="지원 거절 완료"
          message="성공적으로 거절되었습니다."
          confirmText="확인"
          type="info"
          onConfirm={handleRejectSuccessConfirm}
        />
      )}

      {/* 포트폴리오 상세 모달 */}
      {selectedPortfolioId && (
        <PortfolioDetailModal
          isOpen={true}
          onClose={handleClosePortfolio}
          portfolioId={selectedPortfolioId}
          isReadOnly={true}
          artistName={applicant.name}
        />
      )}

      {/* 리뷰 모달 */}
      {showReviewModal && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          userId={applicant.userId}
          userName={applicant.name}
        />
      )}
    </div>
  );
}

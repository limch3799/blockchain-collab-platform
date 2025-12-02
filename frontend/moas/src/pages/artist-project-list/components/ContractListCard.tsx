// src/pages/artist-project-list/components/ContractListCard.tsx

import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';

import calendarIcon from '@/assets/icons/calendar.svg';
import thumbnailImg from '@/assets/project-post/project-thumbnail-dummy/thumbnail2.png';
import DefaultProfileImage1 from '@/assets/header/default_profile/default_profile_1.png';

import type { ApplicationProject } from '../types';
import { CONTRACT_STATUS_TEXT } from '../types';
import { POSITION_CATEGORIES } from '@/constants/categories';

interface ContractListCardProps {
  application: ApplicationProject;
  onSignContract?: (contractId: number) => void;
  onViewContract?: (contractId: number) => void;
}

const getCategoryByPosition = (positionName: string): string => {
  const positionEntry = Object.entries(POSITION_CATEGORIES).find(
    ([_, name]) => name === positionName,
  );

  if (!positionEntry) return '기타';

  const positionId = Number(positionEntry[0]);

  if (positionId >= 1 && positionId <= 4) return '음악/공연';
  if (positionId >= 5 && positionId <= 9) return '사진/영상/미디어';
  if (positionId >= 10 && positionId <= 14) return '디자인';
  return '기타';
};

const CATEGORY_STYLES: Record<string, string> = {
  '사진/영상/미디어': 'bg-moas-main text-white',
  '음악/공연': 'bg-moas-artist text-white',
  디자인: 'bg-moas-leader text-white',
  기타: 'bg-moas-gray-5 text-white',
};

const CONTRACT_STATUS_STYLES: Record<string, string> = {
  PENDING: 'text-moas-main font-bold',
  DECLINED: 'text-moas-error',
  WITHDRAWN: 'text-moas-error',
  ARTIST_SIGNED: 'text-moas-state-1',
  PAYMENT_PENDING: 'text-moas-state-1',
  PAYMENT_COMPLETED: 'text-moas-state-1 font-bold',
  COMPLETED: 'text-moas-state-1 font-bold',
  CANCELLATION_REQUESTED: 'text-moas-error',
};

export function ContractListCard({ application, onSignContract }: ContractListCardProps) {
  const navigate = useNavigate();

  if (!application.contract) return null;

  const category = getCategoryByPosition(application.positionName);
  const categoryStyle = CATEGORY_STYLES[category] || CATEGORY_STYLES['기타'];

  const contractStatus = application.contract.status;
  const statusText = CONTRACT_STATUS_TEXT[contractStatus];
  const statusStyle = CONTRACT_STATUS_STYLES[contractStatus] || 'text-moas-gray-7';

  const formatDateTime = (isoString: string): string => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  };

  const appliedDate = formatDateTime(application.appliedAt);

  const handleCardClick = () => {
    navigate(`/project-post/${application.project.projectId}`);
  };

  // ⭐ 계약서 보기 - 페이지 이동
  const handleViewContract = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/contract/${application.contract!.contractId}`);
  };

  const handleSignContract = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSignContract) {
      onSignContract(application.contract!.contractId);
    }
  };

  const handleChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    alert('채팅 문의하기 기능 (구현 예정)');
  };

  const thumbnailSrc = application.project.thumbnailUrl || thumbnailImg;
  const profileImageSrc = application.project.leaderProfileUrl || DefaultProfileImage1;

  return (
    <Card
      className="group cursor-pointer overflow-hidden bg-moas-gray-1 p-4 transition-all duration-300 ease-out hover:-translate-y-1"
      onClick={handleCardClick}
    >
      <div className="flex gap-4">
        <div className="relative shrink-0">
          <img
            src={thumbnailSrc}
            alt={application.project.title}
            className="h-52 w-[288px] rounded-2xl object-cover"
          />
        </div>

        <div className="flex flex-1 flex-col justify-between">
          <div className="flex flex-1 justify-between">
            <div className="flex flex-col justify-between flex-1">
              <div>
                <div className="mb-2 flex flex-wrap gap-1.5">
                  <Badge
                    className={`h-[22px] rounded-[20px] px-2.5 font-pretendard text-xs font-medium ${categoryStyle}`}
                  >
                    {application.positionName}
                  </Badge>
                </div>

                <h3 className="mb-2 font-pretendard text-xl font-bold leading-tight text-moas-black transition-colors group-hover:text-moas-main">
                  {application.project.title}
                </h3>

                <div className="mb-3 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <img src={calendarIcon} alt="지원일시" className="size-4" />
                    <span className="font-pretendard text-xs font-normal text-moas-text">
                      지원일시: {appliedDate}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <img
                  src={profileImageSrc}
                  alt={application.project.leaderNickname}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="font-pretendard text-sm font-medium text-moas-text">
                  {application.project.leaderNickname}
                </span>
              </div>
            </div>

            <div className="flex items-start">
              <span className={`font-pretendard text-sm font-medium ${statusStyle}`}>
                {statusText}
              </span>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <div className="flex gap-2 flex-1">
              <Button
                onClick={handleViewContract}
                className="h-9 flex-1 rounded-lg bg-moas-main font-pretendard text-sm font-bold text-moas-black hover:bg-moas-main/90"
              >
                계약서 보기
              </Button>
              {contractStatus === 'PENDING' && (
                <Button
                  onClick={handleSignContract}
                  className="h-9 flex-1 rounded-lg bg-white font-pretendard text-sm font-bold text-moas-black hover:bg-moas-gray-1"
                >
                  계약서 서명하기
                </Button>
              )}
            </div>

            <Button
              onClick={handleChat}
              className="h-9 px-4 rounded-lg bg-moas-gray-3 font-pretendard text-sm font-bold text-moas-black hover:bg-moas-gray-4 flex items-center gap-1.5"
            >
              <MessageCircle className="w-4 h-4" />
              채팅 문의하기
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

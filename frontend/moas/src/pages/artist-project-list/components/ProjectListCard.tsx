// src/pages/artist-project-list/components/ProjectListCard.tsx

import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';

import calendarIcon from '@/assets/icons/calendar.svg';
import thumbnailImg from '@/assets/project-post/project-thumbnail-dummy/thumbnail2.png';
import DefaultProfileImage1 from '@/assets/header/default_profile/default_profile_1.png';

import type { ApplicationProject, Section } from '../types';
import { POSITION_CATEGORIES } from '@/constants/categories';

interface ProjectListCardProps {
  application: ApplicationProject;
  section: Section;
  onCancelApplication: (applicationId: number) => void;
  onViewApplication: (applicationId: number) => void;
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

const STATUS_CONFIG: Record<string, { text: string; style: string }> = {
  PENDING: { text: '대기중', style: 'text-moas-gray-7' },
  OFFERED: { text: '계약제안', style: 'text-moas-navy font-bold' },
  REJECTED: { text: '거절됨', style: 'text-moas-error' },
};

export function ProjectListCard({
  application,
  section,
  onCancelApplication,
  onViewApplication,
}: ProjectListCardProps) {
  const navigate = useNavigate();

  const {
    project: { projectId, leaderId, title, leaderNickname, leaderProfileUrl },
  } = application;

  const category = getCategoryByPosition(application.positionName);
  const categoryStyle = CATEGORY_STYLES[category] || CATEGORY_STYLES['기타'];
  const statusConfig = STATUS_CONFIG[application.status] || STATUS_CONFIG.PENDING;

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

  const handleCancelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCancelApplication(application.applicationId);
  };

  const handleViewApplication = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewApplication(application.applicationId);
  };

  const handleChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/chat', {
      state: {
        projectId: projectId,
        otherMemberId: leaderId,
        projectTitle: title,
        otherMemberName: leaderNickname,
        otherMemberProfileUrl: leaderProfileUrl,
      },
    });
  };

  // 계약서 확인 및 서명 핸들러 추가
  const handleViewContract = (e: React.MouseEvent) => {
    e.stopPropagation();

    // contract 정보가 있고 contractId가 있는 경우 계약 상세 페이지로 이동
    if (application.contract && application.contract.contractId) {
      navigate(`/contract/${application.contract.contractId}`, {
        state: {
          projectId: projectId,
          otherMemberId: leaderId,
          projectTitle: title,
          otherMemberName: leaderNickname,
          otherMemberProfileUrl: leaderProfileUrl,
        },
      });
    } else {
      alert('계약 정보를 찾을 수 없습니다.');
    }
  };

  const thumbnailSrc = application.project.thumbnailUrl || thumbnailImg;
  const profileImageSrc = application.project.leaderProfileUrl || DefaultProfileImage1;

  return (
    <Card
      className="group cursor-pointer overflow-hidden bg-moas-gray-1 p-4 transition-all duration-300 ease-out hover:-translate-y-1"
      onClick={handleCardClick}
    >
      <div className="flex gap-4">
        {/* 썸네일 */}
        <div className="relative shrink-0">
          <img
            src={thumbnailSrc}
            alt={application.project.title}
            className="h-52 w-[288px] rounded-2xl object-cover"
          />
        </div>

        {/* 프로젝트 정보 */}
        <div className="flex flex-1 flex-col justify-between pt-2">
          <div className="flex flex-1 justify-between">
            {/* 좌측: 프로젝트 정보 */}
            <div className="flex flex-col justify-between flex-1">
              {/* 상단 정보 */}
              <div>
                {/* 포지션 뱃지 */}
                <div className="mb-2 flex flex-wrap gap-1.5">
                  <Badge
                    className={`h-[24px] rounded-[20px] px-2.5 font-pretendard text-base font-medium ${categoryStyle}`}
                  >
                    {application.positionName}
                  </Badge>
                </div>

                {/* 프로젝트명 */}
                <h3 className="mb-2 font-pretendard text-xl font-bold leading-tight text-moas-black transition-colors group-hover:text-moas-main">
                  {application.project.title}
                </h3>

                {/* 지원일시 */}
                <div className="mb-3 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <img src={calendarIcon} alt="지원일시" className="size-5" />
                    <span className="font-pretendard text-base font-normal text-moas-text">
                      지원일시: {appliedDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* 리더 정보 + 채팅 버튼 */}
              <div className="flex items-center gap-2 mb-3 mt-2">
                <img
                  src={profileImageSrc}
                  alt={application.project.leaderNickname}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="font-pretendard text-lg font-medium text-moas-text">
                  {application.project.leaderNickname}
                </span>

                {/* 채팅 문의하기 버튼 - 작게 */}
                <Button
                  onClick={handleChat}
                  className="h-7 px-2.5 rounded-lg bg-moas-gray-3 font-pretendard text-xm font-medium text-moas-black hover:bg-moas-gray-4 flex items-center gap-1"
                >
                  <MessageCircle className="w-3 h-3" />
                  채팅 문의
                </Button>
              </div>
            </div>

            {/* 우측: 상태 표시 */}
            <div className="flex items-start">
              <span className={`font-pretendard text-lg font-semibold ${statusConfig.style}`}>
                {statusConfig.text}
              </span>
            </div>
          </div>

          {/* 하단 버튼 - 상태별 조건부 렌더링 */}
          {section === 'applications' && (
            <div className="mt-4 flex gap-2">
              <Button
                onClick={handleViewApplication}
                className="h-9 flex-1 rounded-lg bg-moas-main font-pretendard text-sm font-bold text-moas-black hover:bg-moas-main/90"
              >
                내 지원서 확인
              </Button>

              {/* PENDING 상태: 지원 취소 버튼 */}
              {application.status === 'PENDING' && (
                <Button
                  onClick={handleCancelClick}
                  className="h-9 flex-1 rounded-lg bg-white font-pretendard text-sm font-bold text-moas-black hover:bg-moas-gray-1"
                >
                  지원 취소
                </Button>
              )}

              {/* OFFERED 상태: 계약서 확인 및 서명 버튼 */}
              {application.status === 'OFFERED' && (
                <Button
                  onClick={handleViewContract}
                  className="h-9 flex-1 rounded-lg bg-moas-navy font-pretendard text-sm font-bold text-white hover:bg-moas-navy/90"
                >
                  수신 계약서 확인
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

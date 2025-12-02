// src/api/notification.ts

import apiClient from './axios';

// 알림타입 15가지 (CANCELLATION_REJECTED 추가)
export type AlarmType =
  | 'APPLICATION_REJECTED' // 1. 아티스트 - 지원 거절
  | 'CONTRACT_OFFERED' // 2. 아티스트 - 계약서 제시
  | 'CONTRACT_REOFFERED' // 3. 아티스트 - 계약서 재전송
  | 'CONTRACT_WITHDRAWN' // 4. 아티스트 - 계약 제안 철회
  | 'PROJECT_COMPLETED' // 5. 아티스트 - 프로젝트 완료
  | 'CANCELLATION_REQUESTED_BY_LEADER' // 6. 아티스트 - 리더가 계약 취소 요청
  | 'CANCELLATION_APPROVED' // 7. 아티스트/리더 - 계약 취소 승인
  | 'NEW_APPLICATION_RECEIVED' // 8. 리더 - 새 지원
  | 'CONTRACT_DECLINED' // 10. 리더 - 계약 거절
  | 'CONTRACT_ACCEPTED_BY_ARTIST' // 11. 리더 - 계약 수락
  | 'CANCELLATION_REQUESTED_BY_ARTIST' // 12. 리더 - 아티스트가 계약 취소 요청
  | 'NFT_MINTED' // 14. 양측 - NFT 발행 완료
  | 'INQUIRY_ANSWERED' // 15. 양측 - 문의 답변
  | 'CANCELLATION_REJECTED'; // 16. 리더 - 계약 취소 반려

// api 응답타입
export interface NotificationResponse {
  notifications: RawNotification[];
  timestamp: string;
}

export interface RawNotification {
  notificationId: number;
  alarmType: AlarmType | 'APPLICATION_CANCELED_BY_ARTIST'; // 기존 알림 처리를 위해 유지
  relatedId: number;
  isRead: boolean;
  createdAt: string; // ISO string
}

// ===== 가공된 알림 데이터 타입 =====
export interface ProcessedNotification {
  id: number;
  type: AlarmType;
  isRead: boolean;
  createdAt: string; // ISO string
  relatedId: number;
  message: string;
  link: string;
  // 추가 데이터
  projectName?: string;
  artistNickname?: string;
  positionName?: string;
  inquiryTitle?: string;
}

// ===== 추가 API 응답 타입 =====

// 1. 지원서 목록 (APPLICATION_REJECTED용)
export interface MyApplicationsResponse {
  applications: ApplicationItem[];
  pageInfo: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface ApplicationItem {
  applicationId: number;
  status: string;
  appliedAt: string;
  projectPositionId: number;
  positionName: string;
  project: {
    projectId: number;
    title: string;
    thumbnailUrl: string;
    leaderId: number;
    leaderNickname: string;
    leaderProfileUrl: string | null;
  };
  contract: {
    contractId: number;
    status: string;
  } | null;
}

// 2. 계약서 상세
export interface ContractDetailResponse {
  contractId: number;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  project: {
    projectId: number;
    title: string;
    projectPositionId: number;
    positionName: string;
    categoryName: string;
  };
  leader: {
    userId: number;
    nickname: string;
  };
  artist: {
    userId: number;
    nickname: string;
  };
}

// 3. 지원서 상세
export interface ApplicationDetailResponse {
  applicationId: number;
  applicationStatus: string;
  createdAt: string;
  message: string;
  applicant: {
    userId: number;
    nickname: string;
    profileImageUrl: string;
    averageRating: number;
    reviewCount: number;
  };
  position: {
    projectPositionId: number;
    positionName: string;
    positionStatus: string;
  };
  portfolio: any;
}

// 4. 문의 상세
export interface InquiryDetailResponse {
  inquiryId: number;
  memberNickname: string;
  title: string;
  content: string;
  status: string;
  files: any[];
  comments: any[];
  createdAt: string;
  updatedAt: string;
}

// 5. 프로젝트 상세 (NEW_APPLICATION_RECEIVED용)
export interface ProjectDetailResponse {
  projectId: number;
  title: string;
  summary: string;
  description: string;
  thumbnailUrl: string;
  isOnline: boolean;
  province: string | null;
  district: string | null;
  positions: Array<{
    projectPositionId: number;
    positionId: number;
    positionName: string;
    categoryId: number;
    categoryName: string;
    budget: number;
  }>;
  viewCount: number;
  applyDeadline: string;
  startAt: string;
  endAt: string;
  leader: {
    userId: number;
    nickname: string;
    profileImageUrl: string | null;
    reviewCount: number;
    averageRating: number;
  };
  createdAt: string;
  updatedAt: string;
  isClosed: boolean;
}

// ===== API 함수들 =====

/**
 * 알림 목록 조회
 */
export const getNotifications = async (params: {
  page?: number;
  size?: number;
}): Promise<NotificationResponse> => {
  const response = await apiClient.get<NotificationResponse>('/notifications', {
    params: {
      page: params.page || 0,
      size: params.size || 10,
    },
  });
  return response.data;
};

/**
 * 알림 읽음 처리
 */
export const markNotificationAsRead = async (notificationId: number): Promise<void> => {
  await apiClient.patch(`/notifications/${notificationId}/read`);
};

/**
 * 전체 알림 읽음 처리
 */
export const markAllNotificationsAsRead = async (): Promise<void> => {
  await apiClient.patch('/notifications/read-all');
};

/**
 * 내 지원 현황 조회
 */
export const getMyApplications = async (params: {
  page?: number;
  size?: number;
}): Promise<MyApplicationsResponse> => {
  const response = await apiClient.get<MyApplicationsResponse>('/applications/me', {
    params: {
      page: params.page || 0,
      size: params.size || 10,
    },
  });
  return response.data;
};

/**
 * 계약서 상세 조회
 */
export const getContractDetail = async (contractId: number): Promise<ContractDetailResponse> => {
  const response = await apiClient.get<ContractDetailResponse>(`/contracts/${contractId}`);
  return response.data;
};

/**
 * 지원서 상세 조회
 */
export const getApplicationDetail = async (
  applicationId: number,
): Promise<ApplicationDetailResponse> => {
  const response = await apiClient.get<ApplicationDetailResponse>(
    `/applications/${applicationId}`,
  );
  return response.data;
};

/**
 * 프로젝트 상세 조회
 */
export const getProjectDetail = async (projectId: number): Promise<ProjectDetailResponse> => {
  const response = await apiClient.get<ProjectDetailResponse>(`/projects/${projectId}`);
  return response.data;
};

/**
 * 문의 상세 조회
 */
export const getInquiryDetail = async (inquiryId: number): Promise<InquiryDetailResponse> => {
  const response = await apiClient.get<InquiryDetailResponse>(`/member/inquiries/${inquiryId}`);
  return response.data;
};

// ===== 유틸리티 함수 =====

/**
 * 프로젝트명 truncate (12자 초과 시 ...) - 대괄호 추가
 */
export const truncateProjectName = (name: string): string => {
  if (name.length > 12) {
    return `[${name.substring(0, 12)}...]`;
  }
  return `[${name}]`;
};

/**
 * 알림 메시지 생성 및 추가 데이터 가져오기
 * @returns ProcessedNotification 또는 null (필터링된 알림)
 */
export const processNotification = async (
  notification: RawNotification,
): Promise<ProcessedNotification | null> => {
  const { notificationId, alarmType, relatedId, isRead, createdAt } = notification;

  // 9번 알림(APPLICATION_CANCELED_BY_ARTIST) 필터링
  if (alarmType === 'APPLICATION_CANCELED_BY_ARTIST') {
    return null;
  }

  let message = '';
  let link = '';
  let projectName = '';
  let artistNickname = '';
  let positionName = '';
  let inquiryTitle = '';

  try {
    switch (alarmType) {
      case 'APPLICATION_REJECTED': {
        const myApps = await getMyApplications({ size: 50 });
        const app = myApps.applications.find((a) => a.applicationId === relatedId);
        if (app) {
          projectName = truncateProjectName(app.project.title);
          message = `${projectName} 지원이 거절되었습니다.`;
          link = '/artist-project-list';
        } else {
          return null; // 데이터를 찾을 수 없으면 필터링
        }
        break;
      }

      case 'CONTRACT_OFFERED':
      case 'CONTRACT_REOFFERED':
      case 'CONTRACT_WITHDRAWN':
      case 'PROJECT_COMPLETED':
      case 'CANCELLATION_REQUESTED_BY_LEADER':
      case 'CANCELLATION_APPROVED': {
        const contract = await getContractDetail(relatedId);
        projectName = truncateProjectName(contract.project.title);

        if (alarmType === 'CONTRACT_OFFERED') {
          message = `${projectName} 프로젝트의 계약서가 도착했습니다.`;
        } else if (alarmType === 'CONTRACT_REOFFERED') {
          message = `${projectName} 계약서가 수정되어 재전송되었습니다.`;
        } else if (alarmType === 'CONTRACT_WITHDRAWN') {
          message = `${projectName} 계약 제안이 철회되었습니다.`;
        } else if (alarmType === 'PROJECT_COMPLETED') {
          message = `${projectName} 프로젝트가 완료 처리되었습니다. 정산 대기 상태로 변경되었습니다.`;
        } else if (alarmType === 'CANCELLATION_REQUESTED_BY_LEADER') {
          const leaderNickname = contract.leader.nickname;
          message = `{${leaderNickname}}님이 ${projectName} 계약 취소를 요청했습니다.`;
        } else if (alarmType === 'CANCELLATION_APPROVED') {
          message = `${projectName} 계약 취소가 관리자에 의해 승인되었습니다.`;
        }

        link = `/contract/${relatedId}`;
        break;
      }

      case 'NEW_APPLICATION_RECEIVED': {
        // 프로젝트 상세 조회로 변경
        const project = await getProjectDetail(relatedId);
        projectName = truncateProjectName(project.title);
        message = `${projectName} 프로젝트에 새 지원자가 등록되었습니다.`;
        link = `/applicant-list?projectId=${relatedId}`;
        break;
      }

      case 'CONTRACT_DECLINED':
      case 'CONTRACT_ACCEPTED_BY_ARTIST':
      case 'CANCELLATION_REQUESTED_BY_ARTIST':
      case 'NFT_MINTED':
      case 'CANCELLATION_REJECTED': {
        const contract = await getContractDetail(relatedId);
        projectName = truncateProjectName(contract.project.title);
        artistNickname = contract.artist.nickname;
        positionName = `[${contract.project.positionName}]`;

        if (alarmType === 'CONTRACT_DECLINED') {
          message = `{${artistNickname}}님이 ${projectName} 계약을 거절했습니다.`;
        } else if (alarmType === 'CONTRACT_ACCEPTED_BY_ARTIST') {
          message = `{${artistNickname}}님이 ${projectName} 계약에 서명했습니다.`;
        } else if (alarmType === 'CANCELLATION_REQUESTED_BY_ARTIST') {
          message = `{${artistNickname}}님이 ${projectName} 계약 취소를 요청했습니다.`;
        } else if (alarmType === 'NFT_MINTED') {
          message = `${projectName} 계약 NFT 발행이 완료되었습니다.`;
        } else if (alarmType === 'CANCELLATION_REJECTED') {
          message = `${projectName} 계약 취소가 관리자에 의해 반려되었습니다.`;
        }

        link = `/contract/${relatedId}`;
        break;
      }

      case 'INQUIRY_ANSWERED': {
        const inquiry = await getInquiryDetail(relatedId);
        inquiryTitle = `[${inquiry.title}]`;
        message = `${inquiryTitle}에 답변이 작성되었습니다.`;
        link = `/inquiry/${relatedId}`;
        break;
      }

      default:
        return null; // 알 수 없는 타입은 필터링
    }
  } catch (error) {
    console.error('알림 처리 중 오류:', error);
    return null; // 오류 발생 시 리스트에서 제외
  }

  return {
    id: notificationId,
    type: alarmType as AlarmType,
    isRead,
    createdAt,
    relatedId,
    message,
    link,
    projectName,
    artistNickname,
    positionName,
    inquiryTitle,
  };
};
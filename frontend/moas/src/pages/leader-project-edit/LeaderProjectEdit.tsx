/**
 * LeaderProjectEdit Page
 *
 * Description:
 * 리더가 기존 프로젝트 공고를 수정하는 페이지
 * - ProjectForm 컴포넌트의 edit 모드 사용
 * - 취소, 저장 버튼 제공
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ProjectForm } from '@/components/ui/ProjectForm';
import { getProjectById, updateProject } from '@/api/project';
import type { UpdateProjectRequest } from '@/types/project';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { getPositionId } from '@/constants/categories';

function LeaderProjectEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [initialData, setInitialData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // 프로젝트 데이터 불러오기
  useEffect(() => {
    const fetchProject = async () => {
      if (!id) {
        setError('프로젝트 ID가 없습니다.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const project = await getProjectById(Number(id));

        // API 응답을 ProjectForm이 요구하는 형식으로 변환
        const formData = {
          title: project.title,
          summary: project.summary,
          description: project.description,
          startDate: project.startAt, // ISO 8601 형식 그대로 전달 (날짜+시간)
          endDate: project.endAt,
          deadline: project.applyDeadline,
          locationType: project.district ? ('offline' as const) : ('online' as const),
          province: project.province?.nameKo || '',
          district: project.district?.nameKo || '',
          districtCode: project.district?.code || '',
          districtId: project.district?.id, // districtId 추가
          positions: project.positions.map((pos, index) => ({
            id: index + 1,
            positionId: pos.positionId,
            projectPositionId: pos.projectPositionId, // 삭제 API에 필요
            category: pos.categoryName,
            position: pos.positionName,
            budget: pos.budget.toLocaleString('ko-KR'),
            headcount: '1', // API 응답에 headcount가 없으므로 기본값 사용
          })),
          thumbnail: null, // 기존 썸네일 URL은 미리보기로만 사용
          thumbnailUrl: project.thumbnailUrl,
        };

        setInitialData(formData);
        setError(null);
      } catch (error: any) {
        console.error('❌ 프로젝트 조회 실패:', error);

        let errorMsg = '프로젝트를 불러오는데 실패했습니다.';

        if (error.response) {
          const { status } = error.response;

          switch (status) {
            case 401:
              errorMsg = '로그인이 만료되었습니다. 다시 로그인해주세요.';
              break;
            case 403:
              errorMsg = '접근 권한이 없습니다.';
              break;
            case 404:
              errorMsg = '프로젝트를 찾을 수 없습니다.';
              break;
            default:
              errorMsg = error.response.data?.message || errorMsg;
          }
        }

        setError(errorMsg);
        setErrorMessage(errorMsg);
        setShowErrorModal(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  /**
   * 프로젝트 수정 내용을 저장하고 목록 페이지로 이동
   * @param data - 수정된 프로젝트 데이터
   */
  const handleSubmit = async (data: {
    title: string;
    summary: string;
    description: string;
    startDate: string;
    endDate: string;
    deadline: string;
    locationType: 'online' | 'offline';
    province: string;
    district: string;
    districtCode?: string;
    districtId?: number;
    positions: Array<{
      id: number;
      positionId?: number;
      projectPositionId?: number;
      category: string;
      position: string;
      budget: string;
      headcount?: string;
    }>;
    thumbnail: File | null;
  }) => {
    if (!id) {
      setErrorMessage('프로젝트 ID가 없습니다.');
      setShowErrorModal(true);
      return;
    }

    try {
      // ProjectForm 데이터를 UpdateProjectRequest 형식으로 변환
      const updateData: UpdateProjectRequest & { thumbnail?: File } = {
        title: data.title,
        summary: data.summary,
        description: data.description,
        applyDeadline: data.deadline, // ProjectForm에서 이미 ISO 형식으로 전달됨
        startAt: data.startDate,
        endAt: data.endDate,
        positions: data.positions.map((pos) => ({
          positionId: pos.positionId || getPositionId(pos.position) || 0, // 기존 포지션 ID 또는 새로 선택한 포지션 이름으로 ID 조회
          budget: parseInt(pos.budget.replace(/,/g, ''), 10),
          headcount: parseInt(pos.headcount || '1', 10),
        })),
      };

      // 썸네일 파일이 있으면 추가
      if (data.thumbnail) {
        updateData.thumbnail = data.thumbnail;
      }

      // districtId 처리 (온라인/오프라인)
      if (data.locationType === 'offline' && data.districtCode) {
        updateData.districtCode = data.districtCode;
      } else if (data.locationType === 'online') {
        // 온라인으로 변경하는 경우 districtId를 null로 설정
        updateData.districtCode = undefined;
      }

      console.log('📤 프로젝트 수정 요청:', updateData);

      await updateProject(Number(id), updateData);

      console.log('✅ 프로젝트 수정 완료');

      // 성공 모달 표시
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('❌ 프로젝트 수정 실패:', error);

      let errorMsg = '프로젝트 수정에 실패했습니다.';

      if (error.response) {
        const { status, data: responseData } = error.response;

        switch (status) {
          case 400:
            errorMsg = responseData?.message || '입력 값이 올바르지 않습니다. 다시 확인해주세요.';
            break;
          case 401:
            errorMsg = '로그인이 만료되었습니다. 다시 로그인해주세요.';
            break;
          case 403:
            errorMsg = '접근 권한이 없습니다.';
            break;
          case 404:
            errorMsg = '프로젝트를 찾을 수 없습니다.';
            break;
          case 409:
            errorMsg = '현재 상태에서는 요청을 처리할 수 없습니다.';
            break;
          case 500:
            errorMsg = '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
            break;
          default:
            errorMsg = responseData?.message || errorMsg;
        }
      }

      setErrorMessage(errorMsg);
      setShowErrorModal(true);
    }
  };

  /**
   * 수정을 취소하고 프로젝트 목록 페이지로 이동
   */
  const handleCancel = () => {
    navigate('/leader-project-list');
  };

  // 로딩 중
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-moas-main border-t-transparent" />
      </div>
    );
  }

  // 에러 발생
  if (error || !initialData) {
    return (
      <>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-moas-error">{error || '프로젝트를 불러올 수 없습니다.'}</p>
            <button
              onClick={() => navigate('/leader-project-list')}
              className="mt-4 rounded-lg bg-moas-main px-6 py-2 font-bold text-white hover:bg-moas-main/90"
            >
              목록으로 돌아가기
            </button>
          </div>
        </div>

        {/* 에러 모달 */}
        {showErrorModal && (
          <ConfirmModal
            message={errorMessage}
            confirmText="확인"
            onConfirm={() => {
              setShowErrorModal(false);
              navigate('/leader-project-list');
            }}
            type="danger"
          />
        )}
      </>
    );
  }

  return (
    <>
      <ProjectForm
        mode="edit"
        projectId={Number(id)}
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />

      {/* 성공 모달 */}
      {showSuccessModal && (
        <ConfirmModal
          message="프로젝트가 성공적으로 수정되었습니다."
          confirmText="확인"
          onConfirm={() => {
            setShowSuccessModal(false);
            navigate('/leader-project-list');
          }}
          type="info"
        />
      )}

      {/* 에러 모달 */}
      {showErrorModal && (
        <ConfirmModal
          message={errorMessage}
          confirmText="확인"
          onConfirm={() => setShowErrorModal(false)}
          type="danger"
        />
      )}
    </>
  );
}

export default LeaderProjectEdit;

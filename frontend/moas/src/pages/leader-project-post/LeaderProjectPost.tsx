/**
 * LeaderProjectPost Page
 *
 * Description:
 * 리더가 새로운 프로젝트 공고를 등록하는 페이지
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectForm } from '@/components/ui/ProjectForm';
import { createProject } from '@/api/project';
import type { CreateProjectRequest } from '@/types/project';
import { getPositionId } from '@/constants/categories';
import { PROVINCES, DISTRICTS } from '@/constants/regions';

function LeaderProjectPost() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    positions: Array<{
      id: number;
      category: string;
      position: string;
      budget: string;
      headcount?: string;
    }>;
    thumbnail: File | null;
  }) => {
    if (isSubmitting) return;
    if (!data.thumbnail) {
      alert('썸네일 이미지를 등록해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      // districtCode 조회
      let districtCode: string;
      if (data.locationType === 'online') {
        districtCode = ''; // 온라인일 경우 빈 문자열
      } else {
        // 시/도 코드 찾기
        const selectedProvince = PROVINCES.find((p) => p.name === data.province);
        console.log('선택한 시/도:', data.province, '찾은 코드:', selectedProvince);
        if (!selectedProvince) {
          alert('시/도 정보를 확인해주세요.');
          setIsSubmitting(false);
          return;
        }

        // 구/군 코드 찾기
        const districts = DISTRICTS[selectedProvince.code];
        console.log('사용 가능한 구/군 목록:', districts);
        const selectedDistrict = districts?.find((d) => d.name === data.district);
        console.log('선택한 구/군:', data.district, '찾은 코드:', selectedDistrict);
        if (!selectedDistrict) {
          alert(`구/군 정보를 확인해주세요. 선택: ${data.district}`);
          setIsSubmitting(false);
          return;
        }

        districtCode = selectedDistrict.code;
        console.log('최종 districtCode:', districtCode);
      }

      // positions를 positionId로 변환 (constants/categories.ts 사용)
      const positions = data.positions.map((pos) => {
        const positionId = getPositionId(pos.position);
        if (!positionId) {
          throw new Error(`포지션 ID를 찾을 수 없습니다: ${pos.position}`);
        }
        return {
          positionId,
          budget: pos.budget,
        };
      });

      const requestData: CreateProjectRequest = {
        districtCode,
        title: data.title,
        summary: data.summary,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        deadline: data.deadline,
        positions,
        thumbnail: data.thumbnail,
      };

      const response = await createProject(requestData);
      console.log('프로젝트 등록 성공:', response);

      navigate('/leader-project-list');
    } catch (error) {
      console.error('프로젝트 등록 실패:', error);
      alert('프로젝트 등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return <ProjectForm mode="create" onSubmit={handleSubmit} />;
}

export default LeaderProjectPost;

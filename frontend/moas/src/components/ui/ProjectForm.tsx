/**
 * ProjectForm Component
 *
 * Description:
 * 프로젝트 등록 및 수정을 위한 재사용 가능한 폼 컴포넌트
 * - mode: 'create' (등록) 또는 'edit' (수정) 모드 지원
 * - 등록 모드: 등록
 * - 수정 모드: 취소, 저장
 */

import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Trash2, ArrowLeft, Sparkles, Loader2, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImageCropModal } from '@/components/ui/ImageCropModal';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';
import { AiLoadingModal } from '@/components/contract/AiLoadingModal';
import { MarkdownEditor } from '@/components/ui/MarkdownEditor';

import imageIcon from '@/assets/icons/image-icon.svg';

import { CATEGORIES, POSITION_CATEGORIES } from '@/constants/categories';
import { PROVINCES, DISTRICTS } from '@/constants/regions';
import { SelectModal } from '@/pages/leader-project-post/components/SelectModal';
import { describeProject, checkPositionDeletable, type DescribeProjectRequest } from '@/api/project';
import { getPositionId } from '@/constants/categories';
import { ConfirmModal } from '@/components/common/ConfirmModal';

interface Position {
  id: number;
  positionId?: number; // API에서 받은 포지션 ID (edit 모드에서만 존재)
  projectPositionId?: number; // 프로젝트-포지션 매핑 ID (삭제 API에 사용)
  category: string;
  position: string;
  budget: string;
  headcount?: string;
}

interface ValidationErrors {
  [key: string]: boolean;
}

type ModalType = 'category' | 'position' | 'province' | 'district' | null;

interface ProjectFormProps {
  mode: 'create' | 'edit';
  projectId?: number; // edit 모드에서 필요
  initialData?: {
    title?: string;
    summary?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    deadline?: string;
    locationType?: 'online' | 'offline';
    province?: string;
    district?: string;
    districtCode?: string;
    districtId?: number;
    positions?: Position[];
    thumbnail?: File | null;
    thumbnailUrl?: string;
  };
  onSubmit: (data: {
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
    positions: Position[];
    thumbnail: File | null;
  }) => void;
  onCancel?: () => void;
}

export function ProjectForm({ mode, projectId, initialData, onSubmit, onCancel }: ProjectFormProps) {
  const navigate = useNavigate();

  // 상태 관리
  const [title, setTitle] = useState(initialData?.title || '');
  const [summary, setSummary] = useState(initialData?.summary || '');
  const [description, setDescription] = useState(initialData?.description || '');

  // 날짜/시간 상태 (Date 객체 + 시간 문자열)
  const [startDate, setStartDate] = useState<Date | undefined>(
    initialData?.startDate ? new Date(initialData.startDate.split('T')[0]) : undefined
  );
  const [startTime, setStartTime] = useState(
    initialData?.startDate ? initialData.startDate.split('T')[1]?.substring(0, 2) || '00' : ''
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    initialData?.endDate ? new Date(initialData.endDate.split('T')[0]) : undefined
  );
  const [endTime, setEndTime] = useState(
    initialData?.endDate ? initialData.endDate.split('T')[1]?.substring(0, 2) || '00' : ''
  );
  const [deadline, setDeadline] = useState<Date | undefined>(
    initialData?.deadline ? new Date(initialData.deadline.split('T')[0]) : undefined
  );
  const [deadlineTime, setDeadlineTime] = useState(
    initialData?.deadline ? initialData.deadline.split('T')[1]?.substring(0, 2) || '23' : ''
  );

  const [locationType, setLocationType] = useState<'online' | 'offline'>(
    initialData?.locationType || 'online',
  );
  const [province, setProvince] = useState(initialData?.province || '');
  const [district, setDistrict] = useState(initialData?.district || '');
  const [districtCode, setDistrictCode] = useState(initialData?.districtCode || '');
  const [districtId] = useState(initialData?.districtId);
  const [thumbnail, setThumbnail] = useState<File | null>(initialData?.thumbnail || null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    initialData?.thumbnailUrl || null
  );
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);
  const [originalFileName, setOriginalFileName] = useState<string>('');
  const [showCropModal, setShowCropModal] = useState(false);
  const [positions, setPositions] = useState<Position[]>(
    initialData?.positions || [{ id: 1, category: '', position: '', budget: '' }],
  );
  // 초기 데이터에서 받아온 원본 projectPositionId 목록 (edit 모드에서 새로 추가된 포지션 구분용)
  const [originalProjectPositionIds] = useState<Set<number>>(
    new Set(initialData?.positions?.map(p => p.projectPositionId).filter((id): id is number => id !== undefined) || [])
  );
  const [submitted, setSubmitted] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // 날짜/시간 검증 에러 상태
  const [startDateError, setStartDateError] = useState('');
  const [endDateError, setEndDateError] = useState('');
  const [deadlineError, setDeadlineError] = useState('');

  // 예산 범위 에러 메시지 상태 (포지션별)
  const [budgetRangeErrors, setBudgetRangeErrors] = useState<Record<number, string>>({});

  // 예산 입력 비정상 입력 감지 상태 (포지션별)
  const [invalidBudgetInputs, setInvalidBudgetInputs] = useState<Record<number, boolean>>({});

  // 모달 상태
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const [activePositionId, setActivePositionId] = useState<number | null>(null);

  // 포지션 삭제 관련 상태
  const [showDeleteErrorModal, setShowDeleteErrorModal] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState('');

  // AI assistant 상태
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [showAiLoadingModal, setShowAiLoadingModal] = useState(false);

  // 드래그앤드롭 상태
  const [isDragging, setIsDragging] = useState(false);

  // === 날짜/시간 유틸리티 함수 ===

  // Date 객체의 분/초/밀리초를 0으로 정규화 (시간 단위로 통일)
  const normalizeToHour = (date: Date): Date => {
    const normalized = new Date(date);
    normalized.setMinutes(0);
    normalized.setSeconds(0);
    normalized.setMilliseconds(0);
    return normalized;
  };

  // 현재 날짜와 시간을 1시간 단위로 올림 처리하여 Date 객체 반환
  const getMinDateTime = () => {
    const now = new Date();
    const minutes = now.getMinutes();

    // 1시간 단위로 올림
    if (minutes > 0) {
      now.setHours(now.getHours() + 1);
    }
    return normalizeToHour(now);
  };

  // DatePicker에서 사용할 최소 날짜 (시간 제외, 자정으로 설정)
  const getMinDate = () => {
    const now = new Date();
    const currentHour = now.getHours();

    // 현재 시간이 23시 이상이면 내일부터 선택 가능
    if (currentHour >= 23) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      return tomorrow;
    }

    // 그 외의 경우 오늘부터 선택 가능
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  // Date 객체를 YYYY-MM-DD 형식으로 변환
  const formatDateToString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Date 객체와 시간 문자열(HH)을 결합하여 ISO 문자열 반환
  const combineDateAndTimeToISO = (date: Date, timeHour: string): string => {
    const dateStr = formatDateToString(date);
    return `${dateStr}T${timeHour}:00:00`;
  };

  // Date가 오늘인지 확인
  const isToday = (date: Date | undefined): boolean => {
    if (!date) return false;
    const today = new Date();

    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  // 두 Date가 같은 날인지 확인
  const isSameDate = (date1: Date | undefined, date2: Date | undefined): boolean => {
    if (!date1 || !date2) return false;
    return formatDateToString(date1) === formatDateToString(date2);
  };

  // 프로젝트 종료일의 최소 날짜 계산 (시작 시간이 23시면 다음날부터)
  const getProjectEndMinDate = (): Date => {
    if (!startDate) return getMinDate();

    // 시작 시간이 23시인 경우, 종료일은 최소 다음날
    if (startTime === '23') {
      const nextDay = new Date(startDate);
      nextDay.setDate(nextDay.getDate() + 1);
      return nextDay;
    }

    // 그 외의 경우 시작일과 같은 날 가능
    return startDate;
  };

  // 선택된 시/도에 따른 구/군 목록
  const availableDistricts = useMemo(() => {
    const selectedProvince = PROVINCES.find((p) => p.name === province);
    if (!selectedProvince) return [];
    return DISTRICTS[selectedProvince.code] || [];
  }, [province]);

  // 카테고리 목록 (중복 제거)
  const categoryOptions = useMemo(() => {
    const categoryMap = new Map<number, string>();
    Object.entries(CATEGORIES).forEach(([_, categoryName]) => {
      // 카테고리 ID 찾기
      const categoryId = Object.entries(CATEGORIES).find(
        ([__, name]) => name === categoryName,
      )?.[0];
      if (categoryId) {
        categoryMap.set(Number(categoryId), categoryName);
      }
    });
    return Array.from(categoryMap.values());
  }, []);

  // 선택된 카테고리에 따른 포지션 목록
  const getAvailablePositions = (category: string) => {
    // 카테고리명에 해당하는 모든 포지션 찾기
    const categoryId = Object.entries(CATEGORIES).find(([_, name]) => name === category)?.[0];
    if (!categoryId) return [];

    // 해당 카테고리의 모든 포지션 찾기
    const positions: string[] = [];
    Object.entries(POSITION_CATEGORIES).forEach(([posId, posName]) => {
      const posIdNum = Number(posId);
      // 카테고리 ID 범위로 필터링
      if (categoryId === '1' && posIdNum >= 1 && posIdNum <= 4) {
        positions.push(posName);
      } else if (categoryId === '2' && posIdNum >= 5 && posIdNum <= 9) {
        positions.push(posName);
      } else if (categoryId === '3' && posIdNum >= 10 && posIdNum <= 14) {
        positions.push(posName);
      } else if (categoryId === '4' && posIdNum === 15) {
        positions.push(posName);
      }
    });
    return positions;
  };

  // 시간 비활성화 로직 (과거 시간 비활성화 + 모집 마감일 제약)
  const disabledStartHours = useMemo(() => {
    // 시작일 = 모집 마감일인 경우: 마감 시간 이전의 시간들을 비활성화
    if (deadline && startDate && isSameDate(startDate, deadline) && deadlineTime) {
      const deadlineHour = parseInt(deadlineTime);
      return Array.from({ length: 24 }, (_, i) => i < deadlineHour);
    }

    // 오늘 날짜인 경우: 현재 시간 이전 비활성화
    if (isToday(startDate)) {
      const now = new Date();
      const minHour = now.getMinutes() > 0 ? now.getHours() + 1 : now.getHours();
      return Array.from({ length: 24 }, (_, i) => i < minHour);
    }

    // 오늘이 아닌 경우: 모든 시간 활성화
    return Array.from({ length: 24 }, () => false);
  }, [startDate, deadline, deadlineTime]);

  const disabledEndHours = useMemo(() => {
    if (!isSameDate(startDate, endDate) || !startTime) {
      return Array.from({ length: 24 }, () => false);
    }
    const startHour = parseInt(startTime);
    return Array.from({ length: 24 }, (_, i) => i <= startHour);
  }, [startDate, endDate, startTime]);

  const disabledDeadlineHours = useMemo(() => {
    if (!isToday(deadline)) {
      return Array.from({ length: 24 }, () => false);
    }
    const now = new Date();
    const minHour = now.getMinutes() > 0 ? now.getHours() + 1 : now.getHours();
    return Array.from({ length: 24 }, (_, i) => i < minHour);
  }, [deadline]);

  // edit 모드일 때 과거 시간 자동 조정
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      const minDateTime = getMinDateTime();
      let adjustmentsNeeded = false;

      // 모집 마감일이 과거인지 확인
      if (deadline && deadlineTime) {
        const deadlineDateTime = new Date(deadline);
        deadlineDateTime.setHours(parseInt(deadlineTime), 0, 0, 0);

        if (deadlineDateTime < minDateTime) {
          adjustmentsNeeded = true;
          console.log('⏰ 모집 마감일이 과거입니다. 현재 시간으로 조정:', deadlineDateTime, '->', minDateTime);
          setDeadline(minDateTime);
          setDeadlineTime(String(minDateTime.getHours()).padStart(2, '0'));
        }
      }

      // 프로젝트 시작일이 과거인지 확인
      if (startDate && startTime) {
        const startDateTime = new Date(startDate);
        startDateTime.setHours(parseInt(startTime), 0, 0, 0);

        let adjustedStartDateTime = startDateTime;

        if (startDateTime < minDateTime) {
          adjustmentsNeeded = true;
          adjustedStartDateTime = minDateTime;
          console.log('⏰ 프로젝트 시작일이 과거입니다. 현재 시간으로 조정:', startDateTime, '->', minDateTime);
        }

        // 시작일이 모집 마감일보다 이전인지 확인
        if (deadline && deadlineTime) {
          const adjustedDeadlineDateTime = new Date(deadline);
          adjustedDeadlineDateTime.setHours(parseInt(deadlineTime), 0, 0, 0);

          if (adjustedStartDateTime < adjustedDeadlineDateTime) {
            adjustmentsNeeded = true;
            const newStartDateTime = new Date(adjustedDeadlineDateTime);
            newStartDateTime.setHours(newStartDateTime.getHours() + 1);
            adjustedStartDateTime = newStartDateTime;
            console.log('⏰ 시작일이 마감일보다 이전입니다. 마감일 +1시간으로 조정:', adjustedStartDateTime);
          }
        }

        if (adjustmentsNeeded && adjustedStartDateTime !== startDateTime) {
          setStartDate(adjustedStartDateTime);
          setStartTime(String(adjustedStartDateTime.getHours()).padStart(2, '0'));
        }
      }

      // 프로젝트 종료일이 시작일보다 이전인지 확인
      if (endDate && endTime && startDate && startTime) {
        const currentStartDateTime = new Date(startDate);
        currentStartDateTime.setHours(parseInt(startTime), 0, 0, 0);

        const endDateTime = new Date(endDate);
        endDateTime.setHours(parseInt(endTime), 0, 0, 0);

        if (endDateTime <= currentStartDateTime) {
          adjustmentsNeeded = true;
          const newEndDateTime = new Date(currentStartDateTime);
          newEndDateTime.setHours(newEndDateTime.getHours() + 1);
          console.log('⏰ 종료일이 시작일보다 이전입니다. 시작일 +1시간으로 조정:', endDateTime, '->', newEndDateTime);
          setEndDate(newEndDateTime);
          setEndTime(String(newEndDateTime.getHours()).padStart(2, '0'));
        }
      }
    }
  }, [mode, initialData]);

  // 포지션 추가
  const handleAddPosition = () => {
    setPositions([...positions, { id: Date.now(), category: '', position: '', budget: '' }]);
  };

  // 포지션 삭제
  const handleRemovePosition = async (id: number) => {
    if (positions.length <= 1) return;

    const position = positions.find(p => p.id === id);

    // edit 모드이고, projectPositionId가 있으며, 원본 데이터에 있던 포지션인 경우에만 API로 삭제 가능 여부 확인
    // 새로 추가된 포지션(originalProjectPositionIds에 없는)은 API 호출 없이 바로 삭제
    if (mode === 'edit' && projectId && position?.projectPositionId && originalProjectPositionIds.has(position.projectPositionId)) {
      try {
        const result = await checkPositionDeletable(projectId, position.projectPositionId);

        if (!result.deletable) {
          // 삭제 불가능한 경우 에러 모달 표시
          setDeleteErrorMessage(result.message);
          setShowDeleteErrorModal(true);
          return;
        }
      } catch (error: any) {
        console.error('❌ 포지션 삭제 가능 여부 조회 실패:', error);

        // 에러 처리
        let errorMsg = '포지션 삭제 가능 여부를 확인할 수 없습니다.';

        if (error.response) {
          const { status, data } = error.response;

          if (status === 400) {
            errorMsg = data?.message || '해당 포지션에 지원자가 있어 삭제할 수 없습니다.';
          } else if (status === 403) {
            errorMsg = '프로젝트 소유자만 가능한 작업입니다.';
          } else if (status === 404) {
            errorMsg = '프로젝트 또는 포지션을 찾을 수 없습니다.';
          } else {
            errorMsg = data?.message || errorMsg;
          }
        }

        setDeleteErrorMessage(errorMsg);
        setShowDeleteErrorModal(true);
        return;
      }
    }

    // 삭제 가능한 경우 포지션 제거
    setPositions(positions.filter((p) => p.id !== id));
  };

  // 포지션 변경
  const handlePositionChange = (id: number, field: keyof Position, value: string) => {
    setPositions(
      positions.map((p) => {
        if (p.id === id) {
          // 카테고리 변경 시 포지션 초기화
          if (field === 'category') {
            return { ...p, category: value, position: '' };
          }
          return { ...p, [field]: value };
        }
        return p;
      }),
    );
  };

  /**
   * 예산 입력값에 천 단위 콤마를 추가
   * @param value - 사용자 입력 문자열
   * @returns 콤마가 추가된 숫자 문자열
   */
  const formatBudget = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '');
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // 예산 변경 핸들러
  const handleBudgetChange = (id: number, value: string) => {
    // 숫자와 콤마만 추출 (한글/특수문자 제거)
    const cleanValue = value.replace(/[^\d,]/g, '');

    // 원래 값과 다르면 (한글/특수문자가 있었으면) shake 효과
    if (cleanValue !== value) {
      setInvalidBudgetInputs(prev => ({ ...prev, [id]: true }));
      // 에러 메시지 초기화
      setBudgetRangeErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
      setTimeout(() => {
        setInvalidBudgetInputs(prev => ({ ...prev, [id]: false }));
      }, 1000);
      return; // 입력 차단 - 유효성 검사 호출 안 함
    }

    // 정리된 값으로 포맷팅
    const formatted = formatBudget(cleanValue);

    // 1000억 초과 체크
    const numbers = formatted.replace(/,/g, '');
    const budgetNumber = parseInt(numbers || '0');
    const isOverLimit = budgetNumber > 100000000000;

    // 1000억 초과 시 입력 차단 + 흔들림 + 에러 메시지
    if (isOverLimit) {
      setInvalidBudgetInputs(prev => ({ ...prev, [id]: true }));
      setBudgetRangeErrors(prev => ({ ...prev, [id]: '최대 1,000억원까지 입력 가능합니다' }));
      setTimeout(() => {
        setInvalidBudgetInputs(prev => ({ ...prev, [id]: false }));
      }, 1000);
      return; // 입력 차단
    }

    handlePositionChange(id, 'budget', formatted);

    // 예산 범위 검증
    if (formatted && formatted.trim() !== '') {
      const budgetNum = parseInt(formatted.replace(/,/g, ''));

      if (budgetNum <= 0) {
        setBudgetRangeErrors(prev => ({ ...prev, [id]: '예산은 양수여야 합니다' }));
      } else {
        // 에러 제거
        setBudgetRangeErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[id];
          return newErrors;
        });
      }
    } else {
      // 빈 값이면 에러 제거
      setBudgetRangeErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  // 파일 처리 공통 함수
  const processImageFile = (file: File) => {
    // 파일 타입 검증
    if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
      alert('JPG 또는 PNG 파일만 업로드 가능합니다.');
      return;
    }

    // 파일 크기 검증 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('파일 크기는 최대 10MB까지 업로드 가능합니다.');
      return;
    }

    // 원본 파일 이름 저장
    setOriginalFileName(file.name);

    // 원본 이미지를 읽어서 크롭 모달에 표시
    const reader = new FileReader();
    reader.onloadend = () => {
      setOriginalImageSrc(reader.result as string);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  // 썸네일 파일 선택 (크롭 모달 열기)
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
    // input 값 초기화 (같은 파일을 다시 선택할 수 있도록)
    e.target.value = '';
  };

  // 드래그앤드롭 핸들러
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processImageFile(files[0]);
    }
  };

  // 크롭 완료
  const handleCropComplete = (croppedImage: Blob) => {
    // 원본 파일 이름에서 확장자 제거하고 _cropped 추가
    const fileNameWithoutExt = originalFileName.replace(/\.[^/.]+$/, '');
    const finalFileName = `${fileNameWithoutExt}_cropped.jpg`;

    // Blob을 File로 변환 (원본 파일 이름 사용)
    const file = new File([croppedImage], finalFileName, { type: 'image/jpeg' });
    setThumbnail(file);

    // 미리보기 생성
    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnailPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setShowCropModal(false);
    setOriginalImageSrc(null);
  };

  // 크롭 취소
  const handleCropCancel = () => {
    setShowCropModal(false);
    setOriginalImageSrc(null);
  };

  // 뒤로가기 핸들러
  const handleBack = () => {
    if (mode === 'edit' && onCancel) {
      onCancel();
    } else {
      navigate(-1);
    }
  };

  // 시/도 변경 시 구/군 초기화
  const handleProvinceChange = (value: string) => {
    setProvince(value);
    setDistrict('');
  };

  // 모달 열기
  const openCategoryModal = (positionId: number) => {
    setActivePositionId(positionId);
    setOpenModal('category');
  };

  const openPositionModal = (positionId: number) => {
    setActivePositionId(positionId);
    setOpenModal('position');
  };

  const openProvinceModal = () => {
    setOpenModal('province');
  };

  const openDistrictModal = () => {
    setOpenModal('district');
  };

  // 모달에서 선택
  const handleModalSelect = (value: string) => {
    if (openModal === 'category' && activePositionId) {
      handlePositionChange(activePositionId, 'category', value);
    } else if (openModal === 'position' && activePositionId) {
      handlePositionChange(activePositionId, 'position', value);
    } else if (openModal === 'province') {
      handleProvinceChange(value);
      // 시/도 선택 후 자동으로 구/군 모달로 전환
      setOpenModal('district');
      return; // 모달을 닫지 않음
    } else if (openModal === 'district') {
      setDistrict(value);
      // districtCode 설정 (PROVINCES에서 현재 province의 code 찾기)
      const provinceCode = PROVINCES.find(p => p.name === province)?.code;
      if (provinceCode) {
        const selectedDistrict = DISTRICTS[provinceCode]?.find(d => d.name === value);
        if (selectedDistrict) {
          setDistrictCode(selectedDistrict.code);
          // districtId는 edit 모드에서 initialData로 전달된 값을 유지
          // (새로 선택하면 districtId는 초기화되고 districtCode만 사용)
        }
      }
    }
  };

  /**
   * 폼 전체의 유효성을 검사
   * @returns 유효성 검사 통과 여부
   */
  const validateForm = () => {
    const errors: ValidationErrors = {};

    // 포지션 검사
    positions.forEach((position, index) => {
      if (!position.category) errors[`position-${index}-category`] = true;
      if (!position.position) errors[`position-${index}-position`] = true;
      if (!position.budget) {
        errors[`position-${index}-budget`] = true;
      } else {
        // 예산 범위 검증
        const budgetNumber = parseInt(position.budget.replace(/,/g, ''));
        if (budgetNumber <= 0 || budgetNumber > 100000000000) {
          errors[`position-${index}-budget`] = true;
        }
      }
    });

    // 제목 검사
    if (!title || title.length > 30) errors.title = true;

    // 요약 검사
    if (!summary || summary.length > 100) errors.summary = true;

    // 설명 검사
    if (!description || description.length > 10000) errors.description = true;

    // 프로젝트 기간 검사 (날짜 + 시간 모두 필수)
    if (!startDate || !startTime) errors.startDate = true;
    if (!endDate || !endTime) errors.endDate = true;

    // 모집 마감일 검사 (날짜 + 시간 모두 필수)
    if (!deadline || !deadlineTime) errors.deadline = true;

    // 오프라인일 경우 지역 검사
    if (locationType === 'offline') {
      if (!province) errors.province = true;
      if (!district) errors.district = true;
    }

    // 대표 이미지 검사 (edit 모드에서는 thumbnailPreview가 있으면 OK)
    if (!thumbnail && !thumbnailPreview) errors.thumbnail = true;

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * 폼 제출 처리 및 유효성 검사 실패 시 에러 필드로 스크롤
   */
  const handleFormSubmit = () => {
    setSubmitted(true);

    if (!validateForm()) {
      // 유효성 검사 실패 시 첫 번째 에러로 스크롤
      const firstError = Object.keys(validationErrors)[0];
      const element = document.getElementById(firstError);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    onSubmit({
      title,
      summary,
      description,
      startDate: startDate && startTime ? combineDateAndTimeToISO(startDate, startTime) : '',
      endDate: endDate && endTime ? combineDateAndTimeToISO(endDate, endTime) : '',
      deadline: deadline && deadlineTime ? combineDateAndTimeToISO(deadline, deadlineTime) : '',
      locationType,
      province,
      district,
      districtCode,
      districtId,
      positions,
      thumbnail,
    });
  };

  // 유효성 검사 헬퍼
  const isTitleValid = title.length > 0 && title.length <= 30;
  const isSummaryValid = summary.length > 0 && summary.length <= 100;
  const isDescriptionValid = description.length > 0 && description.length <= 10000;

  // 에러 상태 헬퍼 (텍스트 필드)
  const getTitleError = () => {
    if (title.length > 0) {
      return !isTitleValid;
    }
    return submitted && !isTitleValid;
  };

  const getSummaryError = () => {
    if (summary.length > 0) {
      return !isSummaryValid;
    }
    return submitted && !isSummaryValid;
  };

  const getDescriptionError = () => {
    if (description.length > 0) {
      return !isDescriptionValid;
    }
    return submitted && !isDescriptionValid;
  };

  // 날짜/시간 검증 함수
  const validateStartDate = () => {
    if (!startDate && !startTime) {
      setStartDateError('');
      return '';
    }

    if (!startDate || !startTime) {
      setStartDateError('프로젝트 시작일과 시간은 필수입니다');
      return '프로젝트 시작일과 시간은 필수입니다';
    }

    const now = new Date();
    const selected = new Date(startDate);
    selected.setHours(parseInt(startTime), 0, 0, 0);

    if (selected < now) {
      setStartDateError('프로젝트 시작일은 현재 또는 미래 시점이어야 합니다');
      return '프로젝트 시작일은 현재 또는 미래 시점이어야 합니다';
    }

    // 모집 마감일과의 관계 검증 (applyDeadline <= startAt)
    if (deadline && deadlineTime) {
      const deadlineDate = new Date(deadline);
      deadlineDate.setHours(parseInt(deadlineTime), 0, 0, 0);

      if (selected < deadlineDate) {
        setStartDateError('프로젝트 시작일은 모집 마감일 이후여야 합니다');
        return '프로젝트 시작일은 모집 마감일 이후여야 합니다';
      }
    }

    setStartDateError('');
    return '';
  };

  const validateEndDate = () => {
    if (!endDate && !endTime) {
      setEndDateError('');
      return '';
    }

    if (!endDate || !endTime) {
      setEndDateError('프로젝트 종료일과 시간은 필수입니다');
      return '프로젝트 종료일과 시간은 필수입니다';
    }

    if (!startDate || !startTime) {
      setEndDateError('');
      return '';
    }

    const start = new Date(startDate);
    start.setHours(parseInt(startTime), 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(parseInt(endTime), 0, 0, 0);

    if (end <= start) {
      setEndDateError('프로젝트 종료일은 시작일보다 이후여야 합니다');
      return '프로젝트 종료일은 시작일보다 이후여야 합니다';
    }

    setEndDateError('');
    return '';
  };

  const validateDeadline = () => {
    if (!deadline && !deadlineTime) {
      setDeadlineError('');
      return '';
    }

    if (!deadline || !deadlineTime) {
      setDeadlineError('모집 마감일과 시간은 필수입니다');
      return '모집 마감일과 시간은 필수입니다';
    }

    const now = new Date();
    const selected = new Date(deadline);
    selected.setHours(parseInt(deadlineTime), 0, 0, 0);

    if (selected < now) {
      setDeadlineError('모집 마감일은 현재 또는 미래 시점이어야 합니다');
      return '모집 마감일은 현재 또는 미래 시점이어야 합니다';
    }

    if (startDate && startTime) {
      const start = new Date(startDate);
      start.setHours(parseInt(startTime), 0, 0, 0);

      if (selected > start) {
        setDeadlineError('모집 마감일은 프로젝트 시작일 이전이어야 합니다');
        return '모집 마감일은 프로젝트 시작일 이전이어야 합니다';
      }
    }

    setDeadlineError('');
    return '';
  };

  // 날짜/시간 에러 상태 헬퍼 함수
  const getStartDateError = () => {
    // 날짜나 시간 중 하나라도 입력했으면 에러 상태 확인 시작
    if (startDate || startTime) {
      return startDateError !== '';
    }
    // 제출 버튼을 눌렀는데 비어있으면 에러 표시
    return submitted && startDateError !== '';
  };

  const getEndDateError = () => {
    if (endDate || endTime) {
      return endDateError !== '';
    }
    return submitted && endDateError !== '';
  };

  const getDeadlineError = () => {
    if (deadline || deadlineTime) {
      return deadlineError !== '';
    }
    return submitted && deadlineError !== '';
  };

  // 날짜/시간 변경 시 자동 검증 (둘 다 입력될 때만)
  useEffect(() => {
    if (startDate && startTime) {
      validateStartDate();
      validateEndDate(); // 시작일 변경 시 종료일도 영향받음
    }
  }, [startDate, startTime, deadline, deadlineTime]); // 모집 마감일 변경 시에도 시작일 재검증

  useEffect(() => {
    if (endDate && endTime) {
      validateEndDate();
    }
  }, [endDate, endTime, startDate, startTime]);

  useEffect(() => {
    if (deadline && deadlineTime) {
      validateDeadline();
    }
  }, [deadline, deadlineTime, startDate, startTime]);

  /**
   * 시작 시간이 23시로 변경될 때, 종료일이 시작일과 같으면 자동으로 다음날로 조정
   */
  useEffect(() => {
    if (startDate && startTime === '23' && endDate) {
      // 종료일이 시작일과 같은 날이면 다음날로 조정
      if (isSameDate(startDate, endDate)) {
        const nextDay = new Date(startDate);
        nextDay.setDate(nextDay.getDate() + 1);
        setEndDate(nextDay);
        setEndTime('00'); // 다음날 00시로 설정
        console.log('⏰ 프로젝트 시작 시간 23시 → 종료일 자동 조정:', formatDateToString(nextDay), '00:00');
      }
    }
  }, [startTime, startDate, endDate]);

  /**
   * AI assistant를 사용하여 프로젝트 설명 자동 생성
   */
  const handleGenerateDescription = async () => {
    // 필수 필드 검증
    if (!title.trim()) {
      alert('제목을 먼저 입력해주세요.');
      return;
    }
    if (!summary.trim()) {
      alert('요약을 먼저 입력해주세요.');
      return;
    }
    if (!startDate || !startTime) {
      alert('프로젝트 시작일과 시간을 먼저 선택해주세요.');
      return;
    }
    if (!endDate || !endTime) {
      alert('프로젝트 종료일과 시간을 먼저 선택해주세요.');
      return;
    }

    // 로딩 모달 표시
    setShowAiLoadingModal(true);
    setIsGeneratingDescription(true);

    try {
      // 이미 ISO 8601 형식으로 변환
      const startAt = combineDateAndTimeToISO(startDate!, startTime);
      const endAt = combineDateAndTimeToISO(endDate!, endTime);

      // positions 변환
      const requestPositions = positions
        .filter((p) => p.position && p.budget)
        .map((p) => {
          const positionId = getPositionId(p.position);
          if (!positionId) return null;

          // 예산에서 콤마 제거하고 숫자로 변환
          const budget = p.budget ? parseInt(p.budget.replace(/,/g, ''), 10) : undefined;

          return {
            positionId,
            budget: budget && budget > 0 ? budget : undefined,
          };
        })
        .filter((p) => p !== null) as Array<{ positionId: number; budget?: number }>;

      // 카테고리는 첫 번째 포지션의 카테고리 사용
      const category = positions.length > 0 ? positions[0].category : undefined;

      // districtCode: 오프라인일 경우 district code 사용
      let districtCode: string | undefined;
      if (locationType === 'offline' && province && district) {
        const selectedProvince = PROVINCES.find((p) => p.name === province);
        if (selectedProvince) {
          const selectedDistrict = DISTRICTS[selectedProvince.code]?.find(
            (d) => d.name === district,
          );
          if (selectedDistrict) {
            districtCode = selectedDistrict.code;
          }
        }
      }

      // applyDeadline 변환
      const applyDeadline = deadline && deadlineTime
        ? combineDateAndTimeToISO(deadline, deadlineTime)
        : undefined;

      const requestData: DescribeProjectRequest = {
        title: title.trim(),
        summary: summary.trim(),
        startAt,
        endAt,
        ...(districtCode && { districtCode }),
        ...(requestPositions.length > 0 && { positions: requestPositions }),
        ...(category && { category }),
        ...(applyDeadline && { applyDeadline }),
      };

      console.log('📤 AI 프로젝트 설명 생성 요청:', requestData);

      const response = await describeProject(requestData);
      setDescription(response.description);

      console.log('✅ AI 프로젝트 설명 생성 성공');
    } catch (error: any) {
      console.error('❌ AI 설명 생성 실패:', error);
      console.error('❌ 에러 응답:', error.response?.data);
      console.error('❌ 에러 상태:', error.response?.status);
      alert(error.response?.data?.message || '설명 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setShowAiLoadingModal(false);
      setIsGeneratingDescription(false);
    }
  };

  return (
    <div className="mx-auto min-h-screen max-w-[1200px] px-8 font-pretendard">
      {/* 헤더 */}
      <div className="mb-8 flex items-start gap-4">
        <button
          onClick={handleBack}
          className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-moas-gray-1"
        >
          <ArrowLeft className="h-6 w-6 text-moas-text" />
        </button>
        <div>
          <h1 className="mb-2 text-[32px] font-bold leading-none text-moas-text">
            {mode === 'create' ? '프로젝트 등록' : '프로젝트 수정'}
          </h1>
          <p className="text-[16px] font-medium text-moas-gray-6">
            {mode === 'create'
              ? '새로운 프로젝트를 등록하고 함께할 아티스트를 찾아보세요.'
              : '프로젝트 정보를 수정하세요.'}
          </p>
        </div>
      </div>


      {/* 모집 마감일 */}
      <section className="mb-8" id="deadline">
        <label className="mb-2 block text-[24px] font-bold text-moas-text">모집 마감일</label>
        <p className="mb-4 text-[14px] text-moas-gray-6">시간은 1시간 단위로 선택 가능합니다.</p>
        <div className="flex flex-col">
          <div className="flex gap-2">
            <DatePicker
              date={deadline}
              onSelect={(date) => setDeadline(date)}
              minDate={getMinDate()}
              placeholder="마감 날짜"
              error={getDeadlineError()}
              className="flex-1"
            />
            <TimePicker
              value={deadlineTime}
              onSelect={(time) => setDeadlineTime(time)}
              disabled={disabledDeadlineHours}
              placeholder="시간"
              error={getDeadlineError()}
              className="w-[140px]"
            />
          </div>
          {getDeadlineError() && (
            <p className="mt-2 text-[14px] text-moas-error">{deadlineError}</p>
          )}
        </div>
      </section>


      {/* 프로젝트 기간 */}
      <section className="mb-8">
        <label className="mb-2 block text-[24px] font-bold text-moas-text">프로젝트 기간</label>
        <p className="mb-4 text-[14px] text-moas-gray-6">시간은 1시간 단위로 선택 가능합니다.</p>
        <div className="flex flex-col md:flex-row items-start gap-2">
          {/* 시작 날짜와 시간 */}
          <div className="flex flex-col" id="startDate">
            <div className="flex gap-2">
              <DatePicker
                date={startDate}
                onSelect={(date) => setStartDate(date)}
                minDate={deadline || getMinDate()}
                placeholder="시작 날짜"
                error={getStartDateError()}
                className="flex-1"
              />
              <TimePicker
                value={startTime}
                onSelect={(time) => setStartTime(time)}
                disabled={disabledStartHours}
                placeholder="시간"
                error={getStartDateError()}
                className="w-[140px]"
              />
              <span className="mt-3 text-[18px] text-moas-gray-6"> ~</span>
            </div>
            {getStartDateError() && (
              <p className="mt-2 text-[14px] text-moas-error">{startDateError}</p>
            )}
          </div>

          {/* 종료 날짜와 시간 */}
          <div className="flex flex-col" id="endDate">
            <div className="flex gap-2">
              <DatePicker
                date={endDate}
                onSelect={(date) => setEndDate(date)}
                minDate={getProjectEndMinDate()}
                placeholder="종료 날짜"
                error={getEndDateError()}
                className="flex-1"
              />
              <TimePicker
                value={endTime}
                onSelect={(time) => setEndTime(time)}
                disabled={disabledEndHours}
                placeholder="시간"
                error={getEndDateError()}
                className="w-[140px]"
              />
            </div>
            {getEndDateError() && (
              <p className="mt-2 text-[14px] text-moas-error">{endDateError}</p>
            )}
          </div>
        </div>
      </section>

      {/* 제목 */}
      <section className="mb-8" id="title">
        <label className="mb-2 block text-[24px] font-bold text-moas-text">제목</label>
        <div className="relative">
          <Input
            type="text"
            placeholder="프로젝트 제목을 입력하세요 (최대 30자)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`h-[56px] border-2 ${
              getTitleError()
                ? 'animate-shake border-moas-error'
                : submitted && isTitleValid
                  ? 'border-moas-state-1'
                  : 'border-moas-gray-3'
            }`}
            maxLength={30}
          />
          {submitted && isTitleValid && (
            <CheckCircle className="absolute right-13 top-1/2 h-5 w-5 -translate-y-1/2 text-moas-state-1" />
          )}
          {getTitleError() && (
            <XCircle className="absolute right-13 top-1/2 h-5 w-5 -translate-y-1/2 text-moas-error" />
          )}
          <span
            className={`absolute right-4 top-1/2 -translate-y-1/2 text-[14px] ${
              getTitleError()
                ? 'text-moas-error'
                : submitted && isTitleValid
                  ? 'text-moas-state-1'
                  : 'text-moas-gray-5'
            }`}
          >
            {title.length}/30
          </span>
        </div>
      </section>

      {/* 요약 */}
      <section className="mb-8" id="summary">
        <label className="mb-2 block text-[24px] font-bold text-moas-text">요약</label>
        <div className="relative">
          <Input
            type="text"
            placeholder="프로젝트를 한 줄로 요약해주세요 (최대 100자)"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className={`h-[56px] border-2 ${
              getSummaryError()
                ? 'animate-shake border-moas-error'
                : submitted && isSummaryValid
                  ? 'border-moas-state-1'
                  : 'border-moas-gray-3'
            }`}
            maxLength={100}
          />
          {submitted && isSummaryValid && (
            <CheckCircle className="absolute right-14 top-1/2 h-5 w-5 -translate-y-1/2 text-moas-state-1" />
          )}
          {getSummaryError() && (
            <XCircle className="absolute right-14 top-1/2 h-5 w-5 -translate-y-1/2 text-moas-error" />
          )}
          <span
            className={`absolute right-4 top-1/2 -translate-y-1/2 text-[14px] ${
              getSummaryError()
                ? 'text-moas-error'
                : submitted && isSummaryValid
                  ? 'text-moas-state-1'
                  : 'text-moas-gray-5'
            }`}
          >
            {summary.length}/100
          </span>
        </div>
      </section>

      {/* 모집 포지션 */}
      <section className="mb-8">
        <label className="mb-2 block text-[24px] font-bold text-moas-text">모집 포지션</label>
        <p className="mb-6 text-[16px] font-medium text-moas-gray-6">
          최소 1개 이상의 포지션을 등록해야 합니다.
        </p>

        {positions.map((position, index) => (
          <div key={position.id} className="mb-6">
            <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4">
              {/* 분야 */}
              <div id={`position-${index}-category`}>
                <label className="mb-2 block text-[16px] font-semibold text-moas-text">분야</label>
                <button
                  type="button"
                  onClick={() => openCategoryModal(position.id)}
                  className={`h-[48px] w-full rounded-xl border bg-white px-4 text-left text-[15px] transition-all ${
                    submitted && !position.category
                      ? 'animate-shake border-2 border-moas-error'
                      : submitted && position.category
                        ? 'border-2 border-moas-state-1'
                        : 'border border-moas-gray-3 hover:border-moas-gray-4'
                  } ${!position.category ? 'text-moas-gray-5' : 'text-moas-text'}`}
                >
                  {position.category || '분야 선택'}
                </button>
              </div>

              {/* 포지션 */}
              <div id={`position-${index}-position`}>
                <label className="mb-2 block text-[16px] font-semibold text-moas-text">
                  포지션
                </label>
                <button
                  type="button"
                  onClick={() => openPositionModal(position.id)}
                  disabled={!position.category}
                  className={`h-[48px] w-full rounded-xl border bg-white px-4 text-left text-[15px] transition-all disabled:bg-moas-gray-1 disabled:text-moas-gray-5 ${
                    submitted && !position.position
                      ? 'animate-shake border-2 border-moas-error'
                      : submitted && position.position
                        ? 'border-2 border-moas-state-1'
                        : 'border border-moas-gray-3 hover:border-moas-gray-4'
                  } ${!position.position ? 'text-moas-gray-5' : 'text-moas-text'}`}
                >
                  {position.position || '포지션 선택'}
                </button>
              </div>

              {/* 예산 */}
              <div id={`position-${index}-budget`}>
                <label className="mb-2 block text-[16px] font-semibold text-moas-text">예산</label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="예산 (원)"
                    value={position.budget}
                    onChange={(e) => handleBudgetChange(position.id, e.target.value)}
                    className={`h-[48px] ${
                      (submitted && !position.budget) || budgetRangeErrors[position.id] || invalidBudgetInputs[position.id]
                        ? 'animate-shake !border-2 !border-moas-error'
                        : submitted && position.budget && !budgetRangeErrors[position.id]
                          ? 'border-2 border-moas-state-1'
                          : ''
                    }`}
                  />
                  {submitted && position.budget && !budgetRangeErrors[position.id] && !invalidBudgetInputs[position.id] && (
                    <CheckCircle className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-moas-state-1" />
                  )}
                </div>
                {/* 예산 범위 에러 메시지 */}
                {(budgetRangeErrors[position.id] || invalidBudgetInputs[position.id]) && (
                  <p className="mt-1 text-[12px] text-moas-error">
                    {budgetRangeErrors[position.id] || '숫자만 입력할 수 있습니다'}
                  </p>
                )}
              </div>

              {/* 삭제 버튼 */}
              {positions.length > 1 && (
                <div className="flex items-end pb-[2px]">
                  <button
                    type="button"
                    onClick={() => handleRemovePosition(position.id)}
                    className="flex h-[48px] w-[48px] items-center justify-center rounded-xl transition-colors hover:bg-moas-gray-1"
                  >
                    <Trash2 className="h-5 w-5 text-moas-gray-6" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* 포지션 추가 버튼 */}
        <button
          type="button"
          onClick={handleAddPosition}
          className="flex h-[64px] w-full items-center justify-center rounded-xl border-2 border-dashed border-moas-gray-3 text-[16px] font-normal text-moas-gray-4 transition-colors hover:border-moas-gray-4 hover:text-moas-gray-5"
        >
          + 포지션 추가
        </button>
      </section>

      {/* 설명 */}
      <section className="mb-8" id="description">
        <div className="mb-2 flex items-center justify-between">
          <label className="block text-[24px] font-bold text-moas-text">설명</label>
          <button
            type="button"
            onClick={handleGenerateDescription}
            disabled={
              isGeneratingDescription || !title.trim() || !summary.trim() || !startDate || !endDate
            }
            className={`relative flex items-center gap-2 rounded-lg border px-4 py-2 text-[14px] font-medium transition-all duration-200 overflow-hidden ${
              isGeneratingDescription || !title.trim() || !summary.trim() || !startDate || !endDate
                ? 'border-moas-gray-3 bg-white text-moas-gray-5 cursor-not-allowed opacity-50 hover:border-moas-gray-3 hover:bg-white'
                : 'border-moas-main bg-moas-main text-white cursor-pointer hover:bg-moas-main/90 hover:border-moas-main/90 hover:scale-105 hover:shadow-lg hover:shadow-moas-main/50 active:scale-100'
            }`}
          >
            {/* 홀로그램 효과 - 활성화 상태일 때만 표시 */}
            {!isGeneratingDescription && title.trim() && summary.trim() && startDate && endDate && (
              <>
                <div className="hologram-rainbow" />
                <div className="hologram-effect" />
              </>
            )}
            <span className="relative z-10 flex items-center gap-2">
              {isGeneratingDescription ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>생성 중...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>AI로 설명 작성</span>
                </>
              )}
            </span>
          </button>
        </div>
        <div className="relative">
          <div className={`${
            getDescriptionError()
              ? 'animate-shake ring-2 ring-moas-error rounded-xl'
              : submitted && isDescriptionValid
                ? 'ring-2 ring-moas-state-1 rounded-xl'
                : ''
          }`}>
            <MarkdownEditor
              value={description}
              onChange={(value) => setDescription(value)}
              placeholder="프로젝트 내용을 작성해주세요 (최대 10000자)"
              height="500px"
            />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {submitted && isDescriptionValid && (
                <div className="flex items-center gap-1 text-moas-state-1">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-[14px]">작성 완료</span>
                </div>
              )}
              {getDescriptionError() && (
                <div className="flex items-center gap-1 text-moas-error">
                  <XCircle className="h-4 w-4" />
                  <span className="text-[14px]">설명을 입력해주세요</span>
                </div>
              )}
            </div>
            <span
              className={`text-[14px] ${
                getDescriptionError()
                  ? 'text-moas-error'
                  : submitted && isDescriptionValid
                    ? 'text-moas-state-1'
                    : 'text-moas-gray-5'
              }`}
            >
              {description.length}/10000
            </span>
          </div>
        </div>
      </section>

      {/* 장소 */}
      <section className="mb-8">
        <label className="mb-2 block text-[24px] font-bold text-moas-text">장소</label>
        <div className="mb-4 flex gap-3">
          <button
            type="button"
            onClick={() => setLocationType('online')}
            className={`h-[48px] flex-1 rounded-xl border-2 text-[16px] font-medium transition-all ${
              locationType === 'online'
                ? 'border-moas-main bg-moas-main text-moas-text'
                : 'border-moas-gray-3 bg-white text-moas-gray-6 hover:border-moas-gray-4'
            }`}
          >
            온라인
          </button>
          <button
            type="button"
            onClick={() => setLocationType('offline')}
            className={`h-[48px] flex-1 rounded-xl border-2 text-[16px] font-medium transition-all ${
              locationType === 'offline'
                ? 'border-moas-main bg-moas-main text-moas-text'
                : 'border-moas-gray-3 bg-white text-moas-gray-6 hover:border-moas-gray-4'
            }`}
          >
            오프라인
          </button>
        </div>
      </section>

      {/* 시/도 */}
      {locationType === 'offline' && (
        <section className="mb-8">
          <label className="mb-2 block text-[24px] font-bold text-moas-text">시/도</label>
          <div className="grid grid-cols-2 gap-4">
            <div id="province">
              <button
                type="button"
                onClick={openProvinceModal}
                className={`h-[48px] w-full rounded-xl border bg-white px-4 text-left text-[15px] transition-all ${
                  submitted && !province
                    ? 'animate-shake border-2 border-moas-error'
                    : submitted && province
                      ? 'border-2 border-moas-state-1'
                      : 'border border-moas-gray-3 hover:border-moas-gray-4'
                } ${!province ? 'text-moas-gray-5' : 'text-moas-text'}`}
              >
                {province || '시/도를 선택하세요'}
              </button>
            </div>
            <div id="district">
              <button
                type="button"
                onClick={openDistrictModal}
                disabled={!province}
                className={`h-[48px] w-full rounded-xl border bg-white px-4 text-left text-[15px] transition-all disabled:bg-moas-gray-1 disabled:text-moas-gray-5 ${
                  submitted && !district
                    ? 'animate-shake border-2 border-moas-error'
                    : submitted && district
                      ? 'border-2 border-moas-state-1'
                      : 'border border-moas-gray-3 hover:border-moas-gray-4'
                } ${!district ? 'text-moas-gray-5' : 'text-moas-text'}`}
              >
                {district || '구/군을 선택하세요'}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 대표 이미지 */}
      <section className="mb-8" id="thumbnail">
        <label className="mb-2 block text-[24px] font-bold text-moas-text">대표 이미지</label>
        <p className="mb-4 text-[14px] text-moas-gray-6">이미지는 4:3 비율로 크롭됩니다.</p>
        {thumbnailPreview ? (
          <div className="space-y-4">
            <div
              className="relative mx-auto max-w-[600px] overflow-hidden rounded-xl"
              style={{ aspectRatio: '4/3' }}
            >
              <img
                src={thumbnailPreview}
                alt="썸네일 미리보기"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="mx-auto flex max-w-[600px] items-center justify-between rounded-xl border border-moas-gray-3 bg-white px-4 py-3">
              <p className="text-[14px] font-medium text-moas-text">
                {thumbnail?.name ||
                  (initialData?.thumbnailUrl
                    ? decodeURIComponent(initialData.thumbnailUrl)
                        .split('/').pop()!
                        .replace(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}_/i, '')
                        .replace(/_cropped\.(jpg|jpeg|png|gif|webp)$/i, '.$1')
                    : '기존 이미지')}
              </p>
              <Button
                onClick={() => document.getElementById('thumbnail-upload')?.click()}
                className="h-[36px] rounded-lg bg-moas-gray-3 px-4 text-[14px] font-medium text-moas-text hover:bg-moas-gray-4"
              >
                변경하기
              </Button>
            </div>
          </div>
        ) : (
          <div
            className={`flex h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all ${
              isDragging
                ? 'border-moas-main bg-moas-main/5 scale-[1.02]'
                : submitted && !thumbnail
                  ? 'animate-shake border-moas-error'
                  : submitted && thumbnail
                    ? 'border-moas-state-1'
                    : 'border-moas-gray-3 hover:border-moas-gray-4'
            }`}
            onClick={() => document.getElementById('thumbnail-upload')?.click()}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <img
              src={imageIcon}
              alt="이미지 업로드"
              className={`pointer-events-none mb-4 h-16 w-16 transition-opacity ${isDragging ? 'opacity-60' : 'opacity-40'}`}
            />
            <p className={`pointer-events-none mb-2 text-[16px] font-medium transition-colors ${
              isDragging ? 'text-moas-main' : 'text-moas-gray-6'
            }`}>
              {isDragging ? '파일을 놓으세요' : '클릭하거나 파일을 드래그해서 업로드하세요'}
            </p>
            <p className="pointer-events-none text-[14px] text-moas-gray-5">JPG, PNG 파일만 업로드 가능 (최대 10MB)</p>
          </div>
        )}
        <input
          id="thumbnail-upload"
          type="file"
          accept="image/jpeg,image/png"
          onChange={handleThumbnailChange}
          className="hidden"
        />
      </section>

      {/* 버튼 영역 */}
      <div className="flex justify-center gap-4">
        {mode === 'edit' && onCancel && (
          <Button
            onClick={onCancel}
            className="h-[56px] w-[200px] rounded-xl bg-moas-gray-3 text-[18px] font-bold text-moas-text hover:bg-moas-gray-4"
          >
            취소
          </Button>
        )}
        <Button
          onClick={handleFormSubmit}
          className="h-[56px] w-[200px] rounded-xl bg-moas-main text-[18px] font-bold text-moas-text hover:bg-moas-main/90"
        >
          {mode === 'create' ? '등록' : '저장'}
        </Button>
      </div>

      {/* Select Modal */}
      {openModal === 'category' && activePositionId && (
        <SelectModal
          title="분야 선택"
          options={categoryOptions}
          selectedValue={positions.find((p) => p.id === activePositionId)?.category || ''}
          onSelect={handleModalSelect}
          onClose={() => setOpenModal(null)}
        />
      )}

      {openModal === 'position' && activePositionId && (
        <SelectModal
          title="포지션 선택"
          options={getAvailablePositions(
            positions.find((p) => p.id === activePositionId)?.category || '',
          )}
          selectedValue={positions.find((p) => p.id === activePositionId)?.position || ''}
          onSelect={handleModalSelect}
          onClose={() => setOpenModal(null)}
        />
      )}

      {openModal === 'province' && (
        <SelectModal
          title="시/도 선택"
          options={PROVINCES.map((p) => p.name)}
          selectedValue={province}
          onSelect={handleModalSelect}
          onClose={() => setOpenModal(null)}
          autoClose={false}
        />
      )}

      {openModal === 'district' && (
        <SelectModal
          title="구/군 선택"
          options={availableDistricts.map((d) => d.name)}
          selectedValue={district}
          onSelect={handleModalSelect}
          onClose={() => setOpenModal(null)}
        />
      )}

      {/* Image Crop Modal */}
      {showCropModal && originalImageSrc && (
        <ImageCropModal
          imageSrc={originalImageSrc}
          onComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}

      {/* AI 로딩 모달 */}
      {showAiLoadingModal && (
        <AiLoadingModal
          message={
            <>
              AI가 고객님의 요구사항에 맞춰
              <br />
              최적의 프로젝트 설명을 구성 중입니다.
            </>
          }
        />
      )}

      {/* 포지션 삭제 에러 모달 */}
      {showDeleteErrorModal && (
        <ConfirmModal
          message={deleteErrorMessage}
          confirmText="확인"
          onConfirm={() => setShowDeleteErrorModal(false)}
          type="danger"
        />
      )}
    </div>
  );
}

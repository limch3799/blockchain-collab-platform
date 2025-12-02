/**
 * ContractDraftPage
 *
 * Description:
 * 리더가 지원자에게 계약서를 제안하는 페이지
 * - 계약 제목, 상세 설명, 기간, 총 금액 입력
 * - 유효성 검사 및 시각적 피드백
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Sparkles, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';
import { MarkdownEditor } from '@/components/ui/MarkdownEditor';
import { offerContract, updateContract, describeContract } from '@/api/contract';
import type { OfferContractRequest, Contract } from '@/types/contract';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { AiPromptModal } from '@/components/contract/AiPromptModal';
import { AiLoadingModal } from '@/components/contract/AiLoadingModal';

import btcContractImage from '@/assets/img/btc-contract.png';

function ContractDraftPage() {
  // 라우팅 훅
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  // location state에서 데이터 가져오기
  const applicationId = location.state?.applicationId || searchParams.get('applicationId');
  const mode = location.state?.mode as 'create' | 'edit' | undefined;
  const existingContract = location.state?.contract as Contract | undefined;
  const initialProjectPositionId = location.state?.projectPositionId || existingContract?.position?.projectPositionId;

  // 상태 관리
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [endTime, setEndTime] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 실시간 시계 상태 (과거 시간 비활성화를 위한 현재 시간 추적)
  const [currentTime, setCurrentTime] = useState(new Date());

  // 실시간 에러 메시지 상태
  const [startDateError, setStartDateError] = useState('');
  const [endDateError, setEndDateError] = useState('');
  const [amountError, setAmountError] = useState('');
  const [invalidInputDetected, setInvalidInputDetected] = useState(false);

  // AI assistant 상태
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [showAiLoadingModal, setShowAiLoadingModal] = useState(false);
  const projectPositionId = initialProjectPositionId;

  // 모달 상태
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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

  // 현재 최소 시간을 일관되게 반환 (검증 시 사용)
  const getCurrentMinDateTime = (): Date => {
    const now = new Date();
    if (now.getMinutes() > 0) {
      now.setHours(now.getHours() + 1);
    }
    return normalizeToHour(now);
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

  // ISO 문자열을 Date 객체와 시간(HH)으로 분리
  const parseISOToDateAndTime = (isoString: string): { date: Date; time: string } => {
    const date = new Date(isoString);
    const timeHour = String(date.getHours()).padStart(2, '0');
    return { date, time: timeHour };
  };

  // 두 Date가 같은 날인지 확인
  const isSameDate = (date1: Date | undefined, date2: Date | undefined): boolean => {
    if (!date1 || !date2) return false;
    return formatDateToString(date1) === formatDateToString(date2);
  };

  // Date가 오늘인지 확인
  const isToday = (date: Date | undefined): boolean => {
    if (!date) return false;
    const today = new Date();

    // 연/월/일만 직접 비교 (타임존 이슈 방지)
    const result =
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate();

    console.log('🔍 isToday 체크:', {
      inputDate: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
      today: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`,
      result,
    });

    return result;
  };

  // 종료일의 최소 날짜 계산 (시작 시간이 23시면 다음날부터)
  const getEndMinDate = (): Date => {
    if (!startDate) return getMinDate();

    // 시작 시간이 23시인 경우, 종료일은 최소 다음날
    if (startTime === '23') {
      const nextDay = new Date(startDate);
      nextDay.setDate(nextDay.getDate() + 1);
      console.log('📅 종료일 최소 날짜 (23시 선택): 다음날', formatDateToString(nextDay));
      return nextDay;
    }

    // 그 외의 경우 시작일과 같은 날 가능
    return startDate;
  };

  // 시작 날짜가 오늘인 경우, 현재 시간 이전의 시간 비활성화 (useMemo로 최적화)
  const disabledStartHours = useMemo(() => {
    const isTodaySelected = isToday(startDate);

    console.log('🕐 disabledStartHours 계산:', {
      startDate: startDate ? formatDateToString(startDate) : 'null',
      isTodaySelected,
      currentTime: currentTime.toLocaleTimeString('ko-KR'),
    });

    if (!isTodaySelected) {
      console.log('  → 오늘이 아니므로 모든 시간 활성화');
      return Array.from({ length: 24 }, () => false);
    }

    // currentTime을 사용하여 실시간으로 최소 시간 계산
    const now = new Date(currentTime);
    const minutes = now.getMinutes();
    if (minutes > 0) {
      now.setHours(now.getHours() + 1);
    }
    const minHour = now.getHours();
    const disabledArray = Array.from({ length: 24 }, (_, i) => i < minHour);

    console.log('  → 오늘이므로 과거 시간 비활성화:', {
      minHour,
      disabledHours: disabledArray.map((disabled, index) => disabled ? index : null).filter(h => h !== null),
    });

    return disabledArray;
  }, [startDate, currentTime]); // startDate와 currentTime이 변경될 때 재계산

  // 종료 날짜가 시작 날짜와 같은 경우, 시작 시간 이전 비활성화 (useMemo로 최적화)
  const disabledEndHours = useMemo(() => {
    if (!isSameDate(startDate, endDate) || !startTime) {
      return Array.from({ length: 24 }, () => false);
    }

    const startHour = parseInt(startTime);
    return Array.from({ length: 24 }, (_, i) => i <= startHour);
  }, [startDate, endDate, startTime]); // 의존성이 변경될 때만 재계산

  // edit 모드일 때 기존 계약 정보로 폼 초기화
  useEffect(() => {
    if (mode === 'edit' && existingContract) {
      setTitle(existingContract.title);
      setDescription(existingContract.description);

      // ISO datetime을 Date 객체와 시간으로 분리
      const { date: startDateObj, time: startHour } = parseISOToDateAndTime(existingContract.startAt);
      const { date: endDateObj, time: endHour } = parseISOToDateAndTime(existingContract.endAt);

      // 현재 최소 날짜/시간 가져오기
      const minDateTime = getMinDateTime();

      // 시작 날짜/시간이 과거인지 확인
      const startDateTime = new Date(combineDateAndTimeToISO(startDateObj, startHour));

      let adjustedStartDate = startDateObj;
      let adjustedStartTime = startHour;

      if (startDateTime < minDateTime) {
        // 과거라면 현재 시간으로 조정
        adjustedStartDate = minDateTime;
        adjustedStartTime = String(minDateTime.getHours()).padStart(2, '0');
        console.log('⏰ 시작 시간이 과거입니다. 현재 시간으로 조정:', formatDateToString(startDateObj), startHour, '->', formatDateToString(minDateTime), adjustedStartTime);
      }

      // 종료 날짜/시간 조정
      const adjustedStartDateTime = new Date(combineDateAndTimeToISO(adjustedStartDate, adjustedStartTime));
      const endDateTime = new Date(combineDateAndTimeToISO(endDateObj, endHour));

      let adjustedEndDate = endDateObj;
      let adjustedEndTime = endHour;

      if (endDateTime <= adjustedStartDateTime) {
        // 종료 시간이 시작 시간보다 이전이면 시작 시간 + 1시간으로 설정
        const newEndDate = new Date(adjustedStartDateTime);
        newEndDate.setHours(newEndDate.getHours() + 1);

        adjustedEndDate = newEndDate;
        adjustedEndTime = String(newEndDate.getHours()).padStart(2, '0');

        console.log('⏰ 종료 시간이 시작 시간보다 이전입니다. 조정:', formatDateToString(endDateObj), endHour, '->', formatDateToString(adjustedEndDate), adjustedEndTime);
      }

      setStartDate(adjustedStartDate);
      setStartTime(adjustedStartTime);
      setEndDate(adjustedEndDate);
      setEndTime(adjustedEndTime);
      setTotalAmount(formatAmount(existingContract.totalAmount.toString()));
    }
  }, [mode, existingContract]);

  // 실시간 시계 업데이트 (60초마다 현재 시간 갱신)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 60초마다 업데이트

    return () => clearInterval(interval);
  }, []);

  // 뒤로가기
  const handleBack = () => {
    navigate(-1);
  };

  /**
   * 금액 입력값에 천 단위 콤마를 추가
   * @param value - 사용자 입력 문자열
   * @returns 콤마가 추가된 숫자 문자열
   */
  const formatAmount = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '');
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // 금액 변경 핸들러
  const handleAmountChange = (value: string) => {
    // 숫자와 콤마만 추출 (한글/특수문자 제거)
    const cleanValue = value.replace(/[^\d,]/g, '');

    // 원래 값과 다르면 (한글/특수문자가 있었으면) shake 효과
    if (cleanValue !== value) {
      setInvalidInputDetected(true);
      setAmountError(''); // 에러 메시지 초기화
      setTimeout(() => {
        setInvalidInputDetected(false);
      }, 1000);
      return; // 입력 차단 - validateAmount 호출 안 함
    }

    // 정리된 값으로 포맷팅
    const formatted = formatAmount(cleanValue);

    // 1000억 초과 체크
    const numbers = formatted.replace(/,/g, '');
    const amount = parseInt(numbers || '0');
    const isOverLimit = amount > 100000000000;

    // 1000억 초과 시 입력 차단 + 흔들림 + 에러 메시지
    if (isOverLimit) {
      setInvalidInputDetected(true);
      setAmountError('최대 1,000억원까지 입력 가능합니다');
      setTimeout(() => {
        setInvalidInputDetected(false);
      }, 1000);
      return; // 입력 차단
    }

    setTotalAmount(formatted);

    // 실시간 금액 유효성 검사
    validateAmount(formatted);
  };

  /**
   * 시작 날짜/시간 유효성 검사
   * @returns 에러 메시지 (없으면 빈 문자열)
   */
  const validateStartDate = () => {
    // 둘 다 비어있으면 에러 표시 안 함 (초기 상태)
    if (!startDate && !startTime) {
      setStartDateError('');
      return '';
    }

    // 하나만 입력된 경우
    if (!startDate || !startTime) {
      setStartDateError('계약 시작일은 필수입니다');
      return '계약 시작일은 필수입니다';
    }

    // 선택된 날짜/시간을 정규화 (시간 단위로 통일)
    const selectedDateTime = new Date(startDate);
    selectedDateTime.setHours(parseInt(startTime));
    const normalizedSelected = normalizeToHour(selectedDateTime);

    // 현재 최소 시간을 정규화 (밀리초 차이 방지)
    const minDateTime = getCurrentMinDateTime();

    if (normalizedSelected < minDateTime) {
      setStartDateError('계약 시작일은 현재 또는 미래 시점이어야 합니다');
      return '계약 시작일은 현재 또는 미래 시점이어야 합니다';
    }

    setStartDateError('');
    return '';
  };

  /**
   * 종료 날짜/시간 유효성 검사
   * @returns 에러 메시지 (없으면 빈 문자열)
   */
  const validateEndDate = () => {
    // 둘 다 비어있으면 에러 표시 안 함 (초기 상태)
    if (!endDate && !endTime) {
      setEndDateError('');
      return '';
    }

    // 하나만 입력된 경우
    if (!endDate || !endTime) {
      setEndDateError('계약 종료일은 필수입니다');
      return '계약 종료일은 필수입니다';
    }

    // 시작일이 입력되지 않았으면 시작일과의 비교는 생략
    if (!startDate || !startTime) {
      setEndDateError('');
      return '';
    }

    // 시작일과 종료일을 정규화하여 비교 (시간 단위로 통일)
    const startDateTime = new Date(startDate);
    startDateTime.setHours(parseInt(startTime));
    const normalizedStart = normalizeToHour(startDateTime);

    const endDateTime = new Date(endDate);
    endDateTime.setHours(parseInt(endTime));
    const normalizedEnd = normalizeToHour(endDateTime);

    if (normalizedEnd <= normalizedStart) {
      setEndDateError('종료일은 시작일보다 빠를 수 없습니다');
      return '종료일은 시작일보다 빠를 수 없습니다';
    }

    setEndDateError('');
    return '';
  };

  /**
   * 금액 유효성 검사
   * @param value - 검사할 금액 문자열
   * @returns 에러 메시지 (없으면 빈 문자열)
   */
  const validateAmount = (value: string) => {
    if (!value || value.trim() === '') {
      setAmountError('총 계약금액은 필수입니다');
      return '총 계약금액은 필수입니다';
    }

    // 숫자만 추출
    const numbers = value.replace(/,/g, '');

    // 숫자가 아닌 값이 있는지 확인
    if (!/^\d+$/.test(numbers)) {
      setAmountError('올바른 금액을 입력해주세요');
      return '올바른 금액을 입력해주세요';
    }

    const amount = parseInt(numbers);

    if (amount <= 0) {
      setAmountError('총 계약금액은 양수여야 합니다');
      return '총 계약금액은 양수여야 합니다';
    }

    if (amount > 100000000000) {
      setAmountError('최대 1,000억원까지 입력 가능합니다');
      return '최대 1,000억원까지 입력 가능합니다';
    }

    setAmountError('');
    return '';
  };

  // 유효성 검사
  const isTitleValid = title.length > 0 && title.length <= 100;
  const isDescriptionValid = description.length > 0;

  // 에러 상태 헬퍼 (실시간 검증)
  // 사용자가 필드를 입력하기 시작하면 실시간으로 에러 표시
  const getTitleError = () => {
    // 제목을 입력하기 시작했으면 실시간 검증
    if (title.length > 0) {
      return !isTitleValid;
    }
    // 제출 버튼을 눌렀는데 비어있으면 에러 표시
    return submitted && !isTitleValid;
  };

  const getDescriptionError = () => {
    // 설명을 입력하기 시작했으면 실시간 검증
    if (description.length > 0) {
      return !isDescriptionValid;
    }
    // 제출 버튼을 눌렀는데 비어있으면 에러 표시
    return submitted && !isDescriptionValid;
  };

  const getStartDateError = () => {
    // 날짜나 시간 중 하나라도 입력했으면 실시간 검증
    if (startDate || startTime) {
      return startDateError !== '';
    }
    // 제출 버튼을 눌렀는데 비어있으면 에러 표시
    return submitted && startDateError !== '';
  };

  const getEndDateError = () => {
    // 날짜나 시간 중 하나라도 입력했으면 실시간 검증
    if (endDate || endTime) {
      return endDateError !== '';
    }
    // 제출 버튼을 눌렀는데 비어있으면 에러 표시
    return submitted && endDateError !== '';
  };

  // 금액은 첫 입력부터 에러 표시 (단, 빈 값일 때는 에러 미표시)
  const getTotalAmountError = () => {
    if (!totalAmount || totalAmount.trim() === '') {
      return false; // 아직 입력하지 않은 경우 에러 미표시
    }
    return amountError !== '';
  };

  /**
   * 폼 전체의 유효성을 검사
   * @returns 유효성 검사 통과 여부
   */
  const validateForm = () => {
    // 모든 필드 검증 실행
    const startError = validateStartDate();
    const endError = validateEndDate();
    const amountErr = validateAmount(totalAmount);

    return (
      isTitleValid &&
      isDescriptionValid &&
      startError === '' &&
      endError === '' &&
      amountErr === ''
    );
  };

  /**
   * 시작 날짜/시간이 변경될 때: 오늘 날짜이고 선택된 시간이 과거인 경우 자동 조정
   */
  useEffect(() => {
    if (startDate && startTime) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const selectedDate = new Date(startDate);
      selectedDate.setHours(0, 0, 0, 0);

      // 오늘 날짜인 경우에만 시간 검사 및 조정
      if (selectedDate.getTime() === today.getTime()) {
        const minDateTime = getMinDateTime();
        const minHour = minDateTime.getHours();
        const selectedHour = parseInt(startTime);

        // 선택된 시간이 최소 시간보다 작으면 자동 조정
        if (selectedHour < minHour) {
          console.log(`⏰ 과거 시간 자동 조정: ${startTime}:00 → ${String(minHour).padStart(2, '0')}:00`);
          setStartTime(String(minHour).padStart(2, '0'));
          return; // 시간이 자동 조정되면 다음 useEffect에서 검증됨
        }
      }
    }
  }, [startDate, startTime]); // startDate와 startTime 모두 의존 - 둘 다 변경 시 검증

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
        console.log('⏰ 시작 시간 23시 → 종료일 자동 조정:', formatDateToString(nextDay), '00:00');
      }
    }
  }, [startTime, startDate, endDate]);

  /**
   * 시작 날짜/시간 변경 시 자동 검증
   * - 시작 날짜/시간 검증
   * - 종료 날짜/시간 검증 (시작일에 영향받음)
   */
  useEffect(() => {
    if (startDate && startTime) {
      validateStartDate();
      validateEndDate(); // 시작일 변경 시 종료일도 영향받음
    }
  }, [startDate, startTime]);

  /**
   * 종료 날짜/시간 변경 시 자동 검증
   * - 종료 날짜/시간 검증
   */
  useEffect(() => {
    if (endDate && endTime) {
      validateEndDate();
    }
  }, [endDate, endTime, startDate, startTime]); // startDate, startTime도 의존성에 포함 (비교 대상)

  /**
   * AI assistant를 사용하여 계약서 설명 자동 생성
   */
  const handleGenerateDescription = () => {
    // 필수 필드 검증
    if (!title.trim()) {
      alert('계약명을 먼저 입력해주세요.');
      return;
    }
    if (!startDate || !startTime) {
      alert('계약 시작일을 먼저 선택해주세요.');
      return;
    }
    if (!endDate || !endTime) {
      alert('계약 종료일을 먼저 선택해주세요.');
      return;
    }
    if (!totalAmount || totalAmount.trim() === '') {
      alert('총 금액을 먼저 입력해주세요.');
      return;
    }

    // 프롬프트 입력 모달 열기
    setShowPromptModal(true);
  };

  /**
   * AI 프롬프트 확인 시 실제 API 호출
   */
  const handlePromptConfirm = async (prompt: string) => {
    setShowPromptModal(false);
    setShowAiLoadingModal(true);
    setIsGeneratingDescription(true);

    try {
      const startAt = combineDateAndTimeToISO(startDate!, startTime);
      const endAt = combineDateAndTimeToISO(endDate!, endTime);
      const amount = parseInt(totalAmount.replace(/,/g, ''));

      // projectPositionId 확인
      if (!projectPositionId) {
        throw new Error('프로젝트 포지션 정보를 찾을 수 없습니다.');
      }

      // 계약서 AI API 호출
      const requestData = {
        projectPositionId,
        title: title.trim(),
        totalAmount: amount,
        startAt,
        endAt,
        additionalDetails: prompt || undefined,
      };

      console.log('📤 AI 계약서 생성 요청:', requestData);

      const response = await describeContract(requestData);

      console.log('📥 AI 계약서 생성 응답 (전체):', response);
      console.log('📥 description 필드만:', response.description);

      // 백엔드가 description에 JSON 문자열을 감싸서 보내는 경우 처리
      let actualDescription = response.description;

      // "아래는 AI가 생성한..." 으로 시작하는 경우, JSON 파싱 시도
      if (actualDescription.includes('{') && actualDescription.includes('"description"')) {
        try {
          // JSON 부분만 추출
          const jsonStart = actualDescription.indexOf('{');
          const jsonEnd = actualDescription.lastIndexOf('}') + 1;
          const jsonString = actualDescription.substring(jsonStart, jsonEnd);

          const parsed = JSON.parse(jsonString);
          if (parsed.description) {
            actualDescription = parsed.description;
            console.log('✅ JSON 파싱 성공, description 추출:', actualDescription.substring(0, 100) + '...');
          }
        } catch (e) {
          console.warn('⚠️ JSON 파싱 실패, 원본 그대로 사용:', e);
        }
      }

      // 백엔드에서 받은 \n 문자를 실제 줄바꿈으로 변환
      setDescription(actualDescription.replace(/\\n/g, '\n'));

      console.log('✅ AI 계약서 생성 성공');
    } catch (error: any) {
      console.error('❌ AI 설명 생성 실패:', error);
      console.error('❌ 에러 응답:', error.response?.data);
      console.error('❌ 에러 상태:', error.response?.status);
      console.error('❌ 요청 데이터:', {
        projectPositionId,
        title: title.trim(),
        totalAmount: parseInt(totalAmount.replace(/,/g, '')),
        startAt: combineDateAndTimeToISO(startDate!, startTime),
        endAt: combineDateAndTimeToISO(endDate!, endTime),
      });
      alert(error.response?.data?.message || '설명 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setShowAiLoadingModal(false);
      setIsGeneratingDescription(false);
    }
  };

  /**
   * AI 프롬프트 취소
   */
  const handlePromptCancel = () => {
    setShowPromptModal(false);
  };

  // 폼 제출
  const handleSubmit = async () => {
    setSubmitted(true);

    if (!validateForm()) {
      return;
    }

    // edit 모드: 계약서 재작성 (수정)
    if (mode === 'edit' && existingContract) {
      try {
        setIsSubmitting(true);

        const updateData = {
          description,
          startAt: startDate && startTime ? combineDateAndTimeToISO(startDate, startTime) : '',
          endAt: endDate && endTime ? combineDateAndTimeToISO(endDate, endTime) : '',
          totalAmount: parseInt(totalAmount.replace(/,/g, '')),
        };

        console.log('📤 계약서 수정 요청:', {
          contractId: existingContract.contractId,
          updateData,
        });

        const response = await updateContract(existingContract.contractId, updateData);

        console.log('✅ 계약서 수정 성공:', response);

        setShowSuccessModal(true);
      } catch (error: any) {
        console.error('❌ 계약서 수정 실패:', error);
        console.error('❌ 에러 응답:', error.response?.data);
        console.error('❌ 에러 상태:', error.response?.status);

        if (error.response) {
          const { status, data } = error.response;

          switch (status) {
            case 400:
              setErrorMessage(data?.message || '입력 값이 올바르지 않습니다. 다시 확인해주세요.');
              break;
            case 401:
              setErrorMessage('로그인이 만료되었습니다. 다시 로그인해주세요.');
              break;
            case 403:
              setErrorMessage('해당 계약의 리더만 수정할 수 있습니다.');
              break;
            case 404:
              setErrorMessage('계약을 찾을 수 없습니다.');
              break;
            case 409:
              setErrorMessage(data?.message || '계약이 수정 가능한 상태가 아닙니다.');
              break;
            default:
              setErrorMessage('계약서 수정에 실패했습니다. 잠시 후 다시 시도해주세요.');
          }
        } else {
          setErrorMessage('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
        setShowErrorModal(true);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // create 모드: 신규 계약서 제출
    if (!applicationId) {
      setErrorMessage('지원서 ID가 없습니다.');
      setShowErrorModal(true);
      return;
    }

    // API 호출 준비
    const contractData: OfferContractRequest = {
      title,
      description,
      startAt: startDate && startTime ? combineDateAndTimeToISO(startDate, startTime) : '',
      endAt: endDate && endTime ? combineDateAndTimeToISO(endDate, endTime) : '',
      totalAmount: parseInt(totalAmount.replace(/,/g, '')),
    };

    try {
      setIsSubmitting(true);

      // 디버깅: 요청 데이터 출력
      console.log('📤 계약서 제출 요청:', {
        applicationId: Number(applicationId),
        contractData,
      });

      // API 호출
      const response = await offerContract(Number(applicationId), contractData);

      console.log('✅ 계약서 제출 성공:', response);

      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('❌ 계약서 제출 실패:', error);
      console.error('❌ 에러 응답:', error.response?.data);
      console.error('❌ 에러 상태:', error.response?.status);

      // 에러 메시지 처리
      if (error.response) {
        const { status, data } = error.response;

        switch (status) {
          case 400:
            setErrorMessage(data?.message || '입력 값이 올바르지 않습니다. 다시 확인해주세요.');
            break;
          case 401:
            setErrorMessage('로그인이 만료되었습니다. 다시 로그인해주세요.');
            break;
          case 403:
            setErrorMessage('해당 프로젝트의 리더만 계약서를 제시할 수 있습니다.');
            break;
          case 404:
            setErrorMessage('지원서를 찾을 수 없습니다.');
            break;
          case 409:
            setErrorMessage(data?.message || '이미 처리된 지원서입니다.\n대기중인 지원서에만 계약을 제시할 수 있습니다.');
            break;
          default:
            setErrorMessage('계약서 제출에 실패했습니다. 잠시 후 다시 시도해주세요.');
        }
      } else {
        setErrorMessage('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto min-h-screen max-w-[1200px] px-8 font-pretendard">
      {/* 헤더 */}
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-moas-gray-1"
          >
            <ArrowLeft className="h-6 w-6 text-moas-text" />
          </button>
          <div>
            <h1 className="mb-2 text-[48px] font-bold leading-none text-moas-text">
              {mode === 'edit' ? '계약서 재작성' : '계약서 작성'}
            </h1>
            <p className="text-[18px] font-medium leading-relaxed text-moas-gray-6">
              {mode === 'edit'
                ? '수정된 계약 내용을 작성해주세요.'
                : '지원자에게 제안할 계약 내용을 작성해주세요.'}
            </p>
          </div>
        </div>
        <img src={btcContractImage} alt="계약서" className="h-[150px] w-auto mr-12 animate-float" />
      </div>

      {/* 계약 기간 */}
      <section className="mb-8">
        <div className="space-y-1 mb-3">
          <label className="block text-[24px] font-bold text-moas-text leading-tight">계약 기간</label>
          <p className="text-[14px] text-moas-gray-6 leading-snug">시간은 1시간 단위로 선택 가능합니다.</p>
        </div>
        <div className="flex flex-col md:flex-row items-start gap-4">
          {/* 시작 날짜와 시간 */}
          <div className="flex flex-col" id="startDate">
            <div className="flex gap-2">
              <DatePicker
                date={startDate}
                onSelect={(date) => {
                  setStartDate(date);
                }}
                minDate={getMinDate()}
                placeholder="시작 날짜"
                error={getStartDateError()}
                className="flex-1"
              />
              <TimePicker
                value={startTime}
                onSelect={(time) => {
                  console.log('⏰ 시작 시간 선택:', time);
                  setStartTime(time);
                }}
                disabled={disabledStartHours}
                placeholder="시간"
                error={getStartDateError()}
                className="w-[140px]"
              />
              <span className="mt-3 text-[18px] text-moas-gray-6">ㅤ~</span>
            </div>
            {/* 시작 날짜 에러 메시지 */}
            {getStartDateError() && (
              <p className="mt-2 text-[14px] text-moas-error">{startDateError}</p>
            )}
          </div>

          

          {/* 종료 날짜와 시간 */}
          <div className="flex flex-col" id="endDate">
            <div className="flex gap-2">
              <DatePicker
                date={endDate}
                onSelect={(date) => {
                  setEndDate(date);
                }}
                minDate={getEndMinDate()}
                placeholder="종료 날짜"
                error={getEndDateError()}
                className="flex-1"
              />
              <TimePicker
                value={endTime}
                onSelect={(time) => {
                  setEndTime(time);
                }}
                disabled={disabledEndHours}
                placeholder="시간"
                error={getEndDateError()}
                className="w-[140px]"
              />
            </div>
            {/* 종료 날짜 에러 메시지 */}
            {getEndDateError() && (
              <p className="mt-2 text-[14px] text-moas-error">{endDateError}</p>
            )}
          </div>
        </div>
      </section>

      {/* 총 금액 */}
      <section className="mb-12" id="totalAmount">
        <label className="mb-2 block text-[24px] font-bold text-moas-text">총 금액</label>
        <div className="relative">
          <Input
            type="text"
            placeholder="총 금액 (원)"
            value={totalAmount}
            onChange={(e) => handleAmountChange(e.target.value)}
            className={`h-[56px] border-2 ${
              getTotalAmountError() || invalidInputDetected
                ? 'animate-shake !border-moas-error'
                : totalAmount && !amountError
                  ? 'border-moas-state-1'
                  : 'border-moas-gray-3'
            }`}
          />
          {totalAmount && !amountError && !invalidInputDetected && (
            <CheckCircle className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-moas-state-1" />
          )}
        </div>
        {/* 금액 에러 메시지 */}
        {(getTotalAmountError() || invalidInputDetected) && (
          <p className="mt-2 text-[14px] text-moas-error">
            {amountError || '숫자만 입력할 수 있습니다'}
          </p>
        )}
      </section>

      {/* 계약명 */}
      <section className="mb-8" id="title">
        <div className="space-y-1 mb-3">
          <label className="block text-[24px] font-bold text-moas-text leading-tight">계약명</label>
          <p className="text-[14px] text-moas-gray-6 leading-snug">계약명은 수정할 수 없습니다. </p>
        </div>
        {mode === 'edit' }
        <div className="relative mb-2">
          <Input
            type="text"
            placeholder="계약명을 입력하세요. (최대 100자)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={mode === 'edit'}
            className={`h-[56px] border-2 ${
              mode === 'edit'
                ? 'cursor-not-allowed bg-moas-gray-1'
                : getTitleError()
                  ? 'animate-shake border-moas-error'
                  : submitted && isTitleValid
                    ? 'border-moas-state-1'
                    : 'border-moas-gray-3'
            }`}
            maxLength={100}
          />
          {submitted && isTitleValid && !mode && (
            <CheckCircle className="absolute right-14 top-1/2 h-5 w-5 -translate-y-1/2 text-moas-state-1" />
          )}
          {mode !== 'edit' && (
            <span
              className={`absolute right-4 top-1/2 -translate-y-1/2 text-[14px] ${
                getTitleError()
                  ? 'text-moas-error'
                  : submitted && isTitleValid
                    ? 'text-moas-state-1'
                    : 'text-moas-gray-5'
              }`}
            >
              {title.length}/100
            </span>
          )}
        </div>
        {/* 제목 에러 메시지 */}
        {getTitleError() && mode !== 'edit' && (
          <p className="mt-2 text-[14px] text-moas-error">계약명은 필수입니다</p>
        )}
      </section>

      {/* 상세 설명 */}
      <section className="mb-8" id="description">
        <div className="mb-2 flex items-center justify-between">
          <label className="block text-[24px] font-bold text-moas-text">상세 설명</label>
          <button
            type="button"
            onClick={handleGenerateDescription}
            disabled={
              isGeneratingDescription ||
              !projectPositionId ||
              !title.trim() ||
              !startDate ||
              !endDate ||
              !totalAmount
            }
            className={`relative flex items-center gap-2 rounded-lg border px-4 py-2 text-[14px] font-medium transition-all duration-200 overflow-hidden ${
              isGeneratingDescription || !projectPositionId || !title.trim() || !startDate || !endDate || !totalAmount
                ? 'border-moas-gray-3 bg-white text-moas-gray-5 cursor-not-allowed opacity-50 hover:border-moas-gray-3 hover:bg-white'
                : 'border-moas-main bg-moas-main text-white cursor-pointer hover:bg-moas-main/90 hover:border-moas-main/90 hover:scale-105 hover:shadow-lg hover:shadow-moas-main/50 active:scale-100'
            }`}
          >
            {/* 홀로그램 효과 - 활성화 상태일 때만 표시 */}
            {!isGeneratingDescription && projectPositionId && title.trim() && startDate && endDate && totalAmount && (
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
              placeholder="계약의 주요 조건과 세부 내용을 작성해주세요.&#10;(예: 작업 범위, 일정, 지급 방식, 수정 조건 등)"
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
                  <span className="text-[14px]">계약 상세 설명은 필수입니다</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 버튼 영역 */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={handleBack}
          disabled={isSubmitting}
          className="h-[56px] w-[200px] rounded-xl bg-moas-gray-3 text-[18px] font-bold text-moas-text hover:bg-moas-gray-4 disabled:cursor-not-allowed disabled:opacity-50"
        >
          취소
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="h-[56px] w-[200px] rounded-xl bg-moas-main text-[18px] font-bold text-moas-text hover:bg-moas-main/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (mode === 'edit' ? '계약서 수정 중...' : '계약서 작성 중...') : mode === 'edit' ? '계약서 수정' : '계약서 작성'}
        </Button>
      </div>

      {/* 성공 모달 */}
      {showSuccessModal && (
        <ConfirmModal
          message={
            mode === 'edit'
              ? '계약서가 성공적으로 재제시되었습니다.\n아티스트의 응답을 기다려주세요.'
              : '계약서가 성공적으로 제출되었습니다.'
          }
          confirmText="확인"
          onConfirm={() => {
            setShowSuccessModal(false);
            navigate(-1);
          }}
        />
      )}

      {/* 에러 모달 */}
      {showErrorModal && (
        <ConfirmModal
          message={errorMessage}
          confirmText="확인"
          onConfirm={() => {
            setShowErrorModal(false);
            setErrorMessage('');
          }}
          type="danger"
        />
      )}

      {/* AI 프롬프트 입력 모달 */}
      {showPromptModal && (
        <AiPromptModal
          onConfirm={handlePromptConfirm}
          onCancel={handlePromptCancel}
        />
      )}

      {/* AI 로딩 모달 */}
      {showAiLoadingModal && <AiLoadingModal />}
    </div>
  );
}

export default ContractDraftPage;

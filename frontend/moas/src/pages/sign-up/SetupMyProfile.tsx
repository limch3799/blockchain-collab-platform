// src/pages/setup-my-profile/SetupMyProfile.tsx

import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, Upload, X, Check } from 'lucide-react';
import { updateMemberProfile, authAPI } from '@/api/auth';
import { useMemberStore } from '@/store/memberStore';

export default function SetupMyProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { memberInfo } = useMemberStore();
  const isEditMode = location.pathname.includes('setup-profile');

  // 초기값 설정 (수정 모드일 때 기존 정보 사용)
  const initialNickname =
    isEditMode && memberInfo ? memberInfo.nickname : (location.state as any)?.nickname || '';
  const initialBiography =
    isEditMode && memberInfo ? memberInfo.biography : (location.state as any)?.biography || '';
  const initialPhoneNumber = isEditMode && memberInfo?.phoneNumber ? memberInfo.phoneNumber : '';
  const initialProfileImageUrl =
    isEditMode && memberInfo?.profileImageUrl ? memberInfo.profileImageUrl : null;

  const [nickname, setNickname] = useState(initialNickname);
  const [biography, setBiography] = useState(initialBiography);
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
  const [profileImage, setProfileImage] = useState<string | null>(initialProfileImageUrl);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 닉네임 중복 확인 관련 상태
  const [isCheckingNickname, setIsCheckingNickname] = useState(false);
  const [nicknameChecked, setNicknameChecked] = useState(false);
  const [nicknameAvailable, setNicknameAvailable] = useState(false);

  useEffect(() => {
    if (isEditMode && memberInfo) {
      setNickname(memberInfo.nickname);
      setBiography(memberInfo.biography || '');
      setPhoneNumber(memberInfo.phoneNumber || '');
      setProfileImage(memberInfo.profileImageUrl || null);
      // 수정 모드에서는 초기 닉네임은 중복 확인 완료로 간주
      setNicknameChecked(true);
      setNicknameAvailable(true);
    }
  }, [isEditMode, memberInfo]);

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('프로필 이미지는 10MB 이하만 업로드 가능합니다.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setProfileImage(event.target?.result as string);
      setProfileImageFile(file);
    };
    reader.readAsDataURL(file);
  };

  const removeProfileImage = () => {
    setProfileImage(null);
    setProfileImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 10) {
      setNickname(value);
      // 닉네임이 변경되면 중복 확인 초기화 (초기 닉네임과 다른 경우)
      if (isEditMode && value !== initialNickname) {
        setNicknameChecked(false);
        setNicknameAvailable(false);
      } else if (isEditMode && value === initialNickname) {
        // 초기 닉네임으로 되돌린 경우 중복 확인 통과로 간주
        setNicknameChecked(true);
        setNicknameAvailable(true);
      } else if (!isEditMode) {
        setNicknameChecked(false);
        setNicknameAvailable(false);
      }
    }
  };

  const handleCheckNickname = async () => {
    if (!nickname.trim() || nickname.length < 2) {
      alert('닉네임은 2자 이상 입력해주세요.');
      return;
    }

    setIsCheckingNickname(true);
    setError(null);

    try {
      const result = await authAPI.checkNickname(nickname.trim());
      setNicknameChecked(true);
      setNicknameAvailable(result.available);

      if (result.available) {
        alert('사용 가능한 닉네임입니다.');
      } else {
        alert('이미 사용 중인 닉네임입니다.');
      }
    } catch (error: any) {
      console.error('❌ 닉네임 중복 확인 실패:', error);
      setError(error.response?.data?.message || '닉네임 중복 확인에 실패했습니다.');
      setNicknameChecked(false);
      setNicknameAvailable(false);
    } finally {
      setIsCheckingNickname(false);
    }
  };

  // 변경 사항 확인
  const hasChanges = () => {
    if (!isEditMode) return true; // 신규 등록 모드는 항상 true

    return (
      nickname !== initialNickname ||
      biography !== initialBiography ||
      phoneNumber !== initialPhoneNumber ||
      profileImageFile !== null ||
      (profileImage === null && initialProfileImageUrl !== null)
    );
  };

  const isFormValid = () => {
    if (!nickname.trim()) return false;
    if (nickname.length < 2 || nickname.length > 10) return false;
    if (!biography.trim()) return false;
    if (!nicknameChecked || !nicknameAvailable) return false;
    if (isEditMode && !hasChanges()) return false; // 수정 모드에서는 변경사항이 있어야 함
    return true;
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      if (!nicknameChecked || !nicknameAvailable) {
        setError('닉네임 중복 확인을 완료해주세요.');
      } else if (isEditMode && !hasChanges()) {
        setError('변경된 내용이 없습니다.');
      } else {
        setError('필수 항목을 모두 입력해주세요.');
      }
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. 프로필 데이터 준비
      const requestData: any = {
        nickname: nickname.trim(),
        biography: biography.trim(),
      };

      if (phoneNumber) {
        requestData.phoneNumber = phoneNumber;
      }

      console.log('📝 프로필 업데이트 요청:', requestData);
      console.log('📷 프로필 이미지:', profileImageFile ? '있음' : '없음');

      // 2. 프로필 업데이트 API 호출
      const response = await updateMemberProfile(requestData, profileImageFile);

      console.log('✅ 프로필 설정 완료:', response);

      // 3. 토큰 갱신
      console.log('🔄 Access Token 갱신 중...');
      const refreshResponse = await authAPI.refresh();

      // 4. 새 토큰 저장
      localStorage.setItem('accessToken', refreshResponse.accessToken);
      console.log('✅ Access Token 갱신 완료');

      // 5. 로컬스토리지 업데이트
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      userInfo.nickname = response.nickname;
      userInfo.biography = response.biography;
      userInfo.profileImageUrl = response.profileImageUrl || null;
      localStorage.setItem('userInfo', JSON.stringify(userInfo));

      console.log('💾 로컬스토리지 업데이트 완료');

      // 6. 이동 (수정 모드면 마이페이지로, 신규 등록이면 홈으로)
      if (isEditMode) {
        navigate('/my-account');
      } else {
        navigate('/');
      }
    } catch (error: any) {
      console.error('❌ 프로필 설정 실패:', error);
      setError(error.response?.data?.message || error.message || '프로필 설정에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen from-moas-main/5 to-white py-12 font-pretendard">
      <div className="max-w-3xl mx-auto px-8">
        <div className="text-left mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            {isEditMode ? '프로필 수정' : '프로필 설정'}
          </h1>
        </div>

        <div className="bg-white rounded-2xl p-8 space-y-8">
          {/* 프로필 이미지 */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              프로필 이미지 <span className="text-gray-400 text-xs">(선택)</span>
            </label>
            {!profileImage ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-40 h-40 mx-auto rounded-full border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
              >
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">이미지 업로드</span>
              </div>
            ) : (
              <div className="relative w-40 h-40 mx-auto">
                <img
                  src={profileImage}
                  alt="프로필"
                  className="w-full h-full rounded-full object-cover"
                />
                <button
                  onClick={removeProfileImage}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfileImageUpload}
              className="hidden"
            />
            <p className="text-xs text-gray-500 text-center mt-2">JPG, PNG 형식 (최대 10MB)</p>
          </div>

          {/* 닉네임 */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              닉네임 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="text"
                  value={nickname}
                  onChange={handleNicknameChange}
                  placeholder="사용할 닉네임을 입력해주세요 (2-10자)"
                  maxLength={10}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-moas-main focus:outline-none transition-colors h-12"
                />
              </div>
              <button
                onClick={handleCheckNickname}
                disabled={isCheckingNickname || !nickname.trim() || nickname.length < 2}
                className="px-4 h-12 bg-moas-navy text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
              >
                {isCheckingNickname ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    확인 중
                  </>
                ) : (
                  '중복 확인'
                )}
              </button>
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-500">{nickname.length}/10</p>
              {nicknameChecked && nicknameAvailable && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  확인 완료
                </p>
              )}
            </div>
          </div>

          {/* 자기소개 */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              자기소개 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={biography}
              onChange={(e) => setBiography(e.target.value)}
              placeholder="자신을 소개하는 글을 작성해주세요"
              rows={6}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-moas-main focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* 전화번호 (선택) */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              전화번호 <span className="text-gray-400 text-xs">(선택)</span>
            </label>
            <input
              type="text"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              placeholder="010-1234-5678"
              maxLength={13}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-moas-main focus:outline-none transition-colors"
            />
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* 완료 버튼 */}
          <div className="flex justify-center pt-4">
            <button
              onClick={handleSubmit}
              disabled={!isFormValid() || isSubmitting}
              className="px-4 py-2 bg-moas-main text-white font-semibold text-lg rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isEditMode ? '수정 중...' : '등록 중...'}
                </>
              ) : isEditMode ? (
                '프로필 수정 완료'
              ) : (
                '프로필 설정 완료'
              )}
            </button>
          </div>

          <p className="text-center text-gray-500 text-sm">
            * 표시가 있는 항목은 필수 입력 항목입니다
          </p>
        </div>
      </div>
    </div>
  );
}

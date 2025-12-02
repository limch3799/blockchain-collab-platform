// src/pages/sign-up/SelectRole.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/api/axios';
import { Loader2 } from 'lucide-react';

export default function SelectRole() {
  const [selectedRole, setSelectedRole] = useState<'LEADER' | 'ARTIST' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRoleSelect = (role: 'LEADER' | 'ARTIST') => {
    setSelectedRole(role);
  };

  const handleConfirm = async () => {
    if (!selectedRole) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log(`🔄 역할 변경 API 호출: ${selectedRole}`);

      // PATCH /api/members/me/role
      const response = await apiClient.patch('/members/me/role', {
        role: selectedRole,
      });

      console.log('✅ 역할 변경 성공:', response.data);

      // ✅ localStorage의 userInfo 업데이트
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      userInfo.role = selectedRole;
      localStorage.setItem('userInfo', JSON.stringify(userInfo));

      console.log('💾 로컬스토리지 업데이트 완료');

      // setup-my-profile로 이동
      navigate('/setup-profile');
    } catch (err: any) {
      console.error('❌ 역할 변경 실패:', err);
      setError(err.response?.data?.message || '역할 선택에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center font-pretendard p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl p-2 animate-fade-in">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">MOAS에 오신 것을 환영합니다!</h1>
          <p className="text-gray-600 text-xl">시작하기 전에 역할을 선택해주세요</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* 리더 카드 */}
          <button
            onClick={() => handleRoleSelect('LEADER')}
            disabled={isLoading}
            className={`group relative p-10 rounded-2xl border-2 transition-all duration-300 ${
              selectedRole === 'LEADER'
                ? 'border-moas-leader bg-moas-leader/5 shadow-lg scale-105'
                : 'border-gray-200 hover:border-moas-leader/50 hover:shadow-md'
            } ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <div className="flex flex-col items-center">
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center mb-5 transition-colors ${
                  selectedRole === 'LEADER'
                    ? 'bg-moas-leader text-white'
                    : 'bg-gray-100 text-gray-400 group-hover:bg-moas-leader/10 group-hover:text-moas-leader'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-12 h-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">리더</h3>
              <p className="text-gray-600 text-center">
                프로젝트를 기획하고
                <br />
                팀원을 모집합니다
              </p>

              {selectedRole === 'LEADER' && (
                <div className="absolute top-5 right-5">
                  <div className="w-9 h-9 bg-moas-leader rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </button>

          {/* 아티스트 카드 */}
          <button
            onClick={() => handleRoleSelect('ARTIST')}
            disabled={isLoading}
            className={`group relative p-10 rounded-2xl border-2 transition-all duration-300 ${
              selectedRole === 'ARTIST'
                ? 'border-moas-artist bg-moas-artist/5 shadow-lg scale-105'
                : 'border-gray-200 hover:border-moas-artist/50 hover:shadow-md'
            } ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <div className="flex flex-col items-center">
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center mb-5 transition-colors ${
                  selectedRole === 'ARTIST'
                    ? 'bg-moas-artist text-white'
                    : 'bg-gray-100 text-gray-400 group-hover:bg-moas-artist/10 group-hover:text-moas-artist'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-12 h-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                  />
                </svg>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">아티스트</h3>
              <p className="text-gray-600 text-center">
                프로젝트에 참여하고
                <br />
                재능을 발휘합니다
              </p>

              {selectedRole === 'ARTIST' && (
                <div className="absolute top-5 right-5">
                  <div className="w-9 h-9 bg-moas-artist rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </button>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="flex justify-center">
          <button
            onClick={handleConfirm}
            disabled={!selectedRole || isLoading}
            className={`px-16 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
              selectedRole
                ? selectedRole === 'LEADER'
                  ? 'bg-moas-leader hover:bg-moas-leader/90 text-white shadow-lg hover:shadow-xl'
                  : 'bg-moas-artist hover:bg-moas-artist/90 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                처리 중...
              </span>
            ) : (
              '다음 단계로'
            )}
          </button>
        </div>

        <p className="text-center text-gray-500 text-sm mt-2">
          역할은 최초 선택 후 변경이 불가합니다.
        </p>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

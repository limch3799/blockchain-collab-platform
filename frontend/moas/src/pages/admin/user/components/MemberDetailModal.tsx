// src/pages/admin/user/components/MemberDetailModal.tsx
import { useEffect, useState } from 'react';
import { Loader2, X, User, Mail, Phone, Wallet, Calendar, Award } from 'lucide-react';
import { getMemberDetail, getMemberPenalties } from '@/api/admin/member';
import type { MemberDetail, PenaltyItem } from '@/api/admin/member';
import { PenaltyModal } from './PenaltyModal';
import { PenaltyList } from './PenaltyList';

interface MemberDetailModalProps {
  memberId: number;
  onClose: () => void;
}

export const MemberDetailModal = ({ memberId, onClose }: MemberDetailModalProps) => {
  const [member, setMember] = useState<MemberDetail | null>(null);
  const [penalties, setPenalties] = useState<PenaltyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPenaltyModal, setShowPenaltyModal] = useState(false);

  useEffect(() => {
    loadMemberData();
  }, [memberId]);

  const loadMemberData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [memberData, penaltyData] = await Promise.all([
        getMemberDetail(memberId),
        getMemberPenalties(memberId),
      ]);

      setMember(memberData);
      setPenalties(penaltyData.penalties);
    } catch (err) {
      setError('회원 정보를 불러오는데 실패했습니다.');
      console.error('회원 정보 로드 실패:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoleBadge = (role: 'LEADER' | 'ARTIST' | 'PENDING') => {
    const roleMap = {
      LEADER: { label: '리더', color: 'bg-blue-100 text-blue-700 border-blue-300' },
      ARTIST: { label: '아티스트', color: 'bg-purple-100 text-purple-700 border-purple-300' },
      PENDING: { label: '미결정', color: 'bg-gray-100 text-gray-700 border-gray-300' },
    };
    return roleMap[role];
  };

  const handlePenaltySuccess = () => {
    loadMemberData();
    setShowPenaltyModal(false);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">회원 정보를 불러오는 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error || '회원을 찾을 수 없습니다.'}</p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    );
  }

  const roleBadge = getRoleBadge(member.role);

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* 헤더 */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">회원 상세</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            {/* 회원 기본 정보 */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 mb-6">
              <div className="flex items-start gap-6 mb-6 pb-6 border-b border-gray-200">
                {member.profileImageUrl ? (
                  <img
                    src={member.profileImageUrl}
                    alt={member.nickname}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-12 h-12 text-gray-500" />
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-gray-800">{member.nickname}</h3>
                    <span
                      className={`px-4 py-1 text-sm font-semibold rounded-full border ${roleBadge.color}`}
                    >
                      {roleBadge.label}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">ID: {member.id}</p>
                  {member.biography && <p className="text-gray-700 mt-2">{member.biography}</p>}
                </div>
              </div>

              {/* 상세 정보 그리드 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-600 mb-1">이메일</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {member.email || '정보 없음'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-600 mb-1">전화번호</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {member.phoneNumber || '정보 없음'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Wallet className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-600 mb-1">지갑 주소</p>
                    <p className="text-xs font-semibold text-gray-800 break-all">
                      {member.walletAddress}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-600 mb-1">가입일</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {formatDate(member.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-600 mb-1">인증 제공자</p>
                    <p className="text-sm font-semibold text-gray-800">{member.provider}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-600 mb-1">최종 수정일</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {formatDate(member.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 회원 통계 */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5" />
                회원 통계
              </h4>

              <div className="grid grid-cols-4 gap-4">
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <p className="text-xs text-gray-600 mb-1">페널티 점수</p>
                  <p className="text-2xl font-bold text-red-600">{member.stats.penaltyScore}</p>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <p className="text-xs text-gray-600 mb-1">평균 평점</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {member.stats.averageRating.toFixed(1)}
                  </p>
                </div>

                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <p className="text-xs text-gray-600 mb-1">리뷰 수</p>
                  <p className="text-2xl font-bold text-green-600">{member.stats.reviewCount}</p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-xs text-gray-600 mb-1">미답변 문의</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {member.stats.pendingInquiries}
                  </p>
                </div>
              </div>
            </div>

            {/* 페널티 이력 */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-800">페널티 이력</h4>
                <button
                  onClick={() => setShowPenaltyModal(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
                >
                  페널티 등록
                </button>
              </div>

              <PenaltyList penalties={penalties} />
            </div>
          </div>
        </div>
      </div>

      {/* 페널티 등록 모달 */}
      {showPenaltyModal && (
        <PenaltyModal
          memberId={member.id}
          onClose={() => setShowPenaltyModal(false)}
          onSuccess={handlePenaltySuccess}
        />
      )}
    </>
  );
};

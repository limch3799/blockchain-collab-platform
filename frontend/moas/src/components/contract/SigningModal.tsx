/**
 * SigningModal Component
 *
 * 아티스트와 리더가 공통으로 사용하는 계약 서명 모달
 * - 4단계 서명 프로세스 (안내 → 확인 → 서명 → 완료)
 * - Stage 3는 5개 서브스텝으로 구성
 * - userRole에 따라 애니메이션 자동 선택
 */

import { useEffect, useRef, useState } from 'react';
import Lottie from 'react-lottie-player';
import type { Contract } from '@/types/contract';
import { Eip712Signer } from '@/components/contract/Eip712Signer';
import { MarkdownViewer } from '@/components/ui/MarkdownViewer';

// 애니메이션 import
import artistSignAnimation from '@/assets/artist_sign.json';
import leaderSignAnimation from '@/assets/leader_sign.json';
import verifyLoaderAnimation from '@/assets/verify_loader.json';
import artistSecurityAnimation from '@/assets/artist_security.json';
import leaderSecurityAnimation from '@/assets/leader_security.json';
import docArtistAnimation from '@/assets/doc_artist.json';
import docLeaderAnimation from '@/assets/doc_leader.json';
import artistWalletAnimation from '@/assets/artist_wallet.json';
import leaderWalletAnimation from '@/assets/leader_wallet.json';
import successAnimation from '@/assets/Success_Animation.json';

interface SigningModalState {
  signingStage: number;
  setSigningStage: (stage: number) => void;
  signingSubStep: number;
  setSigningSubStep: (subStep: number) => void;
  check1: boolean;
  setCheck1: (checked: boolean) => void;
  check2: boolean;
  setCheck2: (checked: boolean) => void;
  check3: boolean;
  setCheck3: (checked: boolean) => void;
  check4: boolean;
  setCheck4: (checked: boolean) => void;
  verificationStep1: boolean;
  setVerificationStep1: (verified: boolean) => void;
  verificationStep2: boolean;
  setVerificationStep2: (verified: boolean) => void;
  currentSignature: string;
  setCurrentSignature: (signature: string) => void;
}

// 유틸 함수
const formatAmount = (amount: number | undefined): string => {
  if (!amount) return '0';
  return amount.toLocaleString('ko-KR');
};

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date
    .toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    .replace(/\. /g, '.')
    .replace(/\.$/, '');
};

interface SigningModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract;
  userRole: 'ARTIST' | 'LEADER';
  onSignSuccess: (signature: `0x${string}`) => Promise<void>;
  onSignError: (error: Error) => void;
  state: SigningModalState;
  isSubmitting?: boolean;
  completionMessage?: string;
  address?: string; // 지갑 주소
  onPaymentProceed?: () => void; // 리더 전용: 결제 진행 버튼 클릭 시
}

export function SigningModal({
  isOpen,
  onClose,
  contract,
  userRole,
  onSignSuccess,
  onSignError,
  state,
  isSubmitting = false,
  completionMessage,
  address,
  onPaymentProceed,
}: SigningModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  const {
    signingStage,
    setSigningStage,
    signingSubStep,
    setSigningSubStep,
    check1,
    setCheck1,
    check2,
    setCheck2,
    check3,
    setCheck3,
    check4,
    setCheck4,
    verificationStep1,
    setVerificationStep1,
    verificationStep2,
    setVerificationStep2,
    currentSignature,
    setCurrentSignature,
  } = state;

  // 애니메이션 최소 재생 시간 보장을 위한 완료 플래그
  const [dataPreparationComplete, setDataPreparationComplete] = useState(false);
  const [animationStep3Complete, setAnimationStep3Complete] = useState(false);
  const [signingComplete, setSigningComplete] = useState(false);
  const [animationStep4Complete, setAnimationStep4Complete] = useState(false);

  // 역할에 따른 애니메이션 선택
  const animations = {
    stage1: userRole === 'ARTIST' ? artistSignAnimation : leaderSignAnimation,
    wallet: userRole === 'ARTIST' ? artistWalletAnimation : leaderWalletAnimation,
    security: userRole === 'ARTIST' ? artistSecurityAnimation : leaderSecurityAnimation,
    doc: userRole === 'ARTIST' ? docArtistAnimation : docLeaderAnimation,
    verify: verifyLoaderAnimation,
    success: successAnimation,
  };

  // 역할에 따른 완료 메시지
  const defaultCompletionMessage =
    userRole === 'ARTIST' ? (
      <>
        리더의 최종 승인 후 계약이 체결되며,
        <br />
        NFT 인증서 발행이 진행됩니다.
      </>
    ) : (
      '결제 페이지로 이동하여 계약을 체결하세요.'
    );
  // 3-1 자동 전환 (지갑 연결 중 → 지갑 연결 완료)
  useEffect(() => {
    if (signingStage === 3 && signingSubStep === 1) {
      const timer = setTimeout(() => {
        setSigningSubStep(2);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [signingStage, signingSubStep, setSigningSubStep]);

  // 3-5 검증 단계 시뮬레이션
  useEffect(() => {
    if (signingStage === 3 && signingSubStep === 5) {
      setVerificationStep1(false);
      setVerificationStep2(false);

      const timer1 = setTimeout(() => {
        setVerificationStep1(true);
      }, 1000);

      const timer2 = setTimeout(() => {
        setVerificationStep2(true);
      }, 2000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [signingStage, signingSubStep, setVerificationStep1, setVerificationStep2]);

  // Sub-step 변경 시 완료 플래그 리셋
  useEffect(() => {
    if (signingSubStep === 3) {
      // Sub-step 3 진입 시 플래그 초기화
      setDataPreparationComplete(false);
      setAnimationStep3Complete(false);
    } else if (signingSubStep === 4) {
      // Sub-step 4 진입 시 애니메이션 플래그만 초기화
      // signingComplete는 리셋하지 않음 (이미 서명이 완료되었을 수 있음)
      setAnimationStep4Complete(false);
    }
  }, [signingSubStep]);

  // Sub-step 5로 전환 시 서명 성공 콜백 호출
  useEffect(() => {
    if (signingSubStep === 5 && currentSignature && signingComplete) {
      console.log('[SigningModal] Calling onSignSuccess after animation complete');
      onSignSuccess(currentSignature as `0x${string}`).catch((err) => {
        console.error('[SigningModal] Error in onSignSuccess:', err);
      });
    }
  }, [signingSubStep, currentSignature, signingComplete, onSignSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        ref={modalRef}
        className="relative flex w-full max-w-5xl h-[670px] flex-col gap-6 rounded-2xl bg-white p-8 shadow-xl overflow-y-auto"
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-moas-gray-6 hover:text-moas-text transition-colors"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* 진행 단계 표시 - 원형 스텝퍼 */}
        <div className="w-full pt-1">
          <div className="flex items-center justify-center gap-0">
            {[
              { num: 1, label: '서명 안내' },
              { num: 2, label: '계약 내용 확인' },
              { num: 3, label: '지갑 서명' },
              { num: 4, label: '서명 완료' },
            ].map((stage, index) => (
              <div key={stage.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold transition-all ${
                      stage.num < signingStage
                        ? 'bg-moas-main text-white'
                        : stage.num === signingStage
                          ? 'bg-moas-main text-white'
                          : 'bg-moas-gray-3 text-moas-gray-6'
                    }`}
                  >
                    {stage.num < signingStage ? '✓' : stage.num}
                  </div>
                  <p
                    className={`mt-2 text-xs font-medium transition-all ${
                      stage.num <= signingStage ? 'text-moas-text' : 'text-moas-gray-6'
                    }`}
                  >
                    {stage.label}
                  </p>
                </div>
                {index < 3 && (
                  <div
                    className={`h-0.5 w-16 mx-1 mb-5.5 rounded-full transition-all ${
                      stage.num < signingStage ? 'bg-moas-main' : 'bg-moas-gray-3'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Stage 1: 서명 안내 */}
        {signingStage === 1 && (
          <div className="flex flex-col items-center justify-center py-4">
            <h2 className="text-3xl font-bold text-moas-text mb-2">계약서 서명 안내</h2>
            <div className="mb-0">
              <div className="overflow-hidden" style={{ width: 400, height: 280 }}>
                <div style={{ transform: 'translateY(-80px) translateX(-150px)' }}>
                  <Lottie
                    loop
                    animationData={animations.stage1}
                    play
                    style={{ width: 700, height: 700 }}
                  />
                </div>
              </div>
            </div>

            <p className="text-lg font-semibold text-moas-error text-center mb-2">
              본 서명은 블록체인에 EIP-712 표준으로 서명으로 영구 기록되며, <br />
              서명 후에는 수정이나 철회가 절대 불가능합니다.
            </p>

            <button
              onClick={() => {
                setSigningStage(2);
                modalRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full max-w-md rounded-lg bg-moas-text px-8 py-4 text-lg font-bold text-white transition-opacity hover:opacity-90 mt-8"
            >
              계약 내용 확인하기
            </button>
          </div>
        )}

        {/* Stage 2: 계약 내용 확인 */}
        {signingStage === 2 && (
          <div className="flex w-full flex-col gap-4 py-2">
            {/* 계약서 내용 + 동의 사항 */}
            <div className="rounded-lg border-2 border-moas-gray-1 p-6">
              <div className="space-y-8">
                {/* 계약 내용 섹션 */}
                <div>
                  <h2 className="text-xl font-bold text-moas-text mb-4 pb-2 border-b-2 border-moas-main">
                    계약 내용
                  </h2>

                  <div className="space-y-5 mt-4">
                    {/* 프로젝트 정보 */}
                    <div className="pb-4 border-b border-moas-gray-3">
                      <p className="text-base font-medium text-moas-gray-9 mb-1">프로젝트명</p>
                      <p className="text-base font-semibold text-moas-text mb-1">
                        {contract.project.title}
                      </p>
                      <p className="text-sm text-moas-gray-7">
                        {contract.project.categoryName} · {contract.project.positionName}
                      </p>
                    </div>

                    {/* 금액 */}
                    <div className="pb-4 border-b border-moas-gray-3">
                      <p className="text-s font-medium text-moas-gray-9 mb-1">계약 금액</p>
                      <p className="text-xl font-bold text-moas-main">
                        {formatAmount(contract.totalAmount)}원
                      </p>
                    </div>

                    {/* 계약 기간 */}
                    <div className="pb-4 border-b border-moas-gray-3">
                      <p className="text-s font-medium text-moas-gray-9 mb-1">계약 기간</p>
                      <p className="text-base font-medium text-moas-text">
                        {formatDate(contract.startAt)} ~ {formatDate(contract.endAt)}
                      </p>
                    </div>

                    {/* 당사자 정보 */}
                    <div className="pb-4 border-b border-moas-gray-3">
                      <p className="text-s font-medium text-moas-gray-9 mb-1">계약당사자</p>
                      <div className="space-y-1">
                        <p className="text-sm text-moas-text">
                          <span className="font-medium text-moas-gray-7">리더:</span>{' '}
                          {contract.leader.nickname}
                        </p>
                        <p className="text-sm text-moas-text">
                          <span className="font-medium text-moas-gray-7">아티스트:</span>{' '}
                          {contract.artist.nickname}
                        </p>
                      </div>
                    </div>

                    {/* 상세 내용 */}
                    {contract.description && (
                      <div className="pt-2 pb-4">
                        <p className="text-xs font-medium text-moas-gray-6 mb-3">상세 계약 내용</p>
                        <MarkdownViewer content={contract.description} />
                      </div>
                    )}
                  </div>
                </div>

                {/* 동의 사항 섹션 */}
                <div className="border-t-2 border-moas-gray-3 pt-6">
                  <h2 className="text-xl font-bold text-moas-text mb-4">동의 사항</h2>

                  {/* 4개 필수 체크박스 */}
                  <div className="space-y-3">
                    <div className="rounded-lg bg-moas-gray-1 p-4">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={check1}
                          onChange={(e) => setCheck1(e.target.checked)}
                          className="mt-1 h-5 w-5 cursor-pointer"
                        />
                        <span className="text-sm leading-relaxed text-moas-text">
                          [필수] 위 계약 내용을 모두 읽었으며, 계약 조건을 이해했습니다.
                        </span>
                      </label>
                    </div>

                    <div className="rounded-lg bg-moas-gray-1 p-4">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={check2}
                          onChange={(e) => setCheck2(e.target.checked)}
                          className="mt-1 h-5 w-5 cursor-pointer"
                        />
                        <span className="text-sm leading-relaxed text-moas-text">
                          [필수] EIP-712 전자서명이 법적 효력을 가지는 전자서명임을 이해했습니다.
                        </span>
                      </label>
                    </div>

                    <div className="rounded-lg bg-moas-gray-1 p-4">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={check3}
                          onChange={(e) => setCheck3(e.target.checked)}
                          className="mt-1 h-5 w-5 cursor-pointer"
                        />
                        <span className="text-sm leading-relaxed text-moas-text">
                          [필수] 본 계약의 법적 구속력을 인정하며, 계약 이행 의무를 수락합니다.
                        </span>
                      </label>
                    </div>

                    <div className="rounded-lg bg-moas-gray-1 p-4">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={check4}
                          onChange={(e) => setCheck4(e.target.checked)}
                          className="mt-1 h-5 w-5 cursor-pointer"
                        />
                        <span className="text-sm leading-relaxed text-moas-text">
                          [필수] 개인정보 수집 및 이용(계약 이행 목적)에 동의합니다.
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 이전/다음 버튼 */}
            <div className="flex gap-3 px-2">
              <div className="flex-1">
                <button
                  onClick={() => {
                    setSigningStage(1);
                  }}
                  className="w-full rounded-lg border-2 border-moas-gray-2 bg-white px-6 py-3 text-base font-bold text-moas-text transition-colors hover:bg-moas-gray-1"
                >
                  이전
                </button>
              </div>
              <div className="flex-1">
                <button
                  onClick={() => {
                    setSigningStage(3);
                    setSigningSubStep(1);
                    modalRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={isSubmitting || !check1 || !check2 || !check3 || !check4}
                  className="w-full rounded-lg bg-moas-text px-6 py-3 text-base font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  다음 단계로
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stage 3: 지갑 서명 진행 */}
        {signingStage === 3 && (
          <div className="flex w-full flex-col md:flex-row gap-8 py-4">
            {/* Sub-step 1: 지갑 주소 확인 중 (로딩) */}
            {signingSubStep === 1 && (
              <div className="flex-1 flex flex-col items-center justify-center animate-fadeIn">
                <h3 className="text-3xl font-bold text-moas-text mb-6">지갑 연결 중</h3>
                <div className="overflow-hidden mb-0" style={{ width: 250, height: 250 }}>
                  <div style={{ transform: 'translateY(-45px) translateX(-30px)' }}>
                    <Lottie
                      loop
                      animationData={animations.wallet}
                      play
                      style={{ width: 300, height: 300 }}
                    />
                  </div>
                </div>

                <div className="rounded-lg bg-blue-50 border-2 border-blue-200 p-6 w-full max-w-md">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                    </div>
                    <div>
                      <p className="font-semibold text-blue-900 mb-1">지갑 주소 확인 중...</p>
                      <p className="text-sm text-blue-800">지갑 정보를 불러오고 있습니다...</p>
                    </div>
                  </div>
                </div>

                {/* 비활성화된 서명 버튼 */}
                <div className="mt-4 w-full max-w-md">
                  <button
                    disabled
                    className="w-full rounded-lg bg-moas-gray-4 px-8 py-4 text-lg font-bold text-white cursor-not-allowed opacity-60"
                  >
                    이 지갑 주소로 서명하기
                  </button>
                </div>
              </div>
            )}

            {/* Sub-step 2: 지갑 주소 확인 완료 */}
            {signingSubStep === 2 && (
              <div className="flex-1 flex flex-col items-center justify-center animate-fadeIn">
                <h3 className="text-3xl font-bold text-moas-text mb-4">지갑 연결 완료</h3>
                <div className="overflow-hidden" style={{ width: 250, height: 250 }}>
                  <div style={{ transform: 'translateY(-45px) translateX(-30px)' }}>
                    <Lottie
                      loop
                      animationData={animations.wallet}
                      play
                      style={{ width: 300, height: 300 }}
                    />
                  </div>
                </div>

                <div className="rounded-lg bg-green-50 border-2 border-green-200 p-6 w-full max-w-md">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white font-bold shrink-0">
                      ✓
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-green-900 mb-2">지갑 정보 불러오기 완료</p>
                      <p className="text-xs text-green-700 font-mono break-all mb-1">
                        주소: {address || '연결된 지갑 없음'}
                      </p>
                      <p className="text-xs text-green-700">네트워크: Ethereum Sepolia</p>
                    </div>
                  </div>
                </div>

                {/* 서명하기 버튼 */}
                <div className="mt-4 w-full max-w-md">
                  <Eip712Signer
                    contractId={contract.contractId}
                    buttonText="이 지갑 주소로 서명하기"
                    onSignStart={() => {
                      console.log('[SigningModal] Moving to substep 3 (EIP-712 data prep)');
                      setSigningSubStep(3);
                    }}
                    onDataPrepared={() => {
                      console.log(
                        '[SigningModal] Data prepared, waiting for animation to complete',
                      );
                      setDataPreparationComplete(true);
                      // 애니메이션이 완료될 때까지 대기 (애니메이션 onComplete에서 전환)
                    }}
                    onSigningStarted={() => {
                      console.log('[SigningModal] Signing started');
                    }}
                    onSignSuccess={async (signature) => {
                      console.log(
                        '[SigningModal] Signature received, waiting for animation to complete',
                      );
                      setCurrentSignature(signature);
                      setSigningComplete(true);
                      // 애니메이션이 완료될 때까지 대기 (애니메이션 onComplete에서 전환)
                      // onSignSuccess는 useEffect에서 호출됨
                    }}
                    onSignError={onSignError}
                    disabled={isSubmitting}
                    className="w-full rounded-lg bg-moas-text px-8 py-4 text-lg font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
              </div>
            )}

            {/* Sub-step 3: EIP-712 데이터 준비 */}
            {signingSubStep === 3 && (
              <>
                {/* 왼쪽: 타이틀 + 애니메이션 */}
                <div className="flex-1 flex flex-col items-center justify-center animate-fadeIn">
                  <h3 className="text-3xl font-bold text-moas-text mb-8">서명 데이터 준비 중</h3>
                  <Lottie
                    loop={false}
                    animationData={animations.security}
                    play
                    style={{ width: 250, height: 250 }}
                    onComplete={() => {
                      console.log(
                        '[SigningModal] Security animation complete (1 loop), checking if data is prepared',
                      );
                      // 이미 완료 플래그가 설정되었으면 중복 실행 방지
                      if (!animationStep3Complete) {
                        setAnimationStep3Complete(true);
                      }
                      // 데이터 준비도 끝났으면 Sub-step 4로 전환
                      if (dataPreparationComplete) {
                        console.log('[SigningModal] Data already prepared, moving to substep 4');
                        setSigningSubStep(4);
                      }
                      // 아직 데이터 준비 안 끝났으면 애니메이션 계속 루프
                    }}
                  />
                  <h2 className="text-base text-moas-gray-8 text-center mt-6">
                    EIP-712 표준에 따라 계약 내용을 <br /> 암호화된 서명 데이터로 변환 중입니다...
                  </h2>
                </div>
              </>
            )}

            {/* Sub-step 4: 서명 실행 */}
            {signingSubStep === 4 && (
              <>
                <div className="flex-1 flex flex-col items-center justify-center animate-fadeIn">
                  <h3 className="text-3xl font-bold text-moas-text mb-8">서명 진행 중</h3>
                  <div className="overflow-hidden" style={{ width: 250, height: 250 }}>
                    <div style={{ transform: 'translateY(-40px) translateX(-25px)' }}>
                      <Lottie
                        loop={false}
                        animationData={animations.doc}
                        play
                        style={{ width: 300, height: 300 }}
                        onComplete={() => {
                          console.log(
                            '[SigningModal] Doc animation complete (1 loop), checking if signing is complete',
                          );
                          // 이미 완료 플래그가 설정되었으면 중복 실행 방지
                          if (!animationStep4Complete) {
                            setAnimationStep4Complete(true);
                          }
                          // 서명도 끝났으면 Sub-step 5로 전환
                          if (signingComplete) {
                            console.log(
                              '[SigningModal] Signing already complete, moving to substep 5',
                            );
                            setSigningSubStep(5);
                          }
                          // 아직 서명 안 끝났으면 애니메이션 계속 루프
                        }}
                      />
                    </div>
                  </div>

                  <h2 className="text-base text-moas-gray-8 text-center mt-6">
                    전자서명 요청을 처리하고 있습니다...
                  </h2>
                </div>
              </>
            )}

            {/* Sub-step 5: 서명 검증 */}
            {signingSubStep === 5 && (
              <div className="flex-1 flex flex-col items-center justify-center animate-fadeIn">
                <h3 className="text-3xl font-bold text-moas-text mb-6">서명 검증 중</h3>

                <div className="overflow-hidden mb-0" style={{ width: 200, height: 200 }}>
                  <div style={{ transform: 'translateY(-40px) translateX(-30px)' }}>
                    <Lottie
                      loop={false}
                      animationData={animations.verify}
                      play
                      style={{ width: 250, height: 250 }}
                      onComplete={() => {
                        setSigningStage(4);
                        setSigningSubStep(0);
                        setVerificationStep1(false);
                        setVerificationStep2(false);
                      }}
                    />
                  </div>
                </div>

                {/* 검증 상태 표시 */}
                <div className="w-full max-w-md space-y-3 mt-4">
                  {/* 서명 데이터 확인 */}
                  <div
                    className={`rounded-lg border-2 p-4 transition-colors ${
                      verificationStep1
                        ? 'bg-green-50 border-green-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center shrink-0">
                        {verificationStep1 ? (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white font-bold">
                            ✓
                          </div>
                        ) : (
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                        )}
                      </div>
                      <div>
                        <p
                          className={`font-semibold mb-1 ${verificationStep1 ? 'text-green-900' : 'text-blue-900'}`}
                        >
                          {verificationStep1 ? '서명 데이터 확인 완료' : '서명 데이터 확인 중...'}
                        </p>
                        <p
                          className={`text-sm ${verificationStep1 ? 'text-green-800' : 'text-blue-800'}`}
                        >
                          제출된 서명 데이터를 검증하고 있습니다.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 서명자 주소 검증 */}
                  <div
                    className={`rounded-lg border-2 p-4 transition-colors ${
                      verificationStep2
                        ? 'bg-green-50 border-green-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center shrink-0">
                        {verificationStep2 ? (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white font-bold">
                            ✓
                          </div>
                        ) : (
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                        )}
                      </div>
                      <div>
                        <p
                          className={`font-semibold mb-1 ${verificationStep2 ? 'text-green-900' : 'text-blue-900'}`}
                        >
                          {verificationStep2 ? '서명자 주소 검증 완료' : '서명자 주소 검증 중...'}
                        </p>
                        <p
                          className={`text-sm ${verificationStep2 ? 'text-green-800' : 'text-blue-800'}`}
                        >
                          서명한 지갑 주소가 올바른지 확인하고 있습니다.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stage 4: 서명 완료 */}
        {signingStage === 4 && (
          <div className="flex flex-col items-center justify-center py-12 gap-8">
            <h3 className="text-3xl font-bold text-moas-text mb-2">전자서명이 완료되었습니다!</h3>
            <div className="overflow-hidden mb-2" style={{ width: 200, height: 200 }}>
              <div style={{ transform: 'translateY(-34px) translateX(-30px)' }}>
                <Lottie
                  loop={false}
                  animationData={animations.success}
                  play
                  style={{ width: 250, height: 250 }}
                />
              </div>
            </div>
            <h2 className="text-base text-moas-gray-8 text-center -mt-6">
              {completionMessage || defaultCompletionMessage}
            </h2>

            <button
              onClick={userRole === 'LEADER' ? onPaymentProceed || onClose : onClose}
              className="w-full max-w-md rounded-lg bg-moas-text px-8 py-4 text-lg font-bold text-white transition-opacity hover:opacity-90"
            >
              {userRole === 'LEADER' ? '계약금 결제하기' : '확인'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

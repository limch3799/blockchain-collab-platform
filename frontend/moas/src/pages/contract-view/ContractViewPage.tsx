/**
 * ContractViewPage
 *
 * Description:
 * 계약서 상세 조회 페이지
 * - NFT 카드 형태로 계약서 정보 표시
 * - 왼쪽: NFT 카드, 오른쪽: 계약 상세 정보
 *
 * Route: /contract/:contractId
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Download, MessageCircle, AlertCircle, Hourglass } from 'lucide-react';
import Lottie from 'react-lottie-player';
import { useAccount } from 'wagmi';
import type { Contract } from '@/types/contract';
import {
  getContractById,
  getSignatureData,
  finalizeContract,
  confirmPayment,
  declineContract,
  acceptContract,
  withdrawContract,
  cancelContract,
  createReview,
  uploadNFTImageBundle,
} from '@/api/contract';
import { NFTCard } from './components/NFTCard';
import { ReviewModal } from './components/ReviewModal';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eip712Signer } from '@/components/contract/Eip712Signer';
import { SigningModal } from '@/components/contract/SigningModal';
import { useAuth } from '@/hooks/useAuth';
import { generateContractPDF } from '@/lib/contractPdfGenerator';
import { MarkdownViewer } from '@/components/ui/MarkdownViewer';
import { generateNFTImageBundle } from '@/lib/nftImageGenerator';
import leaderSignAnimation from '@/assets/leader_sign.json';
import verifyLoaderAnimation from '@/assets/verify_loader.json';
import leaderWalletAnimation from '@/assets/leader_wallet.json';
import leaderSecurityAnimation from '@/assets/leader_security.json';
import docLeaderAnimation from '@/assets/doc_leader.json';
import successAnimation from '@/assets/Success_Animation.json';
import artistSignAnimation from '@/assets/artist_sign.json';
import artistWalletAnimation from '@/assets/artist_wallet.json';
import artistSecurityAnimation from '@/assets/artist_security.json';
import docArtistAnimation from '@/assets/doc_artist.json';

export default function ContractViewPage() {
  const { contractId } = useParams<{ contractId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { getUserInfoFromStorage } = useAuth();
  const { address } = useAccount();

  // state로 받은 썸네일과 프로젝트명
  const { projectThumbnailUrl, projectTitle } = location.state || {};

  // const { projectId, otherMemberId, projectTitle, otherMemberName, otherMemberProfileUrl } =
  //   useLocation().state || {};

  // 현재 로그인한 사용자 정보
  const userInfo = getUserInfoFromStorage();
  const currentUserId = userInfo?.memberId;
  const currentUserRole = userInfo?.role;

  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 리더용 state
  const [showSettlementConfirm, setShowSettlementConfirm] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showAcceptConfirm, setShowAcceptConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasArtistSignature, setHasArtistSignature] = useState(false);
  const [isCheckingSignature, setIsCheckingSignature] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<{
    amount: number;
    orderId: string;
    productName: string;
    customerName: string;
  } | null>(null);

  // 아티스트용 state
  const [showArtistDeclineModal, setShowArtistDeclineModal] = useState(false);
  const [showArtistDeclineSuccessModal, setShowArtistDeclineSuccessModal] = useState(false);
  const [showArtistAcceptModal, setShowArtistAcceptModal] = useState(false);

  // 모달 ref
  const artistModalRef = useRef<HTMLDivElement>(null);
  const leaderModalRef = useRef<HTMLDivElement>(null);

  // 스크롤 및 동의 체크박스 state (아티스트)
  const [_artistHasScrolledToBottom, setArtistHasScrolledToBottom] = useState(false);
  const [artistCheck1, setArtistCheck1] = useState(false);
  const [artistCheck2, setArtistCheck2] = useState(false);
  const [artistCheck3, setArtistCheck3] = useState(false);
  const [artistCheck4, setArtistCheck4] = useState(false);

  // 스크롤 및 동의 체크박스 state (리더)
  const [leaderHasScrolledToBottom, setLeaderHasScrolledToBottom] = useState(false);
  const [leaderHasAgreed, setLeaderHasAgreed] = useState(false);
  const [leaderCheck1, setLeaderCheck1] = useState(false);
  const [leaderCheck2, setLeaderCheck2] = useState(false);
  const [leaderCheck3, setLeaderCheck3] = useState(false);
  const [leaderCheck4, setLeaderCheck4] = useState(false);

  // 서명 진행 단계 state
  // Stage 1: 서명 경고/안내
  // Stage 2: 계약 내용 확인
  // Stage 3: 지갑 서명 진행 (3-1: 지갑 연결, 3-2: 데이터 준비, 3-3: 서명 실행, 3-4: 서명 검증)
  // Stage 4: 서명 완료
  const [artistSigningStage, setArtistSigningStage] = useState(1);
  const [artistSigningSubStep, setArtistSigningSubStep] = useState(0); // 0: no substep, 1-5: substeps for stage 3
  const [leaderSigningStage, setLeaderSigningStage] = useState(1);
  const [leaderSigningSubStep, setLeaderSigningSubStep] = useState(0); // 0: no substep, 1-5: substeps for stage 3
  const [currentSignature, setCurrentSignature] = useState<string>('');

  // 아티스트 3-5 검증 단계 state
  const [verificationStep1, setVerificationStep1] = useState(false); // 서명 데이터 확인 완료
  const [verificationStep2, setVerificationStep2] = useState(false); // 서명자 주소 검증 완료

  // 리더 3-5 검증 단계 state
  const [leaderVerificationStep1, setLeaderVerificationStep1] = useState(false); // 서명 데이터 확인 완료
  const [leaderVerificationStep2, setLeaderVerificationStep2] = useState(false); // 서명자 주소 검증 완료

  // 리더: 계약 철회 모달
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showWithdrawSuccessModal, setShowWithdrawSuccessModal] = useState(false);
  const [showWithdrawErrorModal, setShowWithdrawErrorModal] = useState(false);
  const [withdrawErrorMessage, setWithdrawErrorMessage] = useState('');

  // 계약 취소 요청 모달
  const [showCancelReasonModal, setShowCancelReasonModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelSuccessModal, setShowCancelSuccessModal] = useState(false);
  const [showCancelErrorModal, setShowCancelErrorModal] = useState(false);
  const [cancelErrorMessage, setCancelErrorMessage] = useState('');

  // 정산 완료 모달
  const [showSettlementSuccessModal, setShowSettlementSuccessModal] = useState(false);

  // 리뷰 작성 완료 모달
  const [showReviewSuccessModal, setShowReviewSuccessModal] = useState(false);

  const fetchContract = useCallback(async () => {
    if (!contractId) {
      setError('계약서 ID가 필요합니다.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await getContractById(Number(contractId));

      console.log('계약서 데이터:', data);
      setContract(data);
    } catch (err: any) {
      console.error('계약서 조회 실패:', err);

      const errorMessage =
        err.response?.data?.message || err.message || '계약서를 불러오는데 실패했습니다.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  useEffect(() => {
    fetchContract();
  }, [contractId, fetchContract]);

  // 3-1 자동 전환 (지갑 연결 중 → 지갑 연결 완료)
  useEffect(() => {
    if (artistSigningStage === 3 && artistSigningSubStep === 1) {
      const timer = setTimeout(() => {
        setArtistSigningSubStep(2);
      }, 1500); // 1.5초 후 자동 전환
      return () => clearTimeout(timer);
    }
  }, [artistSigningStage, artistSigningSubStep]);

  // 아티스트 3-5 검증 단계 시뮬레이션
  useEffect(() => {
    if (artistSigningStage === 3 && artistSigningSubStep === 5) {
      // 검증 상태 초기화
      setVerificationStep1(false);
      setVerificationStep2(false);

      // 첫 번째 검증 (서명 데이터 확인) - 1초 후
      const timer1 = setTimeout(() => {
        setVerificationStep1(true);
      }, 1000);

      // 두 번째 검증 (서명자 주소 검증) - 2초 후
      const timer2 = setTimeout(() => {
        setVerificationStep2(true);
      }, 2000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [artistSigningStage, artistSigningSubStep]);

  // 리더 3-1 자동 전환 (지갑 연결 중 → 지갑 연결 완료)
  useEffect(() => {
    if (leaderSigningStage === 3 && leaderSigningSubStep === 1) {
      const timer = setTimeout(() => {
        setLeaderSigningSubStep(2);
      }, 1500); // 1.5초 후 자동 전환
      return () => clearTimeout(timer);
    }
  }, [leaderSigningStage, leaderSigningSubStep]);

  // 리더 3-5 검증 단계 시뮬레이션
  useEffect(() => {
    if (leaderSigningStage === 3 && leaderSigningSubStep === 5) {
      // 검증 상태 초기화
      setLeaderVerificationStep1(false);
      setLeaderVerificationStep2(false);

      // 첫 번째 검증 (서명 데이터 확인) - 1초 후
      const timer1 = setTimeout(() => {
        setLeaderVerificationStep1(true);
      }, 1000);

      // 두 번째 검증 (서명자 주소 검증) - 2초 후
      const timer2 = setTimeout(() => {
        setLeaderVerificationStep2(true);
      }, 2000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [leaderSigningStage, leaderSigningSubStep]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleDownloadContract = async () => {
    if (!contract) {
      alert('계약서 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }
    try {
      await generateContractPDF(contract);
    } catch (error) {
      console.error('PDF 생성 실패:', error);
      alert('PDF 생성에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // const handleDownloadNFT = async () => {
  //   if (!contract) {
  //     alert('계약서 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
  //     return;
  //   }
  //   try {
  //     // NFT 이미지 생성
  //     const { activeImage } = await generateNFTImageBundle(contract);

  //     // Blob을 다운로드
  //     const url = URL.createObjectURL(activeImage);
  //     const a = document.createElement('a');
  //     a.href = url;
  //     a.download = `NFT_${contract.title}_${Date.now()}.png`;
  //     a.click();
  //     URL.revokeObjectURL(url);
  //   } catch (error) {
  //     console.error('NFT 이미지 생성 실패:', error);
  //     alert('NFT 이미지 생성에 실패했습니다. 다시 시도해주세요.');
  //   }
  // };

  const handleChat = () => {
    // navigate('/chat', {
    //   state: { projectId, otherMemberId, projectTitle, otherMemberName, otherMemberProfileUrl },
    if (!contract) return;

    // 현재 사용자와 상대방 결정
    const otherMemberId =
      currentUserId === contract.leader.userId ? contract.artist.userId : contract.leader.userId;

    const otherMemberName =
      currentUserId === contract.leader.userId
        ? contract.artist.nickname
        : contract.leader.nickname;

    // 채팅 페이지로 이동
    navigate('/chat', {
      state: {
        projectId: contract.project.projectId,
        otherMemberId: otherMemberId,
        projectTitle: contract.project.title,
        otherMemberName: otherMemberName,
      },
    });
  };

  const handleSettlementClick = () => {
    setShowSettlementConfirm(true);
  };

  const handleSettlementConfirm = async () => {
    if (!contract) return;

    try {
      // 계약 완료 및 구매 확정 API 호출
      console.log('[ContractView] Confirming payment...');
      const response = await confirmPayment(contract.contractId);

      console.log('[ContractView] Payment confirmed:', response);

      setShowSettlementConfirm(false);

      // 정산 완료 모달 표시
      setShowSettlementSuccessModal(true);
    } catch (err: any) {
      console.error('[ContractView] Payment confirmation failed:', err);
      alert(err.response?.data?.message || '정산 요청에 실패했습니다.');
      setShowSettlementConfirm(false);
    }
  };

  const handleSettlementCancel = () => {
    setShowSettlementConfirm(false);
  };

  // 정산 완료 모달 - 닫기 버튼
  const handleSettlementSuccessClose = () => {
    window.location.reload();
  };

  // 정산 완료 모달 - 리뷰 남기기 버튼
  const handleSettlementSuccessReview = () => {
    setShowSettlementSuccessModal(false);
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async (rating: number, content: string) => {
    if (!contract) return;

    try {
      // 리더가 리뷰를 작성하는 경우 아티스트에게, 아티스트가 작성하는 경우 리더에게
      const revieweeMemberId =
        currentUserId === contract.leader.userId ? contract.artist.userId : contract.leader.userId;

      console.log('[ContractView] Submitting review...', {
        contractId: contract.contractId,
        revieweeMemberId,
        rating,
        comment: content,
      });

      await createReview({
        contractId: contract.contractId,
        revieweeMemberId,
        rating,
        comment: content,
      });

      setShowReviewModal(false);

      // 리뷰 작성 완료 모달 표시
      setShowReviewSuccessModal(true);
    } catch (err: any) {
      console.error('[ContractView] Review submission failed:', err);
      alert(err.response?.data?.message || '리뷰 등록에 실패했습니다.');
    }
  };

  const handleReviewCancel = () => {
    setShowReviewModal(false);
  };

  // 리뷰 작성 완료 모달 - 확인 버튼
  const handleReviewSuccessConfirm = () => {
    window.location.reload();
  };

  // 아티스트 서명 확인
  const checkArtistSignature = useCallback(async () => {
    if (!contractId || contract?.status !== 'ARTIST_SIGNED') return;

    setIsCheckingSignature(true);
    try {
      await getSignatureData(Number(contractId));
      setHasArtistSignature(true);
      console.log('[ContractView] Artist signature confirmed');
    } catch (err) {
      console.error('[ContractView] Artist signature check failed:', err);
      setHasArtistSignature(false);
    } finally {
      setIsCheckingSignature(false);
    }
  }, [contractId, contract?.status]);

  // 계약서 로드 후 ARTIST_SIGNED 상태면 서명 확인
  useEffect(() => {
    if (contract?.status === 'ARTIST_SIGNED') {
      checkArtistSignature();
    }
  }, [contract?.status, checkArtistSignature]);

  const handleAcceptClick = () => {
    // 모달 열 때 스크롤 및 동의 상태 초기화
    setLeaderHasScrolledToBottom(false);
    setLeaderHasAgreed(false);
    setLeaderSigningStage(1);
    setCurrentSignature('');
    setShowAcceptConfirm(true);
  };

  const handleAcceptCancel = () => {
    setShowAcceptConfirm(false);
  };

  const handleLeaderSignStart = () => {
    // 서명 버튼 클릭 시 2단계로 전환
    setLeaderSigningStage(2);
  };

  // 결제 재시도 (PAYMENT_PENDING 상태에서)
  const handleRetryPayment = async () => {
    if (!contract) return;

    // leaderSignature가 없으면 에러
    if (!contract.leaderSignature) {
      alert('리더 서명 정보가 없습니다. 계약서를 다시 확인해주세요.');
      return;
    }

    try {
      // 1. finalize API를 다시 호출해서 실제 paymentInfo 받아오기
      console.log('[ContractView] Retrying payment - fetching payment info...');
      console.log('[ContractView] Using leaderSignature:', contract.leaderSignature);

      const response = await finalizeContract(contract.contractId, {
        leaderSignature: contract.leaderSignature,
        nftImageUrl: '', // 재시도 시에는 빈 문자열 (백엔드에서 기존 URL 사용)
      });

      console.log('[ContractView] Payment info received:', response);

      if (!response || !response.paymentInfo) {
        throw new Error('백엔드로부터 올바른 결제 정보를 받지 못했습니다.');
      }

      // 2. 토스페이먼츠 결제창 호출
      const tossClientKey = import.meta.env.VITE_TOSS_CLIENT_KEY;

      // TossPayments 스크립트 로드 확인
      if (!window.TossPayments) {
        throw new Error('Toss Payments SDK가 로드되지 않았습니다.');
      }

      const tossPayments = window.TossPayments(tossClientKey);

      if (!tossPayments || typeof tossPayments.requestPayment !== 'function') {
        throw new Error('Toss Payments SDK가 제대로 로드되지 않았습니다.');
      }

      // 실제 paymentInfo로 결제창 호출
      console.log('[ContractView] Opening payment window with:', response.paymentInfo);

      tossPayments.requestPayment('카드', {
        amount: response.paymentInfo.amount,
        orderId: response.paymentInfo.orderId,
        orderName: response.paymentInfo.productName,
        customerName: response.paymentInfo.customerName,
        successUrl: `${window.location.origin}/payment-success`,
        failUrl: `${window.location.origin}/payment-fail`,
      });
    } catch (err: any) {
      console.error('[ContractView] Payment retry failed:', err);
      console.error('[ContractView] Error response data:', err.response?.data);
      console.error('[ContractView] Error response status:', err.response?.status);
      alert('결제창 호출에 실패했습니다: ' + (err.response?.data?.message || err.message || ''));
    }
  };

  // 최종 서명 성공 시 처리
  const handleFinalizeSuccess = useCallback(
    async (signature: `0x${string}`) => {
      if (!contract) return;

      setCurrentSignature(signature);
      setIsSubmitting(true);

      try {
        console.log('[ContractView] Finalizing contract...');

        console.log('[ContractView] NFT 이미지 생성 시작...');

        // 1. NFT 이미지 생성
        const { activeImage, completedImage, canceledImage } =
          await generateNFTImageBundle(contract);

        console.log('[ContractView] NFT 이미지 업로드 중...');

        // 3. 이미지 업로드 및 URL 받기
        const nftImageUrl = await uploadNFTImageBundle(
          contract.contractId,
          activeImage,
          completedImage,
          canceledImage,
        );

        console.log('[ContractView] NFT 이미지 URL:', nftImageUrl);

        // 4. 백엔드에 최종 승인 요청 (서명 + NFT 이미지 URL)
        const response = await finalizeContract(contract.contractId, {
          leaderSignature: signature,
          nftImageUrl: nftImageUrl,
        });
        console.log('[ContractView] Finalize response:', response);
        if (!response || !response.paymentInfo) {
          throw new Error('백엔드로부터 올바른 결제 정보를 받지 못했습니다.');
        }

        // 결제 정보 저장 (버튼 클릭 시 사용)
        setPaymentInfo({
          amount: response.paymentInfo.amount,
          orderId: response.paymentInfo.orderId,
          productName: response.paymentInfo.productName,
          customerName: response.paymentInfo.customerName,
        });

        // 2초 후 4단계(완료 화면)로 전환
        setTimeout(() => {
          setLeaderSigningStage(4);
        }, 2000);
      } catch (err: any) {
        console.error('[ContractView] Finalize failed:', err);
        alert(
          '계약 체결에 실패했습니다: ' +
            (err.response?.data?.message || err.message || '알 수 없는 오류'),
        );
        setShowAcceptConfirm(false);
      } finally {
        setIsSubmitting(false);
      }
    },
    [contract],
  );

  const handleSignError = useCallback((err: Error) => {
    alert(`서명 오류: ${err.message}`);
    setShowAcceptConfirm(false);
  }, []);

  // "계약금 결제하기" 버튼 클릭 시 결제 진행
  const handlePaymentProceed = useCallback(() => {
    if (!paymentInfo) {
      alert('결제 정보를 찾을 수 없습니다.');
      return;
    }

    try {
      console.log('[ContractView] Starting payment process...');

      // 모달 닫기
      setShowAcceptConfirm(false);

      // 토스페이먼츠 결제창 호출
      const tossClientKey = import.meta.env.VITE_TOSS_CLIENT_KEY;
      if (!window.TossPayments) {
        throw new Error('Toss Payments SDK가 로드되지 않았습니다.');
      }
      const tossPayments = window.TossPayments(tossClientKey);
      if (!tossPayments || typeof tossPayments.requestPayment !== 'function') {
        throw new Error('Toss Payments SDK가 제대로 로드되지 않았습니다.');
      }

      tossPayments.requestPayment('카드', {
        amount: paymentInfo.amount,
        orderId: paymentInfo.orderId,
        orderName: paymentInfo.productName,
        customerName: paymentInfo.customerName,
        successUrl: `${window.location.origin}/payment-success`,
        failUrl: `${window.location.origin}/payment-fail`,
      });
    } catch (err: any) {
      alert('결제창 호출에 실패했습니다: ' + (err.message || ''));
    }
  }, [paymentInfo]);

  // 리더: 계약 철회
  const handleWithdrawClick = () => {
    setShowWithdrawModal(true);
  };

  const handleWithdrawConfirm = async () => {
    if (!contract) return;

    try {
      console.log('[ContractView] Leader withdrawing contract...');
      await withdrawContract(contract.contractId);
      setShowWithdrawModal(false);
      setShowWithdrawSuccessModal(true);
    } catch (err: any) {
      console.error('[ContractView] Withdraw failed:', err);
      setWithdrawErrorMessage(err.response?.data?.message || '계약 철회에 실패했습니다.');
      setShowWithdrawModal(false);
      setShowWithdrawErrorModal(true);
    }
  };

  const handleWithdrawCancel = () => {
    setShowWithdrawModal(false);
  };

  const handleWithdrawSuccessConfirm = () => {
    setShowWithdrawSuccessModal(false);
    navigate('/leader-project-list');
  };

  const handleWithdrawErrorConfirm = () => {
    setShowWithdrawErrorModal(false);
    setWithdrawErrorMessage('');
  };

  // 계약 취소 요청
  const handleCancelClick = () => {
    setCancelReason('');
    setShowCancelReasonModal(true);
  };

  const handleCancelSubmit = async () => {
    if (!contract) return;

    if (!cancelReason.trim()) {
      alert('취소 사유를 입력해주세요.');
      return;
    }

    try {
      console.log('[ContractView] Canceling contract...');
      await cancelContract(contract.contractId, cancelReason);
      setShowCancelReasonModal(false);
      setShowCancelSuccessModal(true);
    } catch (err: any) {
      console.error('[ContractView] Cancel failed:', err);

      let errorMsg = '계약 취소 요청에 실패했습니다.';

      if (err.response) {
        const { status, data } = err.response;

        switch (status) {
          case 400:
            errorMsg = data?.message || '입력 값이 올바르지 않습니다. 다시 확인해주세요.';
            break;
          case 401:
            errorMsg = '로그인이 만료되었습니다. 다시 로그인해주세요.';
            break;
          case 403:
            errorMsg = '계약 당사자만 취소 요청을 할 수 있습니다.';
            break;
          case 404:
            errorMsg = '계약을 찾을 수 없습니다.';
            break;
          case 409:
            errorMsg = data?.message || '현재 상태에서는 취소 요청을 할 수 없습니다.';
            break;
          case 500:
            errorMsg = '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
            break;
          default:
            errorMsg = data?.message || errorMsg;
        }
      }

      setCancelErrorMessage(errorMsg);
      setShowCancelReasonModal(false);
      setShowCancelErrorModal(true);
    }
  };

  const handleCancelReasonCancel = () => {
    setShowCancelReasonModal(false);
    setCancelReason('');
  };

  // 리더: 계약서 재작성 (contract-draft 페이지로 이동)
  const handleRedraftContract = () => {
    if (!contract) return;
    // contract-draft 페이지로 이동하면서 계약 정보를 전달
    navigate('/contract-draft', {
      state: {
        mode: 'edit',
        contract: contract,
      },
    });
  };

  // 아티스트: 계약 거절
  const handleArtistDeclineClick = () => {
    setShowArtistDeclineModal(true);
  };

  const handleArtistDeclineConfirm = async () => {
    if (!contract) return;

    try {
      console.log('[ContractView] Artist declining contract...');
      await declineContract(contract.contractId);

      setShowArtistDeclineModal(false);
      setShowArtistDeclineSuccessModal(true);

      // 계약 정보를 새로 불러와서 상태 업데이트
      const updatedContract = await getContractById(contract.contractId);
      setContract(updatedContract);
    } catch (err: any) {
      console.error('[ContractView] Decline failed:', err);
      alert(err.response?.data?.message || '계약 거절에 실패했습니다.');
      setShowArtistDeclineModal(false);
    }
  };

  const handleArtistDeclineCancel = () => {
    setShowArtistDeclineModal(false);
  };

  const handleArtistDeclineSuccessConfirm = () => {
    setShowArtistDeclineSuccessModal(false);
  };

  // NFT 블록체인 탐색기에서 보기
  const handleViewNFTExplorer = () => {
    if (!contract) return;

    // NFT 정보가 있는지 체크
    if (!contract.nftInfo) {
      alert('NFT가 아직 발행되지 않았습니다.');
      return;
    }

    // explorerUrl이 있는지 체크
    if (!contract.nftInfo.explorerUrl) {
      alert('블록체인 탐색기 URL을 찾을 수 없습니다.');
      return;
    }

    // 새 창에서 NFT 탐색기 열기
    window.open(contract.nftInfo.explorerUrl, '_blank', 'noopener,noreferrer');
  };

  // 아티스트: 계약 수락 (서명)
  const handleArtistAcceptClick = () => {
    // 모달 열 때 스크롤 및 동의 상태 초기화
    setArtistHasScrolledToBottom(false);
    setArtistCheck1(false);
    setArtistCheck2(false);
    setArtistCheck3(false);
    setArtistCheck4(false);
    setArtistSigningStage(1);
    setArtistSigningSubStep(0);
    setCurrentSignature('');
    setShowArtistAcceptModal(true);
  };

  const handleArtistSignSuccess = useCallback(
    async (signature: `0x${string}`) => {
      if (!contract) return;

      setCurrentSignature(signature);
      setIsSubmitting(true);

      try {
        console.log('[ContractView] Artist signing contract...');
        console.log('[ContractView] Signature received, submitting to backend');

        // 백엔드에 서명 제출
        const response = await acceptContract(contract.contractId, signature);
        console.log('[ContractView] Sign response:', response);

        // 2초 후 Stage 4 (완료)로 전환
        setTimeout(() => {
          setArtistSigningStage(4);
          setArtistSigningSubStep(0);
        }, 2000);
      } catch (err: any) {
        console.error('[ContractView] Artist sign failed:', err);
        alert(err.response?.data?.message || '서명에 실패했습니다.');
        setShowArtistAcceptModal(false);
        // 상태 리셋
        setArtistSigningStage(1);
        setArtistSigningSubStep(0);
      } finally {
        setIsSubmitting(false);
      }
    },
    [contract],
  );

  const handleArtistSignError = useCallback((err: Error) => {
    alert(`서명 오류: ${err.message}`);
    setShowArtistAcceptModal(false);
    // 상태 리셋
    setArtistSigningStage(1);
    setArtistSigningSubStep(0);
  }, []);

  const handleArtistAcceptCancel = async () => {
    // Stage 4 (완료 단계)에서 확인 버튼을 누른 경우
    if (artistSigningStage === 4 && contract) {
      setShowArtistAcceptModal(false);
      // 상태 리셋
      setArtistSigningStage(1);
      setArtistSigningSubStep(0);
      setArtistHasScrolledToBottom(false);
      setArtistCheck1(false);
      setArtistCheck2(false);
      setArtistCheck3(false);
      setArtistCheck4(false);

      // 계약 정보 새로고침
      try {
        const updatedContract = await getContractById(contract.contractId);
        setContract(updatedContract);
      } catch (err) {
        console.error('[ContractView] Failed to refresh contract:', err);
      }
    } else {
      // 일반적인 취소
      setShowArtistAcceptModal(false);
      // 상태 리셋
      setArtistSigningStage(1);
      setArtistSigningSubStep(0);
      setArtistHasScrolledToBottom(false);
      setArtistCheck1(false);
      setArtistCheck2(false);
      setArtistCheck3(false);
      setArtistCheck4(false);
    }
  };

  // 리더 모달: 스크롤 감지 핸들러
  const handleLeaderContractScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const isAtBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 10;
    if (isAtBottom && !leaderHasScrolledToBottom) {
      setLeaderHasScrolledToBottom(true);
    }
  };

  const handleRejectClick = () => {
    // 계약 철회 모달 표시 (ARTIST_SIGNED, PAYMENT_PENDING 상태에서 사용)
    setShowWithdrawModal(true);
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
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

  // 금액 포맷팅
  const formatAmount = (amount: number) => {
    return amount.toLocaleString('ko-KR');
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-moas-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-moas-main border-t-transparent" />
          <p className="font-pretendard text-sm text-moas-gray-7">계약서를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error || !contract) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-moas-white">
        <div className="flex flex-col items-center gap-6 rounded-3xl bg-white p-12 shadow-lg">
          <AlertCircle className="h-16 w-16 text-moas-artist" />
          <h2 className="font-pretendard text-2xl font-bold text-moas-text">
            {error || '계약서를 찾을 수 없습니다'}
          </h2>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            돌아가기
          </Button>
        </div>
      </div>
    );
  }

  // 상태 배지 스타일
  const getStatusStyle = () => {
    switch (contract.status) {
      case 'PENDING':
        return { label: '계약 제안', className: 'bg-[#E5F8FF] text-[#47B8E0] border-[#E5F8FF]' };
      case 'DECLINED':
        // 아티스트 입장: "거절 제안", 리더 입장: "거절 제안"
        return { label: '거절 제안', className: 'bg-[#FFEFEF] text-[#E91A27] border-[#FFEFEF]' };
      case 'WITHDRAWN':
        return { label: '거절됨', className: 'bg-[#FFEFEF] text-[#E91A27] border-[#FFEFEF]' };
      case 'ACCEPTED':
        return { label: '수락됨', className: 'bg-[#E4FFFA] text-[#258E93] border-[#E4FFFA]' };
      case 'ARTIST_SIGNED':
        // 리더 입장: "수락됨", 아티스트 입장: "서명 완료"
        if (currentUserId === contract.leader.userId) {
          return { label: '수락됨', className: 'bg-[#FFF9E6] text-[#FFA940] border-[#FFF9E6]' };
        } else {
          return {
            label: '계약서 제안중',
            className: 'bg-[#FFF9E6] text-[#FFA940] border-[#FFF9E6]',
          };
        }
      case 'PAYMENT_PENDING':
        // 리더 입장: "결제 대기", 아티스트 입장: "서명"
        if (currentUserId === contract.leader.userId) {
          return { label: '결제 대기', className: 'bg-[#F8F8FF] text-[#7444E3] border-[#F8F8FF]' };
        } else {
          return { label: '서명', className: 'bg-[#F8F8FF] text-[#7444E3] border-[#F8F8FF]' };
        }
      case 'PAYMENT_COMPLETED':
        return { label: '계약 체결', className: 'bg-[#E4FFFA] text-[#258E93] border-[#E4FFFA]' };
      case 'COMPLETED':
        return { label: '정산 완료', className: 'bg-[#F8F8FF] text-[#7444E3] border-[#F8F8FF]' };
      case 'CANCELLATION_REQUESTED':
        return {
          label: '계약 파기 대기 중',
          className: 'bg-[#FFF9E6] text-[#FFA940] border-[#FFF9E6]',
        };
      case 'CANCELED':
        return { label: '파기된 계약', className: 'bg-[#F5F5F5] text-[#666666] border-[#F5F5F5]' };
      case 'REJECTED':
        return { label: '거절됨', className: 'bg-[#FFEFEF] text-[#E91A27] border-[#FFEFEF]' };
      case 'SETTLED':
        return { label: '정산 완료', className: 'bg-[#FFF9E5] text-[#FFC952] border-[#FFF9E5]' };
      default:
        return { label: '알 수 없음', className: 'bg-[#F5F5F5] text-[#666666] border-[#F5F5F5]' };
    }
  };

  const statusStyle = getStatusStyle();

  return (
    <div className="min-h-screen font-pretendard">
      <div className="mx-auto max-w-[1200px] px-8">
        {/* 헤더 */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-moas-gray-1"
            >
              <ArrowLeft className="h-6 w-6 text-moas-text" />
            </button>
            <h1 className="text-[32px] font-bold leading-none text-moas-text">계약서 상세</h1>
          </div>

          {/* 액션 버튼들 */}
          <div className="flex items-center gap-3">
            <Button onClick={handleChat} variant="outline" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              채팅하기
            </Button>
            <Button
              onClick={handleDownloadContract}
              className="flex items-center gap-2 bg-moas-main text-moas-text hover:bg-moas-main/90"
            >
              <Download className="h-4 w-4" />
              계약서 다운로드
            </Button>
            {/* <Button
              onClick={handleDownloadNFT}
              className="flex items-center gap-2 bg-moas-artist text-white hover:bg-moas-artist/90"
            >
              <Download className="h-4 w-4" />
              NFT 이미지 다운로드
            </Button> */}
          </div>
        </div>

        {/* 메인 레이아웃: 왼쪽 NFT 카드 + 오른쪽 정보 */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[400px_1fr]">
          {/* 왼쪽: NFT 카드 */}
          <div className="flex justify-center lg:justify-start">
            <div className="w-full max-w-[400px]">
              <NFTCard
                contract={contract}
                thumbnailOverride={projectThumbnailUrl}
                titleOverride={projectTitle}
              />
            </div>
          </div>

          {/* 오른쪽: 계약 정보 */}
          <div className="space-y-6">
            {/* 정산 대기 섹션 */}
            <div className="rounded-2xl bg-white p-6 shadow-md">
              <div className="mb-4 flex items-center justify-between">
                <Badge className={statusStyle.className}>{statusStyle.label}</Badge>
              </div>

              {/* 프로젝트명 / 계약 제목 */}
              <div className="mb-6">
                <h3 className="mb-2 text-2xl font-bold text-moas-text">
                  {contract.status === 'PAYMENT_COMPLETED' || contract.status === 'COMPLETED'
                    ? contract.title
                    : contract.project.title}
                </h3>
                <p className="text-base text-moas-gray-7">
                  프로젝트 리더: {contract.leader.nickname}
                </p>
                <p className="text-base text-moas-gray-7">아티스트: {contract.artist.nickname}</p>
              </div>

              {/* 금액 및 기간 정보 */}
              <div className="space-y-4">
                <div>
                  <div className="mb-1 text-sm text-moas-gray-6">계약금</div>
                  <div className="text-2xl font-bold text-moas-text">
                    {formatAmount(contract.totalAmount)}원
                    <span className="ml-2 text-base font-normal text-moas-gray-6">
                      (수수료 5% 포함)
                    </span>
                  </div>
                </div>

                <div>
                  <div className="mb-1 text-sm text-moas-gray-6">계약 기간</div>
                  <div className="text-base font-semibold text-moas-text">
                    {formatDate(contract.startAt)} ~ {formatDate(contract.endAt)}
                  </div>
                </div>

                {/* 스마트 컨트랙트 주소 */}
                {contract.nftInfo && (
                  <div className="bg-moas-gray-1 rounded-lg border border-gray-300 p-4 mt-4">
                    <div className="mb-2 text-base text-moas-gray-9">
                      NFT 토큰 ID: #{contract.nftInfo.tokenId}
                    </div>
                    <div className="mb-3 text-sm text-moas-gray-9">
                      Transaction Hash: {contract.nftInfo.mintTxHash}
                    </div>

                    <button
                      onClick={handleViewNFTExplorer}
                      className="text-sm text-moas-leader hover:underline"
                    >
                      블록체인 탐색기에서 보기
                    </button>
                  </div>
                )}
              </div>

              {/* 버튼 */}
              <div className="mt-6 flex gap-3">
                {/* 아티스트용 UI */}
                {currentUserId === contract.artist.userId && currentUserRole === 'ARTIST' && (
                  <>
                    {contract.status === 'PENDING' && (
                      <>
                        <button
                          onClick={handleArtistDeclineClick}
                          className="flex-1 rounded-lg border-2 border-moas-gray-2 bg-white px-6 py-3 text-base font-bold text-moas-text transition-colors hover:bg-moas-gray-1"
                        >
                          계약 거절
                        </button>
                        <button
                          onClick={handleArtistAcceptClick}
                          className="flex-1 rounded-lg bg-moas-text px-6 py-3 text-base font-bold text-white transition-opacity hover:opacity-90"
                        >
                          계약 수락
                        </button>
                      </>
                    )}

                    {contract.status === 'DECLINED' && (
                      <button
                        disabled
                        className="flex flex-1 items-center justify-center gap-2 cursor-not-allowed rounded-lg bg-moas-gray-3 px-6 py-3 text-base font-bold text-moas-gray-5 opacity-60"
                      >
                        <Hourglass className="h-5 w-5" />
                        리더 응답 대기중
                      </button>
                    )}

                    {contract.status === 'ARTIST_SIGNED' && (
                      <button
                        disabled
                        className="flex flex-1 items-center justify-center gap-2 cursor-not-allowed rounded-lg bg-moas-gray-3 px-6 py-3 text-base font-bold text-moas-gray-5 opacity-60"
                      >
                        <Hourglass className="h-5 w-5" />
                        리더 응답 대기중
                      </button>
                    )}

                    {contract.status === 'PAYMENT_PENDING' && (
                      <button
                        disabled
                        className="flex flex-1 items-center justify-center gap-2 cursor-not-allowed rounded-lg bg-moas-gray-3 px-6 py-3 text-base font-bold text-moas-gray-5 opacity-60"
                      >
                        <Hourglass className="h-5 w-5" />
                        리더 응답 대기중
                      </button>
                    )}

                    {contract.status === 'PAYMENT_COMPLETED' && (
                      <button
                        onClick={handleCancelClick}
                        className="flex-1 rounded-lg border-2 border-moas-error bg-white px-6 py-3 text-base font-bold text-moas-error transition-colors hover:bg-red-50"
                      >
                        계약 취소 요청
                      </button>
                    )}
                  </>
                )}

                {/* 리더용 UI */}
                {currentUserId === contract.leader.userId && currentUserRole === 'LEADER' && (
                  <>
                    {contract.status === 'PENDING' && (
                      <>
                        <button
                          onClick={handleWithdrawClick}
                          className="flex-1 rounded-lg border-2 border-moas-gray-2 bg-white px-6 py-3 text-base font-bold text-moas-text transition-colors hover:bg-moas-gray-1"
                        >
                          계약 철회
                        </button>
                        <button
                          disabled
                          className="flex-1 cursor-not-allowed rounded-lg bg-moas-gray-3 px-6 py-3 text-base font-bold text-moas-gray-5 opacity-60"
                        >
                          아티스트 응답 대기중
                        </button>
                      </>
                    )}

                    {contract.status === 'DECLINED' && (
                      <>
                        <button
                          onClick={handleWithdrawClick}
                          className="flex-1 rounded-lg border-2 border-moas-gray-2 bg-white px-6 py-3 text-base font-bold text-moas-text transition-colors hover:bg-moas-gray-1"
                        >
                          계약 철회
                        </button>
                        <button
                          onClick={handleRedraftContract}
                          className="flex-1 rounded-lg bg-moas-text px-6 py-3 text-base font-bold text-white transition-opacity hover:opacity-90"
                        >
                          계약서 재작성
                        </button>
                      </>
                    )}

                    {contract.status === 'ARTIST_SIGNED' && (
                      <>
                        <button
                          onClick={handleRejectClick}
                          className="flex-1 rounded-lg border-2 border-moas-gray-2 bg-white px-6 py-3 text-base font-bold text-moas-text transition-colors hover:bg-moas-gray-1"
                        >
                          계약 철회
                        </button>
                        <button
                          onClick={handleAcceptClick}
                          className="flex-1 rounded-lg bg-moas-text px-6 py-3 text-base font-bold text-white transition-opacity hover:opacity-90"
                        >
                          최종 수락
                        </button>
                      </>
                    )}

                    {contract.status === 'PAYMENT_PENDING' && (
                      <>
                        <button
                          onClick={handleRejectClick}
                          className="flex-1 rounded-lg border-2 border-moas-gray-2 bg-white px-6 py-3 text-base font-bold text-moas-text transition-colors hover:bg-moas-gray-1"
                        >
                          계약 철회
                        </button>
                        <button
                          onClick={handleRetryPayment}
                          className="flex-1 rounded-lg bg-moas-main px-6 py-3 text-base font-bold text-moas-text transition-opacity hover:opacity-90"
                        >
                          예산 선결제
                        </button>
                      </>
                    )}

                    {contract.status === 'PAYMENT_COMPLETED' && (
                      <>
                        <button
                          onClick={handleCancelClick}
                          className="flex-1 rounded-lg border-2 border-moas-error bg-white px-6 py-3 text-base font-bold text-moas-error transition-colors hover:bg-red-50"
                        >
                          계약 취소 요청
                        </button>
                        <button
                          onClick={handleSettlementClick}
                          className="flex-1 rounded-lg bg-moas-text px-6 py-3 text-base font-bold text-white transition-opacity hover:opacity-90"
                        >
                          정산하기
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 프로젝트 상세 설명 */}
        <div className="mt-8 rounded-2xl bg-moas-gray-1 p-8">
          <h3 className="mb-4 text-xl font-bold text-moas-text"> 계약 상세 설명</h3>
          <MarkdownViewer content={contract.description} />
        </div>

        {/* 블록체인 인증 정보 (NFT가 발행된 경우만) */}
        {/* {contract.nftInfo && (
          <div className="mt-6 rounded-2xl bg-white p-8 shadow-md">
            <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-moas-text">
              <span>🔗</span>
              블록체인 인증 정보
            </h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <div className="mb-2 text-sm text-moas-gray-6">Token ID</div>
                <div className="break-all rounded-xl bg-moas-gray-1 px-4 py-3 font-mono text-sm text-moas-text">
                  {contract.nftInfo.tokenId}
                </div>
              </div>
              <div>
                <div className="mb-2 text-sm text-moas-gray-6">Mint Transaction Hash</div>
                <div className="break-all rounded-xl bg-moas-gray-1 px-4 py-3 font-mono text-sm text-moas-text">
                  {contract.nftInfo.mintTxHash}
                </div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-6">
              <div>
                <div className="mb-1 text-sm text-moas-gray-6">Network</div>
                <div className="text-base font-semibold text-moas-text">Polygon Mumbai</div>
              </div>
              <div>
                <div className="mb-1 text-sm text-moas-gray-6">Minted At</div>
                <div className="text-base font-semibold text-moas-text">
                  {formatDate(contract.createdAt)}
                </div>
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={handleViewNFTExplorer}
                className="inline-flex items-center gap-2 text-moas-leader hover:underline"
              >
                블록체인 탐색기에서 확인하기
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          </div>
        )} */}
      </div>

      {/* 정산 확인 모달 */}
      {showSettlementConfirm && (
        <ConfirmModal
          title="정산하기"
          message="정산하시겠습니까?"
          confirmText="예"
          cancelText="아니오"
          onConfirm={handleSettlementConfirm}
          onCancel={handleSettlementCancel}
        />
      )}

      {/* 계약 수락 및 최종 서명 모달 */}
      {/* 리더 서명 모달 */}
      <SigningModal
        isOpen={showAcceptConfirm && !isCheckingSignature}
        onClose={handleAcceptCancel}
        contract={contract!}
        userRole="LEADER"
        onSignSuccess={handleFinalizeSuccess}
        onSignError={handleSignError}
        onPaymentProceed={handlePaymentProceed}
        state={{
          signingStage: leaderSigningStage,
          setSigningStage: setLeaderSigningStage,
          signingSubStep: leaderSigningSubStep,
          setSigningSubStep: setLeaderSigningSubStep,
          check1: leaderCheck1,
          setCheck1: setLeaderCheck1,
          check2: leaderCheck2,
          setCheck2: setLeaderCheck2,
          check3: leaderCheck3,
          setCheck3: setLeaderCheck3,
          check4: leaderCheck4,
          setCheck4: setLeaderCheck4,
          verificationStep1: leaderVerificationStep1,
          setVerificationStep1: setLeaderVerificationStep1,
          verificationStep2: leaderVerificationStep2,
          setVerificationStep2: setLeaderVerificationStep2,
          currentSignature,
          setCurrentSignature,
        }}
        isSubmitting={isSubmitting}
        address={address}
      />

      {/* 아티스트 서명 확인 중 로딩 모달 */}
      {showAcceptConfirm && contract && isCheckingSignature && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="rounded-2xl bg-white p-8 shadow-xl">
            <div className="py-8 text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-moas-main border-t-transparent" />
              <p className="text-sm text-moas-gray-7">아티스트 서명 확인 중...</p>
            </div>
          </div>
        </div>
      )}

      {/* 아티스트 서명 없음 경고 모달 */}
      {showAcceptConfirm && contract && !isCheckingSignature && !hasArtistSignature && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="rounded-2xl bg-white p-8 shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-moas-text">최종 서명 및 결제</h2>
            <div className="space-y-4">
              <p className="text-sm text-moas-artist">
                ⚠️ 아티스트의 서명이 확인되지 않았습니다. 아티스트가 먼저 계약서에 서명해야 합니다.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleAcceptCancel}
                  className="flex-1 rounded-lg border-2 border-moas-gray-2 bg-white px-6 py-3 text-base font-bold text-moas-text transition-colors hover:bg-moas-gray-1"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 기존 리더 모달 (숨김 처리) */}
      {showAcceptConfirm && false && contract && !isCheckingSignature && hasArtistSignature && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            ref={leaderModalRef}
            className="relative flex w-full max-w-5xl h-[95vh] flex-col gap-6 rounded-2xl bg-white p-8 shadow-xl overflow-y-auto"
          >
            {/* 닫기 버튼 (X) */}
            <button
              onClick={handleAcceptCancel}
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
            <div className="w-full pt-4 pb-3">
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
                        className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold transition-all ${
                          stage.num < leaderSigningStage
                            ? 'bg-moas-main text-white'
                            : stage.num === leaderSigningStage
                              ? 'bg-moas-main text-white'
                              : 'bg-moas-gray-3 text-moas-gray-6'
                        }`}
                      >
                        {stage.num < leaderSigningStage ? '✓' : stage.num}
                      </div>
                      <p
                        className={`mt-2 text-xs font-medium transition-all ${
                          stage.num <= leaderSigningStage ? 'text-moas-text' : 'text-moas-gray-6'
                        }`}
                      >
                        {stage.label}
                      </p>
                    </div>
                    {index < 3 && (
                      <div
                        className={`h-0.5 w-16 mx-1 transition-all ${
                          stage.num < leaderSigningStage ? 'bg-moas-main' : 'bg-moas-gray-3'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 기존 진행 바 제거를 위한 임시 div */}
            <div className="hidden">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((step) => (
                  <div
                    key={step}
                    className={`h-2 flex-1 rounded-full transition-all ${
                      step <= leaderSigningStage ? 'bg-moas-main' : 'bg-moas-gray-3'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Stage 1: 서명 안내 */}
            {leaderSigningStage === 1 && (
              <div className="flex flex-col items-center justify-center py-4">
                {/* 타이틀 + 애니메이션 */}
                <h2 className="text-3xl font-bold text-moas-text mb-2">계약서 서명 안내</h2>
                {/* Lottie 애니메이션 */}
                <div className="mb-6">
                  <div className="overflow-hidden" style={{ width: 400, height: 280 }}>
                    <div style={{ transform: 'translateY(-80px) translateX(-150px)' }}>
                      <Lottie
                        loop
                        animationData={leaderSignAnimation}
                        play
                        style={{ width: 700, height: 700 }}
                      />
                    </div>
                  </div>
                </div>

                {/* 경고 문구 */}
                <p className="text-lg font-semibold text-moas-error text-center mb-8">
                  본 서명은 블록체인에 EIP-712 표준으로 영구 기록되며, <br />
                  서명 후에는 수정이나 철회가 절대 불가능합니다.
                </p>

                {/* 다음 버튼 */}
                <button
                  onClick={() => {
                    setLeaderSigningStage(2);
                    leaderModalRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full max-w-md rounded-lg bg-moas-text px-8 py-4 text-lg font-bold text-white transition-opacity hover:opacity-90"
                >
                  계약 내용 확인하기
                </button>
              </div>
            )}

            {/* Stage 2: 계약 내용 확인 - 임시로 기존 Stage 1 유지 */}
            {leaderSigningStage === 2 && false && (
              <div className="flex w-full gap-6">
                {/* 왼쪽: 로티 애니메이션 */}
                <div className="flex w-2/5 flex-col items-center justify-between">
                  <div className="flex flex-col items-center">
                    <h2 className="mb-4 mt-4 text-4xl font-bold text-moas-text">최종 서명</h2>

                    {/* 아티스트 서명 확인 배지 */}
                    <div className="mb-4 w-full rounded-lg bg-green-50 border-2 border-green-200 p-4">
                      <p className="text-center text-sm font-semibold text-green-700">
                        ✓ 아티스트 서명 확인 완료
                      </p>
                    </div>

                    {/* 블록체인 경고 배너 */}
                    <div className="mb-4 w-full rounded-lg bg-amber-50 border-2 border-amber-200 p-4">
                      <div className="flex items-start gap-2">
                        <span className="text-2xl">⚠️</span>
                        <div>
                          <p className="text-sm font-bold text-amber-900">
                            블록체인에 영구 기록됩니다
                          </p>
                          <p className="text-xs text-amber-800 mt-1">
                            서명 후 자동으로 결제 페이지로 이동합니다
                          </p>
                        </div>
                      </div>
                    </div>

                    <Lottie
                      loop
                      animationData={leaderSignAnimation}
                      play
                      style={{ width: 300, height: 300 }}
                    />

                    <p className="mb-4 text-center text-sm text-moas-gray-7">
                      계약이 체결되면 수정할 수 없습니다.
                      <br />
                      최종 승인 이후 계약 해지 요청 시 패널티가 주어질 수 있습니다.
                    </p>
                  </div>

                  <div className="mt-6 flex w-full gap-3">
                    <div className="flex-1">
                      <button
                        onClick={handleAcceptCancel}
                        disabled={isSubmitting}
                        className="w-full rounded-lg border-2 border-moas-gray-2 bg-white px-6 py-3 text-base font-bold text-moas-text transition-colors hover:bg-moas-gray-1 disabled:opacity-60"
                      >
                        취소
                      </button>
                    </div>
                    <div className="flex-1">
                      <Eip712Signer
                        contractId={contract!.contractId}
                        buttonText="🔐 최종 서명하기"
                        onSignStart={handleLeaderSignStart}
                        onSignSuccess={handleFinalizeSuccess}
                        onSignError={handleSignError}
                        disabled={isSubmitting || !leaderHasAgreed}
                        className="w-full rounded-lg bg-moas-text px-6 py-3 text-base font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>
                  </div>
                </div>

                {/* 오른쪽: 계약서 상세 내용 */}
                <div className="w-3/5 flex flex-col">
                  <div
                    className="max-h-[500px] overflow-y-auto rounded-lg border-2 border-moas-gray-2 p-6"
                    onScroll={handleLeaderContractScroll}
                  >
                    <h3 className="mb-4 text-xl font-bold text-moas-text">계약서 상세 내용</h3>

                    <div className="space-y-4">
                      {/* 계약명 */}
                      <div>
                        <p className="text-sm font-semibold text-moas-gray-7">계약명</p>
                        <p className="text-base text-moas-text">{contract!.title}</p>
                      </div>

                      {/* 프로젝트 정보 */}
                      <div>
                        <p className="text-sm font-semibold text-moas-gray-7">프로젝트</p>
                        <p className="text-base text-moas-text">{contract!.project.title}</p>
                        <p className="text-sm text-moas-gray-6">
                          {contract!.project.categoryName} · {contract!.project.positionName}
                        </p>
                      </div>

                      {/* 금액 */}
                      <div>
                        <p className="text-sm font-semibold text-moas-gray-7">계약 금액</p>
                        <p className="text-lg font-bold text-moas-main">
                          {formatAmount(contract!.totalAmount)}원
                        </p>
                      </div>

                      {/* 계약 기간 */}
                      <div>
                        <p className="text-sm font-semibold text-moas-gray-7">계약 기간</p>
                        <p className="text-base text-moas-text">
                          {formatDate(contract!.startAt)} ~ {formatDate(contract!.endAt)}
                        </p>
                      </div>

                      {/* 상세 내용 */}
                      {contract!.description && (
                        <div>
                          <p className="text-sm font-semibold text-moas-gray-7">상세 내용</p>
                          <MarkdownViewer content={contract!.description} />
                        </div>
                      )}

                      {/* 당사자 정보 */}
                      <div className="rounded-lg bg-moas-gray-1 p-4">
                        <p className="mb-2 text-sm font-semibold text-moas-text">계약 당사자</p>
                        <p className="text-sm text-moas-gray-7">
                          리더: {contract!.leader.nickname}
                        </p>
                        <p className="text-sm text-moas-gray-7">
                          아티스트: {contract!.artist.nickname}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 동의 체크박스 */}
                  <div className="mt-4 rounded-lg bg-moas-gray-1 p-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={leaderHasAgreed}
                        onChange={(e) => setLeaderHasAgreed(e.target.checked)}
                        disabled={!leaderHasScrolledToBottom}
                        className="mt-1 h-5 w-5 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                      />
                      <span
                        className={`text-sm leading-relaxed ${!leaderHasScrolledToBottom ? 'text-moas-gray-5' : 'text-moas-text font-medium'}`}
                      >
                        {leaderHasScrolledToBottom
                          ? '해당 내용을 모두 읽어봤으며 계약 조건에 동의합니다.'
                          : '계약서를 끝까지 스크롤하면 동의할 수 있습니다.'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* 기존 2단계: 서명 요청 중 - 숨김 */}
            {leaderSigningStage === 99 && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="mb-8 text-center">
                  <div className="mb-6 inline-block h-20 w-20 animate-bounce">
                    <span className="text-7xl">🦊</span>
                  </div>
                  <h3 className="text-2xl font-bold text-moas-text mb-2">MetaMask 서명 요청</h3>
                  <p className="text-sm text-moas-gray-6">MetaMask에서 서명을 확인해주세요</p>
                </div>

                <div className="w-full max-w-2xl rounded-lg bg-amber-50 border-2 border-amber-200 p-6">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <p className="font-semibold text-amber-900 mb-2">서명 진행 안내</p>
                      <ul className="text-sm text-amber-800 space-y-1">
                        <li>• MetaMask 팝업이 자동으로 열립니다</li>
                        <li>• 계약 내용을 확인하고 서명해주세요</li>
                        <li>• 서명을 거부하면 계약이 취소됩니다</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 기존 3단계: 서명 실행 중 (MetaMask) - 숨김 */}
            {leaderSigningStage === 99 && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="mb-8 text-center">
                  <div className="mb-6 inline-block h-20 w-20">
                    <div className="animate-bounce">
                      <span className="text-7xl">🦊</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-moas-text mb-2">MetaMask 서명 실행 중</h3>
                  <p className="text-sm text-moas-gray-6">지갑에서 서명을 진행하고 있습니다...</p>
                </div>

                <div className="w-full max-w-2xl rounded-lg bg-blue-50 border-2 border-blue-200 p-6">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💡</span>
                    <div>
                      <p className="font-semibold text-blue-900 mb-2">서명 실행 중</p>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• 지갑에서 트랜잭션 서명이 진행되고 있습니다</li>
                        <li>• 잠시만 기다려주세요</li>
                        <li>• 창을 닫지 마세요</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 기존 4단계: ECDSA 서명 검증 중 - 숨김 */}
            {leaderSigningStage === 99 && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="mb-8 text-center">
                  <div className="mb-6 flex justify-center">
                    <Lottie
                      loop
                      animationData={verifyLoaderAnimation}
                      play
                      style={{ width: 200, height: 200 }}
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-moas-text mb-2">서명 검증 중</h3>
                  <p className="text-sm text-moas-gray-6">블록체인 전자서명을 검증하고 있습니다</p>
                </div>

                {/* 검증 단계 시각화 */}
                <div className="w-full max-w-2xl space-y-4">
                  <div className="flex items-start gap-4 rounded-lg bg-green-50 border-2 border-green-200 p-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white font-bold shrink-0">
                      ✓
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-green-900">서명 데이터 수신 완료</p>
                      <p className="text-xs text-green-700 mt-1 font-mono break-all">
                        {currentSignature.slice(0, 20)}...{currentSignature.slice(-20)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 rounded-lg bg-blue-50 border-2 border-blue-200 p-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-blue-900">ECDSA 공개키 복구 중...</p>
                      <p className="text-xs text-blue-700 mt-1">
                        EIP-712 구조화된 데이터로부터 서명자 검증
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 rounded-lg bg-moas-gray-1 border-2 border-moas-gray-3 p-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-moas-gray-4 text-white font-bold shrink-0">
                      3
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-moas-gray-7">
                        결제 및 블록체인 기록 대기 중
                      </p>
                      <p className="text-xs text-moas-gray-6 mt-1">
                        검증 완료 후 자동으로 결제 페이지로 이동합니다
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex items-center gap-2 rounded-lg bg-purple-50 border border-purple-200 px-4 py-2">
                  <span className="text-2xl">🔒</span>
                  <span className="text-sm text-purple-900 font-medium">
                    타원곡선 암호화 (ECDSA)로 위조 불가능한 서명 검증 중
                  </span>
                </div>
              </div>
            )}

            {/* 기존 5단계: 서명 완료 - 결제 진행 - 숨김 */}
            {leaderSigningStage === 99 && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="mb-6">
                  <div className="relative">
                    <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-6xl">✅</span>
                    </div>
                    <div className="absolute inset-0 animate-ping opacity-75">
                      <div className="h-24 w-24 rounded-full bg-green-200"></div>
                    </div>
                  </div>
                </div>

                <h3 className="text-3xl font-bold text-moas-text mb-2">
                  전자서명이 완료되었습니다!
                </h3>
                <p className="text-sm text-moas-gray-6 mb-8">
                  블록체인 기반 EIP-712 서명이 성공적으로 기록되었습니다
                </p>

                {/* 서명 증명서 카드 */}
                <div className="w-full max-w-2xl rounded-xl border-2 border-moas-main bg-linear-to-br from-blue-50 to-purple-50 p-6 shadow-lg">
                  <div className="mb-4 flex items-center gap-2 text-lg font-bold text-moas-text">
                    <span className="text-2xl">🔐</span>
                    <span>블록체인 서명 증명서</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start justify-between rounded-lg bg-white/80 p-3">
                      <span className="text-sm text-moas-gray-7">서명자</span>
                      <span className="text-sm font-semibold text-moas-text">
                        {contract!.leader.nickname} (리더)
                      </span>
                    </div>

                    <div className="flex items-start justify-between rounded-lg bg-white/80 p-3">
                      <span className="text-sm text-moas-gray-7">서명 시각</span>
                      <span className="text-sm font-semibold text-moas-text">
                        {new Date().toLocaleString('ko-KR')}
                      </span>
                    </div>

                    <div className="flex items-start justify-between rounded-lg bg-white/80 p-3">
                      <span className="text-sm text-moas-gray-7">서명 해시</span>
                      <span className="text-xs font-mono text-moas-gray-7 break-all max-w-md">
                        {currentSignature.slice(0, 10)}...{currentSignature.slice(-10)}
                      </span>
                    </div>

                    <div className="flex items-start justify-between rounded-lg bg-white/80 p-3">
                      <span className="text-sm text-moas-gray-7">검증 상태</span>
                      <span className="rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white">
                        ECDSA 검증 완료
                      </span>
                    </div>
                  </div>

                  {/* 결제 진행 안내 */}
                  <div className="mt-4 rounded-lg bg-blue-100 border border-blue-200 p-4">
                    <div className="flex items-start gap-2">
                      <span className="text-xl">💳</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-blue-900">
                          결제 페이지로 이동합니다
                        </p>
                        <p className="text-xs text-blue-800 mt-1">
                          결제 완료 후 Polygon 네트워크에 NFT로 발행됩니다
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stage 2: 계약 내용 확인 */}
            {leaderSigningStage === 2 && (
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
                            {contract!.project.title}
                          </p>
                          <p className="text-sm text-moas-gray-7">
                            {contract!.project.categoryName} · {contract!.project.positionName}
                          </p>
                        </div>

                        {/* 금액 */}
                        <div className="pb-4 border-b border-moas-gray-3">
                          <p className="text-s font-medium text-moas-gray-9 mb-1">계약 금액</p>
                          <p className="text-xl font-bold text-moas-main">
                            {formatAmount(contract!.totalAmount)}원
                          </p>
                        </div>

                        {/* 계약 기간 */}
                        <div className="pb-4 border-b border-moas-gray-3">
                          <p className="text-s font-medium text-moas-gray-9 mb-1">계약 기간</p>
                          <p className="text-base font-medium text-moas-text">
                            {formatDate(contract!.startAt)} ~ {formatDate(contract!.endAt)}
                          </p>
                        </div>

                        {/* 당사자 정보 */}
                        <div className="pb-4 border-b border-moas-gray-3">
                          <p className="text-s font-medium text-moas-gray-9 mb-1">계약당사자</p>
                          <div className="space-y-1">
                            <p className="text-sm text-moas-text">
                              <span className="font-medium text-moas-gray-7">리더:</span>{' '}
                              {contract!.leader.nickname}
                            </p>
                            <p className="text-sm text-moas-text">
                              <span className="font-medium text-moas-gray-7">아티스트:</span>{' '}
                              {contract!.artist.nickname}
                            </p>
                          </div>
                        </div>

                        {/* 상세 내용 */}
                        {contract!.description && (
                          <div className="pt-2 pb-4">
                            <p className="text-xs font-medium text-moas-gray-6 mb-3">
                              상세 계약 내용
                            </p>
                            <MarkdownViewer content={contract!.description} />
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
                              checked={leaderCheck1}
                              onChange={(e) => setLeaderCheck1(e.target.checked)}
                              className="mt-1 h-5 w-5 cursor-pointer"
                            />
                            <span className="flex-1 text-sm text-moas-text">
                              [필수] 위 계약 내용을 모두 읽었으며, 계약 조건을 이해했습니다.
                            </span>
                          </label>
                        </div>

                        <div className="rounded-lg bg-moas-gray-1 p-4">
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={leaderCheck2}
                              onChange={(e) => setLeaderCheck2(e.target.checked)}
                              className="mt-1 h-5 w-5 cursor-pointer"
                            />
                            <span className="flex-1 text-sm text-moas-text">
                              [필수] EIP-712 전자서명이 법적 효력을 가지는 전자서명임을
                              이해했습니다.
                            </span>
                          </label>
                        </div>

                        <div className="rounded-lg bg-moas-gray-1 p-4">
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={leaderCheck3}
                              onChange={(e) => setLeaderCheck3(e.target.checked)}
                              className="mt-1 h-5 w-5 cursor-pointer"
                            />
                            <span className="flex-1 text-sm text-moas-text">
                              [필수] 본 계약의 법적 구속력을 인정하며, 계약 이행 의무를 수락합니다.
                            </span>
                          </label>
                        </div>

                        <div className="rounded-lg bg-moas-gray-1 p-4">
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={leaderCheck4}
                              onChange={(e) => setLeaderCheck4(e.target.checked)}
                              className="mt-1 h-5 w-5 cursor-pointer"
                            />
                            <span className="flex-1 text-sm text-moas-text">
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
                      onClick={() => setLeaderSigningStage(1)}
                      className="w-full rounded-lg border-2 border-moas-gray-2 bg-white px-6 py-3 text-base font-bold text-moas-text transition-colors hover:bg-moas-gray-1"
                    >
                      이전
                    </button>
                  </div>
                  <div className="flex-1">
                    <button
                      onClick={() => {
                        setLeaderSigningStage(3);
                        setLeaderSigningSubStep(1);
                        leaderModalRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={!leaderCheck1 || !leaderCheck2 || !leaderCheck3 || !leaderCheck4}
                      className="w-full rounded-lg bg-moas-text px-6 py-3 text-base font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      다음 단계로
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Stage 3: 지갑 서명 - 5개 하위 단계 */}
            {leaderSigningStage === 3 && (
              <div className="flex w-full flex-col md:flex-row gap-8 py-4">
                {/* Sub-step 1: 지갑 주소 확인 중 (로딩) */}
                {leaderSigningSubStep === 1 && (
                  <div className="flex-1 flex flex-col items-center justify-center animate-fadeIn">
                    <h3 className="text-3xl font-bold text-moas-text mb-6">지갑 연결 중</h3>
                    <div className="overflow-hidden mb-0" style={{ width: 250, height: 250 }}>
                      <div style={{ transform: 'translateY(-45px) translateX(-30px)' }}>
                        <Lottie
                          loop
                          animationData={leaderWalletAnimation}
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
                {leaderSigningSubStep === 2 && (
                  <div className="flex-1 flex flex-col items-center justify-center animate-fadeIn">
                    <h3 className="text-3xl font-bold text-moas-text mb-6">지갑 연결 완료</h3>
                    <div className="overflow-hidden" style={{ width: 250, height: 250 }}>
                      <div style={{ transform: 'translateY(-45px) translateX(-30px)' }}>
                        <Lottie
                          loop
                          animationData={leaderWalletAnimation}
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
                          <p className="font-semibold text-green-900 mb-2">
                            지갑 정보 불러오기 완료
                          </p>
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
                        contractId={contract!.contractId}
                        buttonText="이 지갑 주소로 서명하기"
                        onSignStart={() => {
                          console.log('[ContractView] Moving to substep 3 (EIP-712 data prep)');
                          setLeaderSigningSubStep(3);
                        }}
                        onDataPrepared={() => {
                          console.log(
                            '[ContractView] Data prepared, waiting for animation to complete',
                          );
                        }}
                        onSigningStarted={() => {
                          console.log('[ContractView] Signing started');
                        }}
                        onSignSuccess={handleFinalizeSuccess}
                        onSignError={handleSignError}
                        disabled={isSubmitting}
                        className="w-full rounded-lg bg-moas-text px-8 py-4 text-lg font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>
                  </div>
                )}

                {/* Sub-step 3: EIP-712 데이터 준비 */}
                {leaderSigningSubStep === 3 && (
                  <div className="flex-1 flex flex-col items-center justify-center animate-fadeIn">
                    <h3 className="text-3xl font-bold text-moas-text mb-6">서명 데이터 준비 중</h3>
                    <Lottie
                      loop={false}
                      animationData={leaderSecurityAnimation}
                      play
                      style={{ width: 250, height: 250 }}
                      onComplete={() => {
                        console.log(
                          '[ContractView] Security animation complete, moving to substep 4',
                        );
                        setLeaderSigningSubStep(4);
                      }}
                    />

                    <h2 className="text-base text-moas-gray-8 text-center">
                      EIP-712 표준에 따라 계약 내용을 <br /> 암호화된 서명 데이터로 변환 중입니다...
                    </h2>
                  </div>
                )}

                {/* Sub-step 4: 서명 진행 */}
                {leaderSigningSubStep === 4 && (
                  <div className="flex-1 flex flex-col items-center justify-center animate-fadeIn">
                    <h3 className="text-3xl font-bold text-moas-text mb-6">서명 진행 중</h3>
                    <div className="overflow-hidden" style={{ width: 250, height: 250 }}>
                      <div style={{ transform: 'translateY(-30px) translateX(0px)' }}>
                        <Lottie
                          loop={false}
                          animationData={docLeaderAnimation}
                          play
                          style={{ width: 300, height: 300 }}
                          onComplete={() => {
                            console.log(
                              '[ContractView] Doc animation complete, moving to substep 5',
                            );
                            setLeaderSigningSubStep(5);
                          }}
                        />
                      </div>
                    </div>

                    <h2 className="text-base text-moas-gray-8 text-center">
                      전자서명 요청을 처리하고 있습니다... <br /> 처리가 완료되면 다음 단계로
                      자동으로 이동합니다.
                    </h2>
                  </div>
                )}

                {/* Sub-step 5: 서명 검증 */}
                {leaderSigningSubStep === 5 && (
                  <div className="flex-1 flex flex-col items-center justify-center animate-fadeIn">
                    <h3 className="text-3xl font-bold text-moas-text mb-6">서명 검증 중</h3>

                    <div className="overflow-hidden mb-0" style={{ width: 200, height: 200 }}>
                      <div style={{ transform: 'translateY(-40px) translateX(-30px)' }}>
                        <Lottie
                          loop={false}
                          animationData={verifyLoaderAnimation}
                          play
                          style={{ width: 250, height: 250 }}
                          onComplete={() => {
                            console.log(
                              '[ContractView] Verification animation complete, moving to stage 4',
                            );
                            setLeaderSigningStage(4);
                            setLeaderSigningSubStep(0);
                            // 검증 상태 초기화
                            setLeaderVerificationStep1(false);
                            setLeaderVerificationStep2(false);
                          }}
                        />
                      </div>
                    </div>

                    {/* 검증 상태 표시 */}
                    <div className="w-full max-w-md space-y-3 mt-4">
                      {/* 서명 데이터 확인 */}
                      <div
                        className={`rounded-lg border-2 p-4 transition-colors ${
                          leaderVerificationStep1
                            ? 'bg-green-50 border-green-200'
                            : 'bg-blue-50 border-blue-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 items-center justify-center shrink-0">
                            {leaderVerificationStep1 ? (
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white font-bold">
                                ✓
                              </div>
                            ) : (
                              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                            )}
                          </div>
                          <div>
                            <p
                              className={`font-semibold mb-1 ${leaderVerificationStep1 ? 'text-green-900' : 'text-blue-900'}`}
                            >
                              {leaderVerificationStep1
                                ? '서명 데이터 확인 완료'
                                : '서명 데이터 확인 중...'}
                            </p>
                            <p
                              className={`text-sm ${leaderVerificationStep1 ? 'text-green-800' : 'text-blue-800'}`}
                            >
                              제출된 서명 데이터를 검증하고 있습니다.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 서명자 주소 검증 */}
                      <div
                        className={`rounded-lg border-2 p-4 transition-colors ${
                          leaderVerificationStep2
                            ? 'bg-green-50 border-green-200'
                            : 'bg-blue-50 border-blue-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 items-center justify-center shrink-0">
                            {leaderVerificationStep2 ? (
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white font-bold">
                                ✓
                              </div>
                            ) : (
                              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                            )}
                          </div>
                          <div>
                            <p
                              className={`font-semibold mb-1 ${leaderVerificationStep2 ? 'text-green-900' : 'text-blue-900'}`}
                            >
                              {leaderVerificationStep2
                                ? '서명자 주소 검증 완료'
                                : '서명자 주소 검증 중...'}
                            </p>
                            <p
                              className={`text-sm ${leaderVerificationStep2 ? 'text-green-800' : 'text-blue-800'}`}
                            >
                              서명자의 지갑 주소를 확인하고 있습니다.
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
            {leaderSigningStage === 4 && (
              <div className="flex flex-col items-center justify-center py-12 gap-8">
                {/* 타이틀 + 애니메이션 */}
                <h3 className="text-3xl font-bold text-moas-text mb-2">
                  전자서명이 완료되었습니다!
                </h3>
                <div className="overflow-hidden mb-2" style={{ width: 200, height: 200 }}>
                  <div style={{ transform: 'translateY(-34px) translateX(-30px)' }}>
                    <Lottie
                      loop={false}
                      animationData={successAnimation}
                      play
                      style={{ width: 250, height: 250 }}
                    />
                  </div>
                </div>
                <h2 className="text-base text-moas-gray-8 text-center -mt-4">
                  결제 페이지로 이동하여 계약을 체결하세요.
                </h2>

                {/* 확인 버튼 */}
                <button
                  onClick={() => setShowAcceptConfirm(false)}
                  className="w-full max-w-md rounded-lg bg-moas-text px-8 py-4 text-lg font-bold text-white transition-opacity hover:opacity-90"
                >
                  확인
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 리더: 계약 철회 모달 */}
      {showWithdrawModal && (
        <ConfirmModal
          title="계약 철회"
          message={`계약 제안을 철회하시겠습니까?
철회된 계약은 복구할 수 없습니다.`}
          confirmText="철회"
          cancelText="취소"
          type="danger"
          onConfirm={handleWithdrawConfirm}
          onCancel={handleWithdrawCancel}
        />
      )}

      {/* 리더: 계약 철회 완료 모달 */}
      {showWithdrawSuccessModal && (
        <ConfirmModal
          title="계약 철회 완료"
          message="계약 제안이 철회되었습니다."
          confirmText="확인"
          type="info"
          onConfirm={handleWithdrawSuccessConfirm}
        />
      )}

      {/* 리더: 계약 철회 실패 모달 */}
      {showWithdrawErrorModal && (
        <ConfirmModal
          title="계약 철회 실패"
          message={withdrawErrorMessage}
          confirmText="확인"
          type="danger"
          onConfirm={handleWithdrawErrorConfirm}
        />
      )}

      {/* 아티스트: 계약 거절 모달 */}
      {showArtistDeclineModal && (
        <ConfirmModal
          title="계약 거절"
          message="계약을 거절하시겠습니까?"
          confirmText="예"
          cancelText="아니오"
          type="danger"
          onConfirm={handleArtistDeclineConfirm}
          onCancel={handleArtistDeclineCancel}
        />
      )}

      {/* 아티스트: 계약 거절 완료 모달 */}
      {showArtistDeclineSuccessModal && (
        <ConfirmModal
          message="계약이 거절되었습니다."
          confirmText="확인"
          type="info"
          onConfirm={handleArtistDeclineSuccessConfirm}
        />
      )}

      {/* 아티스트: 계약 서명 모달 */}
      {/* 아티스트 서명 모달 */}
      <SigningModal
        isOpen={showArtistAcceptModal}
        onClose={handleArtistAcceptCancel}
        contract={contract!}
        userRole="ARTIST"
        onSignSuccess={handleArtistSignSuccess}
        onSignError={handleArtistSignError}
        state={{
          signingStage: artistSigningStage,
          setSigningStage: setArtistSigningStage,
          signingSubStep: artistSigningSubStep,
          setSigningSubStep: setArtistSigningSubStep,
          check1: artistCheck1,
          setCheck1: setArtistCheck1,
          check2: artistCheck2,
          setCheck2: setArtistCheck2,
          check3: artistCheck3,
          setCheck3: setArtistCheck3,
          check4: artistCheck4,
          setCheck4: setArtistCheck4,
          verificationStep1: verificationStep1,
          setVerificationStep1: setVerificationStep1,
          verificationStep2: verificationStep2,
          setVerificationStep2: setVerificationStep2,
          currentSignature,
          setCurrentSignature,
        }}
        isSubmitting={isSubmitting}
        address={address}
      />

      {showArtistAcceptModal && false && contract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            ref={artistModalRef}
            className="relative flex w-full max-w-5xl h-[95vh] flex-col gap-6 rounded-2xl bg-white p-8 shadow-xl overflow-y-auto"
          >
            {/* 닫기 버튼 (X) */}
            <button
              onClick={handleArtistAcceptCancel}
              className="absolute right-4 top-4 text-moas-gray-6 hover:text-moas-text transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* 진행 단계 표시 */}
            <div className="w-full pt-1">
              <div className="flex items-center justify-center gap-0">
                {[
                  { num: 1, label: '서명 안내' },
                  { num: 2, label: '계약 내용 확인' },
                  { num: 3, label: '지갑 서명' },
                  { num: 4, label: '서명 완료' },
                ].map((stage, index) => (
                  <div key={stage.num} className="flex items-center">
                    {/* 원형 아이콘 + 라벨 */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold transition-all ${
                          stage.num < artistSigningStage
                            ? 'bg-moas-main text-white'
                            : stage.num === artistSigningStage
                              ? 'bg-moas-main text-white'
                              : 'bg-moas-gray-3 text-moas-gray-6'
                        }`}
                      >
                        {stage.num < artistSigningStage ? '✓' : stage.num}
                      </div>
                      <p
                        className={`mt-2 text-xs font-medium transition-all ${
                          stage.num <= artistSigningStage ? 'text-moas-text' : 'text-moas-gray-6'
                        }`}
                      >
                        {stage.label}
                      </p>
                    </div>

                    {/* 연결선 */}
                    {index < 3 && (
                      <div
                        className={`h-0.5 w-16 mx-1 transition-all ${
                          stage.num < artistSigningStage ? 'bg-moas-main' : 'bg-moas-gray-3'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Stage 1: 서명 경고/안내 */}
            {artistSigningStage === 1 && (
              <div className="flex flex-col items-center justify-center py-4">
                {/* 타이틀 + 애니메이션 */}
                <h2 className="text-3xl font-bold text-moas-text mb-2">계약서 서명 안내</h2>
                {/* Lottie 애니메이션 */}
                <div className="mb-6">
                  <div className="overflow-hidden" style={{ width: 400, height: 280 }}>
                    <div style={{ transform: 'translateY(-80px) translateX(-150px)' }}>
                      <Lottie
                        loop
                        animationData={artistSignAnimation}
                        play
                        style={{ width: 700, height: 700 }}
                      />
                    </div>
                  </div>
                </div>

                {/* 경고 문구 */}
                <p className="text-lg font-semibold text-moas-error text-center mb-8">
                  본 서명은 블록체인에 EIP-712 표준으로 영구 기록되며, <br />
                  서명 후에는 수정이나 철회가 절대 불가능합니다.
                </p>

                {/* 다음 버튼 */}
                <button
                  onClick={() => {
                    setArtistSigningStage(2);
                    artistModalRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full max-w-md rounded-lg bg-moas-text px-8 py-4 text-lg font-bold text-white transition-opacity hover:opacity-90"
                >
                  계약 내용 확인하기
                </button>
              </div>
            )}

            {/* Stage 2: 계약 내용 확인 */}
            {artistSigningStage === 2 && (
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
                            {contract!.project.title}
                          </p>
                          <p className="text-sm text-moas-gray-7">
                            {contract!.project.categoryName} · {contract!.project.positionName}
                          </p>
                        </div>

                        {/* 금액 */}
                        <div className="pb-4 border-b border-moas-gray-3">
                          <p className="text-s font-medium text-moas-gray-9 mb-1">계약 금액</p>
                          <p className="text-xl font-bold text-moas-main">
                            {formatAmount(contract!.totalAmount)}원
                          </p>
                        </div>

                        {/* 계약 기간 */}
                        <div className="pb-4 border-b border-moas-gray-3">
                          <p className="text-s font-medium text-moas-gray-9 mb-1">계약 기간</p>
                          <p className="text-base font-medium text-moas-text">
                            {formatDate(contract!.startAt)} ~ {formatDate(contract!.endAt)}
                          </p>
                        </div>

                        {/* 당사자 정보 */}
                        <div className="pb-4 border-b border-moas-gray-3">
                          <p className="text-s font-medium text-moas-gray-9 mb-1">계약당사자</p>
                          <div className="space-y-1">
                            <p className="text-sm text-moas-text">
                              <span className="font-medium text-moas-gray-7">리더:</span>{' '}
                              {contract!.leader.nickname}
                            </p>
                            <p className="text-sm text-moas-text">
                              <span className="font-medium text-moas-gray-7">아티스트:</span>{' '}
                              {contract!.artist.nickname}
                            </p>
                          </div>
                        </div>

                        {/* 상세 내용 */}
                        {contract!.description && (
                          <div className="pt-2 pb-4">
                            <p className="text-xs font-medium text-moas-gray-6 mb-3">
                              상세 계약 내용
                            </p>
                            <MarkdownViewer content={contract!.description} />
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
                              checked={artistCheck1}
                              onChange={(e) => setArtistCheck1(e.target.checked)}
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
                              checked={artistCheck2}
                              onChange={(e) => setArtistCheck2(e.target.checked)}
                              className="mt-1 h-5 w-5 cursor-pointer"
                            />
                            <span className="text-sm leading-relaxed text-moas-text">
                              [필수] EIP-712 전자서명이 법적 효력을 가지는 전자서명임을
                              이해했습니다.
                            </span>
                          </label>
                        </div>

                        <div className="rounded-lg bg-moas-gray-1 p-4">
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={artistCheck3}
                              onChange={(e) => setArtistCheck3(e.target.checked)}
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
                              checked={artistCheck4}
                              onChange={(e) => setArtistCheck4(e.target.checked)}
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
                        setArtistSigningStage(1);
                      }}
                      className="w-full rounded-lg border-2 border-moas-gray-2 bg-white px-6 py-3 text-base font-bold text-moas-text transition-colors hover:bg-moas-gray-1"
                    >
                      이전
                    </button>
                  </div>
                  <div className="flex-1">
                    <button
                      onClick={() => {
                        setArtistSigningStage(3);
                        setArtistSigningSubStep(1);
                        // 모달 맨 위로 스크롤
                        artistModalRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={
                        isSubmitting ||
                        !artistCheck1 ||
                        !artistCheck2 ||
                        !artistCheck3 ||
                        !artistCheck4
                      }
                      className="w-full rounded-lg bg-moas-text px-6 py-3 text-base font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      다음 단계로
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Stage 3: 지갑 서명 진행 (5 sub-steps) */}
            {artistSigningStage === 3 && (
              <div className="flex w-full flex-col md:flex-row gap-8 py-4">
                {/* Sub-step 1: 지갑 주소 확인 중 (로딩) */}
                {artistSigningSubStep === 1 && (
                  <div className="flex-1 flex flex-col items-center justify-center animate-fadeIn">
                    <h3 className="text-3xl font-bold text-moas-text mb-6">지갑 연결 중</h3>
                    <div className="overflow-hidden mb-0" style={{ width: 250, height: 250 }}>
                      <div style={{ transform: 'translateY(-45px) translateX(-30px)' }}>
                        <Lottie
                          loop
                          animationData={
                            currentUserRole === 'ARTIST'
                              ? artistWalletAnimation
                              : leaderWalletAnimation
                          }
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
                {artistSigningSubStep === 2 && (
                  <div className="flex-1 flex flex-col items-center justify-center animate-fadeIn">
                    <h3 className="text-3xl font-bold text-moas-text mb-8">지갑 연결 완료</h3>
                    <div className="overflow-hidden" style={{ width: 250, height: 250 }}>
                      <div style={{ transform: 'translateY(-45px) translateX(-30px)' }}>
                        <Lottie
                          loop
                          animationData={
                            currentUserRole === 'ARTIST'
                              ? artistWalletAnimation
                              : leaderWalletAnimation
                          }
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
                          <p className="font-semibold text-green-900 mb-2">
                            지갑 정보 불러오기 완료
                          </p>
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
                        contractId={contract!.contractId}
                        buttonText="이 지갑 주소로 서명하기"
                        onSignStart={() => {
                          console.log('[ContractView] Moving to substep 3 (EIP-712 data prep)');
                          setArtistSigningSubStep(3);
                        }}
                        onDataPrepared={() => {
                          console.log(
                            '[ContractView] Data prepared, waiting for animation to complete',
                          );
                          // 애니메이션 완료 시 자동으로 3-4로 이동됨
                        }}
                        onSigningStarted={() => {
                          console.log('[ContractView] Signing started');
                        }}
                        onSignSuccess={handleArtistSignSuccess}
                        onSignError={handleArtistSignError}
                        disabled={isSubmitting}
                        className="w-full rounded-lg bg-moas-text px-8 py-4 text-lg font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>
                  </div>
                )}

                {/* Sub-step 3: EIP-712 데이터 준비 */}
                {artistSigningSubStep === 3 && (
                  <>
                    {/* 왼쪽: 타이틀 + 애니메이션 */}
                    <div className="flex-1 flex flex-col items-center justify-center animate-fadeIn">
                      <h3 className="text-3xl font-bold text-moas-text mb-8">
                        서명 데이터 준비 중
                      </h3>
                      <Lottie
                        loop={false}
                        animationData={
                          currentUserRole === 'ARTIST'
                            ? artistSecurityAnimation
                            : leaderSecurityAnimation
                        }
                        play
                        style={{ width: 250, height: 250 }}
                        onComplete={() => {
                          console.log(
                            '[ContractView] Security animation complete, moving to substep 4',
                          );
                          setArtistSigningSubStep(4);
                        }}
                      />
                      <h2 className="text-base text-moas-gray-8 text-center mt-6">
                        EIP-712 표준에 따라 계약 내용을 <br /> 암호화된 서명 데이터로 변환
                        중입니다...
                      </h2>
                    </div>
                  </>
                )}

                {/* Sub-step 4: 서명 실행 */}
                {artistSigningSubStep === 4 && (
                  <>
                    <div className="flex-1 flex flex-col items-center justify-center animate-fadeIn">
                      <h3 className="text-3xl font-bold text-moas-text mb-8">서명 진행 중</h3>
                      <div className="overflow-hidden" style={{ width: 250, height: 250 }}>
                        <div style={{ transform: 'translateY(-40px) translateX(-25px)' }}>
                          <Lottie
                            loop={false}
                            animationData={
                              currentUserRole === 'ARTIST' ? docArtistAnimation : docLeaderAnimation
                            }
                            play
                            style={{ width: 300, height: 300 }}
                            onComplete={() => {
                              console.log(
                                '[ContractView] Doc animation complete, moving to substep 5',
                              );
                              setArtistSigningSubStep(5);
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
                {artistSigningSubStep === 5 && (
                  <div className="flex-1 flex flex-col items-center justify-center animate-fadeIn">
                    <h3 className="text-3xl font-bold text-moas-text mb-6">서명 검증 중</h3>

                    <div className="overflow-hidden mb-0" style={{ width: 200, height: 200 }}>
                      <div style={{ transform: 'translateY(-40px) translateX(-30px)' }}>
                        <Lottie
                          loop={false}
                          animationData={verifyLoaderAnimation}
                          play
                          style={{ width: 250, height: 250 }}
                          onComplete={() => {
                            console.log(
                              '[ContractView] Verification animation complete, moving to stage 4',
                            );
                            setArtistSigningStage(4);
                            setArtistSigningSubStep(0);
                            // 검증 상태 초기화
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
                              {verificationStep1
                                ? '서명 데이터 확인 완료'
                                : '서명 데이터 확인 중...'}
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
                              {verificationStep2
                                ? '서명자 주소 검증 완료'
                                : '서명자 주소 검증 중...'}
                            </p>
                            <p
                              className={`text-sm ${verificationStep2 ? 'text-green-800' : 'text-blue-800'}`}
                            >
                              서명자의 지갑 주소를 확인하고 있습니다.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 단계 완료 후 버튼 */}
                {artistSigningSubStep === 6 && (
                  <>
                    {/* 왼쪽: 타이틀 + 애니메이션 */}
                    <div className="flex-1 flex flex-col items-center justify-center">
                      <h3 className="text-3xl font-bold text-moas-text mb-6">
                        전 자서명이 완료되었습니다!
                      </h3>
                      <div className="overflow-hidden" style={{ width: 200, height: 200 }}>
                        <div style={{ transform: 'translateY(-30px) translateX(-0px)' }}>
                          <Lottie
                            loop
                            animationData={artistSignAnimation}
                            play
                            style={{ width: 250, height: 250 }}
                          />
                        </div>
                      </div>

                      <h2 className="text-base text-moas-gray-8 text-center mt-6">
                        리더의 최종 승인 후 계약이 체결되며,
                        <br />
                        NFT 인증서 발행이 진행됩니다.
                      </h2>
                    </div>

                    {/* 오른쪽: 전자 서명 정보 */}
                    <div className="flex-1 flex flex-col justify-center px-8">
                      <div className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 p-6 space-y-4">
                        <h4 className="text-lg font-bold text-moas-text mb-4">전자 서명 정보</h4>

                        {/* 서명자 */}
                        <div className="flex items-start gap-3">
                          <span className="text-sm font-semibold text-moas-gray-7 min-w-[80px]">
                            서명자:
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-moas-text font-medium">
                              {currentUserRole === 'ARTIST'
                                ? contract?.artist.nickname
                                : contract?.leader.nickname}
                            </span>
                            <Badge
                              variant={currentUserRole === 'ARTIST' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {currentUserRole === 'ARTIST' ? '아티스트' : '리더'}
                            </Badge>
                          </div>
                        </div>

                        {/* 서명 시각 */}
                        <div className="flex items-start gap-3">
                          <span className="text-sm font-semibold text-moas-gray-7 min-w-[80px]">
                            서명 시각:
                          </span>
                          <span className="text-sm text-moas-text">
                            {new Date()
                              .toLocaleString('ko-KR', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: false,
                                timeZone: 'Asia/Seoul',
                              })
                              .replace(/\. /g, '-')
                              .replace(/\.$/, '')}{' '}
                            (KST)
                          </span>
                        </div>

                        {/* 서명 해시 */}
                        <div className="flex items-start gap-3">
                          <span className="text-sm font-semibold text-moas-gray-7 min-w-[80px]">
                            서명 해시:
                          </span>
                          <span className="text-sm text-moas-text font-mono break-all">
                            {currentSignature
                              ? `${currentSignature.slice(0, 10)}...${currentSignature.slice(-8)}`
                              : '0x...'}
                          </span>
                        </div>

                        {/* 검증 상태 */}
                        <div className="flex items-start gap-3">
                          <span className="text-sm font-semibold text-moas-gray-7 min-w-[80px]">
                            검증 상태:
                          </span>
                          <div className="flex items-center gap-2">
                            <Badge variant="default" className="bg-green-500 text-white text-xs">
                              ✓ 서명 검증 완료
                            </Badge>
                            <span className="text-xs text-moas-gray-6">
                              (서명자 지갑 주소와 일치)
                            </span>
                          </div>
                        </div>

                        {/* 확인 버튼 */}
                        <div className="pt-4 flex justify-center">
                          <Button
                            onClick={() => setShowArtistAcceptModal(false)}
                            className="bg-moas-text hover:bg-moas-text/90 text-white px-8 py-2"
                          >
                            확인
                          </Button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Stage 4: 서명 완료 */}
            {artistSigningStage === 4 && (
              <div className="flex flex-col items-center justify-center py-12 gap-8">
                {/* 타이틀 + 애니메이션 */}
                <h3 className="text-3xl font-bold text-moas-text mb-2">
                  전자서명이 완료되었습니다!
                </h3>
                <div className="overflow-hidden mb-2" style={{ width: 200, height: 200 }}>
                  <div style={{ transform: 'translateY(-34px) translateX(-30px)' }}>
                    <Lottie
                      loop={false}
                      animationData={successAnimation}
                      play
                      style={{ width: 250, height: 250 }}
                    />
                  </div>
                </div>
                <h2 className="text-base text-moas-gray-8 text-center -mt-4">
                  리더의 최종 승인 후 계약이 체결되며,
                  <br />
                  NFT 인증서 발행이 진행됩니다.
                </h2>

                {/* 확인 버튼 */}
                <button
                  onClick={() => setShowArtistAcceptModal(false)}
                  className="w-full max-w-md rounded-lg bg-moas-text px-8 py-4 text-lg font-bold text-white transition-opacity hover:opacity-90"
                >
                  확인
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 리뷰 작성 모달 */}
      {showReviewModal && contract && (
        <ReviewModal
          revieweeId={
            currentUserId === contract.leader.userId
              ? contract.artist.userId
              : contract.leader.userId
          }
          revieweeName={
            currentUserId === contract.leader.userId
              ? contract.artist.nickname
              : contract.leader.nickname
          }
          revieweeProfileImage={
            currentUserId === contract.leader.userId
              ? contract.artist.profileImageUrl
              : contract.leader.profileImageUrl
          }
          revieweeRole={currentUserId === contract.leader.userId ? '아티스트' : '리더'}
          onSubmit={handleReviewSubmit}
          onCancel={handleReviewCancel}
        />
      )}

      {/* 계약 취소 사유 입력 모달 */}
      {showCancelReasonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-xl">
            <h2 className="mb-1 text-3xl font-bold text-moas-text">계약 취소 요청</h2>

            <div className="space-y-4">
              <p className="text-sm text-moas-gray-7">
                계약 취소 요청 사유를 입력해주세요. 관리자의 검토 후 최종 취소 여부가 결정됩니다.
              </p>

              {/* 환불 및 플랫폼 수수료 안내 */}
              <div className="rounded-lg bg-moas-gray-1 p-4">
                <h3 className="mb-2 text-sm font-bold text-moas-text">
                  환불 및 플랫폼 수수료 안내
                </h3>
                <ul className="space-y-1 text-sm text-moas-gray-7">
                  <li className="flex gap-2">
                    <span className="font-semibold text-moas-text">•</span>
                    <div>
                      <span className="font-semibold text-moas-text">계약 진행 전:</span> 플랫폼
                      수수료 없이 전액 환불됩니다.
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-moas-text">•</span>
                    <div>
                      <span className="font-semibold text-moas-text">계약 진행 중:</span> 플랫폼
                      수수료가 부과되며, 이를 제외한 잔여 금액이 환불됩니다. 환불금 배분은 관리자가
                      별도 비율을 기입하지 않을 경우, 계약 기간을 기준으로 일할 계산되어 지급됩니다.
                    </div>
                  </li>
                </ul>
              </div>

              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="취소 사유를 입력하세요"
                className="w-full rounded-lg border-2 border-moas-gray-3 p-3 text-sm focus:border-moas-main focus:outline-none"
                rows={10}
              />

              <div className="flex gap-3">
                <button
                  onClick={handleCancelReasonCancel}
                  className="flex-1 rounded-lg border-2 border-moas-gray-2 bg-white px-6 py-3 text-base font-bold text-moas-text transition-colors hover:bg-moas-gray-1"
                >
                  닫기
                </button>
                <button
                  onClick={handleCancelSubmit}
                  className="flex-1 rounded-lg bg-moas-error px-6 py-3 text-base font-bold text-white transition-opacity hover:opacity-90"
                >
                  취소 요청
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 계약 취소 요청 성공 모달 */}
      {showCancelSuccessModal && (
        <ConfirmModal
          message="계약 취소 요청이 접수되었습니다. "
          confirmText="확인"
          type="info"
          onConfirm={() => {
            setShowCancelSuccessModal(false);
            fetchContract();
          }}
        />
      )}

      {/* 계약 취소 요청 실패 모달 */}
      {showCancelErrorModal && (
        <ConfirmModal
          message={cancelErrorMessage}
          confirmText="확인"
          type="danger"
          onConfirm={() => setShowCancelErrorModal(false)}
        />
      )}

      {/* 정산 완료 모달 */}
      {showSettlementSuccessModal && (
        <ConfirmModal
          message="정산이 완료되었습니다."
          confirmText="리뷰 남기기"
          cancelText="닫기"
          onConfirm={handleSettlementSuccessReview}
          onCancel={handleSettlementSuccessClose}
        />
      )}

      {/* 리뷰 작성 완료 모달 */}
      {showReviewSuccessModal && (
        <ConfirmModal
          message="리뷰가 작성되었습니다."
          confirmText="확인"
          onConfirm={handleReviewSuccessConfirm}
        />
      )}
    </div>
  );
}

package com.s401.moas.blockchain.service;

import com.s401.moas.blockchain.domain.Attribute;
import com.s401.moas.blockchain.domain.NftMetadata;
import com.s401.moas.contract.domain.Contract;
import com.s401.moas.contract.exception.ContractException;
import com.s401.moas.contract.repository.ContractRepository;
import com.s401.moas.member.domain.Member;
import com.s401.moas.member.exception.MemberException;
import com.s401.moas.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigInteger;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MetadataService {

    private final ContractRepository contractRepository;
    private final MemberRepository memberRepository;
    private final BlockchainClient blockchainClient;

    /**
     * 특정 토큰 ID(계약 ID)에 대한 NFT 메타데이터를 동적으로 생성합니다.
     *
     * @param tokenId 조회할 NFT의 토큰 ID
     * @return 표준 NFT 메타데이터 형식의 DTO
     */
    public NftMetadata generateMetadata(Long tokenId) {
        log.info("메타데이터 생성 요청. TokenId: {}", tokenId);

        // 1. DB에서 메타데이터 생성에 필요한 모든 원본 데이터를 조회합니다.
        Contract contract = contractRepository.findById(tokenId)
                .orElseThrow(ContractException::contractNotFound);
        Member leader = memberRepository.findById(contract.getLeaderMemberId())
                .orElseThrow(MemberException::memberNotFound);
        Member artist = memberRepository.findById(contract.getArtistMemberId())
                .orElseThrow(MemberException::memberNotFound);

        // 블록체인에서 직접 현재 온체인 상태를 조회합니다.
        String onChainStatus = getOnChainStatusAsString(tokenId);

        // 계약 상태에 따라 이미지 URL 결정
        String dynamicImageUrl = getDynamicImageUrl(onChainStatus, contract.getNftImageUrl(), tokenId);

        // 3. [동적 로직 2] 계약 정보를 바탕으로 속성(Attributes) 리스트를 생성합니다.
        List<Attribute> attributes = buildAttributes(contract, leader, artist);

        // 4. 조회하고 가공한 모든 정보를 조합하여 최종 메타데이터 객체를 생성하고 반환합니다.
        return new NftMetadata(
                "MOAS Contract #" + contract.getId() + ": " + contract.getTitle(),
                "이 NFT는 MOAS 플랫폼을 통해 체결된 계약의 진정성을 증명하는 온체인 디지털 증서입니다. 계약의 모든 주요 조건은 양 당사자의 암호화 서명을 거쳐, 이더리움 블록체인에 투명하고 영구적으로 기록되었습니다.",
                dynamicImageUrl,
                attributes
        );
    }

    /**
     * 계약 상태에 따라 최종적으로 표시될 이미지 URL을 결정하는 헬퍼 메소드
     */
    private String getDynamicImageUrl(String onChainStatus, String baseImageUrl, Long tokenId) {
        // 프론트엔드에서 이미지 URL을 아직 저장하지 않은 경우를 대비한 방어 코드
        if (baseImageUrl == null || baseImageUrl.isBlank()) {
            log.warn("Contract ID {}에 대한 nft_image_url이 DB에 없습니다. 임시 이미지를 사용합니다.", tokenId);
            return "https://moas-bucket.s3.ap-northeast-2.amazonaws.com/default-placeholder.png";
        }

        return switch (onChainStatus) {
            case "Canceled" -> baseImageUrl.replace("_active.png", "_canceled.png");
            case "Completed" -> baseImageUrl.replace("_active.png", "_completed.png");
            default -> baseImageUrl; // "Active" 상태이거나 다른 모든 경우는 원본 URL 그대로 반환
        };
    }

    /**
     * 계약 정보를 바탕으로 NFT 속성(Attribute) 리스트를 생성하는 헬퍼 메소드
     */
    private List<Attribute> buildAttributes(Contract contract, Member leader, Member artist) {
        List<Attribute> attributes = new ArrayList<>();

        // 1. 계약의 현재 오프체인 상태
        attributes.add(new Attribute("Contract Status", contract.getStatus()));

        // 2. 계약 당사자 (닉네임으로 익명성 보장)
        attributes.add(new Attribute("Leader", leader.getNickname()));
        attributes.add(new Attribute("Artist", artist.getNickname()));

        // 3. 계약 시작일 (날짜 정보는 공개)
        attributes.add(new Attribute("Start Date", contract.getStartAt().toLocalDate().toString(), "date"));
        attributes.add(new Attribute("End Date", contract.getEndAt().toLocalDate().toString(), "date"));
        return attributes;
    }

    /**
     * BlockchainClient를 통해 온체인 상태를 조회하고, 사람이 읽을 수 있는 문자열로 변환합니다.
     */
    private String getOnChainStatusAsString(Long tokenId) {
        try {
            // BlockchainClient의 읽기 전용 메소드를 호출합니다.
            BigInteger statusEnumIndex = blockchainClient.getContractStatus(BigInteger.valueOf(tokenId));
            // Solidity Enum Index: 0=Active, 1=Completed, 2=Canceled
            return switch (statusEnumIndex.intValue()) {
                case 1 -> "Completed";
                case 2 -> "Canceled";
                default -> "Active";
            };
        } catch (Exception e) {
            log.warn("온체인 상태 조회 중 오류 발생. TokenId: {}. 기본값 'Active'를 사용합니다.", tokenId, e);
            // 블록체인 노드에 일시적인 문제가 생겨도 메타데이터 제공이 실패하지 않도록 방어
            return "Active";
        }
    }
}

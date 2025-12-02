// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";

/**
 * @title MOASContract
 * @dev ERC-1155 기반 계약 증서 컨트랙트 (OZ 5.0 호환)
 * - 1:1 계약 시 리더와 아티스트에게 동일한 ID의 증서(토큰)를 1개씩 발행합니다.
 * - 백엔드 DB의 ID를 Token ID로 사용하여 온체인-오프체인 데이터 일관성 유지
 * - EIP-712 서명에 계약의 핵심 내용을 포함하여 검증 후 발행합니다.
 * - ERC-2771을 통해 서버가 트랜잭션 가스비를 대납합니다.
 * - AccessControl을 통해 발행 및 상태 변경은 서버만 가능하도록 제한합니다.
 * - 증서(토큰)는 양도가 불가능(Non-Transferrable)합니다.
 */
contract MOASContract is ERC1155URIStorage, AccessControl, ERC2771Context, EIP712 {
    
    // --- 상태 및 역할 정의 ---

    /**
     * @dev 계약의 라이프사이클 상태
     * - Active: 계약이 생성되어 진행 중
     * - Completed: 계약이 정상적으로 완료됨
     * - Canceled: 계약이 취소됨 (토큰 소각됨)
     */
    enum Status { 
        Active, 
        Completed, 
        Canceled 
    }

    /// @dev 함수 호출 권한을 가진 백엔드 서버 역할
    bytes32 public constant SERVER_ROLE = keccak256("SERVER_ROLE");

    /// @dev EIP-712 서명에 사용될 타입 해시
    bytes32 public constant CONTRACT_SIGNATURE_TYPEHASH =
        keccak256("ContractSignature(uint256 tokenId,string title,bytes32 descriptionHash,address leader,address artist,uint256 totalAmount,string startsAt,string endsAt)");
    // --- 스토리지 변수 ---

    /// @dev (토큰 ID => 계약 상태)
    mapping(uint256 => Status) public contractStatus;

    /// @dev (토큰 ID => 프로젝트 리더 주소)
    mapping(uint256 => address) public projectLeader;

    /// @dev (토큰 ID => 아티스트 주소)
    mapping(uint256 => address) public artist;

    // --- 이벤트 ---

    /// @dev 계약 생성 및 토큰 발행 시 발생하는 이벤트
    event ContractCreated(uint256 indexed tokenId, address indexed leader, address indexed artist);

    /// @dev 계약 상태 변경 시 발생하는 이벤트
    event ContractStatusUpdated(uint256 indexed tokenId, Status newStatus);

    /// @dev 계약 취소 및 토큰 소각 시 발생하는 이벤트
    event ContractCanceled(uint256 indexed tokenId);

    // --- 생성자 ---

    /**
     * @dev 컨트랙트 배포 시 실행
     * @param _trustedForwarder MOASForwarder (ERC-2771) 컨트랙트 주소
     */
    constructor(address _trustedForwarder)
        ERC1155("") // ERC1155URIStorage의 부모인 ERC1155 생성자 호출
        ERC2771Context(_trustedForwarder)
        EIP712("MOASContract", "1")
    {
        address initialAdmin = _msgSender();
        _grantRole(DEFAULT_ADMIN_ROLE, initialAdmin);
        _grantRole(SERVER_ROLE, initialAdmin);
    }

    // --- 핵심 쓰기 기능 (서버 전용) ---

    /**
     * @dev 양 당사자의 서명을 검증한 후 새 계약을 생성하고 증서를 발행합니다. (서버 전용)
     * @param _tokenId 백엔드 DB의 계약 ID (contract.id)
     * @param _title 계약 제목
     * @param _descriptionHash 계약 설명(description)의 Keccak-256 해시값
     * @param _leader 프로젝트 리더의 지갑 주소
     * @param _artist 아티스트의 지갑 주소
     * @param _totalAmount 총 계약 금액
     * @param _startsAt 계약 시작일 (ISO 8601 문자열)
     * @param _endsAt 계약 종료일 (ISO 8601 문자열)
     * @param _tokenURI 계약 증서 메타데이터 URI
     * @param sigLeader 리더의 EIP-712 서명 (오프체인)
     * @param sigArtist 아티스트의 EIP-712 서명 (오프체인)
     */
    function createContract(
        uint256 _tokenId,
        string memory _title,
        bytes32 _descriptionHash,
        address _leader,
        address _artist,
        uint256 _totalAmount,
        string memory _startsAt,
        string memory _endsAt,
        string memory _tokenURI,
        bytes memory sigLeader,
        bytes memory sigArtist
    ) public onlyRole(SERVER_ROLE) {
        
        // 중복 발행 방지
        require(projectLeader[_tokenId] == address(0), "Token ID already exists");

        // 1. 서명 검증
        _verifySignatures(
            _tokenId, _title, _descriptionHash, _leader, _artist, _totalAmount, _startsAt, _endsAt, 
            sigLeader, sigArtist
        );

        // 2. ERC-1155 토큰 발행
        _mint(_leader, _tokenId, 1, "");
        _mint(_artist, _tokenId, 1, "");
        
        // 3. 메타데이터 URI 설정
        _setURI(_tokenId, _tokenURI);

        // 4. 계약 상태 및 정보 저장
        contractStatus[_tokenId] = Status.Active;
        projectLeader[_tokenId] = _leader;
        artist[_tokenId] = _artist;
        
        // 5. 이벤트 발생
        emit ContractCreated(_tokenId, _leader, _artist);
    }

    /**
     * @dev 계약 상태를 변경합니다. (완료/활성) (서버 전용)
     * '취소' 상태로의 변경은 cancelContract 함수를 사용해야 합니다.
     * @param tokenId 변경할 계약(토큰) ID
     * @param newStatus 새로운 상태 (Active, Completed)
     */
    function updateContractStatus(uint256 tokenId, Status newStatus)
        public
        onlyRole(SERVER_ROLE)
    {
        require(newStatus != Status.Canceled, "Use cancelContract function to cancel");
        require(projectLeader[tokenId] != address(0), "Contract (ID) does not exist");

        contractStatus[tokenId] = newStatus;
        emit ContractStatusUpdated(tokenId, newStatus);
    }

    /**
     * @dev 계약을 취소하고 양 당사자의 증서(토큰)를 소각합니다. (서버 전용)
     * @param tokenId 취소할 계약(토큰) ID
     */
    function cancelContract(uint256 tokenId) public onlyRole(SERVER_ROLE) {
        address _leader = projectLeader[tokenId];
        address _artist = artist[tokenId];
        require(_leader != address(0), "Contract (ID) does not exist");

        // 1. NFT 소각 (양 당사자 모두)
        if (balanceOf(_leader, tokenId) > 0) {
            _burn(_leader, tokenId, 1);
        }
        if (balanceOf(_artist, tokenId) > 0) {
            _burn(_artist, tokenId, 1);
        }

        // 2. 상태를 'Canceled'로 변경
        contractStatus[tokenId] = Status.Canceled;

        // 3. 이벤트 발생
        emit ContractStatusUpdated(tokenId, Status.Canceled);
        emit ContractCanceled(tokenId);
    }

    // --- 서명 검증 로직 ---

    /**
     * @dev EIP-712 서명을 검증하는 내부 함수
     */
    function _verifySignatures(
        uint256 _tokenId,
        string memory _title,
        bytes32 _descriptionHash,
        address _leader,
        address _artist,
        uint256 _totalAmount,
        string memory _startsAt,
        string memory _endsAt,
        bytes memory sigLeader,
        bytes memory sigArtist
    ) internal view {
        
        bytes32 structHash = keccak256(
            abi.encode(
                CONTRACT_SIGNATURE_TYPEHASH, 
                _tokenId, 
                keccak256(bytes(_title)),
                _descriptionHash,
                _leader, 
                _artist, 
                _totalAmount, 
                keccak256(bytes(_startsAt)),
                keccak256(bytes(_endsAt))
            )
        );
        bytes32 digest = _hashTypedDataV4(structHash);

        address recoveredLeader = ECDSA.recover(digest, sigLeader);
        address recoveredArtist = ECDSA.recover(digest, sigArtist);

        require(recoveredLeader != address(0) && recoveredLeader == _leader, "Invalid leader signature");
        require(recoveredArtist != address(0) && recoveredArtist == _artist, "Invalid artist signature");
    }

    // --- ERC-1155 및 ERC-2771 오버라이드 ---

    /**
     * @dev (OZ 5.0) _update 함수를 오버라이드하여 토큰 전송을 막습니다. (양도 불가능)
     * 발행(from == 0x0) 및 소각(to == 0x0)만 허용됩니다.
     */
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts
    ) internal virtual override(ERC1155) { 
        
        // 발행(mint) 또는 소각(burn)이 아닌 일반 전송을 차단
        require(from == address(0) || to == address(0), "Tokens are non-transferrable");

        super._update(from, to, ids, amounts);
    }

    /**
     * @dev ERC-2771(가스비 대납)을 위한 _msgSender 오버라이드
     */
    function _msgSender() internal view virtual override(Context, ERC2771Context) returns (address) {
        return ERC2771Context._msgSender();
    }

    /**
     * @dev ERC-2771(가스비 대납)을 위한 _msgData 오버라이드
     */
    function _msgData() internal view virtual override(Context, ERC2771Context) returns (bytes calldata) {
        return ERC2771Context._msgData();
    }
    
    /**
     * @dev ERC-2771(가스비 대납)을 위한 _contextSuffixLength 오버라이드
     */
    function _contextSuffixLength() internal view virtual override(Context, ERC2771Context) returns (uint256) {
        return ERC2771Context._contextSuffixLength();
    }

    /**
     * @dev ERC-165 인터페이스 지원 확인
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
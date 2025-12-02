// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/metatx/ERC2771Forwarder.sol";

/**
 * @title MOASForwarder
 * @dev ERC-2771 표준 가스비 대납 포워더 컨트랙트
 * project&NFT 컨트랙트 배포 전 이 컨트랙트 블록체인 네트워크 배포 필요.
 */
contract MOASForwarder is ERC2771Forwarder {
    constructor() ERC2771Forwarder("MOASForwarder") {}
}
// test/MOASContract.test.ts
import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer } from "ethers";
import { MOASContract, MOASForwarder } from "../typechain-types";

describe("MOASContract (v2)", function () {
  // 테스트에 필요한 변수들
  let moas: MOASContract;
  let forwarder: MOASForwarder;
  let deployer: Signer; // '서버' 역할을 겸함
  let leader: Signer;
  let artist: Signer;
  let otherUser: Signer;

  /**
   * @dev 각 테스트 실행 전에 컨트랙트를 새로 배포하는 Fixture
   */
  async function deployContractsFixture() {
    // 1. 테스트용 지갑(Signer) 가져오기
    [deployer, leader, artist, otherUser] = await ethers.getSigners();

    // 2. MOASForwarder 배포
    const ForwarderFactory = await ethers.getContractFactory("MOASForwarder");
    forwarder = await ForwarderFactory.deploy();
    await forwarder.waitForDeployment();
    const forwarderAddress = await forwarder.getAddress();

    // 3. MOASContract 배포 (Forwarder 주소 주입)
    const MOASFactory = await ethers.getContractFactory("MOASContract");
    moas = await MOASFactory.deploy(forwarderAddress);
    await moas.waitForDeployment();

    return { moas, forwarder, deployer, leader, artist, otherUser };
  }

  /**
   * @dev EIP-712 서명을 생성하는 헬퍼 함수 (업데이트됨)
   */
  async function signContract(
    tokenId: number,
    title: string,
    descriptionHash: string,
    leaderSigner: Signer,
    artistSigner: Signer,
    totalAmount: bigint,
    startsAt: string,
    endsAt: string
  ) {
    const domain = {
      name: "MOASContract",
      version: "1",
      chainId: (await ethers.provider.getNetwork()).chainId,
      verifyingContract: await moas.getAddress(),
    };

    // 컨트랙트의 CONTRACT_SIGNATURE_TYPEHASH와 정확히 일치해야 함
    const types = {
      ContractSignature: [
        { name: "tokenId", type: "uint256" },
        { name: "title", type: "string" },
        { name: "descriptionHash", type: "bytes32" },
        { name: "leader", type: "address" },
        { name: "artist", type: "address" },
        { name: "totalAmount", type: "uint256" },
        { name: "startsAt", type: "string" },
        { name: "endsAt", type: "string" },
      ],
    };

    const value = {
      tokenId: tokenId,
      title: title,
      descriptionHash: descriptionHash, // [MODIFIED] descriptionHash 추가
      leader: await leaderSigner.getAddress(),
      artist: await artistSigner.getAddress(),
      totalAmount: totalAmount,
      startsAt: startsAt,
      endsAt: endsAt,
    };

    // 각 당사자 서명 생성
    const sigLeader = await leaderSigner.signTypedData(domain, types, value);
    const sigArtist = await artistSigner.signTypedData(domain, types, value);

    return { sigLeader, sigArtist };
  }

  // --- 테스트 케이스 시작 ---

  beforeEach(async function () {
    // Fixture를 사용해 매번 깨끗한 상태에서 시작
    Object.assign(this, await loadFixture(deployContractsFixture));
  });

  describe("Deployment & Roles", function () {
    it("Should set the right roles for the deployer", async function () {
      const deployerAddress = await deployer.getAddress();
      const DEFAULT_ADMIN_ROLE = await moas.DEFAULT_ADMIN_ROLE();
      const SERVER_ROLE = await moas.SERVER_ROLE();

      expect(await moas.hasRole(DEFAULT_ADMIN_ROLE, deployerAddress)).to.be.true;
      expect(await moas.hasRole(SERVER_ROLE, deployerAddress)).to.be.true;
    });

    it("Should set the EIP-712 domain correctly", async function () {
      const domain = await moas.eip712Domain();
      expect(domain.name).to.equal("MOASContract");
      expect(domain.version).to.equal("1");
    });
  });

  describe("createContract (Core Logic)", function () {
    // 테스트용 데이터 정의
    const tokenId = 12345; // 백엔드 DB ID
    const title = "MOAS Project Main Contract";
    // [MODIFIED] description 및 hash 추가
    const description = "Test description for contract 12345";
    const descriptionHash = ethers.keccak256(ethers.toUtf8Bytes(description));
    
    const totalAmount = ethers.parseEther("10"); // 10 ETH
    const startsAt = "2025-01-01T00:00:00Z";
    const endsAt = "2025-12-31T23:59:59Z";
    const tokenURI = "ipfs://QmW...example/12345.json";
    
    let sigLeader: string;
    let sigArtist: string;
    let leaderAddress: string;
    let artistAddress: string;

    beforeEach(async function () {
      leaderAddress = await leader.getAddress();
      artistAddress = await artist.getAddress();

      // 서명을 미리 받아둠
      const signatures = await signContract(
        tokenId,
        title,
        descriptionHash, // [MODIFIED] hash 주입
        leader,
        artist,
        totalAmount,
        startsAt,
        endsAt
      );
      sigLeader = signatures.sigLeader;
      sigArtist = signatures.sigArtist;
    });

    it("Should create contract, mint tokens, and set state", async function () {
      // '서버'(deployer)가 createContract 함수 호출
      await expect(
        moas
          .connect(deployer)
          .createContract(
            tokenId,
            title,
            descriptionHash, // [MODIFIED] hash 주입
            leaderAddress,
            artistAddress,
            totalAmount,
            startsAt,
            endsAt,
            tokenURI,
            sigLeader,
            sigArtist
          )
      )
        .to.emit(moas, "ContractCreated")
        .withArgs(tokenId, leaderAddress, artistAddress);

      // 1. 토큰 잔액 확인
      expect(await moas.balanceOf(leaderAddress, tokenId)).to.equal(1);
      expect(await moas.balanceOf(artistAddress, tokenId)).to.equal(1);

      // 2. URI 확인
      expect(await moas.uri(tokenId)).to.equal(tokenURI);

      // 3. 계약 정보 확인
      expect(await moas.contractStatus(tokenId)).to.equal(0); // 0: Status.Active
      expect(await moas.projectLeader(tokenId)).to.equal(leaderAddress);
      expect(await moas.artist(tokenId)).to.equal(artistAddress);
    });

    it("Should fail if Token ID already exists", async function () {
      // 1. 첫 번째 생성 (정상)
      await moas
        .connect(deployer)
        .createContract(
          tokenId, title, descriptionHash, leaderAddress, artistAddress, totalAmount, 
          startsAt, endsAt, tokenURI, sigLeader, sigArtist
        );
      
      // 2. 두 번째 생성 시도 (동일 ID)
      await expect(
        moas
          .connect(deployer)
          .createContract(
            tokenId,
            "Another Title",
            descriptionHash, // [MODIFIED] hash 주입
            leaderAddress, artistAddress, totalAmount, 
            startsAt, endsAt, "ipfs://...", sigLeader, sigArtist
          )
      ).to.be.revertedWith("Token ID already exists");
    });

    it("Should fail if caller is not SERVER_ROLE", async function () {
      // 'otherUser'(서버가 아님)가 함수 호출 시도
      await expect(
        moas
          .connect(otherUser)
          .createContract(
            tokenId, title, descriptionHash, leaderAddress, artistAddress, totalAmount, 
            startsAt, endsAt, tokenURI, sigLeader, sigArtist
          )
      ).to.be.revertedWithCustomError(
        moas,
        "AccessControlUnauthorizedAccount"
      );
    });

    it("Should fail with invalid leader signature", async function () {
      // 'otherUser'가 리더인 척 서명
      const { sigLeader: invalidSig } = await signContract(
        tokenId, title, descriptionHash, 
        otherUser,
        artist, 
        totalAmount, startsAt, endsAt
      );

      await expect(
        moas
          .connect(deployer)
          .createContract(
            tokenId, title, descriptionHash, leaderAddress, artistAddress, totalAmount, 
            startsAt, endsAt, tokenURI, 
            invalidSig,
            sigArtist
          )
      ).to.be.revertedWith("Invalid leader signature");
    });

    it("Should fail if signed data does not match parameters", async function () {
      // 서명은 'title'/'descriptionHash'로 받았는데, 함수 호출은 'WRONG TITLE'로 하는 경우
      await expect(
        moas
          .connect(deployer)
          .createContract(
            tokenId, 
            "WRONG TITLE",
            descriptionHash, // [MODIFIED] hash 주입
            leaderAddress, artistAddress, totalAmount, 
            startsAt, endsAt, tokenURI, 
            sigLeader, 
            sigArtist
          )
      ).to.be.revertedWith("Invalid leader signature"); // 또는 artist (해시 불일치로 둘 다 실패)

      // 서명은 'title'/'descriptionHash'로 받았는데, 함수 호출은 'WRONG HASH'로 하는 경우
      const wrongDescriptionHash = ethers.keccak256(ethers.toUtf8Bytes("wrong desc"));
       await expect(
        moas
          .connect(deployer)
          .createContract(
            tokenId, 
            title,
            wrongDescriptionHash, // <-- 서명된 내용과 다름
            leaderAddress, artistAddress, totalAmount, 
            startsAt, endsAt, tokenURI, 
            sigLeader, 
            sigArtist
          )
      ).to.be.revertedWith("Invalid leader signature"); // 또는 artist (해시 불일치로 둘 다 실패)
    });
  });

  describe("Status Updates & Cancellation", function () {
    const tokenId = 12345;
    // [MODIFIED] setup용 description hash 추가
    const setupDescription = "Status update test contract";
    const setupDescriptionHash = ethers.keccak256(ethers.toUtf8Bytes(setupDescription));

    // 상태 변경 테스트를 위해 먼저 계약을 생성
    beforeEach(async function () {
      const { sigLeader, sigArtist } = await signContract(
        tokenId, "Test Title", setupDescriptionHash, leader, artist, 
        ethers.parseEther("1"), "2025-01-01", "2025-01-31"
      );
      await moas
        .connect(deployer)
        .createContract(
          tokenId, "Test Title", setupDescriptionHash, await leader.getAddress(), await artist.getAddress(),
          ethers.parseEther("1"), "2025-01-01", "2025-01-31",
          "ipfs://...", sigLeader, sigArtist
        );
    });

    it("Should allow server to update status to 'Completed'", async function () {
      const newStatus = 1; // Status.Completed
      await expect(moas.connect(deployer).updateContractStatus(tokenId, newStatus))
        .to.emit(moas, "ContractStatusUpdated")
        .withArgs(tokenId, newStatus);

      expect(await moas.contractStatus(tokenId)).to.equal(newStatus);
    });

    it("Should prevent server from updating status to 'Canceled' via updateContractStatus", async function () {
      const canceledStatus = 2; // Status.Canceled
      await expect(
        moas.connect(deployer).updateContractStatus(tokenId, canceledStatus)
      ).to.be.revertedWith("Use cancelContract function to cancel");
    });

    it("Should allow server to cancel contract and burn tokens", async function () {
      await expect(moas.connect(deployer).cancelContract(tokenId))
        .to.emit(moas, "ContractCanceled")
        .withArgs(tokenId);

      // 토큰 소각 확인
      expect(await moas.balanceOf(await leader.getAddress(), tokenId)).to.equal(0);
      expect(await moas.balanceOf(await artist.getAddress(), tokenId)).to.equal(0);

      // 상태 변경 확인
      expect(await moas.contractStatus(tokenId)).to.equal(2); // Status.Canceled
    });
  });

  describe("Non-Transferrable", function () {
    const tokenId = 12345;
    // [MODIFIED] setup용 description hash 추가
    const setupDescription = "Non-transferrable test contract";
    const setupDescriptionHash = ethers.keccak256(ethers.toUtf8Bytes(setupDescription));

    beforeEach(async function () {
      // 계약 생성
      const { sigLeader, sigArtist } = await signContract(
        tokenId, "Test Title", setupDescriptionHash, leader, artist, 
        ethers.parseEther("1"), "2025-01-01", "2025-01-31"
      );
      await moas
        .connect(deployer)
        .createContract(
          tokenId, "Test Title", setupDescriptionHash, await leader.getAddress(), await artist.getAddress(),
          ethers.parseEther("1"), "2025-01-01", "2025-01-31",
          "ipfs://...", sigLeader, sigArtist
        );
    });

    it("Should prevent safeTransferFrom", async function () {
      await expect(
        moas
          .connect(leader)
          .safeTransferFrom(
            await leader.getAddress(),
            await otherUser.getAddress(),
            tokenId,
            1,
            "0x"
          )
      ).to.be.revertedWith("Tokens are non-transferrable");
    });

    it("Should prevent safeBatchTransferFrom", async function () {
      await expect(
        moas
          .connect(artist)
          .safeBatchTransferFrom(
            await artist.getAddress(),
            await otherUser.getAddress(),
            [tokenId],
            [1],
            "0x"
          )
      ).to.be.revertedWith("Tokens are non-transferrable");
    });
  });
});
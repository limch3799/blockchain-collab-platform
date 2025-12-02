// hardhat.config.ts
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config"; // .env 파일 로드를 위해 추가

// 환경 변수 로드
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

// PRIVATE_KEY가 '0x'로 시작하지 않으면 추가
const deployerPrivateKey = PRIVATE_KEY.startsWith("0x")
  ? PRIVATE_KEY
  : "0x" + PRIVATE_KEY;

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20", // 컨트랙트 pragma와 일치
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  defaultNetwork: "hardhat", // 로컬 테스트를 위한 기본 네트워크
  networks: {
    hardhat: {
      // 로컬 테스트 환경
    },
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [deployerPrivateKey],
      chainId: 11155111, // Sepolia 체인 ID
    },
  },
  etherscan: {
    // Etherscan 자동 검증을 위한 설정
    apiKey: ETHERSCAN_API_KEY,
  },
  paths: {
    sources: "./contracts", // .sol 파일 위치 (기본값)
    tests: "./test",       // .ts 테스트 파일 위치 (기본값)
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
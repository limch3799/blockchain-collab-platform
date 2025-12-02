// IMP START - Quick Start
import { WEB3AUTH_NETWORK, CHAIN_NAMESPACES } from "@web3auth/modal";
import { type Web3AuthContextConfig } from "@web3auth/modal/react";
// IMP END - Quick Start

// IMP START - Dashboard Registration
const clientId = "BNjjVIAZ7y0BMQ4R78yUFEgylYK8zDDasRRSXOlzVvIz7HUZ6fLR2Tv4hMqSSVu51OCxJaxSLxhN1i0MRH-DXbU"; // get from https://dashboard.web3auth.io
// IMP END - Dashboard Registration

// IMP START - Config
const web3AuthContextConfig: Web3AuthContextConfig = {
  web3AuthOptions: {
    clientId,
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
    chainConfig: {
      chainNamespace: CHAIN_NAMESPACES.EIP155, // EVM 호환 체인이므로 EIP155
      chainId: "0xaa36a7", // Sepolia 체인 ID (11155111의 16진수)
      rpcTarget: "https://rpc.sepolia.org", // Sepolia RPC URL
      displayName: "Sepolia Testnet",
      blockExplorer: "https://sepolia.etherscan.io",
      ticker: "ETH",
      tickerName: "Sepolia Ether",
    },
    uiConfig: {
      targetId: "web3auth-modal",
    },
  },
};
// IMP END - Config

export default web3AuthContextConfig;


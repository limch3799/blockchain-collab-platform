// IMP START - Quick Start
import { WEB3AUTH_NETWORK, CHAIN_NAMESPACES } from '@web3auth/modal';
// IMP END - Quick Start

// IMP START - Dashboard Registration
const clientId = import.meta.env.VITE_WEB3_AUTH_KEY;
// IMP END - Dashboard Registration

// IMP START - Config
const web3AuthContextConfig = {
  web3AuthOptions: {
    clientId,
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
    chainConfig: {
      chainNamespace: CHAIN_NAMESPACES.EIP155,
      chainId: "0xaa36a7",
      rpcTarget: "https://rpc.sepolia.org",
      displayName: "Sepolia Testnet",
      blockExplorer: "https://sepolia.etherscan.io",
      ticker: "ETH",
      tickerName: "Sepolia Ether",
    }
  },
};
// IMP END - Config

export default web3AuthContextConfig;
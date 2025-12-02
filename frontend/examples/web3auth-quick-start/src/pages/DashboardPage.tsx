import { useWeb3AuthUser } from "@web3auth/modal/react";
import { useAccount } from "wagmi";
import { Balance } from "../components/getBalance";
import { SendTransaction } from "../components/sendTransaction";
import { SwitchChain } from "../components/switchNetwork";

const DashboardPage = () => {
  const { userInfo } = useWeb3AuthUser();
  const { address } = useAccount();

  function uiConsole(...args: any[]): void {
    const el = document.querySelector("#console>p");
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2);
      console.log(...args);
    }
  }

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Welcome, {userInfo?.name || 'user'}!</p>
      <div>Wallet Address: {address}</div>

      <div className="flex-container" style={{ marginTop: '20px' }}>
        <button onClick={() => uiConsole(userInfo)} className="card">
          Get User Info
        </button>
      </div>
      
      <div id="console" style={{ whiteSpace: "pre-line", marginTop: '20px' }}>
        <p style={{ whiteSpace: "pre-line" }}></p>
      </div>

      <hr style={{ margin: '20px 0' }} />

      {/* 기존 블록체인 컴포넌트들 */}
      <div className="grid">
        <SendTransaction />
        <Balance />
        <SwitchChain />
      </div>
    </div>
  );
};

export default DashboardPage;
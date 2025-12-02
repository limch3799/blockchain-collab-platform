// src/App.tsx (수정된 최종 코드)

import "./App.css";
import { useWeb3AuthConnect, useWeb3AuthDisconnect, useWeb3AuthUser } from "@web3auth/modal/react";
import { useAccount } from "wagmi";
import { Routes, Route, Link, useNavigate } from 'react-router-dom';

// 1. 페이지 컴포넌트들을 import 합니다.
import ContractDetailPage from './pages/ContractDetailPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailPage from './pages/PaymentFailPage';
import DashboardPage from "./pages/DashboardPage"; // 방금 만든 대시보드 페이지
import apiClient from "./services/apiClient"; // API 클라이언트 import

// 간단한 홈페이지 컴포넌트
const HomePage = () => (
  <div className="grid">
    <h2>DApp 계약 및 결제 시스템</h2>
    <p>로그인 후 대시보드로 이동하거나, 계약서 페이지를 확인하세요.</p>
  </div>
);

function App() {
  // 2. 기존 Web3Auth 훅은 그대로 사용합니다.
  const { connect, isConnected, connectorName } = useWeb3AuthConnect();
  const { disconnect } = useWeb3AuthDisconnect();
  const { userInfo } = useWeb3AuthUser();
  const { address } = useAccount();
  const navigate = useNavigate(); // 페이지 이동을 위한 훅

  // 3. 로그인/로그아웃 함수를 개선합니다. (JWT 처리 포함)
  const handleLogin = async () => {
    try {
      await connect();
      // Web3Auth 로그인 성공 후, 우리 백엔드 서버에 로그인 요청을 보내 JWT를 받아옵니다.
      // 이 부분은 백엔드 API 명세에 따라 달라집니다.
      // const response = await apiClient.post('/auth/login', { walletAddress: address });
      // const jwtToken = response.data.token;
      // localStorage.setItem('jwtToken', jwtToken);
      
      alert(`로그인 성공: ${connectorName}`);
      navigate('/dashboard'); // 로그인 후 대시보드로 이동
    } catch (error) {
      console.error("로그인 실패", error);
    }
  };

  const handleLogout = async () => {
    await disconnect();
    localStorage.removeItem('jwtToken'); // 저장된 JWT 토큰 제거
    navigate('/'); // 로그아웃 후 홈으로 이동
  };

  // 4. JSX 구조를 완전히 변경합니다.
  return (
    <div className="container">
      {/* --- 헤더: 항상 보이는 부분 --- */}
      <header className="header">
        <h1 className="title">
          <Link to="/">Contract DApp</Link>
        </h1>
        <nav>
          {isConnected && <Link to="/dashboard" className="nav-link">Dashboard</Link>}
          <Link to="/contract/1" className="nav-link">계약서 #1</Link>
        </nav>
        <div className="auth-section">
          {isConnected ? (
            <div className="user-info">
              <span>{address?.slice(0, 6)}...</span>
              <button onClick={handleLogout} className="card small">Log Out</button>
            </div>
          ) : (
            <button onClick={handleLogin} className="card small">Login</button>
          )}
        </div>
      </header>

      {/* --- 메인 컨텐츠: URL에 따라 바뀌는 부분 --- */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/* 로그인한 사용자만 대시보드를 볼 수 있도록 조건부 렌더링도 가능합니다 */}
          <Route path="/dashboard" element={isConnected ? <DashboardPage /> : <HomePage />} />
          <Route path="/contract/:id" element={<ContractDetailPage />} />
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/payment/fail" element={<PaymentFailPage />} />
          <Route path="/payment-success" element={<PaymentSuccessPage />} />
          <Route path="/payment-fail" element={<PaymentFailPage />} />
        </Routes>
      </main>

      {/* --- 푸터: 항상 보이는 부분 --- */}
      <footer className="footer">
        <a
          href="https://github.com/Web3Auth/web3auth-examples/tree/main/quick-starts/react-quick-start"
          target="_blank"
          rel="noopener noreferrer"
        >
          Source code
        </a>
      </footer>
    </div>
  );
}

export default App;
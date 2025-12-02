import { useState } from 'react';
import ChatTest from './components/ChatTest';
//import NotificationTest from './components/NotificationTest';
import { setAuthToken } from './services/api';

function App() {
  const [token, setToken] = useState('');

  const handleSetToken = () => {
    setAuthToken(token);
    alert('토큰 설정 완료!');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>SSE 테스트 페이지</h1>
      
      {/* 토큰 설정 */}
      <div style={{ marginBottom: '20px', padding: '10px', background: '#ffe' }}>
        <h3>JWT 토큰 설정</h3>
        <input
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="JWT 토큰 입력"
          style={{ width: '500px', marginRight: '10px' }}
        />
        <button onClick={handleSetToken}>토큰 설정</button>
      </div>

      <ChatTest />
      {/* <NotificationTest /> */}
    </div>
  );
}

export default App;
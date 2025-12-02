// src/components/layout/TestLoginFloatingButton.tsx
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWeb3AuthConnect } from '@web3auth/modal/react';
import tempLoginButtonImage from '@/assets/test_login_button.png';
import tempLeader1ButtonImage from '@/assets/temp_leader1_button.png';
import tempLeader2ButtonImage from '@/assets/temp_leader2_button.png';
import tempArtist1ButtonImage from '@/assets/temp_artist1_button.png';
import tempArtist2ButtonImage from '@/assets/temp_artist2_button.png';

export function TestLoginFloatingButton() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { isAuthenticated, handleWeb3AuthLogin } = useAuth();
  const { isConnected } = useWeb3AuthConnect();

  // ✅ Header와 동일한 로그인 판단 로직
  const userLoggedIn = isAuthenticated || isConnected;

  // 로그인 상태면 렌더링하지 않음
  if (userLoggedIn) {
    return null;
  }

  const handleMainButtonClick = () => {
    setIsExpanded(!isExpanded);
  };

  // 임시 로그인 계정 정보 (idToken과 walletAddress를 여기에 입력)
  const tempAccounts = {
    //ch leader 1
    leader1: {
      idToken:
        'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlRZT2dnXy01RU9FYmxhWS1WVlJZcVZhREFncHRuZktWNDUzNU1aUEMwdzAifQ.eyJpYXQiOjE3NjI3NzEzMzgsImF1ZCI6IkJOampWSUFaN3kwQk1RNFI3OHlVRkVneWxZSzh6RERhc1JSU1hPbHpWdkl6N0hVWjZmTFIyVHY0aE1xU1NWdTUxT0N4SmF4U0x4aE4xaTBNUkgtRFhiVSIsIm5vbmNlIjoiMDJhODYzYTc1MjI2NDIzMjM4OTdiMGY1MDAwNWU3ZmI3N2NhNWIyMzgyMTdlODFmZjAwZWVlYzgzNjE1ODE2MmFkIiwiaXNzIjoiaHR0cHM6Ly9hcGktYXV0aC53ZWIzYXV0aC5pbyIsIndhbGxldHMiOlt7InB1YmxpY19rZXkiOiJmNDc4ZDEwZTgxNzQ3ZWUyZThlNTYwYzc4MzUyYjAyYzVhNDFhODU5Y2UzZWE0NThlMDUwMmZjMzRiM2E3ZTA1IiwidHlwZSI6IndlYjNhdXRoX2FwcF9rZXkiLCJjdXJ2ZSI6ImVkMjU1MTkifSx7InB1YmxpY19rZXkiOiJjNWIyMjkwNWYwYzBmOWJhNjY2NTcyY2ExNGI1ZGRjMzQxNmQ0YTlkNjhjMzE1Y2RkNDNmNzc5OGRjNDBjNGFlIiwidHlwZSI6IndlYjNhdXRoX3RocmVzaG9sZF9rZXkiLCJjdXJ2ZSI6ImVkMjU1MTkifSx7InB1YmxpY19rZXkiOiIwMjBhZmUyMzM1OTQwNDVlMTVhODJjYTNmZmI1YTVlNzRmMTZiNGIzYjQ2MGIxMWIwNzJjMzhkYjYwZWUzYTk4ZTIiLCJ0eXBlIjoid2ViM2F1dGhfYXBwX2tleSIsImN1cnZlIjoic2VjcDI1NmsxIn0seyJwdWJsaWNfa2V5IjoiMDIxMGI4NTIyYmVlOWZkZDgyODZlMmUyM2EwOWUyOWI1ZDcwMjIzOTQ0NjcxMzQ2ZDM4N2JmNjc4OGZlMTY2ZjYzIiwidHlwZSI6IndlYjNhdXRoX3RocmVzaG9sZF9rZXkiLCJjdXJ2ZSI6InNlY3AyNTZrMSJ9XSwiZW1haWwiOiJsY2g4MDQ5OUBnbWFpbC5jb20iLCJuYW1lIjoi7LC97ZiEMSIsInByb2ZpbGVJbWFnZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0k5dkN2NGZ6cHphd3M4UV9yUEMtM3hBaFMyQi16RHdlT25tUlA1Zm1objF5amlQZz1zOTYtYyIsInZlcmlmaWVyIjoid2ViM2F1dGgiLCJhdXRoQ29ubmVjdGlvbklkIjoid2ViM2F1dGgiLCJ2ZXJpZmllcklkIjoibGNoODA0OTlAZ21haWwuY29tIiwidXNlcklkIjoibGNoODA0OTlAZ21haWwuY29tIiwiYWdncmVnYXRlVmVyaWZpZXIiOiJ3ZWIzYXV0aC1nb29nbGUtc2FwcGhpcmUtZGV2bmV0IiwiZ3JvdXBlZEF1dGhDb25uZWN0aW9uSWQiOiJ3ZWIzYXV0aC1nb29nbGUtc2FwcGhpcmUtZGV2bmV0IiwiZXhwIjoxNzYyODU3NzM4fQ.iwHxQoDr-_ou0WSySB-3BSgxKm1DSKCTWziejz2Q1yry1sutvEj3CJPMztXEVe964ZWe6qIh0QmJGvny0NAxUg',
      walletAddress: '0x18e150F5e1d056d9874d57B8420B729787eC7212',
    },
    //sj leader1 -> lch804994
    leader2: {
      idToken:
        'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlRZT2dnXy01RU9FYmxhWS1WVlJZcVZhREFncHRuZktWNDUzNU1aUEMwdzAifQ.eyJpYXQiOjE3NjI3NzE0MzMsImF1ZCI6IkJOampWSUFaN3kwQk1RNFI3OHlVRkVneWxZSzh6RERhc1JSU1hPbHpWdkl6N0hVWjZmTFIyVHY0aE1xU1NWdTUxT0N4SmF4U0x4aE4xaTBNUkgtRFhiVSIsIm5vbmNlIjoiMDI4MzAwNDM5NWJiNDk4NGVlY2RlYWQyMGVhMTZjNGNkMWE2ZmQ1YTJiZDMzZjdmNzRjNzYyMzFkZGI2ZTJjNWEwIiwiaXNzIjoiaHR0cHM6Ly9hcGktYXV0aC53ZWIzYXV0aC5pbyIsIndhbGxldHMiOlt7InB1YmxpY19rZXkiOiI3YzdlYmU3NGVmMjk1OTUxNDNjMDdmMmI5MWFkODg4MzFkNTI4MDhjZGM5NzczOGRlMTE4ZTVkMjJlOTc2YzQ2IiwidHlwZSI6IndlYjNhdXRoX2FwcF9rZXkiLCJjdXJ2ZSI6ImVkMjU1MTkifSx7InB1YmxpY19rZXkiOiJlODIxZjUyZGU5YmU3MGJmNTUyOWVmYmE1NzMzMTQ2MTE4NTY5OGEyZDAzMTQ5ZjVjNGJjZDMzNmZiMTgzMDdlIiwidHlwZSI6IndlYjNhdXRoX3RocmVzaG9sZF9rZXkiLCJjdXJ2ZSI6ImVkMjU1MTkifSx7InB1YmxpY19rZXkiOiIwMjBhODI1NzA1Y2Q2ZjgyYzU0Y2E0YjdlYjMwNDEzNWM3MzFjYWE0NGQwODE0MDRlMTA5NGU4OTVjMmI3ZTA3ZGYiLCJ0eXBlIjoid2ViM2F1dGhfYXBwX2tleSIsImN1cnZlIjoic2VjcDI1NmsxIn0seyJwdWJsaWNfa2V5IjoiMDI1YWMwMTU1Y2FiNmQ0YmJkYmZiZWVjZTJiNDllMTI0YTE4NTEwZjZlZWRkM2QxYjY1MDJjYWU0NTA4ZTUwMThmIiwidHlwZSI6IndlYjNhdXRoX3RocmVzaG9sZF9rZXkiLCJjdXJ2ZSI6InNlY3AyNTZrMSJ9XSwiZW1haWwiOiJsY2g4MDQ5OTRAZ21haWwuY29tIiwibmFtZSI6Iuywve2YhDYiLCJwcm9maWxlSW1hZ2UiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NLMVlNcFl6cVRSSWJ0LWZaR29YbUUtbkFGR21KdWQwRG91M3czNnctQm96X0JwSFE9czk2LWMiLCJ2ZXJpZmllciI6IndlYjNhdXRoIiwiYXV0aENvbm5lY3Rpb25JZCI6IndlYjNhdXRoIiwidmVyaWZpZXJJZCI6ImxjaDgwNDk5NEBnbWFpbC5jb20iLCJ1c2VySWQiOiJsY2g4MDQ5OTRAZ21haWwuY29tIiwiYWdncmVnYXRlVmVyaWZpZXIiOiJ3ZWIzYXV0aC1nb29nbGUtc2FwcGhpcmUtZGV2bmV0IiwiZ3JvdXBlZEF1dGhDb25uZWN0aW9uSWQiOiJ3ZWIzYXV0aC1nb29nbGUtc2FwcGhpcmUtZGV2bmV0IiwiZXhwIjoxNzYyODU3ODMzfQ.KsylkRRccA6cnKtqB2bFlQvODxeqJ8VHLT-Q3OM-6PJ3Bsrb4-pXMlhaaqL8PpM2VWUOPw5kbPDNPT5dnFr2ew',
      walletAddress: '0x39a21f919cDe8daf58e9186754CB49af24018B92',
    },
    //ch artist 1
    artist1: {
      idToken:
        'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlRZT2dnXy01RU9FYmxhWS1WVlJZcVZhREFncHRuZktWNDUzNU1aUEMwdzAifQ.eyJpYXQiOjE3NjI3NzEyNzIsImF1ZCI6IkJOampWSUFaN3kwQk1RNFI3OHlVRkVneWxZSzh6RERhc1JSU1hPbHpWdkl6N0hVWjZmTFIyVHY0aE1xU1NWdTUxT0N4SmF4U0x4aE4xaTBNUkgtRFhiVSIsIm5vbmNlIjoiMDI0MTRmMzY1MDBkMmQ3ZGIxZWJmMWRjMTkzYjM0N2E3NzU0ZmZhMDI0ZmE5ZDM0NzgxYjljOTA2MWU2NWY5MGU5IiwiaXNzIjoiaHR0cHM6Ly9hcGktYXV0aC53ZWIzYXV0aC5pbyIsIndhbGxldHMiOlt7InB1YmxpY19rZXkiOiIzMWQ3ZmNhOGU0MTc3OTNjMGVjNWRkZmZjZTMyZGI3YWQ1NGMwOTMxNGFjMmQyMDM3M2NiNjA4MmI1ZWU0ZTA0IiwidHlwZSI6IndlYjNhdXRoX2FwcF9rZXkiLCJjdXJ2ZSI6ImVkMjU1MTkifSx7InB1YmxpY19rZXkiOiI0OGY2MzI4NmY2YzY4ODRlMWU2MDkyZWY1ODcwNWRlYTNjMjAzYmFlOTNhM2ZlZTk5ZGM5MGJhMTc0YzQ0Y2FkIiwidHlwZSI6IndlYjNhdXRoX3RocmVzaG9sZF9rZXkiLCJjdXJ2ZSI6ImVkMjU1MTkifSx7InB1YmxpY19rZXkiOiIwMmQ0ZGUwMTFhNzc3ZGFmM2YyY2RhNDQ3OGFiODJlYjg0Y2JlYTQxZWQyYzJlNTZhZDgwYWE1ZGQyYTFkNDBjNTQiLCJ0eXBlIjoid2ViM2F1dGhfYXBwX2tleSIsImN1cnZlIjoic2VjcDI1NmsxIn0seyJwdWJsaWNfa2V5IjoiMDJjZWM0NDY3MjQzZDBkYjFkNGIzODQzY2Q3NTZhOTUzYzFjNDFjMDBkM2Q3YTllMzI3NTIxNmZmMTU0ZWQzODI4IiwidHlwZSI6IndlYjNhdXRoX3RocmVzaG9sZF9rZXkiLCJjdXJ2ZSI6InNlY3AyNTZrMSJ9XSwiZW1haWwiOiJsaW1jaDM3OTlAZ21haWwuY29tIiwibmFtZSI6IuyehOywve2YhCIsInByb2ZpbGVJbWFnZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0p4T2g4Zm5CUGhTeE5GRFpqX21nMkEzZW84bEh5MjdnRTRxd2F6RjBrblE5ck1KQT1zOTYtYyIsInZlcmlmaWVyIjoid2ViM2F1dGgiLCJhdXRoQ29ubmVjdGlvbklkIjoid2ViM2F1dGgiLCJ2ZXJpZmllcklkIjoibGltY2gzNzk5QGdtYWlsLmNvbSIsInVzZXJJZCI6ImxpbWNoMzc5OUBnbWFpbC5jb20iLCJhZ2dyZWdhdGVWZXJpZmllciI6IndlYjNhdXRoLWdvb2dsZS1zYXBwaGlyZS1kZXZuZXQiLCJncm91cGVkQXV0aENvbm5lY3Rpb25JZCI6IndlYjNhdXRoLWdvb2dsZS1zYXBwaGlyZS1kZXZuZXQiLCJleHAiOjE3NjI4NTc2NzJ9.j9JXohMXoC9aqKPeQTwxvnC3tzUCFnJqBMiYJ3HDZGWmow5KagrgZlwDbRramCpmbiez8OplqHaTXJ4E30122A',
      walletAddress: '0x3Fc59dCDCDa640bb50DEcaB32f8dC76d194C8533',
    },
    //sj artist2 -> lchmoas804993
    artist2: {
      idToken:
        'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlRZT2dnXy01RU9FYmxhWS1WVlJZcVZhREFncHRuZktWNDUzNU1aUEMwdzAifQ.eyJpYXQiOjE3NjI3NzE1MDksImF1ZCI6IkJOampWSUFaN3kwQk1RNFI3OHlVRkVneWxZSzh6RERhc1JSU1hPbHpWdkl6N0hVWjZmTFIyVHY0aE1xU1NWdTUxT0N4SmF4U0x4aE4xaTBNUkgtRFhiVSIsIm5vbmNlIjoiMDMyYjZlNjFlYjFjY2RiODRjOTg5Mjk0NGUwMDk5ZDkzNTE3NzEyNzNmNmFjMzhmYjk0NWI3MTkyZjVlNTI0NDEzIiwiaXNzIjoiaHR0cHM6Ly9hcGktYXV0aC53ZWIzYXV0aC5pbyIsIndhbGxldHMiOlt7InB1YmxpY19rZXkiOiI2NTVhNzBlM2ZiMDc3NGQwM2RiYjExZDFmMTU4ZTM3NGU2NzA5ZDMwMmNmODBiNTU4Njg4ZDY4NDRkODM1OTIzIiwidHlwZSI6IndlYjNhdXRoX2FwcF9rZXkiLCJjdXJ2ZSI6ImVkMjU1MTkifSx7InB1YmxpY19rZXkiOiJkZDdlNjlmZjVjM2E2NGZkNWJiMTkyODhlNzUxM2Q1MzVjMWJiMGFkMDgyMjIzY2M0NTRmY2Q0NGIzYzViM2JlIiwidHlwZSI6IndlYjNhdXRoX3RocmVzaG9sZF9rZXkiLCJjdXJ2ZSI6ImVkMjU1MTkifSx7InB1YmxpY19rZXkiOiIwMzc2ODM5NWFiNGYxMTI2M2Q3ODU0OWM2NjM5NjJkYjhjZGExNTI2MmRmNWIwM2Y1MzQyMWRiYjZiYmZmYmRkNjIiLCJ0eXBlIjoid2ViM2F1dGhfYXBwX2tleSIsImN1cnZlIjoic2VjcDI1NmsxIn0seyJwdWJsaWNfa2V5IjoiMDJjZjlkNmYwYmI5MDc2ZWJiOWQ3ZTIwNzY2OGM3ZjJkNDZkZWIzNWZiNmRlNTNjMjVmNGQzYTMzMGIzOWVlYWI4IiwidHlwZSI6IndlYjNhdXRoX3RocmVzaG9sZF9rZXkiLCJjdXJ2ZSI6InNlY3AyNTZrMSJ9XSwiZW1haWwiOiJsY2htb2FzODA0OTkzQGdtYWlsLmNvbSIsIm5hbWUiOiLssL3tmIQxNjEwIiwicHJvZmlsZUltYWdlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSUVnelMzT0hWaU9ndTdRbE14XzctWkFqa3I4R25jdkFIUmFramFEcy1iRzlVa05RPXM5Ni1jIiwidmVyaWZpZXIiOiJ3ZWIzYXV0aCIsImF1dGhDb25uZWN0aW9uSWQiOiJ3ZWIzYXV0aCIsInZlcmlmaWVySWQiOiJsY2htb2FzODA0OTkzQGdtYWlsLmNvbSIsInVzZXJJZCI6ImxjaG1vYXM4MDQ5OTNAZ21haWwuY29tIiwiYWdncmVnYXRlVmVyaWZpZXIiOiJ3ZWIzYXV0aC1nb29nbGUtc2FwcGhpcmUtZGV2bmV0IiwiZ3JvdXBlZEF1dGhDb25uZWN0aW9uSWQiOiJ3ZWIzYXV0aC1nb29nbGUtc2FwcGhpcmUtZGV2bmV0IiwiZXhwIjoxNzYyODU3OTA5fQ.UAs1DGgOrD7jmHEjQoQHRvVGwV2M-wR9_unBYPIvCPXHZZSXF_cDgsjId9UUCwPdhiWDjt1zLX1W8zNgSzNQAQ',
      walletAddress: '0x37c890c80C3C66fB314B62f44A2D43D6390EB27E',
    },
  };

  const handleLeader1Click = async () => {
    console.log('🔵 Leader 1 로그인 시도...');
    const { idToken, walletAddress } = tempAccounts.leader1;

    if (idToken === '이후적을예정' || walletAddress === '이후적을예정') {
      console.error('❌ Leader 1 계정 정보가 설정되지 않았습니다.');
      alert('Leader 1 계정 정보를 먼저 설정해주세요.');
      return;
    }

    const result = await handleWeb3AuthLogin(idToken, walletAddress);
    if (result.success) {
      console.log('✅ Leader 1 로그인 완료');
      setIsExpanded(false);
    } else {
      console.error('❌ Leader 1 로그인 실패:', result.error);
      alert('로그인에 실패했습니다: ' + result.error);
    }
  };

  const handleLeader2Click = async () => {
    console.log('🔵 Leader 2 로그인 시도...');
    const { idToken, walletAddress } = tempAccounts.leader2;

    if (idToken === '이후적을예정' || walletAddress === '이후적을예정') {
      console.error('❌ Leader 2 계정 정보가 설정되지 않았습니다.');
      alert('Leader 2 계정 정보를 먼저 설정해주세요.');
      return;
    }

    const result = await handleWeb3AuthLogin(idToken, walletAddress);
    if (result.success) {
      console.log('✅ Leader 2 로그인 완료');
      setIsExpanded(false);
    } else {
      console.error('❌ Leader 2 로그인 실패:', result.error);
      alert('로그인에 실패했습니다: ' + result.error);
    }
  };

  const handleArtist1Click = async () => {
    console.log('🎨 Artist 1 로그인 시도...');
    const { idToken, walletAddress } = tempAccounts.artist1;

    if (idToken === '이후적을예정' || walletAddress === '이후적을예정') {
      console.error('❌ Artist 1 계정 정보가 설정되지 않았습니다.');
      alert('Artist 1 계정 정보를 먼저 설정해주세요.');
      return;
    }

    const result = await handleWeb3AuthLogin(idToken, walletAddress);
    if (result.success) {
      console.log('✅ Artist 1 로그인 완료');
      setIsExpanded(false);
    } else {
      console.error('❌ Artist 1 로그인 실패:', result.error);
      alert('로그인에 실패했습니다: ' + result.error);
    }
  };

  const handleArtist2Click = async () => {
    console.log('🎨 Artist 2 로그인 시도...');
    const { idToken, walletAddress } = tempAccounts.artist2;

    if (idToken === '이후적을예정' || walletAddress === '이후적을예정') {
      console.error('❌ Artist 2 계정 정보가 설정되지 않았습니다.');
      alert('Artist 2 계정 정보를 먼저 설정해주세요.');
      return;
    }

    const result = await handleWeb3AuthLogin(idToken, walletAddress);
    if (result.success) {
      console.log('✅ Artist 2 로그인 완료');
      setIsExpanded(false);
    } else {
      console.error('❌ Artist 2 로그인 실패:', result.error);
      alert('로그인에 실패했습니다: ' + result.error);
    }
  };

  return (
    <>
      {/* 메인 플로팅 버튼 */}
      <button
        onClick={handleMainButtonClick}
        className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
          isExpanded ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
        }`}
      >
        <img
          src={tempLoginButtonImage}
          alt="임시 로그인"
          className="h-21 hover:scale-110 transition-transform"
        />
      </button>

      {/* 확장된 4개의 버튼 */}
      {isExpanded && (
        <div className="fixed bottom-1 right-1 z-50">
          <div className="relative w-70 h-40">
            {/* Leader 1 - 왼쪽 위 */}
            <button
              onClick={handleLeader1Click}
              className="absolute animate-expand-tl"
              style={{
                top: '0',
                left: '0',
                animationDelay: '0ms',
              }}
            >
              <img
                src={tempLeader1ButtonImage}
                alt="Leader 1"
                className="h-24 hover:scale-110 transition-transform"
              />
            </button>

            {/* Leader 2 - 왼쪽 아래 */}
            <button
              onClick={handleLeader2Click}
              className="absolute animate-expand-bl"
              style={{
                bottom: '0',
                left: '0',
                animationDelay: '50ms',
              }}
            >
              <img
                src={tempLeader2ButtonImage}
                alt="Leader 2"
                className="h-24 hover:scale-110 transition-transform"
              />
            </button>

            {/* Artist 1 - 오른쪽 위 */}
            <button
              onClick={handleArtist1Click}
              className="absolute animate-expand-tr"
              style={{
                top: '0',
                right: '0',
                animationDelay: '100ms',
              }}
            >
              <img
                src={tempArtist1ButtonImage}
                alt="Artist 1"
                className="h-24 hover:scale-110 transition-transform"
              />
            </button>

            {/* Artist 2 - 오른쪽 아래 */}
            <button
              onClick={handleArtist2Click}
              className="absolute animate-expand-br"
              style={{
                bottom: '0',
                right: '0',
                animationDelay: '150ms',
              }}
            >
              <img
                src={tempArtist2ButtonImage}
                alt="Artist 2"
                className="h-24 hover:scale-110 transition-transform"
              />
            </button>

            {/* 닫기 버튼 (가운데) */}
            <button
              onClick={() => setIsExpanded(false)}
              className="absolute top-48/100 left-43/100 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-700 transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes expand-tl {
          from {
            transform: translate(48px, 48px) scale(0);
            opacity: 0;
          }
          to {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
        }

        @keyframes expand-bl {
          from {
            transform: translate(48px, -48px) scale(0);
            opacity: 0;
          }
          to {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
        }

        @keyframes expand-tr {
          from {
            transform: translate(-48px, 48px) scale(0);
            opacity: 0;
          }
          to {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
        }

        @keyframes expand-br {
          from {
            transform: translate(-48px, -48px) scale(0);
            opacity: 0;
          }
          to {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
        }

        .animate-expand-tl {
          animation: expand-tl 0.3s ease-out forwards;
        }

        .animate-expand-bl {
          animation: expand-bl 0.3s ease-out forwards;
        }

        .animate-expand-tr {
          animation: expand-tr 0.3s ease-out forwards;
        }

        .animate-expand-br {
          animation: expand-br 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
}

# Web3Auth React Quick Start 예제

이 폴더는 **Web3Auth 공식 예제 코드**를 참고용으로 저장한 것입니다.

⚠️ **주의**: 이 코드는 실제 프로젝트에서 직접 사용하는 코드가 아니라, Web3Auth 구현 방법을 **참고하기 위한 예제**입니다.

## 출처

- **원본 레포지토리**: [Web3Auth Examples](https://github.com/Web3Auth/web3auth-examples)
- **Quick Start 예제**: [React Quick Start](https://github.com/Web3Auth/web3auth-examples/tree/main/quick-starts/react-quick-start)
- **공식 문서**: [Web3Auth Embedded Wallets Documentation](https://docs.metamask.io/embedded-wallets/sdk/react)

## 주요 내용

이 예제는 다음과 같은 Web3Auth 기능들을 보여줍니다:

### 1. Web3Auth 설정 (`web3authContext.tsx`)
- Web3Auth Provider 설정
- Client ID 구성
- Network 설정 (Sapphire Devnet)

### 2. Provider 설정 (`main.tsx`)
- `Web3AuthProvider` 래핑
- `WagmiProvider` 설정
- `QueryClientProvider` 설정

### 3. 인증 기능 (`App.tsx`)
- 로그인 (`useWeb3AuthConnect`)
- 로그아웃 (`useWeb3AuthDisconnect`)
- 사용자 정보 조회 (`useWeb3AuthUser`)

### 4. 블록체인 기능 (`components/`)
- **Balance** (`getBalance.tsx`): 잔액 조회
- **SendTransaction** (`sendTransaction.tsx`): 트랜잭션 전송
- **SwitchChain** (`switchNetwork.tsx`): 체인 전환

## 실제 프로젝트에서 사용하는 방법

실제 moas 프로젝트에서는 다음과 같이 구성되어 있습니다:

- **설정**: `src/config/web3authContext.tsx`
- **훅**: `src/hooks/useWeb3Auth.ts`
- **스토어**: `src/store/authStore.ts`

## 실행 방법

이 예제는 **독립적으로 실행 가능**합니다:

```bash
cd examples/web3auth-quick-start
pnpm install
pnpm dev
```

브라우저에서 `http://localhost:5173` (또는 Vite가 지정한 포트)로 접속하여 예제를 확인할 수 있습니다.

> **참고**: 이 예제는 `pnpm`을 기준으로 작성되었습니다. `npm` 또는 `yarn`도 사용 가능하지만, 프로젝트와 일관성을 위해 `pnpm` 사용을 권장합니다.

## Client ID 및 id_token 관련 정보

### Client ID 설정

**현재 `src/web3authContext.tsx`에 포함된 `clientId`는 Web3Auth Dashboard에서 생성한 실제 Client ID입니다.**

이 예제는 실제로 동작하며, 로그인 후 id_token을 얻을 수 있습니다.

### id_token 사용 방법

1. **id_token 획득:**
   - Web3Auth 로그인 성공 후 `useWeb3AuthUser()` 훅의 `userInfo`에서 id_token을 얻을 수 있습니다.
   - 예제 코드에서 `App.tsx`의 `userInfo` 객체에 id_token이 포함되어 있습니다.

2. **백엔드 API 인증에 사용:**
   - 이 JWT id_token은 백엔드 API 인증에 사용할 수 있습니다.
   - 토큰을 Authorization 헤더에 포함하여 API 요청 시 사용합니다.

### 다른 Client ID 사용 시

다른 프로젝트에서 사용하거나 새로운 Client ID를 발급받은 경우:

1. [Web3Auth Dashboard](https://dashboard.web3auth.io)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. 프로젝트 설정에서 Client ID 확인 및 복사
4. `src/web3authContext.tsx` 파일의 `clientId` 값을 변경

### 실제 프로젝트에서 사용 시 권장사항

- ✅ 환경 변수(`.env`)를 사용하여 Client ID를 관리하세요.
- ❌ Client ID를 코드에 하드코딩하지 마세요.
- ✅ `.env` 파일을 `.gitignore`에 추가하세요.

예시:
```typescript
// .env 파일
VITE_WEB3AUTH_CLIENT_ID=your_client_id_here

// web3authContext.tsx
const clientId = import.meta.env.VITE_WEB3AUTH_CLIENT_ID;
```

## 참고사항

1. 이 예제는 최신 Web3Auth 패키지 구조를 반영하고 있습니다.
2. Web3Auth는 로그인 시 JWT id_token을 제공합니다. 이 토큰을 백엔드 API 인증에 사용할 수 있습니다.

## 더 알아보기

- [Web3Auth 공식 문서](https://web3auth.io/docs/)
- [Web3Auth Embedded Wallets Documentation](https://docs.metamask.io/embedded-wallets/sdk/react)


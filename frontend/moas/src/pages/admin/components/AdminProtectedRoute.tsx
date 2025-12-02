// src/components/admin/AdminProtectedRoute.tsx
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

// // JWT 디코딩 함수
// const decodeToken = (token: string) => {
//   try {
//     const base64Url = token.split('.')[1];
//     const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
//     const jsonPayload = decodeURIComponent(
//       atob(base64)
//         .split('')
//         .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
//         .join(''),
//     );
//     return JSON.parse(jsonPayload);
//   } catch (error) {
//     return null;
//   }
// };

const AdminProtectedRoute = ({ children }: AdminProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyToken = () => {
      const accessToken = localStorage.getItem('adminAccessToken');

      // 토큰이 없으면 로그인 페이지로
      if (!accessToken) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // 토큰이 있으면 바로 인증 성공 처리 (만료 체크 주석)
      setIsAuthenticated(true);
      setIsLoading(false);

      // // 토큰 만료 시간 확인
      // const decoded = decodeToken(accessToken);
      // if (!decoded || !decoded.exp) {
      //   // 토큰 디코딩 실패
      //   localStorage.removeItem('adminAccessToken');
      //   localStorage.removeItem('adminRefreshToken');
      //   localStorage.removeItem('adminName');
      //   localStorage.removeItem('adminId');
      //   setIsAuthenticated(false);
      //   setIsLoading(false);
      //   return;
      // }

      // // 만료 시간 체크
      // const currentTime = Date.now() / 1000;
      // if (decoded.exp < currentTime) {
      //   // 토큰 만료됨
      //   localStorage.removeItem('adminAccessToken');
      //   localStorage.removeItem('adminRefreshToken');
      //   localStorage.removeItem('adminName');
      //   localStorage.removeItem('adminId');
      //   setIsAuthenticated(false);
      // } else {
      //   // 토큰 유효
      //   setIsAuthenticated(true);
      // }

      // setIsLoading(false);
    };

    verifyToken();
  }, []);

  // 로딩 중
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">인증 확인 중...</p>
        </div>
      </div>
    );
  }

  // 인증 실패 시 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // 인증 성공 시 자식 컴포넌트 렌더링
  return <>{children}</>;
};

export default AdminProtectedRoute;

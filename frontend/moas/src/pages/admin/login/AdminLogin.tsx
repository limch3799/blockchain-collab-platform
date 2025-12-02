import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, User, AlertCircle } from 'lucide-react';
import { adminApi } from '@/api/admin/auth';
import favicon from '@/assets/favicon.png';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    loginId: '',
    password: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await adminApi.login(formData);

      // 토큰 저장
      localStorage.setItem('adminAccessToken', response.accessToken);
      localStorage.setItem('adminRefreshToken', response.refreshToken);
      localStorage.setItem('adminName', response.name);
      localStorage.setItem('adminId', response.adminId.toString());

      navigate('/admin/dashboard');
    } catch (err) {
      console.error(err);
      setError('로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // SuperDevelopLogin 버튼 클릭 시 자동 로그인
  const handleSuperLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await adminApi.login({
        loginId: 'admin1234',
        password: '12345678a!',
      });

      // 토큰 저장
      localStorage.setItem('adminAccessToken', response.accessToken);
      localStorage.setItem('adminRefreshToken', response.refreshToken);
      localStorage.setItem('adminName', response.name);
      localStorage.setItem('adminId', response.adminId.toString());

      navigate('/admin/dashboard');
    } catch (err) {
      console.error(err);
      setError('로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-moas-navy2 font-pretendard">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
        {/* 로고 및 제목 */}
        <div className="text-center mb-8">
          {/* favicon 이미지 추가 */}
          <div className="flex items-center justify-center gap-3 mb-2">
            <img src={favicon} alt="MOAS logo" className="w-8 h-8 object-contain" />
            <h1 className="text-3xl font-bold text-gray-800">MOAS Admin</h1>
          </div>
          <p className="text-gray-600">관리자 로그인</p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* 로그인 폼 */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* 아이디 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">아이디</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                name="loginId"
                value={formData.loginId}
                onChange={handleChange}
                placeholder="아이디를 입력하세요"
                // 포커스 스타일 변경 적용
                className="pl-10 focus:border-moas-navy2 focus:ring-2 focus:ring-moas-navy2 focus:ring-offset-2"
                required
              />
            </div>
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                // 포커스 스타일 변경 적용
                className="pl-10 focus:border-moas-navy2 focus:ring-2 focus:ring-moas-navy2 focus:ring-offset-2"
                required
              />
            </div>
          </div>

          {/* 로그인 버튼 */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '로그인 중' : '로그인'}
          </Button>

          {/* SuperDevelopLogin 버튼 */}
          <Button
            type="button"
            onClick={handleSuperLogin}
            className="w-full bg-black text-white hover:bg-gray-900"
          >
            SuperDevelopLogin
          </Button>

          {/* 회원가입 링크 */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              <Link to="/admin/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                관리자 등록
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;

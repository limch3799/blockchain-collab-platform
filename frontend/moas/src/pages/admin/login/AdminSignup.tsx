import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Mail, User, AlertCircle, CheckCircle } from 'lucide-react';
import { adminApi } from '@/api/admin/auth';
import favicon from '@/assets/favicon.png';

const AdminSignup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    loginId: '',
    password: '',
    confirmPassword: '',
    name: '',
  });

  const [validationErrors, setValidationErrors] = useState({
    loginId: '',
    password: '',
    confirmPassword: '',
    name: '',
  });

  const validateLoginId = (loginId: string) => {
    if (loginId.length < 4 || loginId.length > 20) {
      return '아이디는 4-20자로 입력해주세요.';
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(loginId)) {
      return '아이디는 영문, 숫자, _, - 만 사용 가능합니다.';
    }
    return '';
  };

  const validatePassword = (password: string) => {
    if (password.length < 8 || password.length > 20) {
      return '비밀번호는 8-20자로 입력해주세요.';
    }
    if (!/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]+$/.test(password)) {
      return '비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다.';
    }
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // 실시간 유효성 검사
    let error = '';
    if (name === 'loginId') {
      error = validateLoginId(value);
    } else if (name === 'password') {
      error = validatePassword(value);
    } else if (name === 'confirmPassword') {
      error = value !== formData.password ? '비밀번호가 일치하지 않습니다.' : '';
    } else if (name === 'name') {
      error = value.trim() === '' ? '이름을 입력해주세요.' : '';
    }

    setValidationErrors({
      ...validationErrors,
      [name]: error,
    });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 유효성 검사
    const loginIdError = validateLoginId(formData.loginId);
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError =
      formData.password !== formData.confirmPassword ? '비밀번호가 일치하지 않습니다.' : '';
    const nameError = formData.name.trim() === '' ? '이름을 입력해주세요.' : '';

    setValidationErrors({
      loginId: loginIdError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
      name: nameError,
    });

    if (loginIdError || passwordError || confirmPasswordError || nameError) {
      return;
    }

    setLoading(true);

    try {
      await adminApi.signup({
        loginId: formData.loginId,
        password: formData.password,
        name: formData.name,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/login');
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || '등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-moas-navy2 font-pretendard py-12">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
        {/* 로고 및 제목 */}
        <div className="text-center mb-8">
          {/* favicon 이미지 추가 */}
          <div className="flex items-center justify-center gap-3 mb-2">
            <img src={favicon} alt="MOAS logo" className="w-8 h-8 object-contain" />
            <h1 className="text-3xl font-bold text-gray-800">MOAS Admin</h1>
          </div>
          <p className="text-gray-600">관리자 등록</p>
        </div>

        {/* 성공 메시지 */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">등록이 완료되었습니다. 로그인 페이지로 이동합니다...</p>
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* 회원가입 폼 */}
        <form onSubmit={handleSignup} className="space-y-5">
          {/* 아이디 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">아이디</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                name="loginId"
                value={formData.loginId}
                onChange={handleChange}
                placeholder="4-20자, 영문/숫자/_/-"
                className={`pl-10 focus:border-moas-navy2 focus:ring-2 focus:ring-moas-navy2 focus:ring-offset-2 ${
                  validationErrors.loginId ? 'border-red-500' : ''
                }`}
                required
              />
            </div>
            {validationErrors.loginId && (
              <p className="mt-1 text-xs text-red-600">{validationErrors.loginId}</p>
            )}
          </div>

          {/* 이름 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="이름을 입력하세요"
                className={`pl-10 focus:border-moas-navy2 focus:ring-2 focus:ring-moas-navy2 focus:ring-offset-2 ${
                  validationErrors.name ? 'border-red-500' : ''
                }`}
                required
              />
            </div>
            {validationErrors.name && (
              <p className="mt-1 text-xs text-red-600">{validationErrors.name}</p>
            )}
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
                placeholder="8-20자, 영문/숫자/특수문자"
                className={`pl-10 focus:border-moas-navy2 focus:ring-2 focus:ring-moas-navy2 focus:ring-offset-2 ${
                  validationErrors.password ? 'border-red-500' : ''
                }`}
                required
              />
            </div>
            {validationErrors.password && (
              <p className="mt-1 text-xs text-red-600">{validationErrors.password}</p>
            )}
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호 확인</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="비밀번호를 다시 입력하세요"
                className={`pl-10 focus:border-moas-navy2 focus:ring-2 focus:ring-moas-navy2 focus:ring-offset-2 ${
                  validationErrors.confirmPassword ? 'border-red-500' : ''
                }`}
                required
              />
            </div>
            {validationErrors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">{validationErrors.confirmPassword}</p>
            )}
          </div>

          {/* 회원가입 버튼 */}
          <Button type="submit" className="w-full" disabled={loading || success}>
            {loading ? '가입 중...' : '관리자 등록'}
          </Button>

          {/* 로그인 링크 */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              이미 계정이 있으신가요?{' '}
              <Link to="/admin/login" className="text-blue-600 hover:text-blue-700 font-medium">
                로그인
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSignup;

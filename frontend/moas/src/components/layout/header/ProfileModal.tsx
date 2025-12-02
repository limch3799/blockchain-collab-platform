import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export function ProfileModal({ isOpen, onClose, onLogout }: ProfileModalProps) {
  const { getUserInfoFromStorage } = useAuth();
  const userInfo = getUserInfoFromStorage();
  const role = userInfo?.role;

  if (!isOpen) return null;

  return (
    <>
      {/* 배경 오버레이 */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* 모달 */}
      <div className="absolute right-0 top-full mt-2 w-40 z-50">
        <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
          {/* 메뉴 아이템들 */}
          <div className="py-1">
            <Link
              to="/my-account"
              onClick={onClose}
              className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              마이페이지
            </Link>

            {/* 리더가 아닐 때만 내 포트폴리오 표시 */}
            {role !== 'LEADER' && (
              <Link
                to="/my-portfolio"
                onClick={onClose}
                className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                내 포트폴리오
              </Link>
            )}

            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

import { Link } from 'react-router-dom';
import { Frown } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center text-center px-4">
      <Frown className="h-16 w-16 text-moas-main mb-4" />
      <h1 className="text-4xl font-bold text-gray-800 mb-2">...</h1>
      <p className="text-gray-500 mb-6">현재 개발 중입니다. 조금만 기다려주세요!</p>
      <Link
        to="/"
        className="rounded-lg bg-moas-main px-4 py-2 text-white font-medium hover:opacity-80 transition-opacity"
      >
        뒤로가기
      </Link>
    </div>
  );
}

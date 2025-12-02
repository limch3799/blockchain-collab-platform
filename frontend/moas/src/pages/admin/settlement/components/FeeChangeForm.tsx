// src/pages/admin/settlement/components/FeeChangeForm.tsx
import { useState } from 'react';

interface FeeChangeFormProps {
  onSubmit: (feeRate: number, startAt: string) => void;
}

export const FeeChangeForm = ({ onSubmit }: FeeChangeFormProps) => {
  const [feeRate, setFeeRate] = useState('');
  const [startAt, setStartAt] = useState('');

  const handleFeeRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // 빈 값 허용
    if (value === '') {
      setFeeRate('');
      return;
    }

    // 숫자만 허용
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return;
    }

    // 0~100 범위 체크
    if (numValue < 0 || numValue > 100) {
      return;
    }

    setFeeRate(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!feeRate || !startAt) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    const rate = parseFloat(feeRate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      alert('수수료율은 0~100 사이의 숫자여야 합니다.');
      return;
    }

    onSubmit(rate, startAt);
    setFeeRate('');
    setStartAt('');
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">수수료 변경</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4">
          {/* 새 수수료율 필드 */}
          <div className="flex-1">
            {' '}
            {/* flex-1로 공간을 균등하게 배분 */}
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              변경 수수료율 (%)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={feeRate}
              onChange={handleFeeRateChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="예: 5.5 "
            />
          </div>

          {/* 적용 시작일 필드 */}
          <div className="flex-1">
            {' '}
            {/* flex-1로 공간을 균등하게 배분 */}
            <label className="block text-sm font-semibold text-gray-700 mb-2">적용 시작일</label>
            <input
              type="date"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex justify-end">
          <button
            type="submit"
            // w-auto는 필요하다면 유지하거나, 삭제해도 내용물 크기에 맞춰집니다.
            className="w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            수수료 변경
          </button>
        </div>
      </form>
    </div>
  );
};

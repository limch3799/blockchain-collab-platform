// src/components/common/FilterModal.tsx
import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface FilterModalProps {
  title: string;
  options: readonly string[];
  selectedOptions: string[];
  onToggle: (value: string) => void;
  onClose: () => void;
  onApply: () => void;
}

export function FilterModal({
  title,
  options,
  selectedOptions,
  onToggle,
  onClose,
  onApply,
}: FilterModalProps) {
  const [initialSelections, setInitialSelections] = useState<string[]>([]);
  const [tempSelections, setTempSelections] = useState<string[]>([]);
  const [shouldShake, setShouldShake] = useState(false);

  useEffect(() => {
    setInitialSelections([...selectedOptions]);
    setTempSelections([...selectedOptions]);
  }, []);

  const hasChanges =
    tempSelections.length !== initialSelections.length ||
    tempSelections.some((option) => !initialSelections.includes(option));

  const handleToggle = (value: string) => {
    setTempSelections((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value],
    );
    setShouldShake(false);
  };

  const handleBackgroundClick = () => {
    if (hasChanges) {
      setShouldShake(true);
      setTimeout(() => setShouldShake(false), 500);
    } else {
      onClose();
    }
  };

  const handleCancel = () => {
    // 초기 선택 값으로 되돌리기
    const toAdd = initialSelections.filter((item) => !selectedOptions.includes(item));
    const toRemove = selectedOptions.filter((item) => !initialSelections.includes(item));

    toRemove.forEach((item) => onToggle(item));
    toAdd.forEach((item) => onToggle(item));

    onClose();
  };

  const handleApply = () => {
    // 초기 선택과 임시 선택의 차이를 계산하여 onToggle 호출
    const toAdd = tempSelections.filter((item) => !selectedOptions.includes(item));
    const toRemove = selectedOptions.filter((item) => !tempSelections.includes(item));

    toRemove.forEach((item) => onToggle(item));
    toAdd.forEach((item) => onToggle(item));

    onApply();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 font-pretendard"
      onClick={handleBackgroundClick}
    >
      <div
        className="bg-white rounded-2xl w-[500px] max-h-[600px] flex flex-col shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-moas-gray-3">
          <h2 className="text-xl font-semibold text-moas-text">{title}</h2>
          <button
            onClick={handleBackgroundClick}
            className="text-moas-gray-6 hover:text-moas-text transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 옵션 리스트 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-3">
            {options.map((option) => (
              <button
                key={option}
                onClick={() => handleToggle(option)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  tempSelections.includes(option)
                    ? 'bg-moas-main text-moas-text border-2 border-moas-main'
                    : 'bg-moas-gray-1 text-moas-gray-7 border-2 border-transparent hover:border-moas-gray-3'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="p-6 border-t border-moas-gray-3 flex gap-3">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-3 rounded-lg border border-moas-gray-3 text-moas-gray-7 font-medium hover:bg-moas-gray-1 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleApply}
            className={`flex-1 px-4 py-3 rounded-lg bg-moas-main text-moas-text font-medium hover:opacity-90 transition-opacity ${
              shouldShake ? 'animate-shake' : ''
            }`}
          >
            적용하기
          </button>
        </div>
      </div>
    </div>
  );
}

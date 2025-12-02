/**
 * SelectModal Component
 *
 * Props:
 * - title (string): 모달 제목
 * - options (string[]): 선택 가능한 옵션 목록
 * - selectedValue (string): 현재 선택된 값
 * - onSelect (function): 선택 시 호출되는 콜백
 * - onClose (function): 모달 닫기 콜백
 *
 * Description:
 * 단일 선택 모달 컴포넌트
 */

import { X } from 'lucide-react';

interface SelectModalProps {
  title: string;
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  autoClose?: boolean; // 선택 시 자동으로 모달을 닫을지 여부 (기본값: true)
}

export function SelectModal({ title, options, selectedValue, onSelect, onClose, autoClose = true }: SelectModalProps) {
  const handleSelect = (value: string) => {
    onSelect(value);
    // autoClose가 false인 경우에만 모달을 닫지 않음
    if (autoClose !== false) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 font-pretendard">
      <div className="flex w-[500px] max-h-[600px] flex-col rounded-2xl bg-white shadow-xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-moas-gray-3 p-6">
          <h2 className="text-xl font-semibold text-moas-text">{title}</h2>
          <button
            onClick={onClose}
            className="text-moas-gray-6 transition-colors hover:text-moas-text"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* 옵션 리스트 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-3">
            {options.map((option) => (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                className={`rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all ${
                  selectedValue === option
                    ? 'border-moas-main bg-moas-main text-moas-text'
                    : 'border-transparent bg-moas-gray-1 text-moas-gray-7 hover:border-moas-gray-3'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

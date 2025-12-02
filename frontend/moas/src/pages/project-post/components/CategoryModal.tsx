// src/components/common/CategoryModal.tsx
import { X } from 'lucide-react';

interface CategoryModalProps {
  title: string;
  options: Array<{ id: number; name: string }>;
  selectedOptions: number[];
  onSelect: (id: number) => void;
  onClose: () => void;
  onApply: () => void;
}

const groupPositionsByCategory = (options: Array<{ id: number; name: string }>) => {
  const groups: Record<string, Array<{ id: number; name: string }>> = {
    '음악/공연': [],
    '사진/영상/미디어': [],
    디자인: [],
    기타: [],
  };

  options.forEach((option) => {
    const id = option.id;
    if (id >= 1 && id <= 4) groups['음악/공연'].push(option);
    else if (id >= 5 && id <= 9) groups['사진/영상/미디어'].push(option);
    else if (id >= 10 && id <= 14) groups['디자인'].push(option);
    else groups['기타'].push(option);
  });

  return Object.entries(groups)
    .filter(([_, positions]) => positions.length > 0)
    .map(([categoryName, positions]) => ({ categoryName, positions }));
};

export function CategoryModal({
  title,
  options,
  selectedOptions,
  onSelect,
  onClose,
  onApply,
}: CategoryModalProps) {
  const groupedPositions = groupPositionsByCategory(options);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 font-pretendard">
      <div className="bg-white rounded-2xl w-[800px] max-h-[80vh] flex flex-col shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-moas-gray-3">
          <h2 className="text-xl font-semibold text-moas-text">{title}</h2>
          <button
            onClick={onClose}
            className="text-moas-gray-6 hover:text-moas-text transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {groupedPositions.map((group) => (
              <div key={group.categoryName}>
                <h3 className="text-base font-semibold text-moas-text mb-3 pb-2 border-b border-moas-gray-3">
                  {group.categoryName}
                </h3>

                <div className="grid grid-cols-3 gap-3">
                  {group.positions.map(({ id, name }) => (
                    <button
                      key={id}
                      onClick={() => onSelect(id)}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        selectedOptions.includes(id)
                          ? 'bg-moas-main text-moas-text border-2 border-moas-main'
                          : 'bg-moas-gray-1 text-moas-gray-7 border-2 border-transparent hover:border-moas-gray-3'
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-moas-gray-3 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-lg border border-moas-gray-3 text-moas-gray-7 font-medium hover:bg-moas-gray-1 transition-colors"
          >
            취소
          </button>
          <button
            onClick={onApply}
            className="flex-1 px-4 py-3 rounded-lg bg-moas-main text-moas-text font-medium hover:opacity-90 transition-opacity"
          >
            적용하기
          </button>
        </div>
      </div>
    </div>
  );
}

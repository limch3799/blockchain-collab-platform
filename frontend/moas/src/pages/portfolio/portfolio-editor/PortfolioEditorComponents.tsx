// src/pages/portfolio/portfolio-editor/PortfolioEditorComponents.tsx
import { X, Upload, GripVertical, Image as ImageIcon, FileText } from 'lucide-react';
import faviconImage from '@/assets/favicon.png';
import type { ImageItem, FileItem, ThumbnailItem } from '@/hooks/usePortfolioEditor';

interface PageHeaderProps {
  title: string;
  description: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="w-full flex justify-between items-start font-pretendard">
      <div className="flex-1">
        <h1 className="text-3xl font-semibold text-moas-text leading-tight">{title}</h1>
        <p className="text-lg text-moas-gray-7 leading-snug mt-1">{description}</p>
      </div>
      <div className="flex-shrink-0 self-end mb-2">
        <img src={faviconImage} alt="Favicon" className="h-18 w-18 object-contain" />
      </div>
    </div>
  );
}

interface CategoryModalProps {
  title: string;
  options: Record<number, string>;
  selectedOption: number | null;
  onSelect: (key: number) => void;
  onClose: () => void;
  onApply: () => void;
}

function groupPositionsByCategory(positions: Record<number, string>) {
  const categoryGroups = {
    1: { name: '음악/공연', positionIds: [1, 2, 3, 4] },
    2: { name: '사진/영상/미디어', positionIds: [5, 6, 7, 8, 9] },
    3: { name: '디자인', positionIds: [10, 11, 12, 13, 14] },
    4: { name: '기타', positionIds: [15] },
  };

  return Object.entries(categoryGroups)
    .map(([categoryId, { name, positionIds }]) => ({
      categoryId: Number(categoryId),
      categoryName: name,
      positions: positionIds
        .filter((id) => positions[id])
        .map((id) => ({ id, name: positions[id] })),
    }))
    .filter((group) => group.positions.length > 0);
}

export function CategoryModal({
  title,
  options,
  selectedOption,
  onSelect,
  onClose,
  onApply,
}: CategoryModalProps) {
  const groupedPositions = groupPositionsByCategory(options);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 font-pretendard">
      <div className="bg-white rounded-2xl w-[600px] max-h-[700px] flex flex-col shadow-xl">
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
              <div key={group.categoryId}>
                <h3 className="text-base font-semibold text-moas-text mb-3 pb-2 border-b border-moas-gray-3">
                  {group.categoryName}
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  {group.positions.map(({ id, name }) => (
                    <button
                      key={id}
                      onClick={() => onSelect(id)}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        selectedOption === id
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

interface ThumbnailUploadSectionProps {
  thumbnail: ThumbnailItem | null;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}

export function ThumbnailUploadSection({
  thumbnail,
  onUpload,
  onRemove,
}: ThumbnailUploadSectionProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-moas-text mb-2">
        썸네일 이미지 (JPG, PNG) <span className="text-red-500">*</span>
      </label>
      <p className="text-xs text-moas-gray-6 mb-3">포트폴리오 목록에서 표시될 대표 이미지입니다.</p>

      {!thumbnail ? (
        <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-moas-gray-4 rounded-lg cursor-pointer hover:border-moas-main transition-colors bg-moas-gray-1">
          <div className="flex flex-col items-center">
            <ImageIcon className="w-10 h-10 text-moas-gray-6 mb-3" />
            <p className="text-sm text-moas-gray-7 font-medium">썸네일 이미지를 선택하세요</p>
            <p className="text-xs text-moas-gray-6 mt-1">JPG, PNG 파일만 가능</p>
          </div>
          <input type="file" accept="image/jpeg,image/png" onChange={onUpload} className="hidden" />
        </label>
      ) : (
        <div className="relative group w-full h-48 rounded-lg border-2 border-moas-main overflow-hidden">
          <img
            src={thumbnail.preview}
            alt="thumbnail-preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={onRemove}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              삭제
            </button>
          </div>
          <div className="absolute top-2 left-2 bg-moas-main text-moas-text text-xs px-3 py-1 rounded-full font-semibold">
            썸네일
          </div>
        </div>
      )}
    </div>
  );
}

interface ImageUploadSectionProps {
  images: ImageItem[];
  maxCount: number;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (id: string | number) => void;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
}

export function ImageUploadSection({
  images,
  maxCount,
  onUpload,
  onRemove,
  onDragStart,
  onDragOver,
  onDragEnd,
}: ImageUploadSectionProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-moas-text mb-2">
        추가 이미지 (JPG, PNG)
      </label>
      <p className="text-xs text-moas-gray-6 mb-3">
        포트폴리오 상세 페이지에 표시될 이미지들입니다. (선택사항)
      </p>
      <div className="space-y-4">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-moas-gray-4 rounded-lg cursor-pointer hover:border-moas-main transition-colors bg-moas-gray-1">
          <div className="flex flex-col items-center">
            <ImageIcon className="w-8 h-8 text-moas-gray-6 mb-2" />
            <p className="text-sm text-moas-gray-7">이미지를 선택하거나 드래그하세요</p>
            <p className="text-xs text-moas-gray-6 mt-1">
              JPG, PNG 파일만 가능 (최대 {maxCount}개)
            </p>
          </div>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png"
            onChange={onUpload}
            className="hidden"
          />
        </label>

        {images.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-moas-gray-7">
                {images.length} / {maxCount}개
              </span>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {images.map((image, index) => {
                const imageId = image.isExisting ? image.imageId : image.id;
                const imagePreview = image.isExisting ? image.imageUrl : image.preview;

                return (
                  <div
                    key={imageId}
                    draggable
                    onDragStart={() => onDragStart(index)}
                    onDragOver={(e) => onDragOver(e, index)}
                    onDragEnd={onDragEnd}
                    className="relative group cursor-move bg-white rounded-lg border-2 border-moas-gray-3 overflow-hidden"
                  >
                    <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                      {index + 1}
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripVertical className="w-5 h-5 text-white drop-shadow-lg" />
                    </div>
                    <img
                      src={imagePreview}
                      alt={`preview-${index}`}
                      className="w-full h-32 object-cover"
                    />
                    <button
                      onClick={() => onRemove(imageId)}
                      className="absolute bottom-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface FileUploadSectionProps {
  files: FileItem[];
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (id: string | number) => void;
}

export function FileUploadSection({ files, onUpload, onRemove }: FileUploadSectionProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-moas-text mb-2">기타 파일 첨부</label>
      <div className="space-y-4">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-moas-gray-4 rounded-lg cursor-pointer hover:border-moas-main transition-colors bg-moas-gray-1">
          <div className="flex flex-col items-center">
            <Upload className="w-8 h-8 text-moas-gray-6 mb-2" />
            <p className="text-sm text-moas-gray-7">파일을 선택하거나 드래그하세요</p>
            <p className="text-xs text-moas-gray-6 mt-1">모든 파일 형식 가능합니다</p>
          </div>
          <input type="file" multiple onChange={onUpload} className="hidden" />
        </label>

        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((file) => {
              const fileId = file.isExisting ? file.fileId : file.id;
              const fileName = file.isExisting ? file.originalFileName : file.name;

              return (
                <div
                  key={fileId}
                  className="flex items-center justify-between p-3 bg-moas-gray-1 rounded-lg border border-moas-gray-3"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-moas-gray-6" />
                    <span className="text-sm text-moas-text">{fileName}</span>
                  </div>
                  <button
                    onClick={() => onRemove(fileId)}
                    className="text-moas-gray-6 hover:text-red-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

interface FileSizeIndicatorProps {
  currentSize: number;
  maxSize: number;
  formatSize: (bytes: number) => string;
}

export function FileSizeIndicator({ currentSize, maxSize, formatSize }: FileSizeIndicatorProps) {
  const percentage = Math.min((currentSize / maxSize) * 100, 100);

  return (
    <div className="flex items-center justify-between p-4 bg-moas-gray-1 rounded-lg border border-moas-gray-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-moas-text">전체 파일 용량</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-moas-text">
          {formatSize(currentSize)} / {formatSize(maxSize)}
        </span>
        <div className="w-32 h-2 bg-moas-gray-3 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              currentSize > maxSize * 0.9
                ? 'bg-red-500'
                : currentSize > maxSize * 0.7
                  ? 'bg-yellow-500'
                  : 'bg-moas-main'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-xs text-moas-gray-6">{Math.round(percentage)}%</span>
      </div>
    </div>
  );
}

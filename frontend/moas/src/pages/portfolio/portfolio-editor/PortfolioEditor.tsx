// src/pages/portfolio/portfolio-editor/PortfolioEditor.tsx
import { Loader2 } from 'lucide-react';
import { POSITION_CATEGORIES } from '@/constants/categories';
import { usePortfolioEditor } from '../../../hooks/usePortfolioEditor';
import {
  PageHeader,
  CategoryModal,
  ThumbnailUploadSection,
  ImageUploadSection,
  FileUploadSection,
  FileSizeIndicator,
} from './PortfolioEditorComponents';

export default function PortfolioEditor() {
  const {
    showCategoryModal,
    selectedCategory,
    tempCategory,
    title,
    content,
    thumbnail,
    images,
    otherFiles,
    isSubmitting,
    submitError,
    isFormValid,
    isEditMode,
    isLoading,
    setShowCategoryModal,
    setTempCategory,
    setTitle,
    setContent,
    handleCategoryApply,
    openCategoryModal,
    handleThumbnailUpload,
    removeThumbnail,
    handleImageUpload,
    handleOtherFileUpload,
    removeImage,
    removeOtherFile,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleSubmit,
    getTotalFileSize,
    formatFileSize,
    MAX_FILE_SIZE,
    MAX_IMAGE_COUNT,
  } = usePortfolioEditor();

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-8 font-pretendard flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-moas-main" />
          <p className="text-moas-gray-6">포트폴리오를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8 font-pretendard">
      <PageHeader
        title={isEditMode ? '포트폴리오 수정' : '포트폴리오 작성'}
        description={
          isEditMode ? '포트폴리오를 수정해보세요' : '당신의 작품을 소개하고 공유해보세요'
        }
      />

      <div className="mt-8 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-moas-text mb-2">
            카테고리 <span className="text-red-500">*</span>
          </label>
          <button
            onClick={openCategoryModal}
            className="w-full px-4 py-3 rounded-lg border-2 border-moas-gray-3 text-left hover:border-moas-main transition-colors"
          >
            {selectedCategory ? (
              <span className="text-moas-text">{POSITION_CATEGORIES[selectedCategory]}</span>
            ) : (
              <span className="text-moas-gray-6">카테고리를 선택해주세요</span>
            )}
          </button>
        </div>

        <div>
          <label className="block text-sm font-semibold text-moas-text mb-2">
            제목 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="포트폴리오 제목을 입력해주세요"
            className="w-full px-4 py-3 rounded-lg border-2 border-moas-gray-3 focus:border-moas-main focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-moas-text mb-2">
            내용 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="포트폴리오에 대한 설명을 작성해주세요"
            rows={8}
            className="w-full px-4 py-3 rounded-lg border-2 border-moas-gray-3 focus:border-moas-main focus:outline-none transition-colors resize-none"
          />
        </div>

        <ThumbnailUploadSection
          thumbnail={thumbnail}
          onUpload={handleThumbnailUpload}
          onRemove={removeThumbnail}
        />

        <ImageUploadSection
          images={images}
          maxCount={MAX_IMAGE_COUNT}
          onUpload={handleImageUpload}
          onRemove={removeImage}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        />

        <FileUploadSection
          files={otherFiles}
          onUpload={handleOtherFileUpload}
          onRemove={removeOtherFile}
        />

        <FileSizeIndicator
          currentSize={getTotalFileSize()}
          maxSize={MAX_FILE_SIZE}
          formatSize={formatFileSize}
        />

        {submitError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{submitError}</p>
          </div>
        )}

        <div className="flex justify-center pt-8">
          <button
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className="px-12 py-4 bg-moas-main text-moas-text font-semibold text-lg rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {isEditMode ? '수정 중...' : '등록 중...'}
              </>
            ) : isEditMode ? (
              '수정 완료'
            ) : (
              '작성 완료'
            )}
          </button>
        </div>
      </div>

      {showCategoryModal && (
        <CategoryModal
          title="카테고리 선택"
          options={POSITION_CATEGORIES}
          selectedOption={tempCategory}
          onSelect={setTempCategory}
          onClose={() => setShowCategoryModal(false)}
          onApply={handleCategoryApply}
        />
      )}
    </div>
  );
}

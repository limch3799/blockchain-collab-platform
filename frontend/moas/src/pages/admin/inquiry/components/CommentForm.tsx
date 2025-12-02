// src/pages/admin/inquiry/components/CommentForm.tsx
import { useState } from 'react';
import { Loader2, Upload, X, FileText } from 'lucide-react';
import { createAdminComment } from '@/api/admin/inquiry';

interface FileItem {
  id: string;
  file: File;
  name: string;
}

interface CommentFormProps {
  inquiryId: number;
  onSuccess: () => void;
}

export const CommentForm = ({ inquiryId, onSuccess }: CommentFormProps) => {
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const newFiles: FileItem[] = Array.from(selectedFiles).map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      name: file.name,
    }));

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError('답변 내용을 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const formData = new FormData();
      formData.append('content', content.trim());

      if (files.length > 0) {
        files.forEach((fileItem) => {
          formData.append('files', fileItem.file);
        });
      }

      await createAdminComment(inquiryId, formData);

      setContent('');
      setFiles([]);
      onSuccess();
    } catch (err) {
      console.error('답변 작성 실패:', err);
      setError('답변 작성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">답변 작성</h3>

      <div className="space-y-6">
        {/* 내용 */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            답변 내용 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="답변 내용을 입력해주세요"
            rows={8}
            className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-600 focus:outline-none transition-colors resize-none"
          />
        </div>

        {/* 파일 첨부 */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">파일 첨부</label>
          <p className="text-xs text-gray-600 mb-3">
            최대 10개의 파일을 첨부할 수 있습니다. (각 파일 최대 10MB, 총 100MB)
          </p>
          <div className="space-y-4">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-400 rounded-lg cursor-pointer hover:border-blue-600 transition-colors bg-gray-50">
              <div className="flex flex-col items-center">
                <Upload className="w-8 h-8 text-gray-600 mb-2" />
                <p className="text-sm text-gray-700">파일을 선택하거나 드래그하세요</p>
                <p className="text-xs text-gray-600 mt-1">모든 파일 형식 가능</p>
              </div>
              <input type="file" multiple onChange={handleFileUpload} className="hidden" />
            </label>

            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-600" />
                      <span className="text-sm text-gray-800">{file.name}</span>
                    </div>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="text-gray-600 hover:text-red-500 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* 버튼 */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                등록 중...
              </>
            ) : (
              '답변 등록'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

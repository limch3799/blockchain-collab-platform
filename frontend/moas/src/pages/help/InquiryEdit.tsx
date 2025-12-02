// src/pages/help/InquiryEdit.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Upload, X, FileText } from 'lucide-react';
import faviconImage from '@/assets/favicon.png';
import { createInquiry, getInquiryList } from '@/api/inquiry';

interface FileItem {
  id: string;
  file: File;
  name: string;
}

type CategoryType = 'MEMBER' | 'CONTRACT' | 'PAYMENT' | 'OTHERS';

const InquiryEdit = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState<CategoryType>('MEMBER');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { value: 'MEMBER' as CategoryType, label: '사용자관리' },
    { value: 'CONTRACT' as CategoryType, label: '계약관리' },
    { value: 'PAYMENT' as CategoryType, label: '정산관리' },
    { value: 'OTHERS' as CategoryType, label: '기타' },
  ];

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
    if (!title.trim() || !content.trim()) {
      setError('제목과 내용을 모두 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const inquiryList = await getInquiryList(0, 3);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayInquiries = inquiryList.content.filter((inquiry) => {
        const inquiryDate = new Date(inquiry.createdAt);
        inquiryDate.setHours(0, 0, 0, 0);
        return inquiryDate.getTime() === today.getTime();
      });

      if (todayInquiries.length >= 3) {
        alert('하루 최대 3개의 문의만 등록 가능합니다.');
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append('category', category);
      formData.append('title', title.trim());
      formData.append('content', content.trim());

      if (files.length > 0) {
        files.forEach((fileItem) => {
          formData.append('files', fileItem.file);
        });
      }

      await createInquiry(formData);
      navigate(`/help`);
    } catch (err) {
      console.error('문의 작성 실패:', err);
      setError('문의 작성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = title.trim() !== '' && content.trim() !== '';

  return (
    <div className="max-w-5xl mx-auto p-8 font-pretendard">
      <div className="w-full flex justify-between items-start mb-8">
        <div className="flex-1">
          <h1 className="text-3xl font-semibold text-moas-text leading-tight">문의 작성</h1>
          <p className="text-lg text-moas-gray-7 leading-snug mt-1">궁금한 사항을 문의해주세요</p>
        </div>
        <div className="flex-shrink-0 self-end mb-2">
          <img src={faviconImage} alt="Favicon" className="h-18 w-18 object-contain" />
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {/* 문의 유형 */}
        <div>
          <label className="block text-sm font-semibold text-moas-text mb-2">
            문의 유형 <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-4 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  category === cat.value
                    ? 'bg-moas-main text-moas-text border-2 border-moas-main'
                    : 'bg-white text-moas-gray-7 border-2 border-moas-gray-3 hover:border-moas-main'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 제목 */}
        <div>
          <label className="block text-sm font-semibold text-moas-text mb-2">
            제목 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="문의 제목을 입력해주세요"
            className="w-full px-4 py-3 rounded-lg border-2 border-moas-gray-3 focus:border-moas-main focus:outline-none transition-colors"
          />
        </div>

        {/* 내용 */}
        <div>
          <label className="block text-sm font-semibold text-moas-text mb-2">
            내용 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="문의 내용을 상세히 작성해주세요"
            rows={12}
            className="w-full px-4 py-3 rounded-lg border-2 border-moas-gray-3 focus:border-moas-main focus:outline-none transition-colors resize-none"
          />
        </div>

        {/* 파일 첨부 */}
        <div>
          <label className="block text-sm font-semibold text-moas-text mb-2">파일 첨부</label>
          <p className="text-xs text-moas-gray-6 mb-3">
            최대 10개의 파일을 첨부할 수 있습니다. (각 파일 최대 10MB, 총 100MB)
          </p>
          <div className="space-y-4">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-moas-gray-4 rounded-lg cursor-pointer hover:border-moas-main transition-colors bg-moas-gray-1">
              <div className="flex flex-col items-center">
                <Upload className="w-8 h-8 text-moas-gray-6 mb-2" />
                <p className="text-sm text-moas-gray-7">파일을 선택하거나 드래그하세요</p>
                <p className="text-xs text-moas-gray-6 mt-1">모든 파일 형식 가능</p>
              </div>
              <input type="file" multiple onChange={handleFileUpload} className="hidden" />
            </label>

            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-moas-gray-1 rounded-lg border border-moas-gray-3"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-moas-gray-6" />
                      <span className="text-sm text-moas-text">{file.name}</span>
                    </div>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="text-moas-gray-6 hover:text-red-500 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="flex justify-center gap-4 pt-8">
          <button
            onClick={() => navigate('/help')}
            className="px-8 py-4 border-2 border-moas-gray-3 text-moas-gray-7 font-semibold text-lg rounded-lg hover:bg-moas-gray-1 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className="px-12 py-4 bg-moas-main text-moas-text font-semibold text-lg rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                등록 중...
              </>
            ) : (
              '문의 등록'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InquiryEdit;

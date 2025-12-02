// src/pages/portfolio/portfolio-detail/components/PortfolioDetailFiles.tsx
import { Download, FileText } from 'lucide-react';
import type { PortfolioFile } from '@/types/portfolio';

interface PortfolioDetailFilesProps {
  files: PortfolioFile[];
}

export function PortfolioDetailFiles({ files }: PortfolioDetailFilesProps) {
  const handleDownload = async (file: PortfolioFile) => {
    try {
      const response = await fetch(file.storedFileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.originalFileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('다운로드 실패:', error);
      alert('파일 다운로드에 실패했습니다.');
    }
  };

  return (
    <div>
      <h4 className="text-sm font-semibold text-moas-gray-6 mb-2">첨부파일</h4>
      <div className="space-y-2">
        {files.map((file) => (
          <button
            key={file.fileId}
            onClick={() => handleDownload(file)}
            className="w-full flex items-center justify-between p-3 bg-moas-gray-1 rounded-lg border border-moas-gray-3 hover:bg-moas-gray-2 transition-colors group"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <FileText className="w-5 h-5 text-moas-gray-6 flex-shrink-0" />
              <span className="text-sm text-moas-text truncate">{file.originalFileName}</span>
            </div>
            <Download className="w-5 h-5 text-moas-gray-6 group-hover:text-moas-main transition-colors flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}

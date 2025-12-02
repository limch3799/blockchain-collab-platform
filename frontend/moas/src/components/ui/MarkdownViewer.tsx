/**
 * MarkdownViewer Component
 *
 * Description:
 * Toast UI Viewer를 사용한 읽기 전용 마크다운 뷰어 컴포넌트
 */

import { Viewer } from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor-viewer.css';
import { useEffect, useRef } from 'react';

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

export function MarkdownViewer({ content, className = '' }: MarkdownViewerProps) {
  const viewerRef = useRef<Viewer>(null);

  // content 변경 시 뷰어 업데이트
  useEffect(() => {
    const viewerInstance = viewerRef.current?.getInstance();
    if (viewerInstance) {
      viewerInstance.setMarkdown(content);
    }
  }, [content]);

  return (
    <div className={`markdown-viewer-wrapper ${className}`}>
      <Viewer ref={viewerRef} initialValue={content} extendedAutolinks={true} />

      <style>{`
        .markdown-viewer-wrapper .toastui-editor-contents {
          font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 14px;
          line-height: 1.6;
          color: #1f2937;
        }

        .markdown-viewer-wrapper .toastui-editor-contents h1 {
          font-size: 1.5em;
          font-weight: bold;
          margin-top: 1em;
          margin-bottom: 0.5em;
        }

        .markdown-viewer-wrapper .toastui-editor-contents h2 {
          font-size: 1.3em;
          font-weight: bold;
          margin-top: 1.2em;
          margin-bottom: 0.6em;
          color: #111827;
        }

        .markdown-viewer-wrapper .toastui-editor-contents h3 {
          font-size: 1.1em;
          font-weight: bold;
          margin-top: 0.8em;
          margin-bottom: 0.4em;
        }

        .markdown-viewer-wrapper .toastui-editor-contents p {
          margin-bottom: 0.5em;
        }

        .markdown-viewer-wrapper .toastui-editor-contents strong {
          font-weight: bold;
        }

        .markdown-viewer-wrapper .toastui-editor-contents em {
          font-style: italic;
        }

        .markdown-viewer-wrapper .toastui-editor-contents ul,
        .markdown-viewer-wrapper .toastui-editor-contents ol {
          margin-left: 1.5em;
          margin-bottom: 0.5em;
        }

        .markdown-viewer-wrapper .toastui-editor-contents ol {
          list-style: none;
          padding-left: 0;
        }

        .markdown-viewer-wrapper .toastui-editor-contents ol > li {
          margin-bottom: 1em;
          padding-left: 0.5em;
        }

        .markdown-viewer-wrapper .toastui-editor-contents ol > li > p:first-child {
          display: inline;
        }

        .markdown-viewer-wrapper .toastui-editor-contents ul > li {
          margin-bottom: 0.25em;
        }

        .markdown-viewer-wrapper .toastui-editor-contents code {
          background-color: #f3f4f6;
          padding: 0.2em 0.4em;
          border-radius: 0.25rem;
          font-size: 0.9em;
        }

        .markdown-viewer-wrapper .toastui-editor-contents pre {
          background-color: #f3f4f6;
          padding: 1em;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin-bottom: 0.5em;
        }

        .markdown-viewer-wrapper .toastui-editor-contents blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1em;
          margin-left: 0;
          color: #6b7280;
        }

        .markdown-viewer-wrapper .toastui-editor-contents table {
          border-collapse: collapse;
          width: 100%;
          margin-bottom: 0.5em;
        }

        .markdown-viewer-wrapper .toastui-editor-contents th,
        .markdown-viewer-wrapper .toastui-editor-contents td {
          border: 1px solid #e5e7eb;
          padding: 0.5em;
        }

        .markdown-viewer-wrapper .toastui-editor-contents th {
          background-color: #f9fafb;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}

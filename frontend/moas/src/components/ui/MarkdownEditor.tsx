/**
 * MarkdownEditor Component
 *
 * Description:
 * Toast UI Editor를 래핑한 마크다운 에디터 컴포넌트
 * WYSIWYG 및 마크다운 모드 지원
 */

import { Editor } from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor.css';
import { useRef, useEffect } from 'react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = '내용을 입력하세요...',
  height = '400px',
}: MarkdownEditorProps) {
  const editorRef = useRef<Editor>(null);

  // value prop 변경 시 에디터 내용 업데이트
  useEffect(() => {
    const editorInstance = editorRef.current?.getInstance();
    if (editorInstance && editorInstance.getMarkdown() !== value) {
      // 마크다운 모드로 전환 후 내용 설정
      editorInstance.setMarkdown(value, false);
    }
  }, [value]);

  const handleChange = () => {
    const editorInstance = editorRef.current?.getInstance();
    if (editorInstance) {
      const markdown = editorInstance.getMarkdown();
      onChange(markdown);
    }
  };

  return (
    <div className="markdown-editor-wrapper">
      <Editor
        ref={editorRef}
        initialValue={value}
        placeholder={placeholder}
        previewStyle="vertical"
        height={height}
        initialEditType="wysiwyg"
        useCommandShortcut={true}
        hideModeSwitch={false}
        toolbarItems={[
          ['heading', 'bold', 'italic', 'strike'],
          ['hr', 'quote'],
          ['ul', 'ol', 'task'],
          ['table', 'link'],
          ['code', 'codeblock'],
        ]}
        onChange={handleChange}
      />

      <style>{`
        .markdown-editor-wrapper .toastui-editor-defaultUI {
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
        }

        .markdown-editor-wrapper .toastui-editor-toolbar {
          background-color: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          border-radius: 0.75rem 0.75rem 0 0;
        }

        .markdown-editor-wrapper .toastui-editor-main {
          border-radius: 0 0 0.75rem 0.75rem;
        }

        .markdown-editor-wrapper .toastui-editor-md-container,
        .markdown-editor-wrapper .toastui-editor-ww-container {
          background-color: white;
        }

        .markdown-editor-wrapper .ProseMirror {
          padding: 16px;
          font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 14px;
          line-height: 1.6;
          color: #1f2937;
        }

        .markdown-editor-wrapper .toastui-editor-md-preview {
          padding: 16px;
          font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 14px;
          line-height: 1.6;
          color: #1f2937;
        }

        .markdown-editor-wrapper .toastui-editor-toolbar-icons {
          color: #6b7280;
        }

        .markdown-editor-wrapper .toastui-editor-toolbar-icons:hover {
          background-color: #e5e7eb;
        }
      `}</style>
    </div>
  );
}

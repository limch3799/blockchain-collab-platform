// src/components/common/ConfirmModal.tsx
interface ConfirmModalProps {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  type?: 'warning' | 'info' | 'danger';
}

export function ConfirmModal({
  title,
  message,
  confirmText = '네',
  cancelText = '아니오',
  onConfirm,
  onCancel,
  type = 'info',
}: ConfirmModalProps) {
  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          confirmButton: 'bg-moas-error hover:bg-moas-error/90 text-white',
          title: 'text-moas-error',
        };
      case 'warning':
        return {
          confirmButton: 'bg-moas-main hover:opacity-90 text-moas-text',
          title: 'text-moas-main',
        };
      default:
        return {
          confirmButton: 'bg-moas-main hover:opacity-90 text-moas-text',
          title: 'text-moas-text',
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 font-pretendard"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl w-[400px] p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 제목 */}
        {title && <h3 className={`text-xl font-bold mb-4 ${styles.title}`}>{title}</h3>}

        {/* 메시지 */}
        <p className="text-moas-gray-9 text-lg mb-6 leading-relaxed whitespace-pre-line">{message}</p>

        {/* 버튼 */}
        <div className="flex gap-3">
          {onCancel && (
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 rounded-lg border-2 border-moas-gray-3 text-moas-gray-7 font-medium hover:bg-moas-gray-1 transition-colors"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${styles.confirmButton}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

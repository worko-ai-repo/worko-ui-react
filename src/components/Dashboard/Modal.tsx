import ReactDOM from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  showCloseButton?: boolean;
  className?: string;
}

const Modal = ({
  isOpen,
  onClose,
  children,
  title,
  showCloseButton = true,
  className = "",
}: ModalProps) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[9999] overflow-auto bg-black/50"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`bg-white rounded-xl p-6 shadow-lg relative animate-slide-in ${className}`}
          style={{ width: 'fit-content', maxWidth: '100%' }}
          onClick={(e) => e.stopPropagation()}
        >
          {showCloseButton && (
            <button
              className="absolute top-3 right-3 text-xl text-gray-500 hover:text-gray-800"
              onClick={onClose}
              aria-label="Close modal"
            >
              ×
            </button>
          )}
          {title && <h2 className="text-lg font-semibold mb-4">{title}</h2>}
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;

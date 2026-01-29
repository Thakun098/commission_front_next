'use client';

interface ConfirmationModalProps {
  isOpen: boolean;
  confirmationMessage: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationModal({
  isOpen,
  confirmationMessage,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <p className="modal-message">{confirmationMessage}</p>
        <div className="modal-buttons">
          <button className="btn-modal btn-modal-cancel" onClick={onCancel}>
            ยกเลิก
          </button>
          <button className="btn-modal btn-modal-confirm" onClick={onConfirm}>
            ยืนยัน
          </button>
        </div>
      </div>
    </div>
  );
}

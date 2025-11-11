import { useEffect, useRef } from 'react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * ConfirmDialog - A modal confirmation dialog
 */
export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Focus management and escape key handling
  useEffect(() => {
    if (isOpen) {
      // Focus the confirm button when dialog opens
      confirmButtonRef.current?.focus();

      // Handle escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onCancel();
        }
      };

      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when dialog is open
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="sk-confirm-dialog-overlay"
      onClick={onCancel}
      role="presentation"
      aria-hidden={!isOpen}
    >
      <div
        ref={dialogRef}
        className="sk-confirm-dialog"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
      >
        <div className="sk-confirm-dialog__header">
          <h3 id="confirm-dialog-title" className="sk-confirm-dialog__title">
            {title}
          </h3>
        </div>

        <div className="sk-confirm-dialog__body">
          <p id="confirm-dialog-message" className="sk-confirm-dialog__message">
            {message}
          </p>
        </div>

        <div className="sk-confirm-dialog__footer">
          <button
            type="button"
            onClick={onCancel}
            className="sk-button sk-button--secondary"
            aria-label={cancelLabel}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            onClick={onConfirm}
            className={`sk-button sk-button--${variant}`}
            aria-label={confirmLabel}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

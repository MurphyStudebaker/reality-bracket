import React from 'react';
import BaseModal from './BaseModal';
import { Button } from '../ui/button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonStyle?: React.CSSProperties;
  isLoading?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonStyle,
  isLoading = false,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const footer = (
    <div className="flex gap-3">
      <Button
        onClick={onClose}
        variant="outline"
        disabled={isLoading}
        className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
      >
        {cancelText}
      </Button>
      <Button
        onClick={onConfirm}
        disabled={isLoading}
        className="flex-1 px-4 py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        style={{
          ...confirmButtonStyle,
          backgroundColor: confirmButtonStyle?.backgroundColor ?? '#BFFF0B',
          color: confirmButtonStyle?.color ?? '#0f172a',
        }}
      >
        {isLoading ? 'Processing...' : confirmText}
      </Button>
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      bodyClassName="p-6 lg:p-8"
      footer={footer}
      sizeClassName="lg:w-full lg:max-w-md"
    >
      <p className="text-slate-300 text-base leading-relaxed">{message}</p>
    </BaseModal>
  );
}


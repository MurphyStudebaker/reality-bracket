import React from 'react';
import { X } from 'lucide-react';
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

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Mobile: Bottom Drawer, Desktop: Center Panel */}
      <div className="fixed inset-x-0 bottom-0 lg:inset-0 lg:flex lg:items-center lg:justify-center z-50 pointer-events-none">
        <div
          className="bg-slate-900 border-slate-800 flex flex-col max-h-[85vh] lg:max-h-[500px] w-full lg:w-[500px] rounded-t-2xl lg:rounded-2xl border-t lg:border pointer-events-auto animate-slide-in-bottom lg:animate-none"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 lg:p-8 border-b border-slate-800">
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
              disabled={isLoading}
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 lg:p-8">
            <p className="text-slate-300 text-base leading-relaxed">{message}</p>
          </div>

          {/* Footer */}
          <div className="p-6 lg:p-8 border-t border-slate-800">
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
                onClick={handleConfirm}
                disabled={isLoading}
                className="flex-1 font-semibold"
                style={
                  confirmButtonStyle || {
                    backgroundColor: '#BFFF0B',
                    color: '#000',
                  }
                }
              >
                {isLoading ? 'Processing...' : confirmText}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


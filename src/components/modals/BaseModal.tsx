import React from 'react';
import { X } from 'lucide-react';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  header?: React.ReactNode;
  headerClassName?: string;
  footer?: React.ReactNode;
  footerClassName?: string;
  bodyClassName?: string;
  containerClassName?: string;
  sizeClassName?: string;
  children: React.ReactNode;
}

export default function BaseModal({
  isOpen,
  onClose,
  title,
  header,
  headerClassName,
  footer,
  footerClassName,
  bodyClassName,
  containerClassName,
  sizeClassName,
  children,
}: BaseModalProps) {
  if (!isOpen) return null;

  const defaultHeader = (
    <div
      className={`rounded-t-2xl lg:rounded-2xl sticky top-0 z-10 flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900 ${headerClassName ?? ''}`}
    >
      {title ? (
        <h2 className="text-xl font-semibold text-white">{title}</h2>
      ) : (
        <div />
      )}
      <button
        onClick={onClose}
        className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
      >
        <X className="w-5 h-5 text-slate-400" />
      </button>
    </div>
  );

  const bodyClasses = `flex-1 min-h-0 overflow-y-auto p-6 ${bodyClassName ?? ''}`.trim();
  const containerClasses = `modal-shell bg-slate-900 rounded-t-2xl lg:rounded-2xl border-t lg:border border-slate-800 w-full ${sizeClassName ?? 'lg:max-w-[600px] lg:w-full lg:mx-auto'} flex flex-col pointer-events-auto animate-slide-in-bottom lg:animate-none overflow-hidden ${containerClassName ?? ''}`.trim();
  const footerClasses = footerClassName ?? 'p-6 border-t border-slate-800';

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
          className="bg-slate-900 border-slate-800 flex flex-col max-h-[85vh] lg:max-h-[600px] w-full lg:w-[480px] rounded-t-2xl lg:rounded-2xl border-t lg:border pointer-events-auto animate-slide-in-bottom lg:animate-none"
          onClick={(e) => e.stopPropagation()}
        >
          {header ?? defaultHeader}
          <div className={bodyClasses}>{children}</div>
          {footer && (
            <div className={footerClasses}>{footer}</div>
          )}
        </div>
      </div>
    </>
  );
}


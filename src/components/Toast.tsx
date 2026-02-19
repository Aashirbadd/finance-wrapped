import { useEffect } from 'react';

export type ToastType = 'info' | 'warning' | 'success';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    info: 'bg-blue-500/20 border-blue-500/50',
    warning: 'bg-yellow-500/20 border-yellow-500/50',
    success: 'bg-green-500/20 border-green-500/50',
  }[type];

  const textColor = {
    info: 'text-blue-400',
    warning: 'text-yellow-400',
    success: 'text-green-400',
  }[type];

  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-lg border ${bgColor} ${textColor} shadow-lg animate-fade-in`}>
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

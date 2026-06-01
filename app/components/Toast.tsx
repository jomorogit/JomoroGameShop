'use client';
import { createContext, useContext, useState, useRef, ReactNode } from 'react';
import Link from 'next/link';

interface ToastState {
  message: string;
  visible: boolean;
  link?: string;
  link_message?: string;
}

interface ToastContextType {
  showToast: (message: string, link?: string, link_message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);


export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState>({ message: '', visible: false });
  const timeoutId = useRef<NodeJS.Timeout | null>(null);

  const showToast = (message: string, link?: string, link_message?: string) => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }

    setToast({ message, visible: true, link, link_message });

    timeoutId.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3200);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastComponent {...toast} />
    </ToastContext.Provider>
  );
}

// Хук для вызова из любого компонента 
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}


function ToastComponent({ message, visible, link, link_message }: ToastState) {
  return (
    <div
      className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-xl flex justify-center shadow-2xl transition-all duration-500 transform border border-purple-500/30 
        ${visible 
          ? 'translate-y-0 opacity-100 scale-100' 
          : 'translate-y-10 opacity-0 scale-95 pointer-events-none'
        }
        bg-gray-900 text-purple-400 bg-opacity-95 backdrop-blur-xl`}
    >
      <div className="flex items-center gap-3 justify-center whitespace-nowrap font-medium w-[80%] lg:w-full text-xs flex-col">
        <span className='text-xl md:text-2xl mr-4'>{message}</span>
        {link && link_message && (
          <Link 
            href={link} 
            className="ml-2 text-purple-300 underline underline-offset-4 text-2xl hover:text-purple-200 transition-colors"
          >
            {link_message}
          </Link>
        )}
      </div>
    </div>
  );
}
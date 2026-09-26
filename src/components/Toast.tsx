import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';

type Tone = 'success' | 'error' | 'info';
const ToastCtx = createContext<(message: string, tone?: Tone) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ message: string; tone: Tone; key: number } | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const show = useCallback((message: string, tone: Tone = 'success') => {
    window.clearTimeout(timer.current);
    setToast({ message, tone, key: Date.now() });
    timer.current = window.setTimeout(() => setToast(null), 3500);
  }, []);

  const tones: Record<Tone, string> = {
    success: 'border-emerald-200 bg-white text-emerald-800',
    error: 'border-red-200 bg-white text-red-800',
    info: 'border-navy-200 bg-white text-navy-800',
  };

  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div aria-live="polite" role="status" className="no-print pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
        {toast && (
          <div key={toast.key} className={`pointer-events-auto rounded-md border px-4 py-2.5 text-sm font-medium shadow-lg ${tones[toast.tone]}`}>
            {toast.message}
          </div>
        )}
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);

import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ title, onClose, children, wide, hideClose }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && !hideClose && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose, hideClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/70 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && !hideClose && onClose()}>
      <div className={`card animate-pop max-h-[92vh] w-full overflow-y-auto rounded-b-none p-6 sm:rounded-b-2xl ${wide ? 'max-w-4xl' : 'max-w-md'}`}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-xl font-extrabold">{title}</h2>
          {!hideClose && <button onClick={onClose} aria-label="Închide" className="rounded-lg p-1 text-ink/50 hover:bg-lav/20 dark:text-slate-400"><X size={20} /></button>}
        </div>
        {children}
      </div>
    </div>
  );
}

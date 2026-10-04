import { useEffect, useRef, useState } from 'react';
import { BadgeCheck, Timer, XCircle, RotateCcw } from 'lucide-react';
import Modal from './Modal.jsx';
import { QUIZ } from '../data.js';

const LIMIT = 30;

export default function QuizModal({ subject, onClose, onPass }) {
  const qs = QUIZ[subject];
  const [idx, setIdx] = useState(0);
  const [left, setLeft] = useState(LIMIT);
  const [state, setState] = useState('run'); // run | pass | fail
  const [why, setWhy] = useState('');
  const [picked, setPicked] = useState(null);
  const done = useRef(false);

  useEffect(() => {
    if (state !== 'run') return;
    const t = setInterval(() => setLeft((l) => l - 1), 1000);
    return () => clearInterval(t);
  }, [state, idx]);

  useEffect(() => {
    if (state === 'run' && left <= 0) { setWhy('Timpul de 30 de secunde a expirat.'); setState('fail'); }
  }, [left, state]);

  useEffect(() => {
    if (state === 'pass' && !done.current) { done.current = true; onPass(subject); }
  }, [state, subject, onPass]);

  const answer = (i) => {
    if (picked !== null || state !== 'run') return;
    setPicked(i);
    setTimeout(() => {
      if (i !== qs[idx].c) { setWhy('Răspuns greșit.'); setState('fail'); return; }
      if (idx + 1 >= qs.length) setState('pass');
      else { setIdx(idx + 1); setLeft(LIMIT); setPicked(null); }
    }, 600);
  };
  const retry = () => { setIdx(0); setLeft(LIMIT); setPicked(null); setWhy(''); setState('run'); };

  return (
    <Modal title={`Test de Mentorat — ${subject}`} onClose={onClose} hideClose={state === 'run'}>
      {state === 'run' && (
        <div className="space-y-4" key={idx}>
          <div className="flex items-center justify-between text-sm font-semibold">
            <span>Întrebarea {idx + 1} din {qs.length}</span>
            <span className={`flex items-center gap-1 font-mono ${left <= 10 ? 'animate-pulse text-rose-500' : 'text-blurple'}`}><Timer size={16} /> {left} secunde / întrebare</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-lav/30">
            <div className={`h-full transition-all duration-1000 ease-linear ${left <= 10 ? 'bg-rose-500' : 'bg-blurple'}`} style={{ width: `${(left / LIMIT) * 100}%` }} />
          </div>
          <p className="text-lg font-bold">{qs[idx].q}</p>
          <div className="space-y-2">
            {qs[idx].a.map((o, i) => {
              const ok = picked !== null && i === qs[idx].c;
              const bad = picked === i && i !== qs[idx].c;
              return (
                <button key={o} onClick={() => answer(i)}
                  className={`w-full rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition ${ok ? 'border-emerald-500 bg-emerald-500/15' : bad ? 'border-rose-500 bg-rose-500/15' : 'border-lav/50 hover:border-blurple hover:bg-lav/15 dark:border-white/10'}`}>
                  <span className="mr-2 font-bold text-blurple">{'ABCD'[i]}.</span>{o}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-ink/50 dark:text-slate-500">Un răspuns greșit sau expirarea timpului înseamnă eșecul testului.</p>
        </div>
      )}
      {state === 'pass' && (
        <div className="animate-pop space-y-4 py-4 text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-500/15 text-emerald-500"><BadgeCheck size={44} /></div>
          <h3 className="text-xl font-extrabold">Felicitări! Ai trecut testul.</h3>
          <p className="text-sm text-ink/70 dark:text-slate-300">Ai primit <b>Insigna Mentor Verificat</b> la {subject}. Acum poți intra în camere ca mentor.</p>
          <button onClick={onClose} className="btn-primary w-full">Închide</button>
        </div>
      )}
      {state === 'fail' && (
        <div className="animate-pop space-y-4 py-4 text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-rose-500/15 text-rose-500"><XCircle size={44} /></div>
          <h3 className="text-xl font-extrabold">Testul a fost picat</h3>
          <p className="text-sm text-ink/70 dark:text-slate-300">{why} Poți relua testul oricând.</p>
          <div className="flex gap-2"><button onClick={onClose} className="btn-ghost flex-1">Închide</button><button onClick={retry} className="btn-primary flex-1"><RotateCcw size={15} /> Reia testul</button></div>
        </div>
      )}
    </Modal>
  );
}

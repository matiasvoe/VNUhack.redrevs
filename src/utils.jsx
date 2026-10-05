import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';

export function useNow(interval = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), interval);
    return () => clearInterval(t);
  }, [interval]);
  return now;
}

export function useLocalStorage(key, initial) {
  const [val, setVal] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch { /* ignorat */ }
  }, [key, val]);
  return [val, setVal];
}

// Fereastra de intrare: :00–:05 și :30–:35. `demo` o forțează deschisă.
export function entryInfo(now, demo) {
  const m = now.getMinutes();
  const s = now.getSeconds();
  const slot = m % 30;
  const open = demo || slot < 5;
  const secToNext = (30 - slot) * 60 - s;
  const secToClose = Math.max(0, (5 - slot) * 60 - s);
  return { open, secToNext, secToClose, closeLabel: m < 30 ? ':05' : ':35', nextLabel: m < 30 ? ':30' : ':00' };
}

export const fmt = (sec) => {
  const s = Math.max(0, Math.floor(sec));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};
export const hhmm = (d = new Date()) => d.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });

const COLORS = ['bg-indigo-500', 'bg-violet-500', 'bg-fuchsia-500', 'bg-sky-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-teal-500'];
export function Avatar({ name = '?', size = 'h-10 w-10', text = 'text-sm', ring = '' }) {
  const h = [...name].reduce((a, c) => a + c.charCodeAt(0), 0);
  const initials = name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div className={`${size} ${text} ${ring} ${COLORS[h % COLORS.length]} grid shrink-0 place-items-center rounded-full font-bold text-white`}>
      {initials}
    </div>
  );
}

export const gradeShort = (g) => g.replace('Clasa a ', 'a ').replace('-a', '-a');

// Sfârșitul ciclului de 30 de minute (:00 / :30) care urmează momentului `ms`
export function cycleEnd(ms) {
  const d = new Date(ms);
  d.setSeconds(0, 0);
  if (d.getMinutes() < 30) d.setMinutes(30);
  else { d.setHours(d.getHours() + 1); d.setMinutes(0); }
  return d.getTime();
}

export function Stars({ rating, className = '' }) {
  if (!rating) return <span className={`text-[11px] text-ink/40 dark:text-slate-500 ${className}`}>Fără evaluări</span>;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-bold text-amber-500 ${className}`} title={`${rating.avg.toFixed(1)} din 5 (${rating.count} evaluări)`}>
      <Star size={11} className="fill-amber-400" /> {rating.avg.toFixed(1)} <span className="font-medium opacity-60">({rating.count})</span>
    </span>
  );
}

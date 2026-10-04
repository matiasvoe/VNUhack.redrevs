import { useEffect, useState } from 'react';

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

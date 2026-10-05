import { Clock, FlaskConical } from 'lucide-react';
import { entryInfo, fmt } from '../utils.jsx';

// Singurul cronometru global al aplicației: ciclu de 30 min (:00–:05 intrare, :05–:30 sesiune blocată)
export default function GlobalTimer({ now, demo, setDemo, inRoom }) {
  const c = entryInfo(now, false);
  const entry = c.open;
  const secs = entry ? c.secToClose : c.secToNext;
  const pos = (now.getMinutes() % 30) * 60 + now.getSeconds();
  const label = entry ? 'Intrarea se închide în' : inRoom ? 'Sesiunea se încheie în' : 'Următoarea intrare în';
  return (
    <div className="border-t border-white/10 bg-[#15123A]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <Clock size={20} className="text-lav" />
          <div className="leading-tight">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-white/60">{label}</p>
            <p className={`font-mono text-2xl font-extrabold tabular-nums ${entry ? 'text-emerald-300' : 'text-lav'}`}>{fmt(secs)}</p>
          </div>
        </div>
        <div className="min-w-0 flex-1 basis-64 text-xs font-semibold sm:text-sm">
          {entry ? (
            <span className="inline-block rounded-lg bg-emerald-500/15 px-3 py-1.5 text-emerald-300">
              🟢 INTRAREA DESCHISĂ! Te poți alătura unei camere acum (Până la {c.closeLabel})
            </span>
          ) : inRoom ? (
            <span className="inline-block rounded-lg bg-rose-500/15 px-3 py-1.5 text-rose-300">
              🔒 Sesiune în desfășurare — lucru intens, fără întreruperi, până la {c.nextLabel}
            </span>
          ) : (
            <span className="inline-block rounded-lg bg-orange-500/15 px-3 py-1.5 text-orange-300">
              ⏳ Următoarea sesiune începe la fix / jumătate. Caută o cameră și pregătește-te!
            </span>
          )}
        </div>
        <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-white/60">
          <input type="checkbox" checked={demo} onChange={(e) => setDemo(e.target.checked)} className="accent-blurple" />
          <FlaskConical size={12} /> Mod demonstrație (intrare permisă oricând)
        </label>
      </div>
      <div className="h-1 bg-white/10">
        <div className={`h-full transition-all ${entry ? 'bg-emerald-400' : 'bg-lav/70'}`} style={{ width: `${(pos / 1800) * 100}%` }} />
      </div>
    </div>
  );
}

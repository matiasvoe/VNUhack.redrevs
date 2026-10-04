import { Clock, FlaskConical } from 'lucide-react';
import { entryInfo, fmt } from '../utils.jsx';

export default function TimerBanner({ now, demo, setDemo }) {
  const { open, secToNext, secToClose, closeLabel } = entryInfo(now, demo);
  const real = entryInfo(now, false);
  return (
    <section className="card animate-fadeUp overflow-hidden">
      <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-ink text-lav"><Clock size={26} /></div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink/60 dark:text-slate-400">
              {real.open ? 'Fereastra de intrare se închide în' : 'Următoarea sesiune începe în'}
            </p>
            <p className="font-mono text-4xl font-extrabold tabular-nums text-blurple">
              {fmt(real.open ? real.secToClose : secToNext)}
            </p>
          </div>
        </div>
        <div className="flex-1 md:max-w-xl">
          {open ? (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              🟢 INTRAREA DESCHISĂ! Te poți alătura unei camere acum (Până la {demo && !real.open ? ':05 / :35' : closeLabel})
            </div>
          ) : (
            <div className="rounded-xl border border-orange-500/40 bg-orange-500/10 p-3 text-sm font-semibold text-orange-700 dark:text-orange-300">
              ⏳ Următoarea sesiune începe la fix / jumătate. Caută o cameră și pregătește-te!
            </div>
          )}
          <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs text-ink/60 dark:text-slate-400">
            <input type="checkbox" checked={demo} onChange={(e) => setDemo(e.target.checked)} className="accent-blurple" />
            <FlaskConical size={13} /> Mod demonstrație: forțează fereastra de intrare deschisă
          </label>
        </div>
      </div>
    </section>
  );
}

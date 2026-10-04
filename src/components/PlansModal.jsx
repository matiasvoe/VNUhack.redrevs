import { Check, Coins, Zap } from 'lucide-react';
import Modal from './Modal.jsx';
import { CREDIT_PACKS, PLANS, SESSION_COST } from '../data.js';

export default function PlansModal({ onClose, user, onPlan, onPack, reason }) {
  return (
    <Modal title="Reîncărcare / Planuri Abonament" onClose={onClose} wide>
      {reason && (
        <div className="mb-4 animate-slideIn rounded-xl border border-rose-400/40 bg-rose-500/10 p-3 text-sm font-semibold text-rose-600 dark:text-rose-300">
          Nu ai suficiente credite. O sesiune = {SESSION_COST} credite — cumpără credite sau alege un abonament.
        </div>
      )}
      <p className="mb-4 text-sm text-ink/70 dark:text-slate-300">Sold curent: <b>{user?.credits ?? 0} Credite</b> · O sesiune = {SESSION_COST} credite</p>
      <div className="grid gap-4 md:grid-cols-3">
        {PLANS.map((p) => {
          const cur = user?.plan === p.id;
          return (
            <div key={p.id} className={`relative flex flex-col rounded-2xl border-2 p-5 transition hover:-translate-y-1 ${p.popular ? 'border-blurple shadow-lg shadow-blurple/20' : 'border-lav/50 dark:border-white/10'}`}>
              {p.popular && <span className="badge absolute -top-3 left-5 bg-blurple text-white"><Zap size={11} /> Cel mai ales</span>}
              <h3 className="text-lg font-extrabold">Plan {p.name}</h3>
              <p className="mt-1"><span className="text-3xl font-extrabold">{p.price} lei</span><span className="text-sm text-ink/60 dark:text-slate-400"> /lună</span></p>
              <p className="mt-1 text-sm font-bold text-blurple">{p.credits} credite / lună</p>
              <ul className="my-4 flex-1 space-y-2 text-sm">
                {p.perks.map((k) => <li key={k} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-emerald-500" />{k}</li>)}
              </ul>
              <button disabled={cur} onClick={() => onPlan(p)} className={p.popular ? 'btn-primary' : 'btn-ghost'}>
                {cur ? 'Planul tău actual' : p.price === 0 ? 'Alege Free' : `Alege ${p.name}`}
              </button>
            </div>
          );
        })}
      </div>
      <h3 className="mb-3 mt-6 font-bold">Sau cumpără credite o singură dată</h3>
      <div className="grid gap-3 sm:grid-cols-3">
        {CREDIT_PACKS.map((c) => (
          <button key={c.credits} onClick={() => onPack(c)} className="btn-ghost justify-between !py-3">
            <span className="flex items-center gap-2"><Coins size={16} className="text-amber-500" /> +{c.credits} credite</span><b>{c.price} lei</b>
          </button>
        ))}
      </div>
      <p className="mt-4 text-center text-xs text-ink/50 dark:text-slate-500">Plată simulată pentru demonstrație — nu se efectuează tranzacții reale.</p>
    </Modal>
  );
}

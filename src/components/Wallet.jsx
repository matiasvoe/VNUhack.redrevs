import { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Banknote, Check, Coins, Copy, Gift, History, Landmark, Plus, Ticket, UserPlus, Users, Wallet } from 'lucide-react';
import Modal from './Modal.jsx';
import { CREDIT_RON_RATE, MIN_CASHOUT, REFERRAL_COUPON, toRon } from '../data.js';

const fmtDate = (ts) => new Date(ts).toLocaleString('ro-RO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

export function WalletCard({ user, onPlans, onCashOut }) {
  const earned = user.earned || 0;
  const can = earned >= MIN_CASHOUT;
  return (
    <div className="card space-y-4 p-5">
      <h2 className="flex items-center gap-2 font-extrabold"><Wallet size={18} className="text-blurple" /> Portofel</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-app p-4 dark:bg-night">
          <p className="label !mb-1">Credite pentru sesiuni</p>
          <p className="text-3xl font-extrabold tabular-nums">{user.credits}</p>
          <button onClick={onPlans} className="btn-primary mt-3 w-full !py-2"><Plus size={15} /> Adaugă Credite</button>
        </div>
        <div className="rounded-xl bg-ink p-4 text-white">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-lav">Credite Câștigate</p>
          <p className="text-3xl font-extrabold tabular-nums">{earned}</p>
          <p className="text-xs text-white/60">≈ {toRon(earned)} RON</p>
          <button onClick={onCashOut} disabled={!can} title={can ? 'Convertește creditele câștigate în bani reali' : `Poți retrage de la ${MIN_CASHOUT} credite câștigate`}
            className="btn mt-3 w-full bg-emerald-500 !py-2 text-white hover:bg-emerald-600"><Banknote size={15} /> Retrage Bani / Cash Out</button>
        </div>
      </div>
      <p className="flex items-start gap-2 text-xs text-ink/60 dark:text-slate-400"><Coins size={14} className="mt-0.5 shrink-0 text-amber-500" />
        Ca mentor primești 50% din creditele elevilor din cameră. Curs de retragere: 100 Credite = {(100 * CREDIT_RON_RATE).toFixed(0)} RON. Minim {MIN_CASHOUT} credite.</p>
    </div>
  );
}

export function ReferralCard({ user, onSim, toast }) {
  const link = `akademos.ro/ref/${user.refCode}`;
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(`https://${link}`); setCopied(true); setTimeout(() => setCopied(false), 1800); toast('Linkul a fost copiat.'); }
    catch { toast('Nu am putut copia automat. Selectează linkul și copiază-l manual.', 'info'); }
  };
  const coupons = user.coupons || [];
  const free = coupons.filter((c) => !c.used);
  return (
    <div className="card space-y-4 p-5">
      <h2 className="flex items-center gap-2 font-extrabold"><Gift size={18} className="text-blurple" /> Recomandă și Economisește</h2>
      <p className="text-sm text-ink/70 dark:text-slate-300">Invită un prieten. Când se înregistrează cu linkul tău, primești <b>{REFERRAL_COUPON.label}</b>, aplicat automat la plată.</p>
      <div>
        <span className="label">Linkul tău unic · cod {user.refCode}</span>
        <div className="flex gap-2">
          <input readOnly value={link} onFocus={(e) => e.target.select()} aria-label="Link de recomandare" className="input font-mono" />
          <button onClick={copy} className="btn-primary shrink-0 !px-3" aria-label="Copiază linkul">{copied ? <Check size={16} /> : <Copy size={16} />}</button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {free.map((c) => <span key={c.id} className="badge animate-pop bg-emerald-500/15 py-1 text-emerald-700 dark:text-emerald-300"><Ticket size={12} /> {c.label}</span>)}
        {free.length === 0 && <span className="text-xs text-ink/50 dark:text-slate-500">Niciun cupon activ încă.</span>}
        <span className="badge-lav ml-auto"><Users size={12} /> {(user.referrals || []).length} prieteni înscriși</span>
      </div>
      {(user.referrals || []).length > 0 && (
        <ul className="space-y-1 text-xs text-ink/70 dark:text-slate-300">
          {user.referrals.slice(0, 4).map((r) => <li key={r.id}>✔ {r.name} s-a înregistrat · {fmtDate(r.ts)}</li>)}
        </ul>
      )}
      <button onClick={onSim} className="btn-ghost w-full text-xs"><UserPlus size={15} /> Demo: simulează înregistrarea unui prieten</button>
    </div>
  );
}

export function TxHistory({ user }) {
  const [f, setF] = useState('all');
  const all = user.tx || [];
  const list = all.filter((t) => f === 'all' || t.type === f);
  return (
    <div className="card p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-extrabold"><History size={18} className="text-blurple" /> Istoric tranzacții</h2>
        <div className="flex gap-1 rounded-xl bg-app p-1 text-xs font-semibold dark:bg-night">
          {[['all', 'Toate'], ['earn', 'Primite'], ['cashout', 'Retrase']].map(([id, l]) => (
            <button key={id} onClick={() => setF(id)} className={`rounded-lg px-3 py-1.5 transition ${f === id ? 'bg-blurple text-white' : 'text-ink/60 dark:text-slate-400'}`}>{l}</button>
          ))}
        </div>
      </div>
      {list.length === 0 ? (
        <p className="rounded-xl bg-app p-4 text-center text-sm text-ink/60 dark:bg-night dark:text-slate-400">Nicio tranzacție încă. Verifică-te ca mentor și găzduiește o sesiune pentru a câștiga credite.</p>
      ) : (
        <ul className="divide-y divide-lav/30 dark:divide-white/10">
          {list.map((t) => (
            <li key={t.id} className="flex items-center gap-3 py-3">
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${t.type === 'earn' ? 'bg-emerald-500/15 text-emerald-600' : 'bg-rose-500/15 text-rose-500'}`}>
                {t.type === 'earn' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{t.type === 'earn' ? 'Credite primite din mentorat' : 'Credite retrase'}</p>
                <p className="truncate text-xs text-ink/60 dark:text-slate-400">{t.note} · {fmtDate(t.ts)}</p>
              </div>
              <div className="text-right">
                <p className={`font-bold tabular-nums ${t.type === 'earn' ? 'text-emerald-600' : 'text-rose-500'}`}>{t.type === 'earn' ? '+' : '−'}{t.credits} cr.</p>
                {t.type === 'cashout' && <p className="text-[11px] text-ink/60 dark:text-slate-400">{toRon(t.credits)} RON · în procesare</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function CashoutModal({ user, onClose, onSubmit }) {
  const earned = user.earned || 0;
  const [name, setName] = useState(user.name);
  const [iban, setIban] = useState('');
  const [credits, setCredits] = useState(earned);
  const [err, setErr] = useState('');
  const clean = iban.replace(/\s/g, '').toUpperCase();
  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) return setErr('Introdu numele titularului contului.');
    if (!/^RO\d{2}[A-Z]{4}[A-Z0-9]{16}$/.test(clean)) return setErr('IBAN invalid. Un IBAN românesc are 24 de caractere, ex. RO49 AAAA 1B31 0075 9384 0000.');
    if (!Number.isInteger(+credits) || +credits < MIN_CASHOUT) return setErr(`Suma minimă de retragere este ${MIN_CASHOUT} credite.`);
    if (+credits > earned) return setErr('Nu ai atâtea credite câștigate.');
    onSubmit({ credits: +credits, name: name.trim(), iban: clean });
  };
  return (
    <Modal title="Retragere Credite" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div className="flex items-center justify-between rounded-xl bg-ink p-4 text-white">
          <div><p className="text-xs font-semibold uppercase tracking-wide text-lav">Credite Câștigate</p><p className="text-2xl font-extrabold">{earned}</p></div>
          <p className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold">100 Credite = 20 RON</p>
        </div>
        <label className="block"><span className="label">Nume titular cont</span><input id="co-name" className="input" value={name} onChange={(e) => setName(e.target.value)} /></label>
        <label className="block"><span className="label">IBAN</span>
          <div className="relative"><Landmark size={16} className="absolute left-3 top-3.5 text-blurple" />
            <input id="co-iban" className="input !pl-9 font-mono uppercase" value={iban} onChange={(e) => setIban(e.target.value)} placeholder="RO49 AAAA 1B31 0075 9384 0000" /></div></label>
        <label className="block"><span className="label">Credite de convertit (minim {MIN_CASHOUT})</span>
          <input id="co-credits" type="number" min={MIN_CASHOUT} max={earned} step="1" className="input" value={credits} onChange={(e) => setCredits(e.target.value)} /></label>
        <div className="flex items-center justify-between rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm font-bold text-emerald-700 dark:text-emerald-300">
          <span>Vei primi</span><span className="text-xl tabular-nums">{toRon(+credits || 0)} RON</span>
        </div>
        {err && <p className="text-sm font-medium text-rose-500">{err}</p>}
        <p className="text-xs text-ink/50 dark:text-slate-500">Transferul ajunge în contul tău în 1–3 zile lucrătoare. Demonstrație: nu se efectuează plăți reale.</p>
        <button className="btn-primary w-full"><Banknote size={16} /> Confirmă retragerea</button>
      </form>
    </Modal>
  );
}

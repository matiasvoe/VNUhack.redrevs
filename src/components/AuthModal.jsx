import { useRef, useState } from 'react';
import { Phone, MessageSquare, UserRound, ArrowLeft } from 'lucide-react';
import Modal from './Modal.jsx';
import { GRADES } from '../data.js';

const PHONE_RE = /^(\+40|0040|0)7\d{8}$/;

export default function AuthModal({ onClose, accounts, onDone, initialRef = '' }) {
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('+40 7');
  const [code, setCode] = useState(['', '', '', '']);
  const [sent, setSent] = useState('');
  const [err, setErr] = useState('');
  const [form, setForm] = useState({ name: '', school: '', grade: GRADES[2], ref: initialRef });
  const refs = [useRef(), useRef(), useRef(), useRef()];
  const clean = phone.replace(/[\s.-]/g, '');
  const norm = clean.replace(/^(0040|0)/, '+40');

  const sendCode = (e) => {
    e.preventDefault();
    if (!PHONE_RE.test(clean)) return setErr('Introdu un număr valid, de forma +40 7xx xxx xxx.');
    setErr('');
    setSent(String(1000 + Math.floor(Math.random() * 9000)));
    setCode(['', '', '', '']);
    setStep('code');
    setTimeout(() => refs[0].current?.focus(), 50);
  };
  const setDigit = (i, v) => {
    const d = v.replace(/\D/g, '').slice(-1);
    const next = [...code]; next[i] = d; setCode(next);
    if (d && i < 3) refs[i + 1].current?.focus();
  };
  const verify = (e) => {
    e.preventDefault();
    if (code.join('') !== sent) return setErr('Cod incorect. Verifică SMS-ul și încearcă din nou.');
    setErr('');
    if (accounts[norm]) onDone(norm, null);
    else setStep('profile');
  };
  const finish = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.school.trim()) return setErr('Completează numele și liceul.');
    onDone(norm, form);
  };

  return (
    <Modal title={step === 'phone' ? 'Conectează-te sau creează cont' : step === 'code' ? 'Verificare prin SMS' : 'Completează-ți profilul'} onClose={onClose}>
      {step === 'phone' && (
        <form onSubmit={sendCode} className="space-y-4">
          <p className="text-sm text-ink/70 dark:text-slate-300">Folosim numărul tău de telefon pentru autentificare. Primești 50 de credite gratuite la înregistrare.</p>
          <label className="block"><span className="label">Număr de telefon</span>
            <div className="relative"><Phone size={16} className="absolute left-3 top-3.5 text-blurple" />
              <input className="input !pl-9" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+40 7xx xxx xxx" inputMode="tel" autoFocus /></div>
          </label>
          {err && <p className="text-sm font-medium text-rose-500">{err}</p>}
          <button className="btn-primary w-full">Trimite codul SMS</button>
        </form>
      )}
      {step === 'code' && (
        <form onSubmit={verify} className="space-y-4">
          <button type="button" onClick={() => { setStep('phone'); setErr(''); }} className="flex items-center gap-1 text-xs font-semibold text-blurple"><ArrowLeft size={14} /> Schimbă numărul</button>
          <p className="text-sm text-ink/70 dark:text-slate-300">Am trimis un cod de 4 cifre la <b>{phone}</b>.</p>
          <div className="animate-slideIn flex items-start gap-2 rounded-xl border border-lav bg-lav/20 p-3 text-xs">
            <MessageSquare size={16} className="mt-0.5 shrink-0 text-blurple" />
            <span><b>SMS simulat (demo):</b> „Codul tău Akademos este <b className="text-sm">{sent}</b>”</span>
          </div>
          <div className="flex justify-center gap-3">
            {code.map((c, i) => (
              <input key={i} ref={refs[i]} value={c} onChange={(e) => setDigit(i, e.target.value)}
                onKeyDown={(e) => e.key === 'Backspace' && !c && i > 0 && refs[i - 1].current?.focus()}
                inputMode="numeric" aria-label={`Cifra ${i + 1}`}
                className="h-14 w-12 rounded-xl border-2 border-lav bg-white text-center text-2xl font-extrabold outline-none focus:border-blurple dark:bg-night" />
            ))}
          </div>
          {err && <p className="text-center text-sm font-medium text-rose-500">{err}</p>}
          <button className="btn-primary w-full" disabled={code.join('').length < 4}>Verifică codul</button>
        </form>
      )}
      {step === 'profile' && (
        <form onSubmit={finish} className="space-y-4">
          <label className="block"><span className="label">Nume</span>
            <div className="relative"><UserRound size={16} className="absolute left-3 top-3.5 text-blurple" />
              <input className="input !pl-9" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="ex. Maria Popescu" autoFocus /></div></label>
          <label className="block"><span className="label">Liceu</span>
            <input className="input" value={form.school} onChange={(e) => setForm({ ...form, school: e.target.value })} placeholder="ex. Colegiul Național „Sf. Sava”" /></label>
          <label className="block"><span className="label">Clasă</span>
            <select className="input" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })}>{GRADES.map((g) => <option key={g}>{g}</option>)}</select></label>
          <label className="block"><span className="label">Cod de recomandare (opțional)</span>
            <input id="auth-ref" className="input font-mono uppercase" value={form.ref} onChange={(e) => setForm({ ...form, ref: e.target.value.trim() })} placeholder="ex. MARIA482" /></label>
          {err && <p className="text-sm font-medium text-rose-500">{err}</p>}
          <button className="btn-primary w-full">Creează contul</button>
        </form>
      )}
    </Modal>
  );
}

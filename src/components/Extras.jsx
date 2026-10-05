import { useState } from 'react';
import { Star, Flag, Lock, Crown } from 'lucide-react';
import Modal from './Modal.jsx';
import { Avatar, Stars } from '../utils.jsx';

export function PaywallModal({ onClose, onUpgrade }) {
  return (
    <Modal title="Flashcard-uri" onClose={onClose}>
      <div className="space-y-4 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-blurple text-white"><Lock size={30} /></div>
        <p className="text-sm font-medium leading-relaxed">Această funcționalitate este rezervată membrilor Pro și Premium. Treci la Pro pentru a-ți genera flashcard-uri din notițe!</p>
        <button onClick={onUpgrade} className="btn-primary w-full"><Crown size={16} /> Treci la Pro</button>
        <button onClick={onClose} className="btn-ghost w-full">Poate mai târziu</button>
      </div>
    </Modal>
  );
}

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1" onMouseLeave={() => setHover(0)} role="radiogroup" aria-label="Număr de stele">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onMouseEnter={() => setHover(n)} onClick={() => onChange(n)} aria-label={`${n} stele`} className="transition active:scale-90">
          <Star size={30} className={n <= (hover || value) ? 'fill-amber-400 text-amber-400' : 'text-lav'} />
        </button>
      ))}
    </div>
  );
}

export function RatingModal({ mentors, getRating, onClose, onSubmit }) {
  const [r, setR] = useState({});
  const [t, setT] = useState({});
  const ready = mentors.some((m) => r[m.name]);
  const submit = () => onSubmit(mentors.filter((m) => r[m.name]).map((m) => ({ name: m.name, stars: r[m.name], text: (t[m.name] || '').trim() })));
  return (
    <Modal title="Evaluează Mentorul" onClose={onClose}>
      <p className="mb-4 text-sm text-ink/70 dark:text-slate-300">Sesiunea de 25 de minute s-a încheiat. Cum a fost ajutorul primit? Media stelelor este publică pe profilul mentorului.</p>
      <div className="space-y-5">
        {mentors.map((m) => (
          <div key={m.id} className="rounded-xl bg-app p-4 dark:bg-night">
            <div className="mb-3 flex items-center gap-3"><Avatar name={m.name} /><div><p className="font-bold">{m.name}</p><Stars rating={getRating(m.name)} /></div></div>
            <StarPicker value={r[m.name] || 0} onChange={(v) => setR({ ...r, [m.name]: v })} />
            <textarea className="input mt-3 resize-none" rows={2} maxLength={140} placeholder="Feedback scurt (opțional)" value={t[m.name] || ''} onChange={(e) => setT({ ...t, [m.name]: e.target.value })} />
          </div>
        ))}
      </div>
      <div className="mt-5 flex gap-2">
        <button onClick={onClose} className="btn-ghost flex-1">Sari peste</button>
        <button onClick={submit} disabled={!ready} className="btn-primary flex-1">Trimite evaluarea</button>
      </div>
    </Modal>
  );
}

const REASONS = ['Limbaj ofensator sau jignitor', 'Hărțuire sau bullying', 'Conținut nepotrivit', 'Spam sau publicitate', 'Perturbarea sesiunii', 'Altceva'];
export function ReportModal({ members, onClose, onSubmit }) {
  const [who, setWho] = useState('Întreaga cameră');
  const [reason, setReason] = useState(REASONS[0]);
  const [text, setText] = useState('');
  return (
    <Modal title="🚨 Raportează comportament abuziv" onClose={onClose}>
      <div className="space-y-4">
        <label className="block"><span className="label">Cine a încălcat regulile?</span>
          <select id="report-who" className="input" value={who} onChange={(e) => setWho(e.target.value)}>
            <option>Întreaga cameră</option>{members.filter((m) => m.id !== 'me').map((m) => <option key={m.id}>{m.name}</option>)}
          </select></label>
        <label className="block"><span className="label">Motiv</span>
          <select id="report-reason" className="input" value={reason} onChange={(e) => setReason(e.target.value)}>{REASONS.map((x) => <option key={x}>{x}</option>)}</select></label>
        <label className="block"><span className="label">Detalii (opțional)</span>
          <textarea id="report-text" className="input resize-none" rows={3} maxLength={300} value={text} onChange={(e) => setText(e.target.value)} placeholder="Descrie pe scurt ce s-a întâmplat..." /></label>
        <p className="text-xs text-ink/50 dark:text-slate-500">Raportul este trimis echipei de moderare și rămâne confidențial.</p>
        <div className="flex gap-2"><button onClick={onClose} className="btn-ghost flex-1">Anulează</button>
          <button onClick={() => onSubmit({ who, reason, text })} className="btn-danger flex-1"><Flag size={15} /> Trimite raportul</button></div>
      </div>
    </Modal>
  );
}

export function EarningsModal({ data, onClose }) {
  const rows = [
    [`Elevi în cameră: ${data.students} × 25 credite`, `${data.pool} cr.`],
    ['Comision Akademos (50%)', `− ${data.fee} cr.`],
    ['Fond total pentru mentori', `${data.mentorPool} cr.`],
    [`Împărțit egal la ${data.mentors} ${data.mentors === 1 ? 'mentor' : 'mentori'}`, `${data.each} cr. / mentor`],
  ];
  return (
    <Modal title="Sesiune încheiată — câștigul tău" onClose={onClose}>
      <div className="space-y-4">
        <div className="rounded-2xl bg-ink p-5 text-center text-white">
          <p className="text-xs font-semibold uppercase tracking-wide text-lav">Credite Câștigate</p>
          <p className="animate-pop text-5xl font-extrabold tabular-nums">+{data.each}</p>
          <p className="text-xs text-white/60">adăugate în portofelul tău</p>
        </div>
        <ul className="divide-y divide-lav/30 rounded-xl border border-lav/40 text-sm dark:divide-white/10 dark:border-white/10">
          {rows.map(([a, b]) => <li key={a} className="flex justify-between gap-3 px-4 py-2.5"><span>{a}</span><b className="shrink-0 tabular-nums">{b}</b></li>)}
        </ul>
        <p className="text-xs text-ink/50 dark:text-slate-500">Sumele fracționare se rotunjesc în jos. Poți retrage creditele câștigate din Profil → Portofel.</p>
        <button onClick={onClose} className="btn-primary w-full">Am înțeles</button>
      </div>
    </Modal>
  );
}

export function CreateSessionModal({ user, levels, grades, onClose, onCreate }) {
  const [subject, setSubject] = useState(user.verified[0]);
  const [grade, setGrade] = useState(user.grade);
  const [level, setLevel] = useState(2);
  return (
    <Modal title="Creează Sesiune Live ca Mentor" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-ink/70 dark:text-slate-300">Vei găzdui o sesiune oficială pentru materia la care ești <b>Mentor Verificat</b>. Nu plătești credite: primești 50% din creditele elevilor care intră.</p>
        <label className="block"><span className="label">Materie (verificată)</span>
          <select id="cs-subject" className="input" value={subject} onChange={(e) => setSubject(e.target.value)}>{user.verified.map((s) => <option key={s}>{s}</option>)}</select></label>
        <label className="block"><span className="label">Clasă</span>
          <select id="cs-grade" className="input" value={grade} onChange={(e) => setGrade(e.target.value)}>{grades.map((g) => <option key={g}>{g}</option>)}</select></label>
        <label className="block"><span className="label">Nivel de dificultate</span>
          <select id="cs-level" className="input" value={level} onChange={(e) => setLevel(+e.target.value)}>{levels.map((l) => <option key={l.id} value={l.id}>Nivel {l.id}: {l.label}</option>)}</select></label>
        <div className="flex gap-2"><button onClick={onClose} className="btn-ghost flex-1">Anulează</button>
          <button onClick={() => onCreate({ subject, grade, level })} className="btn-primary flex-1"><Crown size={16} /> Creează Sesiunea</button></div>
      </div>
    </Modal>
  );
}

import { ArrowDown, BadgeCheck, Coins, Crown, GraduationCap, Handshake, LogOut, Save, ShieldCheck, Timer, Users, Wallet, Lock, Mic } from 'lucide-react';
import { useState } from 'react';
import { GRADES, SESSION_COST, SUBJECTS, SUBJECT_ICONS, PLANS } from '../data.js';
import { Avatar, Stars } from '../utils.jsx';

export function Hero({ onStart, onLogin, user }) {
  return (
    <section className="relative animate-fadeUp overflow-hidden rounded-3xl bg-ink px-6 py-12 text-white shadow-soft md:px-12 md:py-16">
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blurple/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-lav/20 blur-3xl" />
      <div className="relative max-w-3xl">
        <span className="badge bg-lav/20 text-lav"><Handshake size={13} /> Ce facem noi</span>
        <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
          Schimb de cunoștințe între elevi. <span className="text-lav">Învață de la colegii tăi sau ajută-i pe alții.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-white/75">
          Akademos conectează elevii care se blochează la o materie cu colegii care o stăpânesc. Intri într-o cameră audio de maximum 5 elevi, lucrați 25 de minute împreună și vă ajutați reciproc.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <button onClick={onStart} className="btn-primary !px-6 !py-3">Găsește o cameră <ArrowDown size={16} /></button>
          {!user && <button onClick={onLogin} className="btn border border-white/25 !px-6 !py-3 text-white hover:bg-white/10">Creează cont gratuit</button>}
        </div>
      </div>
    </section>
  );
}

export function AboutView({ onStart }) {
  const steps = [
    [Timer, 'Sesiuni la fix și la jumătate', 'Intrarea este deschisă doar între :00–:05 și :30–:35. La :05 / :35 (sau când sunt 5 elevi) camera se blochează.'],
    [Users, 'Grupuri echilibrate', 'Sistemul combină mentori (nivel 7–10) cu elevi (nivel 1–6), maximum 5 persoane / cameră.'],
    [Mic, 'Doar audio + partajare ecran', 'Fără camere video: vă concentrați pe explicații, formule și rezolvări împărțite pe ecran.'],
    [ShieldCheck, 'Mentori verificați', 'Pentru a fi mentor, treci un test de 3 întrebări, cu 30 de secunde pentru fiecare.'],
    [Coins, 'Sistem de credite', `O sesiune costă ${SESSION_COST} credite. Planul Free include 50 de credite pe lună.`],
    [Lock, 'Siguranță', 'Autentificare prin număr de telefon și cod SMS. Moderare și raportare în fiecare sesiune.'],
  ];
  return (
    <div className="animate-fadeUp space-y-8">
      <div className="card p-8 text-center">
        <span className="badge-lav">Despre Noi</span>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-ink/80 dark:text-slate-200">Akademos conectează elevii pentru sesiuni de studiu colaborativ structurate în cicluri eficiente de 30 de minute: primele 5 minute sunt destinate conectării și organizării grupelor de maxim 5 persoane, urmate de 25 de minute de lucru intens fără întreruperi.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map(([I, t, d]) => (
          <div key={t} className="card p-5 transition hover:-translate-y-1">
            <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-blurple text-white"><I size={22} /></div>
            <h3 className="font-bold">{t}</h3><p className="mt-1 text-sm text-ink/70 dark:text-slate-300">{d}</p>
          </div>
        ))}
      </div>
      <div className="text-center"><button onClick={onStart} className="btn-primary !px-8 !py-3">Vezi camerele live</button></div>
    </div>
  );
}

function SkillPicker({ title, hint, value, onChange, verified, onVerify, mentor }) {
  const toggle = (s) => { const n = { ...value }; if (s in n) delete n[s]; else n[s] = 5; onChange(n); };
  return (
    <div className="card p-5">
      <h3 className="font-bold">{title}</h3><p className="mb-3 text-xs text-ink/60 dark:text-slate-400">{hint}</p>
      <div className="mb-4 flex flex-wrap gap-2">
        {SUBJECTS.map((s) => {
          const on = s in value; const I = SUBJECT_ICONS[s];
          return <button key={s} onClick={() => toggle(s)} className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition ${on ? 'border-blurple bg-blurple text-white' : 'border-lav/60 hover:bg-lav/20 dark:border-white/10'}`}><I size={14} />{s}</button>;
        })}
      </div>
      <div className="space-y-3">
        {Object.entries(value).map(([s, lvl]) => (
          <div key={s} className="rounded-xl bg-app p-3 dark:bg-night">
            <div className="flex items-center justify-between text-sm">
              <b>{s}</b>
              <span className="badge-lav">Nivel {lvl}/10</span>
            </div>
            <input type="range" min="1" max="10" value={lvl} onChange={(e) => onChange({ ...value, [s]: +e.target.value })} className="mt-2 w-full" aria-label={`Nivel ${s}`} />
            {mentor && (
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                {verified.includes(s)
                  ? <span className="badge bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"><BadgeCheck size={12} /> Insignă Mentor Verificat</span>
                  : lvl >= 7
                    ? <button onClick={() => onVerify(s)} className="btn-primary !px-3 !py-1.5 text-xs"><ShieldCheck size={13} /> Test de Mentorat (3 întrebări × 30 s)</button>
                    : <span className="text-ink/50 dark:text-slate-500">Nivel 7+ necesar pentru a deveni mentor (acum: elev)</span>}
              </div>
            )}
          </div>
        ))}
        {Object.keys(value).length === 0 && <p className="text-sm italic text-ink/50 dark:text-slate-500">Alege cel puțin o materie.</p>}
      </div>
    </div>
  );
}

export function ProfileView({ rating, user, onSave, onLogout, onLogin, onVerify, onPlans }) {
  const [d, setD] = useState(user ? { name: user.name, school: user.school, grade: user.grade, strong: user.strong, weak: user.weak } : null);
  const [saved, setSaved] = useState(false);
  if (!user) {
    return (
      <div className="card mx-auto max-w-md animate-fadeUp p-8 text-center">
        <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-blurple text-white"><GraduationCap size={28} /></div>
        <h2 className="text-xl font-extrabold">Nu ești conectat</h2>
        <p className="my-2 text-sm text-ink/70 dark:text-slate-300">Conectează-te cu numărul de telefon pentru a-ți configura profilul și a intra în camere.</p>
        <button onClick={onLogin} className="btn-primary mt-2 w-full">Conectează-te</button>
      </div>
    );
  }
  const plan = PLANS.find((p) => p.id === user.plan);
  const save = () => { onSave(d); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  return (
    <div className="animate-fadeUp space-y-5">
      <div className="card flex flex-wrap items-center gap-4 p-5">
        <Avatar name={user.name} size="h-16 w-16" text="text-xl" />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-extrabold">{user.name}</h1>
          <p className="text-sm text-ink/60 dark:text-slate-400">{user.school} · {user.grade} · {user.phone}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="badge-lav">Plan {plan?.name}</span>
            {user.verified.map((s) => <span key={s} className="badge bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"><Crown size={11} /> Mentor Verificat · {s}</span>)}
            {user.verified.length > 0 && <span className="badge bg-amber-400/15 py-1 text-xs">Evaluare mentor: <Stars rating={rating} className="!text-xs" /></span>}
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button onClick={onPlans} className="btn-primary"><Wallet size={16} /> {user.credits} Credite · Adaugă Credite</button>
          <button onClick={onLogout} className="btn-ghost"><LogOut size={16} /> Deconectare</button>
        </div>
      </div>
      <div className="card grid gap-4 p-5 sm:grid-cols-3">
        <label><span className="label">Nume</span><input className="input" value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} /></label>
        <label><span className="label">Liceu</span><input className="input" value={d.school} onChange={(e) => setD({ ...d, school: e.target.value })} /></label>
        <label><span className="label">Clasă</span><select className="input" value={d.grade} onChange={(e) => setD({ ...d, grade: e.target.value })}>{GRADES.map((g) => <option key={g}>{g}</option>)}</select></label>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <SkillPicker title="Materiile la care mă pricep" hint="Nivelurile 7–10 te califică drept mentor (după test)." value={d.strong}
          onChange={(strong) => setD({ ...d, strong })} verified={user.verified} onVerify={onVerify} mentor />
        <SkillPicker title="Materiile la care am nevoie de ajutor" hint="Nivelurile 1–6 te plasează drept elev." value={d.weak} onChange={(weak) => setD({ ...d, weak })} />
      </div>
      <div className="flex justify-end">
        <button onClick={save} className="btn-primary !px-6">{saved ? <><BadgeCheck size={16} /> Profil salvat!</> : <><Save size={16} /> Salvează profilul</>}</button>
      </div>
    </div>
  );
}

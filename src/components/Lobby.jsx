import { useEffect, useMemo, useState } from 'react';
import { Users, Lock, PlusCircle, BadgeCheck, Megaphone, Crown, GraduationCap, ArrowRight, Filter, ExternalLink, Sparkles } from 'lucide-react';
import { ADS, GRADES, LEVELS, MAX_MEMBERS, SUBJECTS, SUBJECT_ICONS, SESSION_COST } from '../data.js';
import { Avatar, Stars, entryInfo } from '../utils.jsx';

export function AdBanner() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % ADS.length), 6000);
    return () => clearInterval(t);
  }, []);
  const ad = ADS[i];
  return (
    <aside className={`animate-fadeUp relative overflow-hidden rounded-2xl bg-gradient-to-r ${ad.grad} p-5 text-white shadow-soft transition-all`} key={i}>
      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-white/70">
        <span>Spațiu Publicitar · Parteneri Akademos</span>
        <span className="rounded-full bg-white/20 px-2 py-0.5">{ad.tag}</span>
      </div>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-extrabold">{ad.title}</h3>
          <p className="mt-1 max-w-xl text-sm text-white/85">{ad.text}</p>
        </div>
        <button className="btn shrink-0 bg-white text-ink hover:bg-white/90">{ad.cta} <ExternalLink size={14} /></button>
      </div>
      <div className="mt-3 flex gap-1.5">
        {ADS.map((_, k) => <button key={k} onClick={() => setI(k)} aria-label={`Reclama ${k + 1}`} className={`h-1.5 rounded-full transition-all ${k === i ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`} />)}
      </div>
    </aside>
  );
}

function RoomCard({ room, open, mine, onJoin, urgent, getRating }) {
  const Icon = SUBJECT_ICONS[room.subject];
  const full = room.members.length >= MAX_MEMBERS;
  const empty = room.members.length === 0;
  const locked = full || !open || !!room.startedAt;
  const lvl = LEVELS[room.level - 1];
  const hasMentor = room.members.some((m) => m.role === 'mentor');
  return (
    <article className={`card animate-fadeUp flex flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-lg ${locked ? 'opacity-90' : ''}`}>
      <div className="flex items-start gap-3">
        <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${locked ? 'bg-slate-200 text-slate-500 dark:bg-white/10' : 'bg-blurple text-white'}`}><Icon size={22} /></div>
        <div className="min-w-0 flex-1">
          {room.hosted && <span className="badge mb-1 bg-amber-400/20 text-amber-700 dark:text-amber-300"><Crown size={11} /> Sesiune oficială</span>}
          <h3 className="font-bold leading-tight">{room.subject} / {room.grade} / {lvl.label}</h3>
          <p className="mt-0.5 text-xs text-ink/60 dark:text-slate-400">{lvl.desc}</p>
        </div>
        <span className="badge-lav shrink-0"><Users size={12} /> {room.members.length}/{MAX_MEMBERS} elevi</span>
      </div>

      <div className="mt-4 min-h-[88px] space-y-1.5">
        {room.members.length === 0 && <p className="text-sm italic text-ink/50 dark:text-slate-500">Niciun elev în așteptare. Fii primul!</p>}
        {room.members.map((m) => (
          <div key={m.id} className="flex items-center gap-2 text-sm">
            <Avatar name={m.name} size="h-6 w-6" text="text-[10px]" />
            <span className="truncate">{m.id === 'me' ? 'Tu' : m.name}</span>
            {m.role === 'mentor' && <Stars rating={getRating(m.name)} />}
            {m.role === 'mentor'
              ? <span className="badge ml-auto bg-amber-400/20 text-amber-700 dark:text-amber-300"><Crown size={11} /> Mentor</span>
              : <span className="badge ml-auto bg-lav/30 text-ink dark:bg-lav/20 dark:text-lav"><GraduationCap size={11} /> Elev</span>}
          </div>
        ))}
      </div>

      {!hasMentor && !empty && !full && (
        <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-rose-500"><Megaphone size={12} /> Camera caută un mentor{urgent ? ' urgent!' : ''}</p>
      )}

      <div className="mt-4">
        {mine ? (
          <button onClick={onJoin} className="btn-primary w-full">Ești în cameră — Revino <ArrowRight size={16} /></button>
        ) : locked ? (
          <>
            <button disabled className="btn w-full cursor-not-allowed bg-rose-500/10 text-rose-600 dark:text-rose-300">
              <Lock size={15} /> {empty && !full ? 'Cameră închisă' : 'Intră în Cameră'}
            </button>
            <p className="mt-2 text-center text-xs font-semibold text-rose-500">
              {empty && !full ? 'Se redeschide la :00 / :30' : '🔴 Cameră Blocată - Sesiune în desfășurare (25 min)'}
            </p>
          </>
        ) : (
          <button onClick={onJoin} className="btn-primary w-full">Intră în Cameră <span className="rounded-md bg-white/20 px-1.5 text-xs">{SESSION_COST} cr.</span></button>
        )}
      </div>
    </article>
  );
}

const Select = ({ label, value, onChange, options }) => (
  <label className="block flex-1">
    <span className="label">{label}</span>
    <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Toate</option>
      {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  </label>
);

export default function Lobby({ rooms, alerts, now, demo, onJoin, activeRoomId, user, getRating, onCreate, onGoProfile }) {
  const [f, setF] = useState({ subject: '', grade: '', level: '' });
  const [onlyOpen, setOnlyOpen] = useState(false);
  const { open } = entryInfo(now, demo);

  const list = useMemo(() => rooms.filter((r) =>
    (!f.subject || r.subject === f.subject) && (!f.grade || r.grade === f.grade) && (!f.level || r.level === +f.level) &&
    (!onlyOpen || (open && r.members.length < MAX_MEMBERS))), [rooms, f, onlyOpen, open]);

  return (
    <section id="camere" className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-2xl font-extrabold">Camere Live</h2>
          <p className="text-sm text-ink/60 dark:text-slate-400">O sesiune = {SESSION_COST} credite · maxim 5 elevi / cameră</p>
        </div>
        <span className="badge bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"><Sparkles size={12} /> {rooms.reduce((a, r) => a + r.members.length, 0)} elevi online</span>
      </div>

      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.slice(0, 3).map((a) => {
            const room = rooms.find((r) => r.id === a.roomId);
            const joinable = room && open && room.members.length < MAX_MEMBERS && room.id !== activeRoomId;
            return (
              <div key={a.id} className="animate-slideIn flex flex-wrap items-center gap-3 rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm">
                <Megaphone size={18} className="animate-pulse text-rose-500" />
                <span className="flex-1 font-semibold text-rose-700 dark:text-rose-300">🚨 {a.text}</span>
                {joinable && user && <button onClick={() => onJoin(room)} className="btn-primary !py-1.5 text-xs">Ajută ca mentor</button>}
              </div>
            );
          })}
        </div>
      )}

      {user && (
        <div className="card flex flex-wrap items-center gap-3 p-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ink text-lav"><Crown size={22} /></div>
          {user.verified.length > 0 ? (
            <>
              <div className="min-w-0 flex-1">
                <p className="font-bold">Ești Mentor Verificat</p>
                <p className="flex flex-wrap gap-1.5 text-xs">{user.verified.map((v) => <span key={v} className="badge bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"><BadgeCheck size={11} /> {v}</span>)}</p>
              </div>
              <button onClick={onCreate} disabled={!open || !!activeRoomId} className="btn-primary"
                title={open ? 'Găzduiește o sesiune oficială' : 'Disponibil doar în fereastra de intrare (:00–:05 / :30–:35)'}>
                <PlusCircle size={16} /> Creează Sesiune Live ca Mentor</button>
              {!open && <p className="w-full text-xs font-semibold text-orange-600 dark:text-orange-300">⏳ Poți crea sesiuni doar în fereastra de intrare (:00–:05 / :30–:35).</p>}
            </>
          ) : (
            <p className="min-w-0 flex-1 text-sm text-ink/70 dark:text-slate-300">Vrei să găzduiești sesiuni și să câștigi credite? Treci <b>Testul de Mentorat</b> la o materie din <button onClick={onGoProfile} className="font-bold text-blurple underline">profilul tău</button>.</p>
          )}
        </div>
      )}

      <AdBanner />

      <div className="card flex flex-col gap-3 p-4 md:flex-row md:items-end">
        <Filter size={18} className="hidden text-blurple md:mb-3 md:block" />
        <Select label="Materie" value={f.subject} onChange={(v) => setF({ ...f, subject: v })} options={SUBJECTS.map((s) => ({ v: s, l: s }))} />
        <Select label="Clasă" value={f.grade} onChange={(v) => setF({ ...f, grade: v })} options={GRADES.map((s) => ({ v: s, l: s }))} />
        <Select label="Nivel de dificultate" value={f.level} onChange={(v) => setF({ ...f, level: v })} options={LEVELS.map((l) => ({ v: l.id, l: `Nivel ${l.id}: ${l.label}` }))} />
        <label className="flex cursor-pointer items-center gap-2 pb-2.5 text-sm font-medium">
          <input type="checkbox" className="accent-blurple" checked={onlyOpen} onChange={(e) => setOnlyOpen(e.target.checked)} /> Doar deschise
        </label>
      </div>

      {list.length === 0 ? (
        <div className="card p-10 text-center text-ink/60 dark:text-slate-400">Nicio cameră nu corespunde filtrelor. Încearcă alte opțiuni.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((r) => (
            <RoomCard key={r.id} room={r} open={open} mine={r.id === activeRoomId} onJoin={() => onJoin(r)}
              urgent={alerts.some((a) => a.roomId === r.id)} getRating={getRating} />
          ))}
        </div>
      )}
    </section>
  );
}

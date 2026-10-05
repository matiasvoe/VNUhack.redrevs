import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, MonitorUp, MonitorOff, LogOut, Send, MessageSquare, NotebookPen, Megaphone, Crown, GraduationCap, Users, Loader2, CheckCircle2, Star } from 'lucide-react';
import { CHAT_LINES, LEVELS, MAX_MEMBERS, SUBJECT_ICONS } from '../data.js';
import { Avatar, Stars, hhmm } from '../utils.jsx';
import { RatingModal, ReportModal } from './Extras.jsx';

function Wave({ active }) {
  return (
    <div className="flex h-6 items-end gap-0.5" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className={`wave-bar w-1 rounded-full ${active ? 'animate-wave bg-emerald-400' : 'bg-white/20'}`}
          style={{ height: '100%', animationDelay: `${i * 0.12}s`, transform: active ? undefined : 'scaleY(.2)' }} />
      ))}
    </div>
  );
}

function SimulatedScreen() {
  const ref = useRef();
  useEffect(() => {
    const c = ref.current; const x = c.getContext('2d'); let t = 0; let raf;
    const draw = () => {
      t += 0.03; x.fillStyle = '#0F111A'; x.fillRect(0, 0, 640, 360);
      x.strokeStyle = '#26304f'; x.lineWidth = 1;
      for (let i = 0; i < 640; i += 40) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 360); x.stroke(); }
      for (let i = 0; i < 360; i += 40) { x.beginPath(); x.moveTo(0, i); x.lineTo(640, i); x.stroke(); }
      x.strokeStyle = '#A5B4FC'; x.lineWidth = 2.5; x.beginPath();
      for (let i = 0; i <= 640; i += 4) { const y = 180 - Math.sin(i / 50 + t) * 70; i ? x.lineTo(i, y) : x.moveTo(i, y); }
      x.stroke();
      x.strokeStyle = '#6366F1'; x.beginPath();
      for (let i = 0; i <= 640; i += 4) { const y = 180 - Math.cos(i / 50 + t) * 70; i ? x.lineTo(i, y) : x.moveTo(i, y); }
      x.stroke();
      x.fillStyle = '#fff'; x.font = 'bold 20px Inter, sans-serif'; x.fillText("f(x) = sin(x)   →   f'(x) = cos(x)", 24, 40);
      x.fillStyle = '#A5B4FC'; x.font = '14px Inter, sans-serif'; x.fillText('Prezentare simulată · Derivate și funcții trigonometrice', 24, 340);
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} width="640" height="360" className="aspect-video w-full rounded-xl bg-night" />;
}

function ScreenShare({ share, onStop }) {
  const v = useRef();
  useEffect(() => { if (v.current && share.stream) v.current.srcObject = share.stream; }, [share]);
  return (
    <div className="card animate-pop overflow-hidden p-3">
      <div className="mb-2 flex items-center justify-between text-sm font-bold">
        <span className="flex items-center gap-2"><MonitorUp size={16} className="text-blurple" /> Ecran partajat de tine {share.stream ? '' : '(simulat)'}</span>
        <button onClick={onStop} className="btn-danger !px-3 !py-1 text-xs">Oprește partajarea</button>
      </div>
      {share.stream
        ? <video ref={v} autoPlay muted playsInline className="aspect-video max-h-[50vh] w-full rounded-xl bg-black object-contain" />
        : <SimulatedScreen />}
    </div>
  );
}

export default function StudyRoom({ room, now, user, onLeave, onAddBot, onUrgent, onRate, getRating, toast }) {
  const [muted, setMuted] = useState(false);
  const [share, setShare] = useState(null);
  const [tab, setTab] = useState('chat');
  const [speaker, setSpeaker] = useState(null);
  const [msgs, setMsgs] = useState([{ id: 0, sys: true, text: 'Bine ai venit! Sesiunea începe când camera are 5 elevi sau când se închide fereastra de intrare.', t: hhmm() }]);
  const [draft, setDraft] = useState('');
  const [notes, setNotes] = useState(() => { try { return localStorage.getItem(`akademos_notes_${room.id}`) || ''; } catch { return ''; } });
  const [urgentSent, setUrgentSent] = useState(false);
  const endRef = useRef();
  const started = !!room.startedAt;
  const [forceEnd, setForceEnd] = useState(false);
  const [rating, setRating] = useState(false);
  const [report, setReport] = useState(false);
  const askedRef = useRef(false);
  const over = started && (forceEnd || now.getTime() >= room.endsAt);
  const me = room.members.find((m) => m.id === 'me');
  const mentorsToRate = room.members.filter((m) => m.role === 'mentor' && m.id !== 'me');
  const lvl = LEVELS[room.level - 1];
  const Icon = SUBJECT_ICONS[room.subject];
  const hasMentor = room.members.some((m) => m.role === 'mentor');
  const botRef = useRef(onAddBot); botRef.current = onAddBot;

  // Potrivire automată: intră colegi până la 5 participanți
  useEffect(() => {
    if (started || room.members.length >= MAX_MEMBERS) return;
    const t = setTimeout(() => botRef.current(room.id), 1800 + Math.random() * 1500);
    return () => clearTimeout(t);
  }, [started, room.members.length, room.id]);

  // Vorbitor activ (animație soundwave)
  useEffect(() => {
    if (!started || over) { setSpeaker(null); return; }
    const t = setInterval(() => {
      const c = room.members.filter((m) => m.id !== 'me' || !muted);
      setSpeaker(c.length ? c[Math.floor(Math.random() * c.length)].id : null);
    }, 2200);
    return () => clearInterval(t);
  }, [started, over, room.members, muted]);

  // Mesaje automate de la colegi
  useEffect(() => {
    if (!started || over) return;
    const t = setInterval(() => {
      const others = room.members.filter((m) => m.id !== 'me');
      if (!others.length) return;
      const m = others[Math.floor(Math.random() * others.length)];
      const pool = CHAT_LINES[m.role]; const text = pool[Math.floor(Math.random() * pool.length)];
      setMsgs((x) => [...x, { id: Date.now(), from: m.name, role: m.role, text, t: hhmm() }]);
    }, 9000);
    return () => clearInterval(t);
  }, [started, over, room.members]);

  useEffect(() => {
    if (over && !askedRef.current && me?.role === 'learner' && mentorsToRate.length) { askedRef.current = true; setRating(true); }
  }, [over, me, mentorsToRate.length]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [msgs, tab]);
  useEffect(() => { try { localStorage.setItem(`akademos_notes_${room.id}`, notes); } catch { /* ignorat */ } }, [notes, room.id]);
  useEffect(() => () => { share?.stream?.getTracks().forEach((t) => t.stop()); }, [share]);

  const send = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    setMsgs((x) => [...x, { id: Date.now(), from: 'Tu', me: true, text: draft.trim(), t: hhmm() }]);
    setDraft('');
  };
  const stopShare = () => { share?.stream?.getTracks().forEach((t) => t.stop()); setShare(null); };
  const startShare = async () => {
    if (share) return stopShare();
    try {
      if (!navigator.mediaDevices?.getDisplayMedia) throw new Error('indisponibil');
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      stream.getVideoTracks()[0].addEventListener('ended', () => setShare(null));
      setShare({ stream });
      toast('Partajezi ecranul cu grupul.');
    } catch {
      setShare({ stream: null });
      toast('Partajarea nativă nu este disponibilă — afișăm o prezentare simulată.');
    }
  };
  const urgent = () => { onUrgent(room); setUrgentSent(true); };

  const slots = Array.from({ length: MAX_MEMBERS }, (_, i) => room.members[i] || null);
  const tabs = [['chat', 'Chat Sesiune', MessageSquare], ['notes', 'Caiet Comun / Notițe', NotebookPen], ['mentor', 'Cere Mentor Urgent', Megaphone]];

  return (
    <div className="animate-fadeUp space-y-4">
      <div className="card flex flex-wrap items-center gap-4 p-4">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-blurple text-white"><Icon size={24} /></div>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-extrabold">{room.subject}</h1>
          <div className="mt-1 flex flex-wrap gap-1.5"><span className="badge-lav">{room.grade}</span><span className="badge-lav">{lvl.label}</span>
            <span className="badge-lav"><Users size={11} /> {room.members.length}/{MAX_MEMBERS}</span></div>
        </div>
        <span className={`badge px-3 py-1.5 text-xs ${over ? 'bg-slate-500/20' : started ? 'bg-rose-500/15 text-rose-600 dark:text-rose-300' : 'bg-orange-500/15 text-orange-600'}`}>
          {over ? 'Sesiune încheiată' : started ? 'Sesiune în desfășurare' : 'Se formează grupul'}
        </span>
      </div>

      {!started && (
        <div className="flex animate-slideIn items-center gap-3 rounded-xl border border-orange-400/40 bg-orange-500/10 px-4 py-3 text-sm font-semibold text-orange-700 dark:text-orange-300">
          <Loader2 size={18} className="animate-spin" /> Potrivire automată: se echilibrează mentori și elevi... Camera se blochează la 5 participanți sau când se închide fereastra de intrare (:05 / :35).
        </div>
      )}
      {started && !over && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-600 dark:text-rose-300">🔴 Cameră Blocată - Sesiune în desfășurare (25 min)
          <button onClick={() => setForceEnd(true)} className="ml-auto text-[11px] font-medium underline opacity-70 hover:opacity-100">Demo: încheie sesiunea acum</button></div>
      )}
      {over && (
        <div className="flex animate-pop items-center gap-3 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 size={18} /> Sesiunea s-a încheiat. Mulțumim pentru implicare!
          <span className="ml-auto flex gap-2">
            {me?.role === 'learner' && mentorsToRate.length > 0 && <button onClick={() => setRating(true)} className="btn-ghost !py-1.5"><Star size={15} /> Evaluează Mentorul</button>}
            <button onClick={onLeave} className="btn-primary !py-1.5">Închide camera</button>
          </span>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          {share && <ScreenShare share={share} onStop={stopShare} />}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {slots.map((m, i) => m ? (
              <div key={m.id} className={`animate-pop relative flex flex-col items-center rounded-2xl bg-ink p-4 text-white transition ${speaker === m.id ? 'ring-2 ring-emerald-400 shadow-lg shadow-emerald-500/30' : 'ring-1 ring-white/10'}`}>
                <Avatar name={m.id === 'me' ? user.name : m.name} size="h-16 w-16" text="text-xl" ring={speaker === m.id ? 'ring-4 ring-emerald-400/60' : ''} />
                <p className="mt-2 max-w-full truncate text-sm font-bold">{m.id === 'me' ? `${user.name} (Tu)` : m.name}</p>
                {m.role === 'mentor'
                  ? <><span className="badge mt-1 bg-amber-400/25 text-amber-300"><Crown size={11} /> Mentor</span><Stars rating={getRating(m.name)} className="mt-1" /></>
                  : <span className="badge mt-1 bg-lav/25 text-lav"><GraduationCap size={11} /> Elev</span>}
                <p className="mt-1 text-[11px] text-white/50">{m.grade}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Wave active={speaker === m.id && !(m.id === 'me' && muted)} />
                  {m.id === 'me' && muted && <MicOff size={14} className="text-rose-400" />}
                </div>
              </div>
            ) : (
              <div key={`e${i}`} className="flex min-h-[190px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-lav/50 text-center text-sm text-ink/50 dark:text-slate-500">
                <Loader2 size={20} className="mb-2 animate-spin" /> Se așteaptă un elev...
              </div>
            ))}
          </div>

          <div className="card flex flex-wrap items-center justify-center gap-3 p-4">
            <button onClick={() => setMuted(!muted)} className={muted ? 'btn-danger' : 'btn-ghost'}>{muted ? <MicOff size={18} /> : <Mic size={18} />} {muted ? 'Activează Microfonul' : 'Mute Microfon'}</button>
            <button onClick={startShare} className={share ? 'btn-primary' : 'btn-ghost'} disabled={!started || over}>{share ? <MonitorOff size={18} /> : <MonitorUp size={18} />} {share ? 'Oprește Partajarea' : 'Partajează Ecranul'}</button>
            <button onClick={() => setReport(true)} className="btn bg-amber-400 font-extrabold text-ink shadow-md shadow-amber-400/30 hover:bg-amber-300">🚨 Raportează</button>
            <button onClick={onLeave} className="btn-danger"><LogOut size={18} /> Părăsește Sesiunea</button>
          </div>
          {!started && <p className="text-center text-xs text-ink/50 dark:text-slate-500">Partajarea ecranului se activează la începutul sesiunii. Dacă pleci acum, creditele îți sunt returnate.</p>}
        </div>

        <aside className="card flex h-[560px] flex-col overflow-hidden lg:h-[640px]">
          <div className="flex border-b border-lav/40 dark:border-white/10">
            {tabs.map(([id, label, I]) => (
              <button key={id} onClick={() => setTab(id)} title={label}
                className={`flex flex-1 flex-col items-center gap-0.5 px-1 py-2.5 text-[11px] font-bold transition ${tab === id ? 'border-b-2 border-blurple text-blurple' : 'text-ink/50 hover:bg-lav/10 dark:text-slate-400'}`}>
                <I size={16} /><span className="leading-tight">{label}</span>
              </button>
            ))}
          </div>
          {tab === 'chat' && (
            <>
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {msgs.map((m) => m.sys ? (
                  <p key={m.id} className="rounded-lg bg-lav/20 px-3 py-2 text-center text-xs text-ink/70 dark:text-slate-300">{m.text}</p>
                ) : (
                  <div key={m.id} className={`animate-fadeUp flex flex-col ${m.me ? 'items-end' : 'items-start'}`}>
                    <span className="mb-0.5 text-[11px] text-ink/50 dark:text-slate-400">{m.from}{m.role === 'mentor' && ' · Mentor'} · {m.t}</span>
                    <p className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${m.me ? 'rounded-br-sm bg-blurple text-white' : 'rounded-bl-sm bg-app dark:bg-night'}`}>{m.text}</p>
                  </div>
                ))}
                <div ref={endRef} />
              </div>
              <form onSubmit={send} className="flex gap-2 border-t border-lav/40 p-3 dark:border-white/10">
                <input className="input" placeholder="Scrie un mesaj..." value={draft} onChange={(e) => setDraft(e.target.value)} />
                <button className="btn-primary !px-3" aria-label="Trimite"><Send size={16} /></button>
              </form>
            </>
          )}
          {tab === 'notes' && (
            <div className="flex flex-1 flex-col p-3">
              <p className="mb-2 text-xs text-ink/60 dark:text-slate-400">Caiet comun: scrieți formule și notițe (ex. x² − 5x + 6 = 0 → x₁ = 2, x₂ = 3). Se salvează automat.</p>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Începe să scrii notițe..." className="input flex-1 resize-none font-mono" />
              <p className="mt-1 text-right text-[11px] text-ink/40">{notes.length} caractere</p>
            </div>
          )}
          {tab === 'mentor' && (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
              <div className={`grid h-16 w-16 place-items-center rounded-full ${hasMentor ? 'bg-emerald-500/15 text-emerald-500' : 'bg-rose-500/15 text-rose-500'}`}>{hasMentor ? <Crown size={30} /> : <Megaphone size={30} />}</div>
              {hasMentor ? (
                <p className="text-sm font-semibold">Camera are deja un mentor verificat. 🎉 Dacă totuși ai nevoie de mai mult sprijin, poți trimite o alertă.</p>
              ) : (
                <p className="text-sm font-semibold">Camera nu are niciun mentor (nivel 7–10). Trimite o alertă către toți elevii din lobby.</p>
              )}
              <button onClick={urgent} disabled={urgentSent || over} className="btn-danger w-full"><Megaphone size={16} /> {urgentSent ? 'Alertă trimisă!' : 'Cere Mentor Urgent'}</button>
              <p className="text-xs text-ink/50 dark:text-slate-500">Mesaj trimis în lobby: „Avem nevoie de un mentor la {room.subject} {room.grade}!”</p>
            </div>
          )}
        </aside>
      </div>
      {rating && <RatingModal mentors={mentorsToRate} getRating={getRating} onClose={() => setRating(false)}
        onSubmit={(l) => { onRate(l); setRating(false); toast('Mulțumim pentru evaluare!'); }} />}
      {report && <ReportModal members={room.members} onClose={() => setReport(false)}
        onSubmit={() => { setReport(false); toast('Raportul a fost trimis echipei de moderare. Mulțumim!'); }} />}
    </div>
  );
}

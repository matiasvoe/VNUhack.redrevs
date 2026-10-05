import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, Info } from 'lucide-react';
import Header from './components/Header.jsx';
import Flashcards from './components/Flashcards.jsx';
import { PaywallModal } from './components/Extras.jsx';
import Lobby from './components/Lobby.jsx';
import AuthModal from './components/AuthModal.jsx';
import PlansModal from './components/PlansModal.jsx';
import QuizModal from './components/QuizModal.jsx';
import StudyRoom from './components/StudyRoom.jsx';
import { AboutView, Hero, ProfileView } from './components/Pages.jsx';
import { MAX_MEMBERS, SESSION_COST, buildRooms, makeBot, seedRating } from './data.js';
import { cycleEnd, entryInfo, useLocalStorage, useNow } from './utils.jsx';

export default function App() {
  const realNow = useNow();
  const [off, setOffState] = useState(0); // decalaj al ceasului global (doar în modul demonstrație)
  const offRef = useRef(0);
  const setOff = (v) => { offRef.current = v; setOffState(v); };
  const now = new Date(realNow.getTime() + off);
  const vnow = () => Date.now() + offRef.current;
  const startRoom = (r, ts) => ({ ...r, startedAt: ts, endsAt: cycleEnd(ts) });
  const [dark, setDark] = useLocalStorage('akademos_dark', false);
  const [accounts, setAccounts] = useLocalStorage('akademos_accounts', {});
  const [phone, setPhone] = useLocalStorage('akademos_phone', null);
  const [demo, setDemo] = useLocalStorage('akademos_demo', true);
  const [view, setView] = useState('rooms');
  const [rooms, setRooms] = useState(buildRooms);
  const [alerts, setAlerts] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [ratings, setRatings] = useLocalStorage('akademos_ratings', {});
  const [modal, setModal] = useState(null); // {type:'auth'|'plans'|'quiz'|'paywall', ...}
  const timers = useRef([]);

  const user = phone ? accounts[phone] : null;
  const { open } = entryInfo(now, demo);
  const activeRoom = rooms.find((r) => r.id === activeRoomId);

  useEffect(() => { document.documentElement.classList.toggle('dark', dark); }, [dark]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const toast = useCallback((text, kind = 'ok') => {
    const id = Math.random();
    setToasts((t) => [...t, { id, text, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  const updateUser = (patch) => setAccounts((a) => ({ ...a, [phone]: { ...a[phone], ...(typeof patch === 'function' ? patch(a[phone]) : patch) } }));

  // ---------- Autentificare ----------
  const onAuth = (ph, form) => {
    if (form) {
      setAccounts((a) => ({ ...a, [ph]: { phone: ph, ...form, credits: 50, plan: 'free', strong: {}, weak: {}, verified: [] } }));
      toast('Cont creat! Ai primit 50 de credite gratuite.');
    } else toast('Bine ai revenit!');
    setPhone(ph);
    setModal(null);
    if (form) setView('profile');
  };
  const logout = () => { leaveRoom(true); setPhone(null); setView('rooms'); toast('Te-ai deconectat.', 'info'); };

  // ---------- Camere & potrivire automată ----------
  const addBot = useCallback((roomId, forceRole) => {
    setRooms((rs) => rs.map((r) => {
      if (r.id !== roomId || r.startedAt || r.members.length >= MAX_MEMBERS) return r;
      const mentors = r.members.filter((m) => m.role === 'mentor').length;
      const learners = r.members.length - mentors;
      const role = forceRole || (mentors === 0 ? 'mentor' : learners >= 3 && mentors < 2 ? 'mentor' : 'learner');
      const members = [...r.members, makeBot(role, r.grade, r.members.map((m) => m.name))];
      return members.length >= MAX_MEMBERS ? startRoom({ ...r, members }, vnow()) : { ...r, members };
    }));
  }, []);

  const joinRoom = (room) => {
    if (!user) { setModal({ type: 'auth' }); toast('Conectează-te pentru a intra într-o cameră.', 'info'); return; }
    if (room.id === activeRoomId) { setView('room'); return; }
    if (activeRoomId) { toast('Ești deja într-o cameră. Părăsește sesiunea curentă mai întâi.', 'info'); return; }
    if (user.credits < SESSION_COST) { setModal({ type: 'plans', reason: true }); return; }
    if (!open) { toast('Intrarea este închisă. Revino la :00 sau :30.', 'info'); return; }
    if (room.members.length >= MAX_MEMBERS || room.startedAt) { toast('Camera este blocată.', 'info'); return; }
    const lvl = user.strong[room.subject];
    const mentor = lvl >= 7 && user.verified.includes(room.subject);
    if (lvl >= 7 && !mentor) toast('Ai nivel de mentor, dar nu ești verificat. Intri ca elev — fă Testul de Mentorat din profil.', 'info');
    const me = { id: 'me', name: user.name, school: user.school, grade: user.grade, role: mentor ? 'mentor' : 'learner' };
    updateUser((u) => ({ credits: u.credits - SESSION_COST }));
    // Mod demonstrație în afara ferestrei reale: sincronizăm ceasul global cu începutul unui ciclu nou
    if (!entryInfo(new Date(vnow()), false).open) {
      const d = new Date();
      setOff(2000 - ((d.getMinutes() % 30) * 60000 + d.getSeconds() * 1000 + d.getMilliseconds()));
      toast('Mod demonstrație: ceasul global a fost resetat la începutul unui ciclu nou.', 'info');
    }
    const ts = vnow();
    setRooms((rs) => rs.map((r) => {
      if (r.id !== room.id) return r;
      const members = [...r.members, me];
      return members.length >= MAX_MEMBERS ? startRoom({ ...r, members }, ts) : { ...r, members };
    }));
    setActiveRoomId(room.id);
    setView('room');
    toast(`Ai intrat în cameră. S-au dedus ${SESSION_COST} credite.`);
  };

  function leaveRoom(silent) {
    if (!activeRoom) return;
    const refund = !activeRoom.startedAt;
    const ended = activeRoom.endsAt && vnow() >= activeRoom.endsAt;
    setRooms((rs) => rs.map((r) => {
      if (r.id !== activeRoom.id) return r;
      const members = r.members.filter((m) => m.id !== 'me');
      return ended || members.length === 0 ? { ...r, members: [], startedAt: null, endsAt: null } : { ...r, members };
    }));
    setOff(0);
    if (refund && user) updateUser((u) => ({ credits: u.credits + SESSION_COST }));
    setActiveRoomId(null);
    setView('rooms');
    if (!silent) toast(refund ? `Ai părăsit camera. Ți-au fost returnate ${SESSION_COST} credite.` : 'Ai părăsit sesiunea.', 'info');
  }

  // Hard lock: la închiderea ferestrei, camera în formare pornește cu cei prezenți
  const windowOpen = entryInfo(now, false).open;
  useEffect(() => {
    if (activeRoom && !activeRoom.startedAt && !windowOpen) {
      setRooms((rs) => rs.map((r) => (r.id === activeRoom.id ? startRoom(r, vnow()) : r)));
      toast('Fereastra de intrare s-a închis — camera s-a blocat și sesiunea a început.', 'info');
    }
  }, [windowOpen, activeRoom, toast]);

  // Camerele cu sesiunea încheiată se golesc și se redeschid la următorul ciclu
  const t = now.getTime();
  useEffect(() => {
    setRooms((rs) => (rs.some((r) => r.endsAt && t >= r.endsAt && r.id !== activeRoomId)
      ? rs.map((r) => (r.endsAt && t >= r.endsAt && r.id !== activeRoomId ? { ...r, members: [], startedAt: null, endsAt: null } : r))
      : rs));
  }, [t, activeRoomId]);

  // ---------- Evaluări mentori ----------
  const getRating = (name) => {
    const r = ratings[name] ?? seedRating(name);
    return r && r.count ? { avg: r.sum / r.count, count: r.count } : null;
  };
  const rate = (list) => setRatings((rs) => {
    const n = { ...rs };
    list.forEach(({ name, stars, text }) => {
      const b = n[name] ?? seedRating(name) ?? { sum: 0, count: 0, reviews: [] };
      n[name] = { sum: b.sum + stars, count: b.count + 1, reviews: [...(b.reviews || []), ...(text ? [{ stars, text, by: user.name }] : [])].slice(-5) };
    });
    return n;
  });

  // ---------- Navigare (Flashcard-uri = Pro / Premium) ----------
  const isPaid = user && user.plan !== 'free';
  const navigate = (v) => {
    if (v === 'flashcards') {
      if (!user) { setModal({ type: 'auth' }); toast('Conectează-te pentru a accesa flashcard-urile.', 'info'); return; }
      if (!isPaid) { setModal({ type: 'paywall' }); return; }
    }
    setView(v);
  };

  const urgent = (room) => {
    const text = `Avem nevoie de un mentor la ${room.subject} ${room.grade}!`;
    setAlerts((a) => [{ id: Math.random(), text, roomId: room.id }, ...a]);
    toast('Alerta a fost trimisă în lobby.');
    if (!room.members.some((m) => m.role === 'mentor')) {
      timers.current.push(setTimeout(() => { addBot(room.id, 'mentor'); toast('Un mentor a răspuns alertei și s-a alăturat camerei! 🎉'); }, 7000));
    }
  };

  // ---------- Credite & abonamente ----------
  const choosePlan = (p) => { updateUser((u) => ({ plan: p.id, credits: u.credits + p.credits })); setModal(null); toast(`Plan ${p.name} activat: +${p.credits} credite.`); };
  const buyPack = (c) => { updateUser((u) => ({ credits: u.credits + c.credits })); setModal(null); toast(`Ai cumpărat ${c.credits} credite.`); };

  const onQuizPass = useCallback((subject) => {
    setAccounts((a) => { const u = a[phone]; return u.verified.includes(subject) ? a : { ...a, [phone]: { ...u, verified: [...u.verified, subject] } }; });
    toast(`Insigna Mentor Verificat obținută la ${subject}!`);
  }, [phone, setAccounts, toast]);

  const saveDecks = (decks) => updateUser({ decks });
  const goRooms = () => { setView('rooms'); setTimeout(() => document.getElementById('camere')?.scrollIntoView({ behavior: 'smooth' }), 50); };

  return (
    <div className="min-h-screen">
      <Header view={view} setView={navigate} dark={dark} setDark={setDark} user={user} inRoom={!!activeRoom} now={now} demo={demo} setDemo={setDemo}
        onLogin={() => setModal({ type: 'auth' })} onPlans={() => setModal({ type: 'plans' })} />
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        {view === 'rooms' && (
          <>
            <Hero user={user} onStart={goRooms} onLogin={() => setModal({ type: 'auth' })} />
            <Lobby rooms={rooms} alerts={alerts} now={now} demo={demo} onJoin={joinRoom} activeRoomId={activeRoomId} user={user} getRating={getRating} />
          </>
        )}
        {view === 'flashcards' && isPaid && <Flashcards user={user} rooms={rooms} onSaveDecks={saveDecks} toast={toast} />}
        {view === 'about' && <AboutView onStart={goRooms} />}
        {view === 'profile' && (
          <ProfileView key={phone} user={user} rating={user ? getRating(user.name) : null} onLogin={() => setModal({ type: 'auth' })} onLogout={logout}
            onPlans={() => setModal({ type: 'plans' })} onVerify={(s) => setModal({ type: 'quiz', subject: s })}
            onSave={(d) => { updateUser(d); toast('Profilul a fost salvat.'); }} />
        )}
        {view === 'room' && activeRoom && user && (
          <StudyRoom key={activeRoom.id} room={activeRoom} now={now} user={user} onLeave={() => leaveRoom()} onAddBot={addBot} onUrgent={urgent} onRate={rate} getRating={getRating} toast={toast} />
        )}
      </main>
      <footer className="py-8 text-center text-xs text-ink/50 dark:text-slate-500">© 2026 Akademos · Schimb de cunoștințe între elevi</footer>

      {modal?.type === 'auth' && <AuthModal accounts={accounts} onClose={() => setModal(null)} onDone={onAuth} />}
      {modal?.type === 'plans' && user && <PlansModal user={user} reason={modal.reason} onClose={() => setModal(null)} onPlan={choosePlan} onPack={buyPack} />}
      {modal?.type === 'paywall' && <PaywallModal onClose={() => setModal(null)} onUpgrade={() => setModal({ type: 'plans' })} />}
      {modal?.type === 'quiz' && <QuizModal subject={modal.subject} onClose={() => setModal(null)} onPass={onQuizPass} />}

      <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[min(92vw,360px)] flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className="animate-slideIn pointer-events-auto flex items-start gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-medium text-white shadow-xl">
            {t.kind === 'ok' ? <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-400" /> : <Info size={18} className="mt-0.5 shrink-0 text-lav" />}
            <span>{t.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

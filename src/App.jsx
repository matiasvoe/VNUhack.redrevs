import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, Info } from 'lucide-react';
import Header from './components/Header.jsx';
import Flashcards from './components/Flashcards.jsx';
import { CreateSessionModal, PaywallModal } from './components/Extras.jsx';
import { CashoutModal } from './components/Wallet.jsx';
import Lobby from './components/Lobby.jsx';
import AuthModal from './components/AuthModal.jsx';
import PlansModal from './components/PlansModal.jsx';
import QuizModal from './components/QuizModal.jsx';
import StudyRoom from './components/StudyRoom.jsx';
import { AboutView, Hero, ProfileView } from './components/Pages.jsx';
import { GRADES, LEVELS, MAX_MEMBERS, REFERRAL_COUPON, SESSION_COST, buildRooms, makeBot, seedRating } from './data.js';
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
  const [pendingRef, setPendingRef] = useState('');

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

  const genCode = (name, taken) => {
    const base = (name || 'USER').split(' ')[0].normalize('NFD').replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 8) || 'USER';
    let c; do { c = base + Math.floor(100 + Math.random() * 900); } while (taken.includes(c));
    return c;
  };

  const updateUser = (patch) => setAccounts((a) => ({ ...a, [phone]: { ...a[phone], ...(typeof patch === 'function' ? patch(a[phone]) : patch) } }));

  // ---------- Recomandări ----------
  const newCoupon = () => ({ id: `c${Date.now()}${Math.random()}`, pct: REFERRAL_COUPON.pct, label: REFERRAL_COUPON.label, used: false });
  const rewardReferrer = (acc, code, friend) => {
    const entry = Object.entries(acc).find(([, u]) => u.refCode && u.refCode === code);
    if (!entry) return acc;
    const [key, u] = entry;
    return { ...acc, [key]: { ...u, referrals: [{ id: Math.random(), name: friend, ts: Date.now() }, ...(u.referrals || [])], coupons: [...(u.coupons || []), newCoupon()] } };
  };
  const simReferral = () => {
    const friends = ['Andrei M.', 'Ioana P.', 'Radu T.', 'Elena V.', 'Matei C.'];
    const name = friends[Math.floor(Math.random() * friends.length)];
    setAccounts((a) => rewardReferrer(a, user.refCode, name));
    toast(`${name} s-a înregistrat cu linkul tău! Ai primit cuponul „${REFERRAL_COUPON.label}”.`);
  };
  useEffect(() => {
    const m = window.location.pathname.match(/\/ref\/([A-Za-z0-9]+)/) || window.location.search.match(/[?&]ref=([A-Za-z0-9]+)/);
    if (m) { setPendingRef(m[1].toUpperCase()); if (!phone) setModal({ type: 'auth' }); }
  }, []);
  // completează câmpurile noi pentru conturile create înainte de aceste funcții
  useEffect(() => {
    if (user && user.refCode === undefined) {
      updateUser((u) => ({ refCode: genCode(u.name, Object.values(accounts).map((x) => x.refCode)), referrals: [], coupons: [], earned: 0, tx: [] }));
    }
  }, [user]);

  // ---------- Autentificare ----------
  const onAuth = (ph, form) => {
    if (form) {
      const { ref, ...profile } = form;
      setAccounts((a) => {
        const created = { ...a, [ph]: { phone: ph, ...profile, credits: 50, plan: 'free', strong: {}, weak: {}, verified: [], decks: undefined, earned: 0, tx: [], referrals: [], coupons: [], refCode: genCode(profile.name, Object.values(a).map((x) => x.refCode)) } };
        const code = (ref || '').toUpperCase();
        return code && !Object.values(a).some((u) => u.refCode === code && u.phone === ph) ? rewardReferrer(created, code, profile.name) : created;
      });
      toast(ref ? 'Cont creat cu cod de recomandare! Ai primit 50 de credite gratuite.' : 'Cont creat! Ai primit 50 de credite gratuite.');
      setPendingRef('');
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
      const role = forceRole || (r.hosted ? 'learner' : mentors === 0 ? 'mentor' : learners >= 3 && mentors < 2 ? 'mentor' : 'learner');
      const members = [...r.members, makeBot(role, r.grade, r.members.map((m) => m.name))];
      return members.length >= MAX_MEMBERS ? startRoom({ ...r, members }, vnow()) : { ...r, members };
    }));
  }, []);

  // Mod demonstrație în afara ferestrei reale: sincronizăm ceasul global cu începutul unui ciclu nou
  const syncDemoClock = () => {
    if (!entryInfo(new Date(vnow()), false).open) {
      const d = new Date();
      setOff(2000 - ((d.getMinutes() % 30) * 60000 + d.getSeconds() * 1000 + d.getMilliseconds()));
      toast('Mod demonstrație: ceasul global a fost resetat la începutul unui ciclu nou.', 'info');
    }
  };

  const createRoom = ({ subject, grade, level }) => {
    if (activeRoomId) { toast('Ești deja într-o cameră.', 'info'); return; }
    if (!open) { toast('Poți crea sesiuni doar în fereastra de intrare (:00–:05 / :30–:35).', 'info'); return; }
    if (!user.verified.includes(subject)) { toast('Trebuie să fii Mentor Verificat la această materie.', 'info'); return; }
    syncDemoClock();
    const me = { id: 'me', name: user.name, school: user.school, grade: user.grade, role: 'mentor' };
    const id = `h${Date.now()}`;
    setRooms((rs) => [{ id, subject, grade, level, members: [me], startedAt: null, endsAt: null, hosted: true, hostId: 'me' }, ...rs]);
    setActiveRoomId(id);
    setModal(null);
    setView('room');
    toast('Sesiunea ta live a fost creată. Elevii se vor alătura în curând.');
  };

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
    syncDemoClock();
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
    const hosted = activeRoom.hostId === 'me';
    const refund = !activeRoom.startedAt && !hosted;
    const ended = activeRoom.endsAt && vnow() >= activeRoom.endsAt;
    if (hosted) setRooms((rs) => rs.filter((r) => r.id !== activeRoom.id));
    else setRooms((rs) => rs.map((r) => {
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
      ? rs.filter((r) => !(r.hosted && r.endsAt && t >= r.endsAt && r.id !== activeRoomId)).map((r) => (r.endsAt && t >= r.endsAt && r.id !== activeRoomId ? { ...r, members: [], startedAt: null, endsAt: null } : r))
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
  const coupon = (user?.coupons || []).find((c) => !c.used);
  const choosePlan = (p) => {
    const useCoupon = coupon && p.id === 'pro';
    updateUser((u) => ({ plan: p.id, credits: u.credits + p.credits, coupons: useCoupon ? u.coupons.map((c) => (c.id === coupon.id ? { ...c, used: true } : c)) : u.coupons }));
    setModal(null);
    toast(useCoupon ? `Plan Pro activat cu ${coupon.label}: +${p.credits} credite.` : `Plan ${p.name} activat: +${p.credits} credite.`);
  };
  const earn = useCallback((e) => updateUser((u) => ((u.tx || []).some((x) => x.key === e.key) ? {} : {
    earned: (u.earned || 0) + e.each,
    tx: [{ id: `t${Date.now()}`, key: e.key, type: 'earn', credits: e.each, note: `${e.note} · ${e.students} elevi`, ts: Date.now() }, ...(u.tx || [])],
  })), [phone]);
  const cashOut = ({ credits, iban }) => {
    updateUser((u) => ({ earned: u.earned - credits, tx: [{ id: `t${Date.now()}`, type: 'cashout', credits, note: `IBAN •••• ${iban.slice(-4)}`, ts: Date.now() }, ...(u.tx || [])] }));
    setModal(null);
    toast(`Retragere înregistrată: ${credits} credite → ${(credits * 0.2).toFixed(2).replace('.', ',')} RON.`);
  };
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
            <Lobby rooms={rooms} alerts={alerts} now={now} demo={demo} onJoin={joinRoom} activeRoomId={activeRoomId} user={user} getRating={getRating}
              onCreate={() => setModal({ type: 'create' })} onGoProfile={() => setView('profile')} />
          </>
        )}
        {view === 'flashcards' && isPaid && <Flashcards user={user} rooms={rooms} onSaveDecks={saveDecks} toast={toast} />}
        {view === 'about' && <AboutView onStart={goRooms} />}
        {view === 'profile' && (
          <ProfileView key={phone} user={user} rating={user ? getRating(user.name) : null} onLogin={() => setModal({ type: 'auth' })} onLogout={logout}
            onPlans={() => setModal({ type: 'plans' })} onVerify={(s) => setModal({ type: 'quiz', subject: s })}
            onSave={(d) => { updateUser(d); toast('Profilul a fost salvat.'); }}
            onCashOut={() => setModal({ type: 'cashout' })} onSimReferral={simReferral} toast={toast} />
        )}
        {view === 'room' && activeRoom && user && (
          <StudyRoom key={activeRoom.id} room={activeRoom} now={now} user={user} onLeave={() => leaveRoom()} onAddBot={addBot} onUrgent={urgent} onRate={rate} onEarn={earn} getRating={getRating} toast={toast} />
        )}
      </main>
      <footer className="py-8 text-center text-xs text-ink/50 dark:text-slate-500">© 2026 Akademos · Schimb de cunoștințe între elevi</footer>

      {modal?.type === 'auth' && <AuthModal initialRef={pendingRef} accounts={accounts} onClose={() => setModal(null)} onDone={onAuth} />}
      {modal?.type === 'plans' && user && <PlansModal user={user} coupon={coupon} reason={modal.reason} onClose={() => setModal(null)} onPlan={choosePlan} onPack={buyPack} />}
      {modal?.type === 'paywall' && <PaywallModal onClose={() => setModal(null)} onUpgrade={() => setModal({ type: 'plans' })} />}
      {modal?.type === 'create' && user && <CreateSessionModal user={user} levels={LEVELS} grades={GRADES} onClose={() => setModal(null)} onCreate={createRoom} />}
      {modal?.type === 'cashout' && user && <CashoutModal user={user} onClose={() => setModal(null)} onSubmit={cashOut} />}
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

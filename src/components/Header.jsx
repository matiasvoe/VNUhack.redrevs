import { useState } from 'react';
import { GraduationCap, Moon, Sun, Wallet, Plus, User, LogIn, Menu, X } from 'lucide-react';

export default function Header({ view, setView, dark, setDark, user, onLogin, onPlans, inRoom }) {
  const [open, setOpen] = useState(false);
  const links = [
    ['rooms', 'Camere Live'],
    ['about', 'Despre Noi'],
    ['profile', 'Profilul Meu'],
  ];
  const go = (v) => { setView(v); setOpen(false); };
  return (
    <header className="sticky top-0 z-40 bg-ink text-white shadow-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
        <button onClick={() => go('rooms')} className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-blurple"><GraduationCap size={20} /></span>
          <span className="text-lg font-extrabold tracking-tight">Akademos</span>
        </button>
        <nav className="ml-6 hidden gap-1 md:flex">
          {links.map(([id, label]) => (
            <button key={id} onClick={() => go(id)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${view === id || (id === 'rooms' && view === 'room') ? 'bg-white/15' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
              {label}
            </button>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {user && (
            <button onClick={onPlans} title="Adaugă Credite"
              className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold transition hover:bg-white/20">
              <Wallet size={16} className="text-lav" />
              <span>{user.credits} <span className="hidden sm:inline">Credite</span></span>
              <span className="grid h-5 w-5 place-items-center rounded-full bg-blurple"><Plus size={12} /></span>
            </button>
          )}
          <button onClick={() => setDark(!dark)} aria-label="Schimbă tema" className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 transition hover:bg-white/20">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {user ? (
            <button onClick={() => go('profile')} className="btn bg-blurple text-white hover:bg-blurple-dark !px-3">
              <User size={16} /> <span className="hidden sm:inline">Profil</span>
            </button>
          ) : (
            <button onClick={onLogin} className="btn bg-blurple text-white hover:bg-blurple-dark !px-3">
              <LogIn size={16} /> <span className="hidden sm:inline">Conectează-te</span>
            </button>
          )}
          <button className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 md:hidden" onClick={() => setOpen(!open)} aria-label="Meniu">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="animate-fadeUp border-t border-white/10 px-4 pb-3 md:hidden">
          {links.map(([id, label]) => (
            <button key={id} onClick={() => go(id)} className="block w-full rounded-lg px-3 py-3 text-left text-sm font-medium hover:bg-white/10">{label}</button>
          ))}
        </nav>
      )}
      {inRoom && view !== 'room' && (
        <button onClick={() => go('room')} className="w-full animate-pop bg-emerald-500 py-1.5 text-center text-xs font-bold hover:bg-emerald-600">
          Ești într-o cameră — apasă pentru a reveni la sesiune
        </button>
      )}
    </header>
  );
}

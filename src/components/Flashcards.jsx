import { useMemo, useState } from 'react';
import { BookCopy, ChevronLeft, ChevronRight, Eye, Layers, NotebookPen, Plus, RotateCcw, Shuffle, Sparkles, Trash2, Wand2, PenLine, Check, X } from 'lucide-react';
import { SUBJECTS } from '../data.js';

const SAMPLE = {
  id: 'demo', title: 'Formule de bază – Matematică', subject: 'Matematică', sample: true,
  cards: [
    { id: 1, front: 'Derivata lui xⁿ', back: 'n·xⁿ⁻¹' },
    { id: 2, front: 'sin²x + cos²x', back: '1' },
    { id: 3, front: 'Discriminantul Δ al ecuației ax² + bx + c = 0', back: 'Δ = b² − 4ac' },
    { id: 4, front: 'Suma primilor n termeni ai unei progresii aritmetice', back: 'Sₙ = n(a₁ + aₙ) / 2' },
  ],
};

// Generare automată: „termen: definiție” → față/verso, altfel propoziția devine text cu spațiu de completat
export function generateCards(text) {
  const out = [];
  let id = Date.now();
  const lines = text.split('\n').map((l) => l.replace(/^[\s\-•*\d.)]+/, '').trim()).filter(Boolean);
  for (const line of lines) {
    const m = line.match(/^(.{2,70}?)\s*(?::|=|→|->|–|—)\s*(.{2,})$/);
    if (m) { out.push({ id: id++, front: m[1].trim(), back: m[2].trim() }); continue; }
    for (const sent of line.split(/(?<=[.!?])\s+/)) {
      if (sent.length < 28) continue;
      const word = sent.replace(/[.,;:!?()„”"]/g, '').split(/\s+/).filter((w) => w.length >= 6).sort((a, b) => b.length - a.length)[0];
      if (!word) continue;
      out.push({ id: id++, front: sent.replace(word, '_____'), back: `${word} — ${sent}` });
    }
  }
  return out.slice(0, 30);
}

function Study({ deck, onClose }) {
  const [cards, setCards] = useState(deck.cards);
  const [i, setI] = useState(0);
  const [flip, setFlip] = useState(false);
  const [known, setKnown] = useState({});
  const c = cards[i];
  const done = Object.keys(known).length === cards.length;
  const go = (d) => { setFlip(false); setI((i + d + cards.length) % cards.length); };
  const mark = (v) => { setKnown({ ...known, [c.id]: v }); if (i < cards.length - 1) go(1); };
  const score = Object.values(known).filter(Boolean).length;
  if (!cards.length) return <p className="card p-6 text-center">Pachetul nu are cărți.</p>;
  return (
    <div className="card animate-pop space-y-4 p-5">
      <div className="flex items-center justify-between">
        <div><h3 className="font-extrabold">{deck.title}</h3><p className="text-xs text-ink/60 dark:text-slate-400">Cardul {i + 1} din {cards.length} · Știu: {score}</p></div>
        <div className="flex gap-2">
          <button className="btn-ghost !px-3" onClick={() => { setCards([...cards].sort(() => Math.random() - 0.5)); setI(0); setFlip(false); }} title="Amestecă"><Shuffle size={16} /></button>
          <button className="btn-ghost !px-3" onClick={onClose}><X size={16} /> Închide</button>
        </div>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-lav/30"><div className="h-full bg-blurple transition-all" style={{ width: `${((i + 1) / cards.length) * 100}%` }} /></div>
      <button onClick={() => setFlip(!flip)} aria-label="Întoarce cardul" className="block w-full [perspective:1000px]">
        <div className={`relative h-56 w-full transition-transform duration-500 [transform-style:preserve-3d] sm:h-64 ${flip ? '[transform:rotateY(180deg)]' : ''}`}>
          <div className="absolute inset-0 grid place-items-center rounded-2xl bg-ink p-6 text-center text-lg font-bold text-white [backface-visibility:hidden] sm:text-2xl">
            <div><p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-lav">Întrebare</p>{c.front}<p className="mt-4 flex items-center justify-center gap-1 text-xs font-medium text-white/50"><Eye size={12} /> Atinge pentru răspuns</p></div>
          </div>
          <div className="absolute inset-0 grid place-items-center rounded-2xl bg-blurple p-6 text-center text-lg font-bold text-white [backface-visibility:hidden] [transform:rotateY(180deg)] sm:text-2xl">
            <div><p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-white/70">Răspuns</p>{c.back}</div>
          </div>
        </div>
      </button>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button className="btn-ghost !px-3" onClick={() => go(-1)} aria-label="Anterior"><ChevronLeft size={18} /></button>
        <button className="btn bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 dark:text-rose-300" onClick={() => mark(false)}><X size={16} /> Nu știu</button>
        <button className="btn bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300" onClick={() => mark(true)}><Check size={16} /> Știu</button>
        <button className="btn-ghost !px-3" onClick={() => go(1)} aria-label="Următorul"><ChevronRight size={18} /></button>
      </div>
      {done && <p className="animate-pop rounded-xl bg-emerald-500/10 p-3 text-center text-sm font-semibold text-emerald-700 dark:text-emerald-300">Ai parcurs tot pachetul: {score} din {cards.length} cunoscute. <button className="underline" onClick={() => { setKnown({}); setI(0); setFlip(false); }}>Reia</button></p>}
    </div>
  );
}

export default function Flashcards({ user, rooms, onSaveDecks, toast }) {
  const decks = user.decks ?? [SAMPLE];
  const [mode, setMode] = useState('list'); // list | manual | auto
  const [studying, setStudying] = useState(null);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [rows, setRows] = useState([{ id: 1, front: '', back: '' }, { id: 2, front: '', back: '' }]);
  const [src, setSrc] = useState('');
  const [text, setText] = useState('');
  const [preview, setPreview] = useState(null);

  const saved = useMemo(() => {
    const list = [];
    for (const r of rooms) {
      try { const v = localStorage.getItem(`akademos_notes_${r.id}`); if (v && v.trim()) list.push({ id: r.id, label: `${r.subject} / ${r.grade}`, text: v, subject: r.subject }); } catch { /* ignorat */ }
    }
    return list;
  }, [rooms, mode]);

  const reset = () => { setMode('list'); setTitle(''); setRows([{ id: 1, front: '', back: '' }, { id: 2, front: '', back: '' }]); setSrc(''); setText(''); setPreview(null); };
  const save = (cards) => {
    if (!title.trim()) return toast('Dă un nume pachetului.', 'info');
    if (!cards.length) return toast('Adaugă cel puțin un card complet.', 'info');
    onSaveDecks([{ id: `d${Date.now()}`, title: title.trim(), subject, cards }, ...decks.filter((d) => !d.sample)]);
    toast(`Pachetul „${title.trim()}” a fost salvat (${cards.length} carduri).`);
    reset();
  };
  const pickSrc = (id) => { setSrc(id); const s = saved.find((x) => x.id === id); if (s) { setText(s.text); setSubject(s.subject); if (!title) setTitle(`Notițe ${s.label}`); } };
  const generate = () => {
    const cards = generateCards(text);
    if (!cards.length) return toast('Nu am găsit conținut potrivit. Scrie definiții de tip „termen: explicație”.', 'info');
    setPreview(cards);
  };

  return (
    <div className="animate-fadeUp space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold"><Layers className="text-blurple" /> Flashcard-uri <span className="badge bg-blurple text-white">{user.plan === 'premium' ? 'PREMIUM' : 'PRO'}</span></h1>
          <p className="text-sm text-ink/60 dark:text-slate-400">Învață activ: creează pachete manual sau generează-le automat din notițele tale.</p>
        </div>
        {mode === 'list' && !studying && (
          <div className="flex gap-2">
            <button className="btn-ghost" onClick={() => setMode('manual')}><PenLine size={16} /> Pachet manual</button>
            <button className="btn-primary" onClick={() => setMode('auto')}><Wand2 size={16} /> Generează din notițe</button>
          </div>
        )}
      </div>

      {studying && <Study deck={studying} onClose={() => setStudying(null)} />}

      {mode === 'list' && !studying && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {decks.map((d) => (
            <article key={d.id} className="card flex flex-col p-5 transition hover:-translate-y-0.5">
              <div className="mb-3 flex items-start gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blurple text-white"><BookCopy size={22} /></div>
                <div className="min-w-0 flex-1"><h3 className="font-bold leading-tight">{d.title}</h3><p className="text-xs text-ink/60 dark:text-slate-400">{d.subject} · {d.cards.length} carduri</p></div>
                {d.sample && <span className="badge-lav">Exemplu</span>}
              </div>
              <p className="mb-4 line-clamp-2 flex-1 text-sm text-ink/70 dark:text-slate-300">{d.cards.slice(0, 2).map((c) => c.front).join(' · ')}</p>
              <div className="flex gap-2">
                <button className="btn-primary flex-1" onClick={() => setStudying(d)}>Învață</button>
                {!d.sample && <button className="btn-ghost !px-3" aria-label="Șterge pachetul" onClick={() => { onSaveDecks(decks.filter((x) => x.id !== d.id)); toast('Pachet șters.', 'info'); }}><Trash2 size={16} /></button>}
              </div>
            </article>
          ))}
          <button onClick={() => setMode('auto')} className="flex min-h-[170px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-lav/60 text-sm font-semibold text-blurple transition hover:bg-lav/10">
            <Plus /> Pachet nou
          </button>
        </div>
      )}

      {mode === 'manual' && (
        <div className="card animate-pop space-y-4 p-5">
          <h2 className="font-extrabold">Pachet nou — manual</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label><span className="label">Nume pachet</span><input id="fc-title" className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ex. Legile lui Newton" /></label>
            <label><span className="label">Materie</span><select id="fc-subject" className="input" value={subject} onChange={(e) => setSubject(e.target.value)}>{SUBJECTS.map((s) => <option key={s}>{s}</option>)}</select></label>
          </div>
          <div className="space-y-2">
            {rows.map((r, k) => (
              <div key={r.id} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <input className="input" placeholder={`Întrebare ${k + 1}`} value={r.front} onChange={(e) => setRows(rows.map((x) => x.id === r.id ? { ...x, front: e.target.value } : x))} />
                <input className="input" placeholder="Răspuns" value={r.back} onChange={(e) => setRows(rows.map((x) => x.id === r.id ? { ...x, back: e.target.value } : x))} />
                <button className="btn-ghost !px-3" aria-label="Șterge rândul" onClick={() => setRows(rows.filter((x) => x.id !== r.id))}><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
          <button className="btn-ghost" onClick={() => setRows([...rows, { id: Date.now(), front: '', back: '' }])}><Plus size={16} /> Adaugă card</button>
          <div className="flex justify-end gap-2"><button className="btn-ghost" onClick={reset}>Anulează</button>
            <button className="btn-primary" onClick={() => save(rows.filter((r) => r.front.trim() && r.back.trim()).map((r) => ({ ...r, front: r.front.trim(), back: r.back.trim() })))}>Salvează pachetul</button></div>
        </div>
      )}

      {mode === 'auto' && (
        <div className="card animate-pop space-y-4 p-5">
          <h2 className="flex items-center gap-2 font-extrabold"><Sparkles size={18} className="text-blurple" /> Generează din notițe</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label><span className="label">Nume pachet</span><input id="fc-title" className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ex. Recapitulare derivate" /></label>
            <label><span className="label">Materie</span><select id="fc-subject" className="input" value={subject} onChange={(e) => setSubject(e.target.value)}>{SUBJECTS.map((s) => <option key={s}>{s}</option>)}</select></label>
          </div>
          <label className="block"><span className="label">Notițe din sesiuni anterioare</span>
            <select id="fc-src" className="input" value={src} onChange={(e) => pickSrc(e.target.value)}>
              <option value="">{saved.length ? 'Alege notițele unei sesiuni...' : 'Nu ai notițe salvate încă — scrie mai jos'}</option>
              {saved.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select></label>
          <label className="block"><span className="label"><NotebookPen size={12} className="mr-1 inline" />Notițele tale</span>
            <textarea id="fc-text" className="input min-h-[140px] font-mono" value={text} onChange={(e) => { setText(e.target.value); setPreview(null); }}
              placeholder={'Scrie definiții, una pe rând:\nDerivata lui x²: 2x\nTeorema lui Pitagora: a² + b² = c²\nFotosinteza are loc în cloroplaste.'} /></label>
          <div className="flex justify-end"><button className="btn-primary" onClick={generate} disabled={!text.trim()}><Wand2 size={16} /> Generează flashcard-uri</button></div>
          {preview && (
            <div className="animate-fadeUp space-y-3 rounded-xl bg-app p-4 dark:bg-night">
              <p className="text-sm font-bold">{preview.length} carduri generate — elimină ce nu vrei:</p>
              <div className="max-h-72 space-y-2 overflow-y-auto">
                {preview.map((c) => (
                  <div key={c.id} className="flex items-start gap-2 rounded-lg bg-white p-3 text-sm dark:bg-panel">
                    <div className="min-w-0 flex-1"><p className="font-semibold">{c.front}</p><p className="text-ink/60 dark:text-slate-400">{c.back}</p></div>
                    <button aria-label="Elimină cardul" onClick={() => setPreview(preview.filter((x) => x.id !== c.id))} className="text-rose-500"><Trash2 size={15} /></button>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-2"><button className="btn-ghost" onClick={reset}><RotateCcw size={15} /> Anulează</button><button className="btn-primary" onClick={() => save(preview)}>Salvează pachetul</button></div>
            </div>
          )}
          {!preview && <div className="flex justify-end"><button className="btn-ghost" onClick={reset}>Anulează</button></div>}
        </div>
      )}
    </div>
  );
}

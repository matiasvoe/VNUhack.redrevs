import { Sigma, Atom, FlaskConical, Code2, Dna, BookOpen } from 'lucide-react';
import { cycleEnd } from './utils.jsx';

export const SESSION_COST = 25;
export const SESSION_MINUTES = 25;
export const MAX_MEMBERS = 5;

export const GRADES = ['Clasa a 9-a', 'Clasa a 10-a', 'Clasa a 11-a', 'Clasa a 12-a'];
export const SUBJECTS = ['Matematică', 'Fizică', 'Chimie', 'Informatică', 'Biologie', 'Limba Română'];
export const SUBJECT_ICONS = {
  Matematică: Sigma,
  Fizică: Atom,
  Chimie: FlaskConical,
  Informatică: Code2,
  Biologie: Dna,
  'Limba Română': BookOpen,
};
export const LEVELS = [
  { id: 1, label: 'Vreau doar să trec', desc: 'Recapitulare și noțiuni de bază' },
  { id: 2, label: 'Nivel BAC', desc: 'Pregătire standard, nivel mediu' },
  { id: 3, label: 'Nivel Olimpiadă', desc: 'Probleme avansate, excelență' },
];

export const PLANS = [
  { id: 'free', name: 'Free', price: 0, credits: 50, perks: ['50 credite / lună incluse', '2 sesiuni gratuite pe lună', 'Acces la toate camerele', 'Fără flashcard-uri (doar Pro și Premium)'] },
  { id: 'pro', name: 'Pro', price: 30, credits: 600, popular: true, perks: ['600 credite / lună', '24 de sesiuni pe lună', 'Flashcard-uri generate din notițe', 'Insignă Pro în profil'] },
  { id: 'premium', name: 'Premium', price: 50, credits: 1000, perks: ['1000 credite / lună', '40 de sesiuni pe lună', 'Flashcard-uri nelimitate', 'Prioritate la intrarea în camere'] },
];
export const CREDIT_PACKS = [
  { credits: 25, price: 6 },
  { credits: 100, price: 20 },
  { credits: 250, price: 45 },
];

// ---------- Întrebări test mentor (3 / materie) ----------
export const QUIZ = {
  Matematică: [
    { q: 'Care este derivata funcției f(x) = x²?', a: ['2x', 'x', 'x²', '2'], c: 0 },
    { q: 'Care sunt soluțiile ecuației x² − 5x + 6 = 0?', a: ['1 și 6', '2 și 3', '−2 și −3', '5 și 6'], c: 1 },
    { q: 'Cât este sin²x + cos²x?', a: ['0', '2', '1', 'sin 2x'], c: 2 },
  ],
  Fizică: [
    { q: 'Care este unitatea de măsură a forței în SI?', a: ['Joule', 'Newton', 'Watt', 'Pascal'], c: 1 },
    { q: 'Care este expresia legii a II-a a lui Newton?', a: ['F = m / a', 'F = a / m', 'F = m · a', 'F = m + a'], c: 2 },
    { q: 'Cât este aproximativ viteza luminii în vid?', a: ['3·10⁸ m/s', '3·10⁶ m/s', '3·10⁵ m/s', '340 m/s'], c: 0 },
  ],
  Chimie: [
    { q: 'Care este formula chimică a apei?', a: ['CO₂', 'H₂O', 'O₂', 'NaCl'], c: 1 },
    { q: 'Cât este pH-ul unei soluții neutre la 25°C?', a: ['14', '0', '7', '1'], c: 2 },
    { q: 'Care este numărul atomic al carbonului?', a: ['6', '12', '8', '14'], c: 0 },
  ],
  Informatică: [
    { q: 'Care este complexitatea căutării binare?', a: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], c: 1 },
    { q: 'Ce afișează în C++ instrucțiunea cout << 7 / 2; ?', a: ['3.5', '4', '3', '3.0'], c: 2 },
    { q: 'Care structură de date funcționează după principiul LIFO?', a: ['Stiva', 'Coada', 'Arborele', 'Graful'], c: 0 },
  ],
  Biologie: [
    { q: 'În ce organit celular are loc fotosinteza?', a: ['Mitocondrie', 'Cloroplast', 'Ribozom', 'Nucleu'], c: 1 },
    { q: 'Care moleculă poartă informația ereditară?', a: ['ATP', 'Glucoza', 'ADN', 'Lipidele'], c: 2 },
    { q: 'Câți cromozomi are o celulă somatică umană?', a: ['46', '23', '44', '48'], c: 0 },
  ],
  'Limba Română': [
    { q: 'Cine este autorul romanului „Ion”?', a: ['Liviu Rebreanu', 'Camil Petrescu', 'Mihail Sadoveanu', 'G. Călinescu'], c: 0 },
    { q: 'Cine a scris poemul „Luceafărul”?', a: ['Ion Creangă', 'Mihai Eminescu', 'Tudor Arghezi', 'Lucian Blaga'], c: 1 },
    { q: 'Ce figură de stil apare în „soarele zâmbește”?', a: ['Epitet', 'Comparație', 'Personificare', 'Hiperbolă'], c: 2 },
  ],
};

// ---------- Elevi mock ----------
const BOTS = [
  ['Andrei Popescu', 'Colegiul Național „Sf. Sava”'],
  ['Ioana Dumitrescu', 'Liceul „Mihai Viteazul”'],
  ['Mihai Ionescu', 'Colegiul „Gheorghe Lazăr”'],
  ['Elena Stoica', 'Liceul „Tudor Vianu”'],
  ['Alexandru Radu', 'Colegiul „Matei Basarab”'],
  ['Maria Constantin', 'Liceul „Ion Neculce”'],
  ['Cătălin Marin', 'Colegiul „Spiru Haret”'],
  ['Teodora Nistor', 'Liceul „Avram Iancu”'],
  ['David Munteanu', 'Colegiul „Emil Racoviță”'],
  ['Andreea Georgescu', 'Liceul „George Coșbuc”'],
  ['Ștefan Dinu', 'Colegiul „Mircea cel Bătrân”'],
  ['Bianca Tudor', 'Liceul „Lucian Blaga”'],
  ['Vlad Stan', 'Colegiul „Ion Luca Caragiale”'],
  ['Raluca Preda', 'Liceul „Nicolae Bălcescu”'],
  ['Denis Lungu', 'Colegiul „Octavian Goga”'],
  ['Sorina Barbu', 'Liceul „Dimitrie Cantemir”'],
];

export const BOT_NAMES = BOTS.map(([n]) => n);
export function seedRating(name) {
  if (!BOT_NAMES.includes(name)) return null;
  const h = [...name].reduce((a, c) => a + c.charCodeAt(0), 0);
  const count = 10 + (h % 45);
  return { sum: Math.round((4.2 + (h % 8) / 10) * count), count, reviews: [] };
}

let botSeq = 0;
export function makeBot(role, grade, usedNames = []) {
  const free = BOTS.filter(([n]) => !usedNames.includes(n));
  const [name, school] = (free.length ? free : BOTS)[Math.floor(Math.random() * (free.length || BOTS.length))];
  return { id: `b${++botSeq}-${Date.now()}`, name, school, role, grade };
}
const m = (i, role, grade) => {
  const [name, school] = BOTS[i % BOTS.length];
  return { id: `m${i}`, name, school, role, grade };
};

// [subiect, clasă, nivel, [membri: rol]]
const SPEC = [
  ['Matematică', 2, 2, 'MLL'],
  ['Matematică', 0, 1, 'MLLL'],
  ['Matematică', 3, 2, 'MMLLL'],
  ['Matematică', 1, 3, 'ML'],
  ['Matematică', 3, 3, 'M'],
  ['Limba Română', 3, 2, 'MLL'],
  ['Limba Română', 0, 1, 'L'],
  ['Fizică', 1, 2, 'LLLL'],
  ['Fizică', 2, 3, 'ML'],
  ['Informatică', 2, 2, 'MLL'],
  ['Informatică', 0, 1, 'LL'],
  ['Informatică', 3, 3, 'MMLLL'],
  ['Chimie', 1, 2, 'ML'],
  ['Biologie', 3, 2, 'MLL'],
];

export function buildRooms() {
  let n = 0;
  const end = cycleEnd(Date.now());
  return SPEC.map(([subject, g, level, roles], idx) => {
    const grade = GRADES[g];
    const members = roles.split('').map((r) => m(n++, r === 'M' ? 'mentor' : 'learner', GRADES[Math.max(0, Math.min(3, g + (n % 2 ? 0 : -1)))]));
    return {
      id: `r${idx + 1}`,
      subject,
      grade,
      level,
      members,
      startedAt: members.length >= MAX_MEMBERS ? end - SESSION_MINUTES * 60000 : null,
      endsAt: members.length >= MAX_MEMBERS ? end : null,
    };
  });
}

export const CHAT_LINES = {
  mentor: [
    'Hai să luăm problema pas cu pas. Ce date avem în enunț?',
    'Bună întrebare! Încearcă să te gândești la definiție mai întâi.',
    'Așa, exact. Verifică și unitățile de măsură la final.',
    'Pentru BAC apare des tipul ăsta de exercițiu, merită să-l știți.',
  ],
  learner: [
    'Salut tuturor! Eu nu am înțeles subiectul II de la simulare.',
    'Putem relua exercițiul 3? M-am blocat la final.',
    'Aaa, acum se leagă! Mulțumesc!',
    'Poți să scrii formula în caiet, te rog?',
  ],
};

export const ADS = [
  { tag: 'Cărți', title: 'Culegeri BAC 2027 −30%', text: 'Editura Paralela 45 — pachet complet Mate + Română pentru elevii Akademos.', cta: 'Vezi oferta', grad: 'from-fuchsia-500 to-indigo-600' },
  { tag: 'Tehnologie', title: 'Laptopuri pentru elevi de la 1.999 lei', text: 'Reducere specială cu legitimația de elev. Livrare gratuită în toată țara.', cta: 'Alege laptopul', grad: 'from-sky-500 to-blurple' },
  { tag: 'Bootcamp', title: 'Bootcamp Web & Python — 6 săptămâni', text: 'Învață programare practic, cu mentori din industrie. Prima lecție gratuită.', cta: 'Înscrie-te', grad: 'from-emerald-500 to-teal-600' },
];

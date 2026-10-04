# Akademos — Be the Middleman

Prototip hackathon (React + Tailwind + lucide-react), UI exclusiv în limba română.

    npm install
    npm run dev

- Autentificare prin telefon + cod SMS simulat (afișat în modal), cont persistat în localStorage
- Credite: 25 / sesiune, abonamente Free/Pro/Premium, blocare intrare sub 25 credite
- Test de mentorat: 3 întrebări, 30 s / întrebare, insignă „Mentor Verificat”
- Lobby cu filtre, spațiu publicitar, alerte „Cere Mentor Urgent”
- Fereastra de intrare :00–:05 / :30–:35 (bifa „Mod demonstrație” o forțează deschisă), blocare la 5 participanți sau la :05/:35
- Cameră audio-only (fără video), partajare ecran cu `getDisplayMedia` (fallback simulat), chat, caiet comun

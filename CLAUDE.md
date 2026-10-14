# CLAUDE.md – Food for All

## Vad projektet gör

Food for All är en enkel webbapp för att hålla koll på vilka recept hushållet gillar.

- En översikt visar alla recept, var och ett med **namn** och **länk** till receptet.
- För varje recept kan man markera om **person 1, person 2 och person 3** tyckte om det eller inte.
- Man kan **lägga till** nya recept (namn + länk) och **ta bort** recept.

**Problemet det löser:** Det är svårt att komma ihåg vilka recept som gick hem hos alla och vilka som inte gjorde det. Appen samlar recepten och allas omdömen på ett ställe, så att det blir lättare att välja vad man ska laga.

## Teknikstack och varför

| Del | Val | Varför |
|-----|-----|--------|
| Struktur | HTML5 | Det enklaste sättet att bygga en webbsida. Det fungerar direkt i webbläsaren. |
| Utseende | CSS (en fil, ingen preprocessor) | Det räcker för en liten app och kräver inget byggsteg. |
| Logik | Vanilla JavaScript (ES-moduler) | Det behövs inget ramverk för den här storleken på app, och det är lätt att förstå och lära sig. |
| Lagring | `localStorage` i webbläsaren | Det behövs ingen server eller databas. Datan sparas mellan besök. |

Det finns inget byggsteg, ingen npm och ingen backend. Öppna `index.html` i en webbläsare eller kör en enkel lokal server (t.ex. `python3 -m http.server`).

### Filstruktur (mål)

```
index.html      – sidans struktur
css/style.css   – all styling
js/main.js      – startpunkt, kopplar ihop UI och data
js/storage.js   – all läsning/skrivning till localStorage
js/recipes.js   – logik för recept (lägga till, ta bort, sätta omdöme)
js/ui.js        – rendering av listan och hantering av händelser
```

### Datamodell

```js
// Sparas som JSON under nyckeln "foodforall.recipes"
[
  {
    id: "unik-sträng",          // t.ex. crypto.randomUUID()
    name: "Pasta carbonara",
    url: "https://...",
    ratings: { p1: true, p2: false, p3: null } // true = gillade, false = gillade inte, null = ej svarat
  }
]
```

## Arkitekturprinciper

- **Inga globala variabler.** Använd ES-moduler (`type="module"`) och exportera bara det som behövs.
- **All lagring sker i ett lager.** Bara `storage.js` får använda `localStorage`. Övrig kod går via dess funktioner.
- **Separera logik och UI.** `recipes.js` arbetar bara med data och rör aldrig DOM:en. `ui.js` sköter all DOM-hantering.
- **Funktioner ska göra en sak.** Håll dem korta och ge dem beskrivande namn (`addRecipe`, `removeRecipe`, `setRating`).
- **Behandla data som oföränderlig.** Returnera nya arrayer och objekt i stället för att mutera befintliga.
- **Validera indata.** Namnet får inte vara tomt och länken måste vara en giltig URL (`new URL(...)`). Visa ett tydligt felmeddelande om något är fel.
- **Säker rendering.** Lägg in användartext med `textContent`, aldrig med `innerHTML`. Länkar öppnas med `rel="noopener noreferrer"`.
- **Tillgänglighet.** Använd semantisk HTML (`<button>`, `<label>`, `<ul>`) och se till att allt fungerar med tangentbordet.
- **Svenska i gränssnittet.** Koden (variabelnamn, funktioner) skrivs på engelska.

## Saker agenten INTE ska göra

- **Lägg inte till externa beroenden** (npm-paket, CDN-bibliotek, ramverk) utan att fråga först.
- **Byt inte lagringslösning.** Använd inte en databas, backend eller molntjänst i stället för `localStorage` utan att fråga.
- **Inför inget byggsteg** (Vite, Webpack, TypeScript osv.) utan att fråga.
- **Ändra inte datamodellen** så att befintlig sparad data går sönder. Om modellen måste ändras ska det finnas en migrering.
- **Ändra inte antalet personer** (tre stycken) eller vad de heter utan att fråga.
- **Ta inte bort eller skriv om** fungerande funktionalitet som inte hör till uppgiften.
- **Committa eller pusha inte** utan att användaren ber om det. Committa aldrig `.DS_Store` eller andra systemfiler.

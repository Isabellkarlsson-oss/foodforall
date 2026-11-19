# Food for All

En webbapp där ett hushåll samlar sina recept och markerar vem som gillade vad, så att det blir lättare att välja vad man ska laga.

**Live:** Ingen deployad version. Appen körs lokalt från repot: [github.com/Isabellkarlsson-oss/foodforall](https://github.com/Isabellkarlsson-oss/foodforall)

## Vad det gör

Du lägger till recept med namn och länk, och de visas i en lista där länken öppnar receptet. För varje recept väljer Isabell, Christoffer och Hugo var för sig om de gillade det eller inte i en rullgardinsmeny. Du kan också ta bort recept. Allt sparas i webbläsaren och finns kvar nästa gång du öppnar appen.

## Kom igång

### Krav

- Python 3.7 eller senare. Behövs bara för den lokala servern, och använder inga paket utöver standardbiblioteket.
- En modern webbläsare, till exempel Chrome, Firefox, Safari eller Edge.
- Inga externa tjänster, konton eller API-nycklar.

### Installation

```bash
git clone https://github.com/Isabellkarlsson-oss/foodforall
cd foodforall
```

Inget mer behöver installeras. Det finns ingen npm, inget byggsteg och inga beroenden.

### Konfiguration

Ingen konfiguration behövs, och det finns ingen `.env`-fil. Servern använder port 8000. Om den porten är upptagen kan du välja en annan:

```bash
python3 server.py 8001
```

### Kör projektet

```bash
python3 server.py
```

Öppna sedan `http://localhost:8000` i webbläsaren. Avsluta servern med Ctrl+C.

- Bara din egen dator når servern, inte andra på samma nätverk.
- Servern säger åt webbläsaren att alltid kontrollera om en fil har ändrats. Med `python3 -m http.server` kan webbläsaren blanda gamla och nya JS-filer ur sin cache, och då slutar appen fungera.
- Det går **inte** att öppna `index.html` direkt som fil, eftersom webbläsaren då blockerar ES-moduler.

### Tester

1. Öppna `http://localhost:8000/tests/` för de automatiska testerna av `recipes.js` och `storage.js`. Fliktiteln visar till exempel `✓ 20/20` när alla går igenom.
2. Kör den manuella testlistan i [TESTING.md](TESTING.md) för det som syns i gränssnittet.

## Arkitektur

Appen är uppdelad i tre lager som bara pratar med varandra via `main.js`. `storage.js` är den enda filen som läser och skriver i `localStorage`. `recipes.js` innehåller all datalogik (skapa, ta bort, sätta omdöme, validera) och rör aldrig sidan, utan returnerar alltid nya listor i stället för att ändra de gamla. `ui.js` bygger listan, hanterar klick och formulär och innehåller alla svenska texter. `main.js` håller appens data, och varje ändring sparas direkt. Om sparandet misslyckas behålls den gamla datan, så att det som visas alltid stämmer med det som är sparat.

```
foodforall/
├── index.html        # sidans struktur
├── server.py         # lokal utvecklingsserver
├── css/
│   └── style.css     # all styling
├── js/
│   ├── main.js       # startpunkt, håller datan och kopplar ihop lagren
│   ├── storage.js    # all läsning och skrivning till localStorage
│   ├── recipes.js    # datalogik för recept, utan DOM
│   └── ui.js         # rendering, händelser och alla gränssnittstexter
├── tests/            # automatiska tester som körs i webbläsaren
├── TESTING.md        # manuell testlista
└── CLAUDE.md         # instruktioner till Claude Code
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

Nycklarna `p1`, `p2` och `p3` står för Isabell, Christoffer och Hugo. Namnen finns bara i gränssnittet (`PERSON_NAMES` i `js/ui.js`), så de kan bytas utan att sparad data går sönder.

## Teknisk stack

| Komponent | Val | Anledning |
|-----------|-----|-----------|
| Struktur | HTML5 | Det enklaste sättet att bygga en webbsida, och det fungerar direkt i webbläsaren. |
| Utseende | CSS (en fil, ingen preprocessor) | Det räcker för en liten app och kräver inget byggsteg. |
| Logik | Vanilla JavaScript (ES-moduler) | Ett ramverk behövs inte för en app av den här storleken, och koden blir lätt att förstå. |
| Lagring | `localStorage` i webbläsaren | Ingen server eller databas behövs, och datan sparas mellan besök. |
| Lokal server | Python, bara standardbiblioteket | Ger rätt cache-inställningar och når bara den egna datorn, utan att något behöver installeras. |

## Begränsningar

- **Datan finns bara i en webbläsare.** Två enheter, eller två olika webbläsare, har var sin lista. Det finns ingen synkning.
- **Datan kan försvinna.** Den rensas om man tömmer webbläsarens webbplatsdata, och det finns ingen export eller backup.
- **Personerna är fasta.** Det är alltid tre personer, och för att byta namn måste man ändra i koden.
- **Ingen deployad version.** Appen körs bara lokalt via `server.py`.
- **Testerna körs för hand.** De automatiska testerna öppnas i webbläsaren, och det finns ingen CI som kör dem vid varje push.
- **Proof of concept.** Appen är byggd för ett hushåll och är inte gjord för många användare eller stora mängder recept.

## Utvecklat med

Claude Code (agentdriven utveckling) som del av kursen Next-Generation Software Development with AI.

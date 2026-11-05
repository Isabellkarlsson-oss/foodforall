# Manuell testlista – Food for All

Kör listan efter varje steg i en ändring, så ser du att beteendet inte har ändrats.

Datalogik och lagring testas automatiskt på `http://localhost:8000/tests/`. Kör dem först. Den här listan täcker det som syns och klickas i gränssnittet.

## Förberedelse

1. Starta servern i projektmappen: `python3 -m http.server 8000 --bind 127.0.0.1`
2. Öppna `http://localhost:8000`
3. Öppna webbläsarens utvecklarverktyg (Cmd+Option+I) och välj fliken **Console**.
4. Börja från tom lista: skriv `localStorage.clear()` i konsolen och ladda om sidan.

## Tester

| # | Gör så här | Förväntat resultat | OK? |
|---|---|---|---|
| 1 | Ladda sidan med tom lista | Texten "Inga recept än…" visas | ☐ |
| 2 | Klicka "Lägg till" med tomt namn | "Skriv ett namn på receptet." och markören hamnar i namnfältet | ☐ |
| 3 | Namn "Pasta", länk `hej` | "Skriv en giltig länk…" och markören hamnar i länkfältet | ☐ |
| 4 | Namn "Pasta", länk `javascript:alert(1)` | "Länken måste börja med http:// eller https://." | ☐ |
| 5 | Namn "Pasta carbonara", länk `https://www.ica.se` | Receptet visas, formuläret töms, felmeddelandet försvinner och "Inga recept än" döljs | ☐ |
| 6 | Klicka på receptets namn | Länken öppnas i en ny flik | ☐ |
| 7 | Lägg till ett recept med namnet `<b>Tacos</b>` | Namnet visas som vanlig text med `<b>` synligt, inte i fetstil | ☐ |
| 8 | Välj "Isabell gillar" och "Hugo ogillar", ladda om sidan | Valen finns kvar | ☐ |
| 9 | Ändra "Isabell gillar" tillbaka till "Isabell –", ladda om | "Isabell –" visas | ☐ |
| 10 | Klicka "Ta bort" och sedan "Avbryt" | Receptet finns kvar | ☐ |
| 11 | Klicka "Ta bort" och sedan "OK", ladda om | Receptet är borta även efter omladdning | ☐ |
| 12 | Bara tangentbord: Tab genom sidan, lägg till ett recept med Enter, ändra ett omdöme med piltangenterna och ta bort med Enter | Allt går att göra och den blå fokusramen syns hela tiden | ☐ |
| 13 | Gör fönstret smalt (under 600 px) | Rullgardinsmenyerna hamnar under varandra | ☐ |
| 14 | Titta i konsolen under hela testet | Inga röda felmeddelanden | ☐ |
| 15 | Trasig sparad data: klistra in `localStorage.setItem("foodforall.recipes", JSON.stringify([{id:"a",name:"Bra",url:"https://www.ica.se"},{id:"b",name:"Trasig",url:"javascript:alert(1)"}]))` i konsolen och ladda om | "Bra" visas med alla tre menyer på "–", "Trasig" är borta och "Ett eller flera sparade recept kunde inte läsas in och har tagits bort." visas ovanför listan. Ladda om igen: meddelandet är borta | ☐ |
| 16 | Sparfel: klistra in `Storage.prototype.setItem = () => { throw new Error("full") }` i konsolen. Försök lägga till ett recept, ändra ett omdöme och ta bort ett recept | Varje gång visas "Kunde inte spara. Försök igen.": under formuläret när man lägger till, och **i receptkortet** när man ändrar ett omdöme eller tar bort. Texten i formuläret ligger kvar, menyn hoppar tillbaka och receptet finns kvar. Ladda om sidan efteråt för att sluta simulera felet | ☐ |
| 17 | Öppna appen i två flikar. Lägg till ett recept i flik 1, byt till flik 2. Lägg till ett recept i flik 2 och ladda om flik 1 | Receptet från flik 1 syns direkt i flik 2, och efter omladdning finns båda recepten i flik 1 | ☐ |
| 18 | Stoppa servern (Ctrl+C) och starta den **tillfälligt** öppen för nätverket: `python3 -m http.server 8000 --bind 0.0.0.0`. Ta reda på datorns IP-adress (`ipconfig getifaddr en0` i Terminal), öppna `http://<ip-adressen>:8000` och lägg till ett recept. Starta sedan om servern med `--bind 127.0.0.1` igen | Receptet läggs till utan fel. Testdatan där är skild från den på localhost | ☐ |
| 19 | Namn "Pasta", länk `hej`. Högerklicka på länkfältet → **Inspektera**. Skriv sedan ett tecken i länkfältet | Först har fältet `aria-invalid="true"` och `aria-describedby="form-error"`. När du skriver försvinner felmeddelandet och båda attributen. (Med VoiceOver, Cmd+F5, läses felet upp tillsammans med fältets namn) | ☐ |
| 20 | Gör fönstret smalt (under 600 px). Lägg till ett recept med namnet `Superlångtreceptnamnutanmellanslagsomkanskespräckerlayouten` | Namnet bryts på flera rader inuti kortet, och sidan går inte att scrolla i sidled | ☐ |
| 21 | Namn med bara mellanslag (`   `), länk `https://www.ica.se`. Sedan namn `  Tacos  ` med samma länk | Först "Skriv ett namn på receptet.". Sedan läggs receptet till som "Tacos", utan mellanslagen | ☐ |
| 22 | Öppna appen i två fönster sida vid sida. I fönster 1: Tab till "Hugo"-menyn i ett recept. Lägg till ett recept i fönster 2. Ta sedan bort receptet du stod på, i fönster 2 | Efter att receptet lagts till har "Hugo"-menyn i fönster 1 kvar fokus (blå ram). Efter borttagningen hamnar fokus på rubriken "Våra recept" | ☐ |
| 23 | Oläslig data: klistra in `localStorage.setItem("foodforall.recipes", '[{"name":"Köttbullar"')` i konsolen och ladda om. Lägg sedan till ett recept. Skriv till sist `localStorage.getItem("foodforall.recipes.backup")` i konsolen | Tom lista och "De sparade recepten kunde inte läsas in. En kopia av dem har sparats i webbläsaren." ovanför listan. Receptet läggs till. Kopian innehåller fortfarande "Köttbullar" | ☐ |

## Logg

Skriv en rad varje gång du kör listan.

| Datum | Efter vilket steg | Resultat | Kommentar |
|---|---|---|---|
| 2026-10-28 | Före Fas 1 (utgångsläge) | 14/14 OK | Körd av Claude i webbläsaren |
| 2026-10-28 | Fas 1 steg 1: storage.js | 14/14 OK | |
| 2026-10-28 | Fas 1 steg 2: recipes.js | 14/14 OK | |
| 2026-10-28 | Fas 1 steg 3: ui.js | 14/14 OK | |
| 2026-10-28 | Fas 1 steg 4: main.js, app.js borttagen | 14/14 OK | Sidan laddar js/main.js |
| 2026-10-28 | Fas 1 steg 5: CSS-städning | 14/14 OK | Uppmätta färger, kanter och avstånd oförändrade. Test 12 även kört med riktigt tangentbord |
| 2026-10-28 | Fas 2 steg 6: kontroll av sparad data | 1–15 OK | 16–18 ännu inte byggda |
| 2026-10-28 | Fas 2 steg 7: sparfel | 1–16 OK | |
| 2026-10-28 | Fas 2 steg 8: synk mellan flikar | 1–17 OK | |
| 2026-10-28 | Fas 2 steg 9: reservlösning för id | 18/18 OK | Test 18 även kört på riktigt via http://192.168.45.103:8000 |
| 2026-10-28 | Fas 3 steg 10–11: felmarkering på fälten, kommentar om novalidate/required | 19/19 OK | |
| 2026-11-05 | Rättelse: långa receptnamn på mobil | 1–5, 8, 13, 14, 20 OK | Övriga tester inte körda, bara CSS ändrad |
| 2026-11-05 | Principer steg 1: validering trimmar själv | 1–11, 13–17, 19–21 OK | Körd av Claude med skript. 12 (tangentbord) och 18 (IP-adress) inte körda |
| 2026-11-05 | Principer steg 2: sparfel skilt från valideringsfel | 1–11, 13–17, 19–21 OK | Som ovan |
| 2026-11-05 | Principer steg 3: lugnare meddelande ovanför listan | 1–11, 13–17, 19–21 OK | Som ovan. Ny text i test 15 och role="status" kontrollerade |
| 2026-11-05 | Principer steg 4: sparfel i receptkortet | 1–11, 13–17, 19–21 OK | Som ovan. Felet visas i kortet, kopplas med aria-describedby och försvinner när nästa ändring sparas. Tomt felfält ger ingen extra luft (12 px som förut) |
| 2026-11-05 | Principer steg 5: fokus kvar vid synk mellan flikar | 1–11, 13–17, 19–22 OK | Som ovan. Test 22 kört med två inbäddade fönster: fokus kvar på meny och ta bort-knapp, och till rubriken när receptet togs bort. Bör även köras med två riktiga fönster |
| 2026-11-05 | Kodgranskning punkt 1: oläslig data sparas som kopia | 1–11, 13–17, 19–21, 23 OK | Körd av Claude med skript. Även kontrollerat: inget sparat, data som inte är en lista, och när kopian inte kan sparas |
| 2026-11-05 | Kodgranskning punkt 2: servern bara på egen dator | 1–11, 13–17, 19–21, 23 OK | Servern svarar på localhost men inte via nätverksadressen. 18 inte körd |
| 2026-11-05 | Kodgranskning punkt 3: loadAndRender uppdelad | 1–11, 13–17, 19–21, 23 OK | Även kontrollerat: meddelandet när rensad data inte kan sparas |
| 2026-11-05 | Kodgranskning punkt 4–5: gemensamma svar (RESULT) | 1–11, 13–17, 19–21, 23 OK | |
| 2026-11-05 | Kodgranskning punkt 6: showCardSaveResult uppdelad | 1–11, 13–17, 19–21, 23 OK | Ny: meddelandet ovanför listan töms även när ett recept läggs till |
| 2026-11-05 | Kodgranskning punkt 7: tydligare namn | 1–11, 13–17, 19–21, 23 OK | |
| 2026-11-05 | Automatiska tester (tests/) tillagda | 20/20 automatiska OK | Kontrollerat att ett infört fel ger röda tester, och att appens sparade data ligger kvar efter körningen |

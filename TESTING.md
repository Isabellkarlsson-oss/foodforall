# Manuell testlista – Food for All

Kör listan efter varje steg i en ändring, så ser du att beteendet inte har ändrats.

## Förberedelse

1. Starta servern i projektmappen: `python3 -m http.server 8000`
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

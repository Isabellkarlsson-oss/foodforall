// Automatiska tester för datalogik och lagring. Öppna http://localhost:8000/tests/
// så körs de direkt. Inga beroenden och inget byggsteg, bara webbläsaren.

import {
  PERSON_KEYS,
  validateInput,
  createRecipe,
  addRecipe,
  removeRecipe,
  setRating,
  removeInvalidRecipes,
} from "../js/recipes.js";
import { loadRecipes, saveRecipes } from "../js/storage.js";

// ---------- Ett litet testverktyg ----------

const tests = [];

// Registrerar ett test. fn kastar ett fel om något inte stämmer.
function test(name, fn) {
  tests.push({ name, fn });
}

// Kontrollerar att två värden är lika. Objekt och listor jämförs på innehåll.
function assertEqual(actual, expected, message = "") {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    throw new Error(`${message}\n  förväntat: ${e}\n  fick:      ${a}`);
  }
}

// Kontrollerar att ett villkor är sant.
function assertTrue(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

// ---------- validateInput ----------

test("validateInput: tomt namn ger fel på namnet", () => {
  assertEqual(validateInput("", "https://www.ica.se"), { field: "name", code: "empty" });
});

test("validateInput: namn med bara mellanslag ger fel på namnet", () => {
  assertEqual(validateInput("   ", "https://www.ica.se"), { field: "name", code: "empty" });
});

test("validateInput: text som inte är en länk ger fel på länken", () => {
  assertEqual(validateInput("Pasta", "hej"), { field: "url", code: "invalid" });
});

test("validateInput: javascript:-länk stoppas", () => {
  assertEqual(validateInput("Pasta", "javascript:alert(1)"), { field: "url", code: "protocol" });
});

test("validateInput: http och https godkänns, även med mellanslag runt", () => {
  assertEqual(validateInput("Pasta", "http://x.se"), null);
  assertEqual(validateInput(" Pasta ", "  https://www.ica.se  "), null);
});

// ---------- createRecipe ----------

test("createRecipe: tar bort mellanslag och sätter alla omdömen till null", () => {
  const recipe = createRecipe("  Tacos  ", "  https://x.se  ");
  assertEqual(recipe.name, "Tacos");
  assertEqual(recipe.url, "https://x.se");
  assertEqual(recipe.ratings, { p1: null, p2: null, p3: null });
});

test("createRecipe: ger varje recept ett eget id", () => {
  const a = createRecipe("A", "https://a.se");
  const b = createRecipe("B", "https://b.se");
  assertTrue(typeof a.id === "string" && a.id !== "", "id ska vara en icke-tom text");
  assertTrue(a.id !== b.id, "två recept ska inte få samma id");
});

// ---------- addRecipe, removeRecipe, setRating ----------

const pasta = { id: "1", name: "Pasta", url: "https://p.se", ratings: { p1: null, p2: null, p3: null } };
const soup = { id: "2", name: "Soppa", url: "https://s.se", ratings: { p1: true, p2: false, p3: null } };

test("addRecipe: lägger till sist och ändrar inte den gamla listan", () => {
  const before = [pasta];
  const after = addRecipe(before, soup);
  assertEqual(after.map((r) => r.id), ["1", "2"]);
  assertEqual(before.map((r) => r.id), ["1"], "den gamla listan ändrades");
});

test("removeRecipe: tar bort rätt recept och ändrar inte den gamla listan", () => {
  const before = [pasta, soup];
  const after = removeRecipe(before, "1");
  assertEqual(after.map((r) => r.id), ["2"]);
  assertEqual(before.length, 2, "den gamla listan ändrades");
});

test("removeRecipe: okänt id ger samma innehåll", () => {
  assertEqual(removeRecipe([pasta, soup], "finns-inte").map((r) => r.id), ["1", "2"]);
});

test("setRating: ändrar bara rätt persons omdöme i rätt recept", () => {
  const after = setRating([pasta, soup], "1", "p2", true);
  assertEqual(after[0].ratings, { p1: null, p2: true, p3: null });
  assertTrue(after[1] === soup, "ett annat recept ska inte kopieras eller ändras");
});

test("setRating: ändrar inte det gamla receptet", () => {
  setRating([pasta], "1", "p1", false);
  assertEqual(pasta.ratings.p1, null, "det gamla receptet ändrades");
});

// ---------- removeInvalidRecipes ----------

test("removeInvalidRecipes: tar bort ogiltiga recept och räknar dem", () => {
  const saved = [
    pasta,
    null,
    "text",
    { id: "x", url: "https://x.se" }, // saknar namn
    { id: "y", name: "   ", url: "https://y.se" }, // tomt namn
    { id: "z", name: "Farlig", url: "javascript:alert(1)" },
  ];
  const { recipes, removedCount } = removeInvalidRecipes(saved);
  assertEqual(recipes.map((r) => r.id), ["1"]);
  assertEqual(removedCount, 5);
});

test("removeInvalidRecipes: fyller i omdömen och tar bort okända eller felaktiga", () => {
  const saved = [{ id: "1", name: "Pasta", url: "https://p.se", ratings: { p1: true, p2: "ja", p9: false } }];
  const { recipes } = removeInvalidRecipes(saved);
  assertEqual(recipes[0].ratings, { p1: true, p2: null, p3: null });
});

test("removeInvalidRecipes: ger id till recept som saknar det och tar bort mellanslag", () => {
  const { recipes } = removeInvalidRecipes([{ name: " Pasta ", url: " https://p.se " }]);
  assertTrue(typeof recipes[0].id === "string" && recipes[0].id !== "", "id saknas");
  assertEqual([recipes[0].name, recipes[0].url], ["Pasta", "https://p.se"]);
});

test("PERSON_KEYS: tre personer", () => {
  assertEqual(PERSON_KEYS, ["p1", "p2", "p3"]);
});

// ---------- storage.js ----------
// Testerna använder samma lagring som appen på den här adressen. Därför sparas
// appens riktiga data undan innan testerna och läggs tillbaka efteråt.

const KEYS = ["foodforall.recipes", "foodforall.recipes.backup"];

// Kör fn med tom lagring och lägger sedan tillbaka det som fanns.
function withCleanStorage(fn) {
  const saved = KEYS.map((key) => localStorage.getItem(key));
  try {
    KEYS.forEach((key) => localStorage.removeItem(key));
    fn();
  } finally {
    KEYS.forEach((key, i) =>
      saved[i] === null ? localStorage.removeItem(key) : localStorage.setItem(key, saved[i])
    );
  }
}

test("loadRecipes: inget sparat ger en tom lista", () => {
  withCleanStorage(() => {
    assertEqual(loadRecipes(), { status: "ok", recipes: [] });
  });
});

test("saveRecipes och loadRecipes: det som sparas kan läsas tillbaka", () => {
  withCleanStorage(() => {
    assertEqual(saveRecipes([pasta]), true);
    assertEqual(loadRecipes(), { status: "ok", recipes: [pasta] });
  });
});

test("loadRecipes: trasig data ger 'unreadable' och sparas som kopia", () => {
  withCleanStorage(() => {
    localStorage.setItem("foodforall.recipes", '[{"name":"Köttbullar"');
    assertEqual(loadRecipes(), { status: "unreadable", backedUp: true });
    assertEqual(localStorage.getItem("foodforall.recipes.backup"), '[{"name":"Köttbullar"');
  });
});

test("loadRecipes: data som inte är en lista räknas som oläslig", () => {
  withCleanStorage(() => {
    localStorage.setItem("foodforall.recipes", '{"inte":"en lista"}');
    assertEqual(loadRecipes().status, "unreadable");
  });
});

// ---------- Kör och visa resultatet ----------

const results = document.querySelector("#results");
let failed = 0;

for (const { name, fn } of tests) {
  const item = document.createElement("li");
  try {
    fn();
    item.className = "pass";
    item.textContent = `✓ ${name}`;
  } catch (error) {
    failed += 1;
    item.className = "fail";
    item.textContent = `✗ ${name}`;
    const details = document.createElement("pre");
    details.textContent = error.message;
    item.append(details);
  }
  results.append(item);
}

const summary = document.querySelector("#summary");
const passed = tests.length - failed;
summary.textContent = failed === 0
  ? `Alla ${tests.length} tester gick igenom.`
  : `${failed} av ${tests.length} tester misslyckades.`;
summary.className = `summary ${failed === 0 ? "pass" : "fail"}`;
// Fliktiteln visar resultatet, så att det syns även när fliken inte är öppen.
document.title = `${failed === 0 ? "✓" : "✗"} ${passed}/${tests.length} – Tester`;

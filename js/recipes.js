// Datalogik för recept. Rör aldrig DOM:en och returnerar alltid nya
// arrayer och objekt i stället för att ändra de gamla.

// Nycklarna för personerna som kan sätta omdömen. Namnen finns bara i ui.js.
export const PERSON_KEYS = ["p1", "p2", "p3"];

// Kontrollerar formulärets värden. Ger null om allt är okej, annars
// vilket fält som är fel och varför, t.ex. { field: "url", code: "invalid" }.
export function validateInput(name, url) {
  if (name === "") {
    return { field: "name", code: "empty" };
  }
  try {
    const parsed = new URL(url);
    // Bara vanliga webblänkar. Stoppar t.ex. "javascript:"-länkar.
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { field: "url", code: "protocol" };
    }
  } catch {
    return { field: "url", code: "invalid" };
  }
  return null;
}

// Skapar ett unikt id. crypto.randomUUID finns bara på säkra adresser
// (https eller localhost), så på t.ex. http://192.168.1.10:8000 används
// i stället 16 slumpade byte skrivna som text.
function createId() {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

// Gör sparad data säker att använda. Recept som inte är giltiga (saknar namn
// eller har en ogiltig länk) tas bort, och saknade omdömen fylls i som null.
// Ger de giltiga recepten och hur många som togs bort.
export function cleanRecipes(saved) {
  const recipes = saved.filter(isValidRecipe).map(cleanRecipe);
  return { recipes, removedCount: saved.length - recipes.length };
}

// Kontrollerar ett sparat recept med samma regler som formuläret.
function isValidRecipe(recipe) {
  return (
    typeof recipe === "object" &&
    recipe !== null &&
    typeof recipe.name === "string" &&
    typeof recipe.url === "string" &&
    validateInput(recipe.name.trim(), recipe.url.trim()) === null
  );
}

// Returnerar en kopia av receptet med id och ett omdöme per person.
function cleanRecipe(recipe) {
  const savedRatings = recipe.ratings ?? {};
  return {
    ...recipe,
    id: typeof recipe.id === "string" && recipe.id !== "" ? recipe.id : createId(),
    ratings: Object.fromEntries(
      PERSON_KEYS.map((key) => [key, typeof savedRatings[key] === "boolean" ? savedRatings[key] : null])
    ),
  };
}

// Skapar ett nytt receptobjekt där ingen har svarat än.
export function createRecipe(name, url) {
  return {
    id: createId(),
    name,
    url,
    ratings: Object.fromEntries(PERSON_KEYS.map((key) => [key, null])),
  };
}

// Returnerar en ny lista med receptet tillagt sist.
export function addRecipe(recipes, recipe) {
  return [...recipes, recipe];
}

// Returnerar en ny lista utan receptet med angivet id.
export function removeRecipe(recipes, id) {
  return recipes.filter((recipe) => recipe.id !== id);
}

// Returnerar en ny lista där en persons omdöme för ett recept är ändrat.
// value: true = gillar, false = ogillar, null = inte svarat.
export function setRating(recipes, id, personKey, value) {
  return recipes.map((recipe) =>
    recipe.id === id
      ? { ...recipe, ratings: { ...recipe.ratings, [personKey]: value } }
      : recipe
  );
}

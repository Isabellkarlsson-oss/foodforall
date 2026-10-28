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

// Skapar ett nytt receptobjekt där ingen har svarat än.
export function createRecipe(name, url) {
  return {
    id: crypto.randomUUID(),
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

// Lagring – den enda filen som får använda localStorage.

const STORAGE_KEY = "foodforall.recipes";

// Läser recepten från localStorage. Ger en tom lista om inget finns
// eller om den sparade datan är trasig.
export function loadRecipes() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

// Sparar hela listan med recept i localStorage.
export function saveRecipes(recipes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
}

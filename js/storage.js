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

// Sparar hela listan med recept i localStorage. Ger false om webbläsaren
// inte kunde spara, t.ex. för att lagringen är full eller blockerad.
export function saveRecipes(recipes) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
    return true;
  } catch {
    return false;
  }
}

// Anropar onChange när recepten ändras i en annan flik eller ett annat fönster.
// (Webbläsaren skickar bara händelsen "storage" till de andra flikarna.)
export function watchRecipesInOtherTabs(onChange) {
  window.addEventListener("storage", (event) => {
    // key är null när hela lagringen rensas, t.ex. med localStorage.clear().
    if (event.key === STORAGE_KEY || event.key === null) {
      onChange();
    }
  });
}

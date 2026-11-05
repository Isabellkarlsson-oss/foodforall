// Lagring – den enda filen som får använda localStorage.

const STORAGE_KEY = "foodforall.recipes";

// Hit kopieras sparad data som inte gick att läsa, så att den inte går
// förlorad när listan sparas nästa gång.
const BACKUP_KEY = "foodforall.recipes.backup";

// Läser recepten från localStorage. Ger ett av:
// { status: "ok", recipes }                – inget sparat ger en tom lista
// { status: "unreadable", backedUp }       – datan gick inte att läsa. backedUp
//                                            säger om en kopia kunde sparas.
export function loadRecipes() {
  let raw;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    // Lagringen är blockerad. Då finns inget att läsa, och sparfel visas
    // när användaren försöker ändra något.
    return { status: "ok", recipes: [] };
  }
  if (raw === null) {
    return { status: "ok", recipes: [] };
  }
  try {
    const saved = JSON.parse(raw);
    if (Array.isArray(saved)) {
      return { status: "ok", recipes: saved };
    }
  } catch {
    // Trasig JSON hanteras som all annan oläslig data nedan.
  }
  return { status: "unreadable", backedUp: backupUnreadableData(raw) };
}

// Sparar en kopia av data som inte gick att läsa. Ger false om det misslyckades.
function backupUnreadableData(raw) {
  try {
    localStorage.setItem(BACKUP_KEY, raw);
    return true;
  } catch {
    return false;
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

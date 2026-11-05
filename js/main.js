// Food for All – startpunkt. Håller appens data och kopplar ihop
// lagring (storage.js), datalogik (recipes.js) och gränssnitt (ui.js).

import { loadRecipes, saveRecipes, watchRecipesInOtherTabs } from "./storage.js";
import { validateInput, removeInvalidRecipes, createRecipe, addRecipe, removeRecipe, setRating } from "./recipes.js";
import { initUI, renderRecipes, showListMessage, RESULT } from "./ui.js";

// Appens aktuella data. Det här är det enda stället där den ändras.
let recipes = [];

// Läser sparad data och tar bort trasiga recept. Ger recepten och vilket
// meddelande som ska visas ovanför listan, eller null om allt gick bra.
function readSavedRecipes() {
  const loaded = loadRecipes();
  if (loaded.status === "unreadable") {
    // Visa en tom lista. Den oläsliga datan finns kvar som kopia om backedUp.
    return { recipes: [], message: loaded.backedUp ? "unreadable" : "unreadableNoBackup" };
  }
  const { recipes: valid, removedCount } = removeInvalidRecipes(loaded.recipes);
  if (removedCount === 0) {
    return { recipes: valid, message: null };
  }
  // Spara den rensade listan så att meddelandet bara visas en gång. Gick det
  // inte ligger de trasiga recepten kvar i lagringen, och då säger meddelandet
  // bara att de inte visas.
  return { recipes: valid, message: saveRecipes(valid) ? "removed" : "removedNotSaved" };
}

// Läser in sparad data, visar eventuellt ett meddelande och ritar om listan.
// Körs när appen startar och när en annan flik har sparat.
function loadAndRender() {
  const { recipes: saved, message } = readSavedRecipes();
  recipes = saved;
  if (message) {
    showListMessage(message);
  }
  renderRecipes(recipes);
}

// Ändrar datan med en funktion från recipes.js och sparar resultatet direkt,
// så att ingen ändring kan glömma att sparas. Om sparandet misslyckas behålls
// den gamla datan, så att det som visas alltid stämmer med det som är sparat.
// Ger { status: RESULT.DONE } eller { status: RESULT.SAVE_FAILED }.
function updateRecipes(applyChange) {
  const changed = applyChange(recipes);
  if (!saveRecipes(changed)) {
    return { status: RESULT.SAVE_FAILED };
  }
  recipes = changed;
  return { status: RESULT.DONE };
}

// Alla tre ger ett svar i formen { status }, se RESULT i ui.js.
initUI({
  onAdd(name, url) {
    const error = validateInput(name, url);
    if (error) {
      return { status: RESULT.INVALID, error };
    }
    const result = updateRecipes((current) => addRecipe(current, createRecipe(name, url)));
    if (result.status === RESULT.DONE) {
      renderRecipes(recipes);
    }
    return result;
  },

  onRemove(id) {
    const result = updateRecipes((current) => removeRecipe(current, id));
    if (result.status === RESULT.DONE) {
      renderRecipes(recipes);
    }
    return result;
  },

  onRate(id, personKey, value) {
    return updateRecipes((current) => setRating(current, id, personKey, value));
  },
});

// Läs in på nytt när en annan flik har sparat, så att den här fliken inte
// skriver över den andra flikens ändringar nästa gång den sparar.
watchRecipesInOtherTabs(loadAndRender);

loadAndRender();

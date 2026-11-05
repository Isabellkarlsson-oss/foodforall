// Food for All – startpunkt. Håller appens data och kopplar ihop
// lagring (storage.js), datalogik (recipes.js) och gränssnitt (ui.js).

import { loadRecipes, saveRecipes, watchRecipesInOtherTabs } from "./storage.js";
import { validateInput, cleanRecipes, createRecipe, addRecipe, removeRecipe, setRating } from "./recipes.js";
import { initUI, renderRecipes, showListMessage } from "./ui.js";

// Appens aktuella data. Det här är det enda stället där den ändras.
let recipes = [];

// Läser in sparad data, tar bort trasiga recept och ritar om listan.
function loadAndRender() {
  const { recipes: cleaned, removedCount } = cleanRecipes(loadRecipes());
  recipes = cleaned;
  if (removedCount > 0) {
    // Spara den rensade listan så att meddelandet bara visas en gång.
    saveRecipes(recipes);
    showListMessage("removed");
  }
  renderRecipes(recipes);
}

// Ändrar datan med en funktion från recipes.js och sparar resultatet direkt,
// så att ingen ändring kan glömma att sparas. Om sparandet misslyckas behålls
// den gamla datan, så att det som visas alltid stämmer med det som är sparat.
// Ger true om ändringen sparades.
function updateRecipes(change) {
  const changed = change(recipes);
  if (!saveRecipes(changed)) {
    return false;
  }
  recipes = changed;
  return true;
}

initUI({
  // Ger hur det gick:
  // { status: "added" }            – receptet lades till
  // { status: "invalid", error }   – fel i formuläret, error är { field, code }
  // { status: "saveFailed" }       – webbläsaren kunde inte spara
  onAdd(name, url) {
    const error = validateInput(name, url);
    if (error) {
      return { status: "invalid", error };
    }
    if (!updateRecipes((current) => addRecipe(current, createRecipe(name, url)))) {
      return { status: "saveFailed" };
    }
    renderRecipes(recipes);
    return { status: "added" };
  },

  // Ger true om receptet togs bort.
  onRemove(id) {
    if (!updateRecipes((current) => removeRecipe(current, id))) {
      return false;
    }
    renderRecipes(recipes);
    return true;
  },

  // Ger true om omdömet sparades.
  onRate(id, personKey, value) {
    return updateRecipes((current) => setRating(current, id, personKey, value));
  },
});

// Läs in på nytt när en annan flik har sparat, så att den här fliken inte
// skriver över den andra flikens ändringar nästa gång den sparar.
watchRecipesInOtherTabs(loadAndRender);

loadAndRender();

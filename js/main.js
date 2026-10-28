// Food for All – startpunkt. Håller appens data och kopplar ihop
// lagring (storage.js), datalogik (recipes.js) och gränssnitt (ui.js).

import { loadRecipes, saveRecipes } from "./storage.js";
import { validateInput, createRecipe, addRecipe, removeRecipe, setRating } from "./recipes.js";
import { initUI, renderRecipes } from "./ui.js";

// Appens aktuella data. Det här är det enda stället där den ändras.
let recipes = loadRecipes();

// Ändrar datan med en funktion från recipes.js och sparar resultatet direkt,
// så att ingen ändring kan glömma att sparas.
function updateRecipes(change) {
  recipes = change(recipes);
  saveRecipes(recipes);
}

initUI({
  // Ger felet från validateInput, eller null om receptet lades till.
  onAdd(name, url) {
    const error = validateInput(name, url);
    if (error) {
      return error;
    }
    updateRecipes((current) => addRecipe(current, createRecipe(name, url)));
    renderRecipes(recipes);
    return null;
  },

  onRemove(id) {
    updateRecipes((current) => removeRecipe(current, id));
    renderRecipes(recipes);
  },

  onRate(id, personKey, value) {
    updateRecipes((current) => setRating(current, id, personKey, value));
  },
});

renderRecipes(recipes);

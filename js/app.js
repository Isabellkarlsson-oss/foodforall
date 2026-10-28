// Food for All – all logik i en fil (tillfälligt).
// Delas upp i storage.js, recipes.js, ui.js och main.js i kursuppgiften.

// ---------- Inställningar ----------

const STORAGE_KEY = "foodforall.recipes";

// Personerna som kan sätta omdömen. "key" är det som sparas i datan,
// "name" är det som visas i gränssnittet.
const PEOPLE = [
  { key: "p1", name: "Isabell" },
  { key: "p2", name: "Christoffer" },
  { key: "p3", name: "Hugo" },
];

// ---------- Lagring ----------

// Läser recepten från localStorage. Ger en tom lista om inget finns
// eller om den sparade datan är trasig.
function loadRecipes() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

// Sparar hela listan med recept i localStorage.
function saveRecipes(recipes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
}

// ---------- Datalogik ----------

// Kontrollerar formulärets värden. Ger ett felmeddelande, eller "" om allt är okej.
function validateInput(name, url) {
  if (name === "") {
    return "Skriv ett namn på receptet.";
  }
  try {
    const parsed = new URL(url);
    // Bara vanliga webblänkar. Stoppar t.ex. "javascript:"-länkar.
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return "Länken måste börja med http:// eller https://.";
    }
  } catch {
    return "Skriv en giltig länk, till exempel https://www.ica.se/recept/...";
  }
  return "";
}

// Skapar ett nytt receptobjekt där ingen har svarat än.
function createRecipe(name, url) {
  return {
    id: crypto.randomUUID(),
    name,
    url,
    ratings: { p1: null, p2: null, p3: null },
  };
}

// Returnerar en ny lista med receptet tillagt sist.
function addRecipe(recipes, recipe) {
  return [...recipes, recipe];
}

// Returnerar en ny lista utan receptet med angivet id.
function removeRecipe(recipes, id) {
  return recipes.filter((recipe) => recipe.id !== id);
}

// Returnerar en ny lista där en persons omdöme för ett recept är ändrat.
// value: true = gillar, false = ogillar, null = inte svarat.
function setRating(recipes, id, personKey, value) {
  return recipes.map((recipe) =>
    recipe.id === id
      ? { ...recipe, ratings: { ...recipe.ratings, [personKey]: value } }
      : recipe
  );
}

// ---------- Gränssnitt ----------

const form = document.querySelector("#recipe-form");
const nameInput = document.querySelector("#recipe-name");
const urlInput = document.querySelector("#recipe-url");
const formError = document.querySelector("#form-error");
const list = document.querySelector("#recipe-list");
const listHeading = document.querySelector("#list-heading");
const emptyMessage = document.querySelector("#empty-message");

// Appens aktuella data. Ändras bara via funktionerna ovan.
let recipes = loadRecipes();

// Ritar om hela receptlistan utifrån `recipes`.
function render() {
  list.replaceChildren(...recipes.map(createRecipeItem));
  emptyMessage.hidden = recipes.length > 0;
}

// Bygger ett receptkort (<li>) med länk, tre omdömesmenyer och ta bort-knapp.
function createRecipeItem(recipe) {
  const item = document.createElement("li");
  item.className = "recipe";

  const link = document.createElement("a");
  link.className = "recipe-link";
  link.href = recipe.url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = recipe.name;

  const ratings = document.createElement("div");
  ratings.className = "ratings";
  for (const person of PEOPLE) {
    ratings.append(createRatingSelect(recipe, person));
  }

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "remove-button";
  removeButton.textContent = "Ta bort";
  removeButton.setAttribute("aria-label", `Ta bort ${recipe.name}`);
  removeButton.addEventListener("click", () => handleRemove(recipe));

  item.append(link, ratings, removeButton);
  return item;
}

// Bygger en rullgardinsmeny för en persons omdöme, t.ex. "Isabell gillar".
function createRatingSelect(recipe, person) {
  const select = document.createElement("select");
  select.setAttribute("aria-label", `Omdöme från ${person.name} om ${recipe.name}`);

  // Menyn kan bara hålla text, så true/false/null sparas som "true"/"false"/"".
  const options = [
    { value: "", text: `${person.name} –` },
    { value: "true", text: `${person.name} gillar` },
    { value: "false", text: `${person.name} ogillar` },
  ];
  for (const { value, text } of options) {
    select.append(new Option(text, value));
  }

  const current = recipe.ratings[person.key];
  select.value = current === null ? "" : String(current);

  select.addEventListener("change", () => {
    const value = select.value === "" ? null : select.value === "true";
    recipes = setRating(recipes, recipe.id, person.key, value);
    saveRecipes(recipes);
    // Ingen omritning här: menyn visar redan rätt val, och fokus ska stanna kvar.
  });

  return select;
}

// Lägger till ett recept när formuläret skickas.
function handleSubmit(event) {
  event.preventDefault();
  const name = nameInput.value.trim();
  const url = urlInput.value.trim();

  const error = validateInput(name, url);
  formError.textContent = error;
  if (error) {
    (name === "" ? nameInput : urlInput).focus();
    return;
  }

  recipes = addRecipe(recipes, createRecipe(name, url));
  saveRecipes(recipes);
  render();
  form.reset();
  nameInput.focus();
}

// Tar bort ett recept efter att användaren bekräftat.
function handleRemove(recipe) {
  if (!confirm(`Vill du ta bort ${recipe.name}?`)) {
    return;
  }
  recipes = removeRecipe(recipes, recipe.id);
  saveRecipes(recipes);
  render();
  // Knappen som hade fokus är borta, så flytta fokus till listans rubrik.
  listHeading.focus();
}

// ---------- Start ----------

form.addEventListener("submit", handleSubmit);
render();

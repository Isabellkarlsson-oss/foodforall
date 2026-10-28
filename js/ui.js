// Gränssnitt – all DOM-hantering. Ändrar aldrig datan själv, utan anropar
// funktionerna som main.js skickar in via initUI.

import { PERSON_KEYS } from "./recipes.js";

// ---------- Texter (all svensk text i gränssnittet som skapas av JS) ----------

// Namnen som visas för varje person. Nycklarna är de som sparas i datan.
const PERSON_NAMES = {
  p1: "Isabell",
  p2: "Christoffer",
  p3: "Hugo",
};

// Valen i omdömesmenyn. Menyn kan bara hålla text, så varje omdöme
// (true/false/null) får också ett textvärde i optionValue.
const RATING_OPTIONS = [
  { value: null, optionValue: "", text: "–" },
  { value: true, optionValue: "true", text: "gillar" },
  { value: false, optionValue: "false", text: "ogillar" },
];

const SAVE_FAILED = "Kunde inte spara. Försök igen.";

// Felmeddelanden för formuläret, per fält och felkod från main.js.
const ERROR_MESSAGES = {
  name: { empty: "Skriv ett namn på receptet." },
  url: {
    protocol: "Länken måste börja med http:// eller https://.",
    invalid: "Skriv en giltig länk, till exempel https://www.ica.se/recept/...",
  },
  save: { failed: SAVE_FAILED },
};

// Meddelanden som visas ovanför receptlistan.
const LIST_MESSAGES = {
  removed: "Kunde inte hitta länken. Försök igen med en annan länk",
  saveFailed: SAVE_FAILED,
};

const TEXTS = {
  removeButton: "Ta bort",
  removeLabel: (recipeName) => `Ta bort ${recipeName}`,
  confirmRemove: (recipeName) => `Vill du ta bort ${recipeName}?`,
  ratingLabel: (personName, recipeName) => `Omdöme från ${personName} om ${recipeName}`,
};

// ---------- Element i index.html ----------

const form = document.querySelector("#recipe-form");
const nameInput = document.querySelector("#recipe-name");
const urlInput = document.querySelector("#recipe-url");
const formError = document.querySelector("#form-error");
const list = document.querySelector("#recipe-list");
const listHeading = document.querySelector("#list-heading");
const listMessage = document.querySelector("#list-message");
const emptyMessage = document.querySelector("#empty-message");

// Funktionerna från main.js: onAdd, onRemove och onRate.
let handlers;

// Kopplar gränssnittet till main.js och lyssnar på formuläret.
export function initUI(appHandlers) {
  handlers = appHandlers;
  form.addEventListener("submit", handleSubmit);
}

// Ritar om hela receptlistan.
export function renderRecipes(recipes) {
  list.replaceChildren(...recipes.map(createRecipeItem));
  emptyMessage.hidden = recipes.length > 0;
}

// Visar ett meddelande ovanför listan, t.ex. showListMessage("removed").
export function showListMessage(key) {
  listMessage.textContent = LIST_MESSAGES[key];
}

// Visar felmeddelandet om ändringen inte sparades, annars tas ett gammalt
// meddelande bort eftersom det inte längre gäller.
function showSaveResult(saved) {
  if (saved) {
    listMessage.textContent = "";
  } else {
    showListMessage("saveFailed");
  }
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
  for (const personKey of PERSON_KEYS) {
    ratings.append(createRatingSelect(recipe, personKey));
  }

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "remove-button";
  removeButton.textContent = TEXTS.removeButton;
  removeButton.setAttribute("aria-label", TEXTS.removeLabel(recipe.name));
  removeButton.addEventListener("click", () => handleRemove(recipe));

  item.append(link, ratings, removeButton);
  return item;
}

// Bygger en rullgardinsmeny för en persons omdöme, t.ex. "Isabell gillar".
function createRatingSelect(recipe, personKey) {
  const personName = PERSON_NAMES[personKey];
  const select = document.createElement("select");
  select.setAttribute("aria-label", TEXTS.ratingLabel(personName, recipe.name));

  for (const { optionValue, text } of RATING_OPTIONS) {
    select.append(new Option(`${personName} ${text}`, optionValue));
  }
  select.value = toOptionValue(recipe.ratings[personKey]);

  // Kom ihåg det sparade valet, så att menyn kan ändras tillbaka om sparandet misslyckas.
  let savedValue = select.value;
  select.addEventListener("change", () => {
    const saved = handlers.onRate(recipe.id, personKey, fromOptionValue(select.value));
    // Ingen omritning här: menyn visar redan rätt val, och fokus ska stanna kvar.
    if (saved) {
      savedValue = select.value;
    } else {
      select.value = savedValue;
    }
    showSaveResult(saved);
  });

  return select;
}

// Översätter ett omdöme (true/false/null) till menyns textvärde.
function toOptionValue(rating) {
  return RATING_OPTIONS.find((option) => option.value === rating).optionValue;
}

// Översätter menyns textvärde tillbaka till ett omdöme (true/false/null).
function fromOptionValue(optionValue) {
  return RATING_OPTIONS.find((option) => option.optionValue === optionValue).value;
}

// Lägger till ett recept när formuläret skickas.
function handleSubmit(event) {
  event.preventDefault();
  const name = nameInput.value.trim();
  const url = urlInput.value.trim();

  const error = handlers.onAdd(name, url);
  formError.textContent = error ? ERROR_MESSAGES[error.field][error.code] : "";
  if (error) {
    // Vid sparfel finns inget fält att markera, så fokus stannar där det är.
    const fieldInputs = { name: nameInput, url: urlInput };
    fieldInputs[error.field]?.focus();
    return;
  }

  form.reset();
  nameInput.focus();
}

// Tar bort ett recept efter att användaren bekräftat.
function handleRemove(recipe) {
  if (!confirm(TEXTS.confirmRemove(recipe.name))) {
    return;
  }
  const removed = handlers.onRemove(recipe.id);
  showSaveResult(removed);
  if (removed) {
    // Knappen som hade fokus är borta, så flytta fokus till listans rubrik.
    listHeading.focus();
  }
}

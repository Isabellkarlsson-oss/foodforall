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

// Felmeddelanden för formuläret, per fält och felkod från recipes.js.
const ERROR_MESSAGES = {
  name: { empty: "Skriv ett namn på receptet." },
  url: {
    protocol: "Länken måste börja med http:// eller https://.",
    invalid: "Skriv en giltig länk, till exempel https://www.ica.se/recept/...",
  },
};

// Meddelanden som visas ovanför receptlistan.
const LIST_MESSAGES = {
  removed: "Ett eller flera sparade recept kunde inte läsas in och har tagits bort.",
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

// Fälten i formuläret, per fältnamn i felen från main.js.
const FIELD_INPUTS = { name: nameInput, url: urlInput };

// Funktionerna från main.js: onAdd, onRemove och onRate.
let handlers;

// Kopplar gränssnittet till main.js och lyssnar på formuläret.
export function initUI(appHandlers) {
  handlers = appHandlers;
  form.addEventListener("submit", handleSubmit);
  for (const input of Object.values(FIELD_INPUTS)) {
    input.addEventListener("input", () => {
      // Felet gäller inte längre när användaren har börjat rätta fältet.
      if (input.getAttribute("aria-invalid") === "true") {
        clearFormError();
      }
    });
  }
}

// Ritar om hela receptlistan. Hade en meny eller knapp i listan fokus får
// samma kontroll fokus igen, t.ex. när en annan flik har sparat.
export function renderRecipes(recipes) {
  const focused = findFocusedControl();
  list.replaceChildren(...recipes.map((recipe, index) => createRecipeItem(recipe, index)));
  emptyMessage.hidden = recipes.length > 0;
  if (focused) {
    restoreFocus(focused);
  }
}

// Ger vilket recept och vilken kontroll i listan som har fokus, eller null.
function findFocusedControl() {
  const active = document.activeElement;
  if (!list.contains(active) || !active.dataset.control) {
    return null;
  }
  return { recipeId: active.closest(".recipe").dataset.recipeId, control: active.dataset.control };
}

// Sätter fokus på samma kontroll i det omritade kortet. Finns receptet inte
// längre hamnar fokus på listans rubrik, som när man själv tar bort ett recept.
function restoreFocus({ recipeId, control }) {
  const item = [...list.children].find((li) => li.dataset.recipeId === recipeId);
  const target = item?.querySelector(`[data-control="${control}"]`);
  (target ?? listHeading).focus();
}

// Visar ett meddelande ovanför listan, t.ex. showListMessage("removed").
export function showListMessage(key) {
  listMessage.textContent = LIST_MESSAGES[key];
}

// Visar i receptkortet om en ändring inte sparades. Felet kopplas till menyn
// eller knappen som användes, så att skärmläsare läser upp det tillsammans.
// Lyckades det tas gamla fel bort, både i kortet och ovanför listan.
function showCardSaveResult(control, cardError, saved) {
  for (const linked of cardError.parentElement.querySelectorAll("[aria-describedby]")) {
    linked.removeAttribute("aria-describedby");
  }
  if (saved) {
    cardError.textContent = "";
    listMessage.textContent = "";
  } else {
    cardError.textContent = SAVE_FAILED;
    control.setAttribute("aria-describedby", cardError.id);
  }
}

// Bygger ett receptkort (<li>) med länk, tre omdömesmenyer, en rad för
// sparfel och ta bort-knapp. index ger felraden ett unikt id.
function createRecipeItem(recipe, index) {
  const item = document.createElement("li");
  item.className = "recipe";
  // Används för att hitta tillbaka till kortet efter en omritning.
  item.dataset.recipeId = recipe.id;

  const link = document.createElement("a");
  link.className = "recipe-link";
  link.href = recipe.url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = recipe.name;

  // Tom tills något inte gick att spara. role="alert" läser upp felet direkt.
  const cardError = document.createElement("p");
  cardError.className = "recipe-error";
  cardError.id = `recipe-error-${index}`;
  cardError.setAttribute("role", "alert");

  const ratings = document.createElement("div");
  ratings.className = "ratings";
  for (const personKey of PERSON_KEYS) {
    ratings.append(createRatingSelect(recipe, personKey, cardError));
  }

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "remove-button";
  removeButton.dataset.control = "remove";
  removeButton.textContent = TEXTS.removeButton;
  removeButton.setAttribute("aria-label", TEXTS.removeLabel(recipe.name));
  removeButton.addEventListener("click", () => handleRemove(recipe, removeButton, cardError));

  item.append(link, ratings, cardError, removeButton);
  return item;
}

// Bygger en rullgardinsmeny för en persons omdöme, t.ex. "Isabell gillar".
function createRatingSelect(recipe, personKey, cardError) {
  const personName = PERSON_NAMES[personKey];
  const select = document.createElement("select");
  select.dataset.control = personKey;
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
    showCardSaveResult(select, cardError, saved);
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
  // Skickas vidare som de skrevs. recipes.js bestämmer vad som är giltigt.
  const result = handlers.onAdd(nameInput.value, urlInput.value);

  if (result.status === "invalid") {
    showFieldError(result.error);
  } else if (result.status === "saveFailed") {
    // Inget fält är fel, så texten i formuläret och fokus får vara kvar.
    clearFormError();
    formError.textContent = SAVE_FAILED;
  } else {
    clearFormError();
    form.reset();
    nameInput.focus();
  }
}

// Visar felet under formuläret, markerar fältet som ogiltigt och kopplar det
// till felmeddelandet, så att skärmläsare läser upp felet tillsammans med
// fältets namn.
function showFieldError(error) {
  clearFormError();
  formError.textContent = ERROR_MESSAGES[error.field][error.code];
  const input = FIELD_INPUTS[error.field];
  input.setAttribute("aria-invalid", "true");
  input.setAttribute("aria-describedby", formError.id);
  input.focus();
}

// Tar bort felmeddelandet och fältens felmarkering.
function clearFormError() {
  formError.textContent = "";
  for (const input of Object.values(FIELD_INPUTS)) {
    input.removeAttribute("aria-invalid");
    input.removeAttribute("aria-describedby");
  }
}

// Tar bort ett recept efter att användaren bekräftat.
function handleRemove(recipe, removeButton, cardError) {
  if (!confirm(TEXTS.confirmRemove(recipe.name))) {
    return;
  }
  if (handlers.onRemove(recipe.id)) {
    listMessage.textContent = "";
    // Knappen som hade fokus är borta, så flytta fokus till listans rubrik.
    listHeading.focus();
  } else {
    showCardSaveResult(removeButton, cardError, false);
  }
}

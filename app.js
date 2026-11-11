const questionList = document.querySelector("#question-list");
const questionCount = document.querySelector("#question-count");
const topicMenu = document.querySelector("#topic-menu");
const topicButtons = document.querySelector("#topic-buttons");
const menuButton = document.querySelector("#menu-button");
let questions = [];

function createQuestion(item) {
  const article = document.createElement("article");
  article.className = "question";

  const heading = document.createElement("h2");
  const number = document.createElement("span");
  number.className = "question-number";
  number.textContent = `${item.sourceNumber}.`;
  const text = document.createElement("span");
  text.className = "question-text";
  text.textContent = item.question;
  heading.append(number, text);

  const images = document.createElement("div");
  images.className = "question-images";
  for (const path of item.images || []) {
    const image = document.createElement("img");
    image.src = path;
    image.alt = `Obrázok k otázke ${item.sourceNumber}`;
    image.loading = "lazy";
    images.append(image);
  }

  const answerLabel = document.createElement("h3");
  answerLabel.textContent = "Odpoveď";
  const answer = document.createElement("p");
  answer.className = "answer";
  answer.textContent = item.answer;

  article.append(heading);
  if (images.childElementCount > 0) article.append(images);
  article.append(answerLabel, answer);
  return article;
}

async function loadQuestions() {
  const response = await fetch("data/questions.json");
  if (!response.ok) throw new Error(`Načítanie otázok zlyhalo (${response.status}).`);

  questions = await response.json();
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("Databáza otázok je prázdna.");
  }

  createTopicMenu();
  showMenu();
}

function createTopicMenu() {
  const topics = new Map();
  for (const item of questions) {
    topics.set(item.section, (topics.get(item.section) || 0) + 1);
  }

  const fragment = document.createDocumentFragment();
  const allButton = createTopicButton("Všetky otázky", questions.length, () => showQuestions(questions));
  allButton.classList.add("topic-button-featured");
  fragment.append(allButton);

  for (const [name, count] of topics) {
    fragment.append(createTopicButton(name, count, () => {
      showQuestions(questions.filter((item) => item.section === name));
    }));
  }
  topicButtons.replaceChildren(fragment);
}

function createTopicButton(name, count, onClick) {
  const button = document.createElement("button");
  button.className = "topic-button";
  button.type = "button";
  button.addEventListener("click", onClick);
  const title = document.createElement("span");
  title.className = "topic-title";
  title.textContent = name;
  const total = document.createElement("span");
  total.className = "topic-count";
  total.textContent = `${count} otázok`;
  button.append(title, total);
  return button;
}

function showMenu() {
  topicMenu.hidden = false;
  questionList.hidden = true;
  menuButton.hidden = true;
  questionCount.textContent = `${questions.length} otázok v 10 okruhoch`;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showQuestions(items) {
  const fragment = document.createDocumentFragment();
  for (const item of items) fragment.append(createQuestion(item));
  questionList.replaceChildren(fragment);
  topicMenu.hidden = true;
  questionList.hidden = false;
  menuButton.hidden = false;
  questionCount.textContent = `${items.length} otázok`;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

menuButton.addEventListener("click", showMenu);

loadQuestions().catch((error) => {
  questionCount.textContent = error.message;
});

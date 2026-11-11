const questionList = document.querySelector("#question-list");
const questionCount = document.querySelector("#question-count");
const topicMenu = document.querySelector("#topic-menu");
const topicButtons = document.querySelector("#topic-buttons");
const menuButton = document.querySelector("#menu-button");
const readingToolbar = document.querySelector("#reading-toolbar");
const activeTopic = document.querySelector("#active-topic");
const progressLabel = document.querySelector("#progress-label");
const progressBar = document.querySelector("#progress-bar");
let questions = [];
let visibleQuestions = [];
let currentTopic = "";
let observer;

function createQuestion(item) {
  const article = document.createElement("article");
  article.className = "question";
  article.dataset.questionId = item.id;

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
    image.addEventListener("load", () => {
      if (image.naturalWidth <= 180 && image.naturalHeight <= 180) {
        image.classList.add("image-small");
      } else if (image.naturalWidth < 240) {
        image.classList.add("image-medium");
      } else {
        image.classList.add("image-wide");
      }
    });
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
  readingToolbar.hidden = true;
  visibleQuestions = [];
  currentTopic = "";
  if (observer) observer.disconnect();
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
  readingToolbar.hidden = false;
  visibleQuestions = items;
  currentTopic = items.length === questions.length ? "Všetky otázky" : items[0].section;
  activeTopic.textContent = shortenTopicName(currentTopic);
  questionCount.textContent = `${items.length} otázok`;
  updateProgress(1);
  observeQuestions();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function shortenTopicName(name) {
  const words = name.trim().split(/\s+/);
  return words.length > 3 ? `${words.slice(0, 3).join(" ")}...` : name;
}

function updateProgress(position) {
  const total = visibleQuestions.length;
  if (!total) return;
  const safePosition = Math.min(Math.max(position, 1), total);
  progressLabel.textContent = `${safePosition} z ${total}`;
  progressBar.style.width = `${(safePosition / total) * 100}%`;
}

function observeQuestions() {
  if (observer) observer.disconnect();
  const articles = [...questionList.querySelectorAll(".question")];
  observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
    if (!visible) return;
    const position = articles.indexOf(visible.target) + 1;
    updateProgress(position);
  }, { rootMargin: "-88px 0px -65% 0px", threshold: 0 });
  articles.forEach((article) => observer.observe(article));
}

menuButton.addEventListener("click", showMenu);

loadQuestions().catch((error) => {
  questionCount.textContent = error.message;
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch((error) => {
    console.warn("Offline režim sa nepodarilo aktivovať.", error);
  });
}

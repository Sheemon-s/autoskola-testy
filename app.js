const questionList = document.querySelector("#question-list");
const questionCount = document.querySelector("#question-count");

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

  const questions = await response.json();
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("Databáza otázok je prázdna.");
  }

  const fragment = document.createDocumentFragment();
  for (const item of questions) fragment.append(createQuestion(item));
  questionList.replaceChildren(fragment);
  questionCount.textContent = `${questions.length} otázok na jednom mieste`;
}

loadQuestions().catch((error) => {
  questionCount.textContent = error.message;
});

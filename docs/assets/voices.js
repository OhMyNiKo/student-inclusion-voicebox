const API_BASE = "https://student-inclusion-voicebox.niko20090709.chatgpt.site";
const grid = document.querySelector("#question-grid");
const status = document.querySelector("#board-status");

loadQuestions();

async function loadQuestions() {
  try {
    const response = await fetch(`${API_BASE}/api/questions`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Published questions could not be loaded.");

    const questions = Array.isArray(data.questions) ? data.questions : [];
    status.hidden = true;

    if (!questions.length) {
      status.hidden = false;
      status.className = "loading-card empty";
      status.textContent = "No published questions yet. Once the team replies, they will appear here.";
      return;
    }

    questions.forEach((question, index) => {
      grid.append(createQuestionCard(question, questions.length - index));
    });
  } catch (error) {
    status.className = "loading-card error-card";
    status.textContent = error instanceof Error ? error.message : "Please refresh in a moment.";
  }
}

function createQuestionCard(question, number) {
  const article = document.createElement("article");
  article.className = "question-card";

  const header = document.createElement("div");
  header.className = "question-card-head";

  const voice = document.createElement("span");
  voice.className = "voice-number";
  voice.textContent = `Voice #${number}`;

  const time = document.createElement("time");
  time.dateTime = new Date(question.createdAt * 1000).toISOString();
  time.textContent = formatTimestamp(question.createdAt);
  header.append(voice, time);

  const conversation = document.createElement("div");
  conversation.className = "conversation";
  conversation.append(
    createBubble("Anonymous student", question.questionText, "student"),
    createBubble("Student Inclusion", question.replyText || "", "official")
  );

  article.append(header, conversation);
  return article;
}

function createBubble(author, body, type) {
  const bubble = document.createElement("div");
  bubble.className = `bubble ${type}`;
  const label = document.createElement("strong");
  label.textContent = author;
  const text = document.createElement("p");
  text.textContent = body;
  bubble.append(label, text);
  return bubble;
}

function formatTimestamp(seconds) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).format(new Date(seconds * 1000));
}

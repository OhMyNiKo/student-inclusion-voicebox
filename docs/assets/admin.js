const API_BASE = "https://student-inclusion-voicebox.niko20090709.chatgpt.site";
const TOKEN_KEY = "siAdminToken";
const token = sessionStorage.getItem(TOKEN_KEY);

if (!token) window.location.replace("../");

const queue = document.querySelector("#review-queue");
const status = document.querySelector("#admin-status");
const dialog = document.querySelector("#delete-dialog");
const confirmDelete = document.querySelector("#confirm-delete");
let questions = [];
let deleteTarget = null;

document.querySelector("#sign-out").addEventListener("click", () => {
  sessionStorage.removeItem(TOKEN_KEY);
  window.location.replace("../");
});

confirmDelete.addEventListener("click", async (event) => {
  event.preventDefault();
  if (!deleteTarget) return;
  const target = deleteTarget;
  deleteTarget = null;
  dialog.close("confirm");
  await deleteQuestion(target);
});

dialog.addEventListener("close", () => {
  if (dialog.returnValue !== "confirm") deleteTarget = null;
});

loadQueue();

async function api(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  const data = await response.json();
  if (response.status === 401) {
    sessionStorage.removeItem(TOKEN_KEY);
    window.location.replace("../");
    throw new Error("Your moderation session has expired.");
  }
  if (!response.ok) throw new Error(data.error || "The request could not be completed.");
  return data;
}

async function loadQueue() {
  try {
    const data = await api("/api/admin/questions");
    questions = Array.isArray(data.questions) ? data.questions : [];
    renderQueue();
  } catch (error) {
    showStatus(error instanceof Error ? error.message : "The review queue could not be loaded.", true);
  }
}

function renderQueue() {
  queue.replaceChildren();
  updateCounts();

  if (!questions.length) {
    showStatus("The queue is clear. New anonymous submissions will appear here.");
    return;
  }

  status.hidden = true;
  questions.forEach((question, index) => queue.append(createReviewCard(question, index)));
}

function createReviewCard(question, index) {
  const article = document.createElement("article");
  article.className = "review-card";
  article.dataset.id = question.id;

  const top = document.createElement("div");
  top.className = "review-top";
  const meta = document.createElement("div");
  meta.className = "review-meta";
  meta.append(
    makeBadge(`#${index + 1}`, "number-badge"),
    makeBadge(question.status, question.status === "published" ? "published-badge" : "pending-badge")
  );
  const time = document.createElement("time");
  time.dateTime = new Date(question.createdAt * 1000).toISOString();
  time.textContent = formatTimestamp(question.createdAt);
  meta.append(time);

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "delete-button";
  remove.setAttribute("aria-label", "Delete question");
  remove.textContent = "×";
  remove.addEventListener("click", () => {
    deleteTarget = question.id;
    dialog.showModal();
  });
  top.append(meta, remove);

  const questionBox = document.createElement("div");
  questionBox.className = "question-box";
  const questionLabel = document.createElement("strong");
  questionLabel.textContent = "Anonymous question";
  const questionText = document.createElement("p");
  questionText.textContent = question.questionText;
  questionBox.append(questionLabel, questionText);

  const replyLabel = document.createElement("label");
  replyLabel.className = "reply-label";
  replyLabel.htmlFor = `reply-${question.id}`;
  replyLabel.textContent = "Official reply";
  const reply = document.createElement("textarea");
  reply.id = `reply-${question.id}`;
  reply.className = "reply-box";
  reply.maxLength = 2000;
  reply.placeholder = "Write the Student Inclusion response…";
  reply.value = question.replyText || "";

  const replyActions = document.createElement("div");
  replyActions.className = "reply-actions";
  const counter = document.createElement("span");
  counter.textContent = `${reply.value.length} / 2000`;
  reply.addEventListener("input", () => {
    counter.textContent = `${reply.value.length} / 2000`;
  });
  const publish = document.createElement("button");
  publish.type = "button";
  publish.className = "submit-button compact";
  publish.textContent = question.status === "published" ? "Update reply →" : "Reply →";
  publish.addEventListener("click", () => publishReply(question.id, reply, publish));
  replyActions.append(counter, publish);

  article.append(top, questionBox, replyLabel, reply, replyActions);
  return article;
}

async function publishReply(id, textarea, button) {
  const reply = textarea.value.trim();
  if (!reply) {
    textarea.focus();
    showStatus("Write a reply before publishing.", true);
    return;
  }

  button.disabled = true;
  const original = button.textContent;
  button.textContent = "Publishing…";
  try {
    const data = await api(`/api/admin/questions/${encodeURIComponent(id)}/reply`, {
      method: "POST",
      body: JSON.stringify({ reply }),
    });
    questions = questions.map((question) =>
      question.id === id
        ? { ...question, replyText: reply, repliedAt: data.repliedAt, status: "published" }
        : question
    );
    renderQueue();
    showStatus("Reply published to the public board.");
  } catch (error) {
    showStatus(error instanceof Error ? error.message : "The reply could not be published.", true);
    button.disabled = false;
    button.textContent = original;
  }
}

async function deleteQuestion(id) {
  try {
    await api(`/api/admin/questions/${encodeURIComponent(id)}`, { method: "DELETE" });
    questions = questions.filter((question) => question.id !== id);
    deleteTarget = null;
    renderQueue();
    showStatus("Question permanently deleted.");
  } catch (error) {
    showStatus(error instanceof Error ? error.message : "The question could not be deleted.", true);
  }
}

function updateCounts() {
  const pending = questions.filter((question) => question.status === "pending").length;
  document.querySelector("#all-count").textContent = questions.length;
  document.querySelector("#pending-count").textContent = pending;
  document.querySelector("#published-count").textContent = questions.length - pending;
}

function makeBadge(text, className) {
  const badge = document.createElement("span");
  badge.className = className;
  badge.textContent = text;
  return badge;
}

function showStatus(text, isError = false) {
  status.hidden = false;
  status.className = `loading-card ${isError ? "error-card" : "success-card"}`;
  status.textContent = text;
  if (!isError) window.setTimeout(() => { status.hidden = true; }, 3500);
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

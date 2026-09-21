const API_BASE = "https://student-inclusion-voicebox.niko20090709.chatgpt.site";
const MAX_LENGTH = 1000;

const form = document.querySelector("#feedback-form");
const message = document.querySelector("#message");
const website = document.querySelector("#website");
const count = document.querySelector("#character-count");
const status = document.querySelector("#form-status");
const submit = form.querySelector("button[type='submit']");
const label = submit.querySelector(".button-label");

message.addEventListener("input", () => {
  count.textContent = `${message.value.length} / ${MAX_LENGTH}`;
  status.textContent = "";
  status.className = "form-status";
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const trimmed = message.value.trim();

  if (!trimmed) {
    showStatus("Please write a message before sending.", true);
    message.focus();
    return;
  }

  submit.disabled = true;
  label.textContent = "Sending";

  try {
    const response = await fetch(`${API_BASE}/api/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: trimmed, website: website.value }),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Your message could not be sent.");
    }

    if (data.adminToken) {
      sessionStorage.setItem("siAdminToken", data.adminToken);
      window.location.href = new URL("admin/", window.location.href).href;
      return;
    }

    message.value = "";
    count.textContent = `0 / ${MAX_LENGTH}`;
    showStatus("Message sent. Thank you for speaking up.");
  } catch (error) {
    showStatus(error instanceof Error ? error.message : "Please try again.", true);
  } finally {
    submit.disabled = false;
    label.textContent = "Submit";
  }
});

function showStatus(text, isError = false) {
  status.textContent = text;
  status.className = `form-status ${isError ? "error" : "success"}`;
}

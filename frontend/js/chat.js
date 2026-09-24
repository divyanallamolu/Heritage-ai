/**
 * HeritageAI Cultural AI Chat Controller
 */
import { sendChatMessage } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  setupChatPage();
});

function setupChatPage() {
  const messagesContainer = document.getElementById("chat-messages");
  const chatInput = document.getElementById("chat-input");
  const sendBtn = document.getElementById("send-btn");
  const suggestionsContainer = document.getElementById("suggestions-container");

  const initialMessages = [
    {
      sender: "ai",
      text: "Welcome to the Heritage AI Assistant. I have indexed all oral transcripts, Summaries, and Dialects from the public library archive. Ask me anything about the stories or folk recipes preserved in our database."
    }
  ];

  let messages = [...initialMessages];

  function renderMessages() {
    if (!messagesContainer) return;

    messagesContainer.innerHTML = messages.map(msg => `
      <div style="display: flex; gap: 0.75rem; align-items: flex-start; margin-bottom: 1rem; ${msg.sender === 'user' ? 'flex-direction: row-reverse;' : ''}">
        <div style="width: 2.25rem; height: 2.25rem; border-radius: var(--radius-md); background-color: ${msg.sender === 'user' ? 'var(--heritage-green-600)' : 'var(--gold-600)'}; color: #ffffff; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0;">
          ${msg.sender === 'user' ? '👤' : '✨'}
        </div>
        <div style="max-width: 80%; padding: 0.85rem 1.15rem; border-radius: var(--radius-xl); font-size: 0.875rem; line-height: 1.6; white-space: pre-line; ${
          msg.sender === 'user'
            ? 'background-color: var(--heritage-green-600); color: #ffffff;'
            : 'background-color: #ffffff; color: #374151; border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);'
        }">
          ${msg.text}
        </div>
      </div>
    `).join("");

    scrollToBottom();
  }

  function scrollToBottom() {
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  async function handleSend(customText = "") {
    const textToSend = customText || (chatInput ? chatInput.value : "");
    if (!textToSend || !textToSend.trim()) return;

    messages.push({ sender: "user", text: textToSend });
    if (chatInput) chatInput.value = "";
    if (suggestionsContainer) suggestionsContainer.style.display = "none";
    renderMessages();

    // Loading indicator bubble
    messages.push({ sender: "ai", text: "Consulting oral records vault...", isLoading: true });
    renderMessages();

    if (sendBtn) sendBtn.disabled = true;

    try {
      const res = await sendChatMessage(textToSend);
      messages.pop(); // Remove loading bubble
      messages.push({ sender: "ai", text: res.answer || "I couldn't generate a response." });
    } catch (err) {
      messages.pop();
      messages.push({ sender: "ai", text: "I'm having trouble connecting to the Heritage knowledge vault. Please check your connection." });
    } finally {
      if (sendBtn) sendBtn.disabled = false;
      renderMessages();
    }
  }

  // Setup Prompt Suggestions
  document.querySelectorAll(".prompt-suggestion-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const query = btn.getAttribute("data-query");
      handleSend(query);
    });
  });

  if (sendBtn) {
    sendBtn.addEventListener("click", () => handleSend());
  }

  if (chatInput) {
    chatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });

    chatInput.addEventListener("input", () => {
      chatInput.style.height = "auto";
      chatInput.style.height = `${chatInput.scrollHeight}px`;
    });
  }

  renderMessages();
}

/**
 * HeritageAI User Profile Controller
 */
import { getMyInterviews, deleteInterview, getPublicLibrary } from "./api.js";
import { getUser, getInitials, requireAuth } from "./auth.js";
import { CENTRAL_STORIES } from "../data/stories.js";

let userInterviews = [];
let savedStories = [];

document.addEventListener("DOMContentLoaded", async () => {
  if (!requireAuth()) return;
  setupTabs();
  setupProfileForm();
  setupAvatarUpload();
  setupThemeSwitcher();
  await loadProfileData();
});

async function loadProfileData() {
  const user = getUser();
  const displayNameElem = document.getElementById("profile-display-name");
  const usernameElem = document.getElementById("profile-username");
  const bioElem = document.getElementById("profile-bio-text");

  const displayName = localStorage.getItem("profile_display_name") || user?.name || "Elder Custodian";
  const username = localStorage.getItem("profile_username") || (user?.name ? "@" + user.name.toLowerCase().replace(/\s+/g, "") : "@caretaker");
  const bio = localStorage.getItem("profile_bio") || "Custodian of cultural memory. Recording and preserving elder histories for future generations.";

  if (displayNameElem) displayNameElem.textContent = displayName;
  if (usernameElem) usernameElem.textContent = username;
  if (bioElem) bioElem.textContent = bio;

  // Load My Interviews
  try {
    userInterviews = await getMyInterviews();
  } catch (err) {
    userInterviews = [];
  }

  // Load Saved Stories
  let savedIds = [];
  try {
    const raw = localStorage.getItem("saved_interviews");
    savedIds = raw ? JSON.parse(raw) : [];
  } catch (e) {}

  let publicStories = [];
  try {
    publicStories = await getPublicLibrary();
  } catch (e) {
    publicStories = CENTRAL_STORIES;
  }

  const merged = [...publicStories];
  CENTRAL_STORIES.forEach(fallback => {
    if (!merged.some(item => item.elder_name === fallback.elder_name)) {
      merged.push(fallback);
    }
  });

  savedStories = merged.filter(story => savedIds.includes(story.id));

  // Update counters
  const myCountElem = document.getElementById("my-posts-count");
  const savedCountElem = document.getElementById("saved-stories-count");
  if (myCountElem) myCountElem.textContent = userInterviews.length;
  if (savedCountElem) savedCountElem.textContent = savedStories.length;

  renderMyInterviews();
  renderSavedStories();
}

function setupTabs() {
  const tabs = document.querySelectorAll(".profile-tab-btn");
  const tabContents = document.querySelectorAll(".profile-tab-content");

  // Read URL query parameter ?tab=...
  const urlParams = new URLSearchParams(window.location.search);
  const activeTabName = urlParams.get("tab") || "posts";

  tabs.forEach(tab => {
    const target = tab.getAttribute("data-tab");
    if (target === activeTabName) {
      tab.classList.add("active");
    } else {
      tab.classList.remove("active");
    }

    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tabContents.forEach(c => c.style.display = "none");

      tab.classList.add("active");
      const targetContent = document.getElementById(`tab-content-${target}`);
      if (targetContent) targetContent.style.display = "block";
    });
  });

  tabContents.forEach(c => c.style.display = "none");
  const initialContent = document.getElementById(`tab-content-${activeTabName}`);
  if (initialContent) initialContent.style.display = "block";
}

function renderMyInterviews() {
  const container = document.getElementById("my-interviews-list");
  if (!container) return;

  if (userInterviews.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem 1rem; color: #6b7280;">
        <p style="font-size: 1rem; font-weight: 700; margin-bottom: 0.5rem;">No preserved interviews recorded yet.</p>
        <a href="interview.html" class="btn btn-primary" style="margin-top: 0.5rem;">Record First Story</a>
      </div>
    `;
    return;
  }

  container.innerHTML = userInterviews.map(item => `
    <div class="card" style="margin-bottom: 1rem;">
      <div class="flex items-start justify-between">
        <div>
          <span class="badge badge-gold">${item.language}</span>
          <h3 class="font-serif" style="font-size: 1.25rem; color: var(--heritage-green-600); margin-top: 0.3rem;">${item.elder_name}</h3>
          <p style="font-size: 0.8rem; color: #6b7280;">📍 ${item.village_or_city || ''} ${item.state ? '• ' + item.state : ''}</p>
        </div>
        <button class="delete-interview-btn btn btn-outline" data-id="${item.id}" style="color: #dc2626; border-color: #fca5a5; padding: 0.35rem 0.75rem; font-size: 0.75rem;">
          🗑️ Delete
        </button>
      </div>
      <p style="font-size: 0.85rem; color: #4b5563; margin-top: 0.75rem; line-height: 1.5;">
        ${item.ai_summary || item.transcript?.substring(0, 150) + '...'}
      </p>
    </div>
  `).join("");

  document.querySelectorAll(".delete-interview-btn").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const id = btn.getAttribute("data-id");
      if (confirm("Are you sure you want to delete this preserved interview?")) {
        try {
          await deleteInterview(id);
          await loadProfileData();
        } catch (err) {
          alert("Failed to delete interview.");
        }
      }
    });
  });
}

function renderSavedStories() {
  const container = document.getElementById("saved-stories-list");
  if (!container) return;

  if (savedStories.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem 1rem; color: #6b7280;">
        <p style="font-size: 1rem; font-weight: 700; margin-bottom: 0.5rem;">No saved stories bookmarked yet.</p>
        <a href="library.html" class="btn btn-outline" style="margin-top: 0.5rem;">Browse Heritage Library</a>
      </div>
    `;
    return;
  }

  container.innerHTML = savedStories.map(story => `
    <div class="card" style="margin-bottom: 1rem;">
      <div class="flex items-start justify-between">
        <div>
          <span class="badge badge-green">${story.language} • ${story.category || 'Heritage'}</span>
          <h3 class="font-serif" style="font-size: 1.25rem; color: var(--heritage-green-600); margin-top: 0.3rem;">${story.elder_name}</h3>
          <p style="font-size: 0.8rem; color: #6b7280;">📍 ${story.state || 'India'}</p>
        </div>
        <a href="library.html" class="btn btn-outline" style="padding: 0.35rem 0.75rem; font-size: 0.75rem;">Read Story</a>
      </div>
      <p style="font-size: 0.85rem; color: #4b5563; margin-top: 0.75rem;">
        "${story.ai_summary || story.transcript?.substring(0, 140) + '...'}"
      </p>
    </div>
  `).join("");
}

function setupProfileForm() {
  const nameInput = document.getElementById("edit-display-name");
  const usernameInput = document.getElementById("edit-username");
  const bioInput = document.getElementById("edit-bio");
  const saveBtn = document.getElementById("save-settings-btn");

  const user = getUser();
  if (nameInput) nameInput.value = localStorage.getItem("profile_display_name") || user?.name || "";
  if (usernameInput) usernameInput.value = localStorage.getItem("profile_username") || "";
  if (bioInput) bioInput.value = localStorage.getItem("profile_bio") || "";

  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      if (nameInput && nameInput.value) localStorage.setItem("profile_display_name", nameInput.value);
      if (usernameInput && usernameInput.value) localStorage.setItem("profile_username", usernameInput.value);
      if (bioInput && bioInput.value) localStorage.setItem("profile_bio", bioInput.value);
      alert("Profile settings updated successfully!");
      window.location.reload();
    });
  }
}

function setupAvatarUpload() {
  const avatarInput = document.getElementById("avatar-file-input");
  if (!avatarInput) return;

  avatarInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      localStorage.setItem("profile_pic", reader.result);
      window.location.reload();
    };
    reader.readAsDataURL(file);
  });
}

function setupThemeSwitcher() {
  const themeSelect = document.getElementById("theme-select");
  if (!themeSelect) return;

  const currentTheme = localStorage.getItem("profile_theme") || "cream";
  themeSelect.value = currentTheme;

  themeSelect.addEventListener("change", () => {
    localStorage.setItem("profile_theme", themeSelect.value);
    window.location.reload();
  });
}

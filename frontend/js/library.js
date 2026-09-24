/**
 * HeritageAI Library Page Controller
 */
import { CENTRAL_STORIES } from "../data/stories.js";
import { getPublicLibrary } from "./api.js";

let allStories = [];
let savedIds = getSavedIds();
let selectedStory = null;

document.addEventListener("DOMContentLoaded", async () => {
  setupFilterDropdowns();
  setupEventListeners();
  await loadLibraryStories();
});

function getSavedIds() {
  try {
    const raw = localStorage.getItem("saved_interviews");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSavedIds(ids) {
  localStorage.setItem("saved_interviews", JSON.stringify(ids));
}

function toggleSaveStory(id) {
  if (savedIds.includes(id)) {
    savedIds = savedIds.filter(sId => sId !== id);
  } else {
    savedIds.push(id);
  }
  saveSavedIds(savedIds);
  renderStories();
}

async function loadLibraryStories() {
  const container = document.getElementById("stories-grid");
  if (container) container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #6b7280; padding: 2rem;">Loading Heritage Library catalogue...</p>`;

  let apiItems = [];
  try {
    const data = await getPublicLibrary();
    apiItems = (data || []).map((item, idx) => enrichStory(item, idx));
  } catch (err) {
    console.warn("Library API fetch note, using catalogue fallbacks.");
  }

  const merged = [...apiItems];
  CENTRAL_STORIES.forEach(fallback => {
    if (!merged.some(item => item.elder_name === fallback.elder_name)) {
      merged.push(fallback);
    }
  });

  allStories = merged;
  populateDropdownOptions();
  renderStories();
}

function enrichStory(story, idx) {
  const seed = (story.id || idx) * 17;
  return {
    ...story,
    id: story.id || `story-${idx}`,
    views: story.views || (seed % 900) + 80,
    saves: story.saves || Math.floor(((seed % 900) + 80) * 0.15),
    category: story.category || ["Traditional Recipes", "Festivals", "Folk Stories", "Folk Medicine", "Handicrafts", "Village Life"][seed % 6],
    elder_name: story.elder_name || "Elder Custodian",
    language: story.language || "Telugu",
    state: story.state || "Andhra Pradesh",
    transcript: story.transcript || "",
    ai_summary: story.ai_summary || story.transcript?.substring(0, 150) + "..."
  };
}

function populateDropdownOptions() {
  const stateSelect = document.getElementById("state-filter");
  const categorySelect = document.getElementById("category-filter");
  const languageSelect = document.getElementById("language-filter");

  if (stateSelect) {
    const states = Array.from(new Set(allStories.map(s => s.state).filter(Boolean))).sort();
    stateSelect.innerHTML = `<option value="">All States</option>` + states.map(st => `<option value="${st}">${st}</option>`).join("");
  }

  if (categorySelect) {
    const categories = Array.from(new Set(allStories.map(s => s.category).filter(Boolean))).sort();
    categorySelect.innerHTML = `<option value="">All Categories</option>` + categories.map(cat => `<option value="${cat}">${cat}</option>`).join("");
  }

  if (languageSelect) {
    const languages = Array.from(new Set(allStories.map(s => s.language).filter(Boolean))).sort();
    languageSelect.innerHTML = `<option value="">All Languages</option>` + languages.map(lang => `<option value="${lang}">${lang}</option>`).join("");
  }
}

function setupFilterDropdowns() {
  const searchInput = document.getElementById("search-input");
  const stateSelect = document.getElementById("state-filter");
  const categorySelect = document.getElementById("category-filter");
  const languageSelect = document.getElementById("language-filter");
  const sortSelect = document.getElementById("sort-filter");
  const resetBtn = document.getElementById("reset-filters-btn");

  [searchInput, stateSelect, categorySelect, languageSelect, sortSelect].forEach(elem => {
    if (elem) {
      elem.addEventListener("change", () => renderStories());
      elem.addEventListener("input", () => renderStories());
    }
  });

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      if (stateSelect) stateSelect.value = "";
      if (categorySelect) categorySelect.value = "";
      if (languageSelect) languageSelect.value = "";
      if (sortSelect) sortSelect.value = "recent";
      renderStories();
    });
  }
}

function renderStories() {
  const container = document.getElementById("stories-grid");
  const countElem = document.getElementById("stories-count");
  if (!container) return;

  const searchTerm = (document.getElementById("search-input")?.value || "").toLowerCase();
  const selectedState = document.getElementById("state-filter")?.value || "";
  const selectedCategory = document.getElementById("category-filter")?.value || "";
  const selectedLanguage = document.getElementById("language-filter")?.value || "";
  const sortBy = document.getElementById("sort-filter")?.value || "recent";

  let filtered = allStories.filter(story => {
    const matchesSearch = !searchTerm || (
      (story.elder_name && story.elder_name.toLowerCase().includes(searchTerm)) ||
      (story.state && story.state.toLowerCase().includes(searchTerm)) ||
      (story.language && story.language.toLowerCase().includes(searchTerm)) ||
      (story.category && story.category.toLowerCase().includes(searchTerm)) ||
      (story.transcript && story.transcript.toLowerCase().includes(searchTerm))
    );
    const matchesState = !selectedState || story.state === selectedState;
    const matchesCategory = !selectedCategory || story.category === selectedCategory;
    const matchesLanguage = !selectedLanguage || story.language === selectedLanguage;

    return matchesSearch && matchesState && matchesCategory && matchesLanguage;
  });

  // Apply Sorting
  filtered.sort((a, b) => {
    if (sortBy === "views") return (b.views || 0) - (a.views || 0);
    if (sortBy === "saves") return (b.saves || 0) - (a.saves || 0);
    if (sortBy === "name") return (a.elder_name || "").localeCompare(b.elder_name || "");
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });

  if (countElem) countElem.textContent = `${filtered.length} Stories Found`;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; color: #6b7280;">
        <p style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem;">No stories found matching your filter criteria.</p>
        <p style="font-size: 0.85rem;">Try clearing your filters or searching for another region.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map((story, index) => {
    const isSaved = savedIds.includes(story.id);
    return `
      <div class="story-card" data-story-id="${story.id}">
        <div class="story-card-body">
          <div class="flex items-start justify-between" style="margin-bottom: 0.5rem;">
            <div>
              <span style="font-size: 0.7rem; font-weight: 800; color: #9ca3af; text-transform: uppercase;">
                📍 ${story.state || 'India'}
              </span>
              <h3 class="font-serif" style="font-size: 1.2rem; color: var(--heritage-green-600); margin-top: 0.2rem;">
                ${story.elder_name} ${story.age ? `• ${story.age}` : ''}
              </h3>
            </div>
            <button class="save-bookmark-btn" data-id="${story.id}" style="background: none; border: none; cursor: pointer; font-size: 1.1rem; color: ${isSaved ? '#dc2626' : '#d1d5db'};">
              ${isSaved ? '❤️' : '🤍'}
            </button>
          </div>

          <div class="flex items-center gap-2" style="margin-bottom: 0.75rem;">
            <span class="badge badge-gold">${story.language}</span>
            <span class="badge badge-green">${story.category || 'Heritage'}</span>
          </div>

          <p style="font-size: 0.85rem; color: #4b5563; line-height: 1.5; margin-bottom: 1.25rem; flex: 1;">
            "${story.ai_summary || story.transcript?.substring(0, 130) + '...'}"
          </p>

          <div class="flex items-center justify-between" style="border-top: 1px solid var(--border-color); padding-top: 0.75rem; font-size: 0.75rem; color: #9ca3af;">
            <span>👁️ ${story.views || 450} views</span>
            <button class="open-story-btn btn btn-outline" data-index="${index}" style="padding: 0.35rem 0.75rem; font-size: 0.7rem;">
              Read Story
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  // Attach card click handlers
  document.querySelectorAll(".open-story-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const idx = e.target.getAttribute("data-index");
      openStoryModal(filtered[idx]);
    });
  });

  document.querySelectorAll(".save-bookmark-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-id");
      toggleSaveStory(id);
    });
  });
}

function openStoryModal(story) {
  selectedStory = story;
  const overlay = document.getElementById("story-modal-overlay");
  const content = document.getElementById("story-modal-content");
  if (!overlay || !content) return;

  const isSaved = savedIds.includes(story.id);

  content.innerHTML = `
    <div class="flex items-start justify-between" style="border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; margin-bottom: 1rem;">
      <div>
        <span class="badge badge-gold" style="margin-bottom: 0.4rem;">${story.language} • ${story.category || 'Oral History'}</span>
        <h2 class="font-serif" style="font-size: 1.75rem; color: var(--heritage-green-600); margin: 0;">
          ${story.elder_name} ${story.age ? `(Age ${story.age})` : ''}
        </h2>
        <p style="font-size: 0.85rem; color: #6b7280; margin-top: 0.2rem;">
          📍 ${story.village_or_city || story.village || ''}, ${story.district ? story.district + ',' : ''} ${story.state || ''}
        </p>
      </div>
      <button id="close-modal-btn" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #9ca3af;">✕</button>
    </div>

    ${story.biography ? `
      <div style="margin-bottom: 1.25rem;">
        <h4 style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: var(--gold-700); margin-bottom: 0.3rem;">Biography & Background</h4>
        <p style="font-size: 0.9rem; color: #374151; line-height: 1.6;">${story.biography}</p>
      </div>
    ` : ''}

    <div style="margin-bottom: 1.25rem;">
      <h4 style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: var(--heritage-green-600); margin-bottom: 0.3rem;">🗣️ Spoken Transcript</h4>
      <div style="background-color: var(--ivory-100); border-left: 3px solid var(--gold-600); padding: 1rem; border-radius: var(--radius-md); font-size: 0.9rem; font-style: italic; color: #4b5563; line-height: 1.7;">
        "${story.transcript}"
      </div>
    </div>

    <div style="margin-bottom: 1.5rem;">
      <h4 style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: var(--heritage-green-600); margin-bottom: 0.3rem;">✨ AI Cultural Knowledge Summary</h4>
      <p style="font-size: 0.9rem; color: #374151; line-height: 1.6;">${story.ai_summary}</p>
    </div>

    <div class="flex items-center justify-between" style="border-top: 1px solid var(--border-color); padding-top: 1rem;">
      <button id="modal-save-btn" class="btn ${isSaved ? 'btn-outline' : 'btn-gold'}">
        ${isSaved ? '❤️ Saved in Profile' : '🤍 Bookmark Story'}
      </button>
      <button id="modal-close-bottom-btn" class="btn btn-outline">Close</button>
    </div>
  `;

  overlay.classList.add("active");

  document.getElementById("close-modal-btn")?.addEventListener("click", closeModal);
  document.getElementById("modal-close-bottom-btn")?.addEventListener("click", closeModal);
  document.getElementById("modal-save-btn")?.addEventListener("click", () => {
    toggleSaveStory(story.id);
    openStoryModal(story);
  });
}

function closeModal() {
  const overlay = document.getElementById("story-modal-overlay");
  if (overlay) overlay.classList.remove("active");
}

function setupEventListeners() {
  const overlay = document.getElementById("story-modal-overlay");
  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal();
    });
  }
}

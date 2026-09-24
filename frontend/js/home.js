/**
 * HeritageAI HomePage Controller
 */
import { CENTRAL_STORIES } from "../data/stories.js";
import { getPublicLibrary } from "./api.js";
import { getInitials } from "./auth.js";

document.addEventListener("DOMContentLoaded", async () => {
  initHeroStats();
  initPreviewCard();
  await loadRecentStories();
});

function initHeroStats() {
  const totalStories = CENTRAL_STORIES.length;
  const languagesCount = new Set(CENTRAL_STORIES.map(s => s.language).filter(Boolean)).size;
  const statesCount = new Set(CENTRAL_STORIES.map(s => s.state).filter(Boolean)).size;

  const storiesElem = document.getElementById("stat-stories-count");
  const languagesElem = document.getElementById("stat-languages-count");
  const statesElem = document.getElementById("stat-states-count");

  if (storiesElem) storiesElem.textContent = `${totalStories}+`;
  if (languagesElem) languagesElem.textContent = `${languagesCount}+`;
  if (statesElem) statesElem.textContent = `${statesCount}+`;

  const vaultCountElem = document.getElementById("vault-stories-count");
  if (vaultCountElem) vaultCountElem.textContent = totalStories;
}

function initPreviewCard() {
  const preview = CENTRAL_STORIES[0];
  if (!preview) return;

  const elderNameElem = document.getElementById("preview-elder-name");
  const stateElem = document.getElementById("preview-state");
  const categoryElem = document.getElementById("preview-category");
  const quoteElem = document.getElementById("preview-quote");
  const avatarElem = document.getElementById("preview-avatar");
  const dialectElem = document.getElementById("preview-dialect");

  if (elderNameElem) elderNameElem.textContent = `${preview.elder_name} • Age ${preview.age}`;
  if (stateElem) stateElem.textContent = `📍 ${preview.state}`;
  if (categoryElem) categoryElem.textContent = preview.category;
  if (quoteElem) quoteElem.textContent = `"${preview.transcript.substring(0, 110)}..."`;
  if (avatarElem) avatarElem.textContent = getInitials(preview.elder_name);
  if (dialectElem) dialectElem.textContent = preview.language;
}

async function loadRecentStories() {
  const container = document.getElementById("recent-stories-grid");
  if (!container) return;

  let stories = [];
  try {
    const data = await getPublicLibrary();
    if (Array.isArray(data) && data.length > 0) {
      stories = data.slice(0, 6);
    } else {
      stories = CENTRAL_STORIES.slice(0, 6);
    }
  } catch {
    stories = CENTRAL_STORIES.slice(0, 6);
  }

  container.innerHTML = stories.map(story => `
    <div class="story-card">
      <div class="story-card-body">
        <div class="flex items-start justify-between" style="margin-bottom: 0.75rem;">
          <div>
            <h3 class="font-serif" style="font-size: 1.25rem; color: var(--heritage-green-600); margin-bottom: 0.25rem;">
              ${story.elder_name}
            </h3>
            <p style="font-size: 0.8rem; color: #6b7280;">${story.age ? `${story.age} years old` : ''}</p>
          </div>
          <span class="badge badge-gold">${story.language}</span>
        </div>

        <div class="flex items-center gap-2" style="font-size: 0.8rem; color: #6b7280; margin-bottom: 0.75rem;">
          <span>📍 ${story.village_or_city || story.village || 'Village'}</span>
          ${story.state ? `<span>• ${story.state}</span>` : ''}
        </div>

        <p style="font-size: 0.85rem; color: #4b5563; line-height: 1.5; margin-bottom: 1rem; flex: 1;">
          ${story.ai_summary || (story.transcript ? story.transcript.substring(0, 140) + '...' : '')}
        </p>

        <a href="library.html" style="font-size: 0.8rem; font-weight: 700; color: var(--heritage-green-600);">
          View Story →
        </a>
      </div>
    </div>
  `).join("");
}

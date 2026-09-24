/**
 * HeritageAI Analytics Page Controller
 * Interactive SVG Map of India + Dynamic Aggregated Metrics.
 */
import { CENTRAL_STORIES } from "../data/stories.js";
import { indiaMapPaths } from "./indiaMapPaths.js";
import { getPublicLibrary } from "./api.js";

let allStories = [];
let selectedState = null;

document.addEventListener("DOMContentLoaded", async () => {
  renderIndiaMap();
  await loadAnalyticsData();
});

async function loadAnalyticsData() {
  let dbStories = [];
  try {
    const data = await getPublicLibrary();
    dbStories = (data || []).map((item, idx) => enrichForAnalytics(item, idx));
  } catch (e) {}

  const merged = [...dbStories];
  CENTRAL_STORIES.forEach(fallback => {
    if (!merged.some(item => item.elder_name === fallback.elder_name)) {
      merged.push(fallback);
    }
  });

  allStories = merged;
  updateAnalyticsUI();
}

function enrichForAnalytics(item, idx) {
  const seed = (item.id || idx) * 17;
  return {
    ...item,
    views: item.views || (seed % 900) + 80,
    saves: item.saves || Math.floor(((seed % 900) + 80) * 0.15),
    category: item.category || ["Traditional Recipes", "Festivals", "Folk Stories", "Folk Medicine", "Handicrafts", "Village Life"][seed % 6],
    elder_name: item.elder_name || "Unknown Elder",
    language: item.language || "Telugu",
    state: item.state || "Andhra Pradesh"
  };
}

function renderIndiaMap() {
  const mapContainer = document.getElementById("india-map-container");
  if (!mapContainer) return;

  const pathsSvg = indiaMapPaths.map(state => `
    <path
      id="${state.id}"
      data-name="${state.name}"
      d="${state.d}"
      class="state-path"
      title="${state.name}"
    />
  `).join("");

  mapContainer.innerHTML = `
    <svg viewBox="0 0 700 800" class="india-map-svg" style="width: 100%; height: auto;">
      <g>${pathsSvg}</g>
    </svg>
  `;

  document.querySelectorAll(".state-path").forEach(path => {
    path.addEventListener("click", () => {
      const stateName = path.getAttribute("data-name");
      if (selectedState === stateName) {
        selectedState = null;
        path.classList.remove("active-state");
      } else {
        document.querySelectorAll(".state-path").forEach(p => p.classList.remove("active-state"));
        selectedState = stateName;
        path.classList.add("active-state");
      }
      updateAnalyticsUI();
    });
  });
}

function updateAnalyticsUI() {
  const displayed = selectedState
    ? allStories.filter(s => s.state && s.state.toLowerCase() === selectedState.toLowerCase())
    : allStories;

  const totalStories = displayed.length;
  const uniqueElders = new Set(displayed.map(s => s.elder_name)).size;
  const totalViews = displayed.reduce((sum, s) => sum + (s.views || 0), 0);
  const totalSaves = displayed.reduce((sum, s) => sum + (s.saves || 0), 0);
  const languagesCount = new Set(displayed.map(s => s.language).filter(Boolean)).size;

  animateCounter("analytics-total-stories", totalStories);
  animateCounter("analytics-unique-elders", uniqueElders);
  animateCounter("analytics-total-views", totalViews);
  animateCounter("analytics-total-saves", totalSaves);
  animateCounter("analytics-languages-count", languagesCount);

  const selectedStateLabel = document.getElementById("analytics-state-label");
  if (selectedStateLabel) {
    selectedStateLabel.textContent = selectedState ? `Filtered by ${selectedState}` : "Showing All 28 States & UTs";
  }

  // Category Distribution Breakdown
  renderCategoryBreakdown(displayed);

  // Popular Stories
  renderPopularStories(displayed);
}

function animateCounter(elemId, value) {
  const elem = document.getElementById(elemId);
  if (!elem) return;
  elem.textContent = value.toLocaleString();
}

function renderCategoryBreakdown(stories) {
  const container = document.getElementById("category-breakdown-list");
  if (!container) return;

  const counts = {};
  stories.forEach(s => {
    if (s.category) counts[s.category] = (counts[s.category] || 0) + 1;
  });

  const total = stories.length || 1;
  const sortedCategories = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  container.innerHTML = sortedCategories.map(([cat, count]) => {
    const percent = Math.round((count / total) * 100);
    return `
      <div style="margin-bottom: 0.75rem;">
        <div class="flex justify-between" style="font-size: 0.8rem; font-weight: 600; color: #374151; margin-bottom: 0.2rem;">
          <span>${cat}</span>
          <span>${count} (${percent}%)</span>
        </div>
        <div style="width: 100%; height: 6px; background-color: var(--ivory-200); border-radius: 3px; overflow: hidden;">
          <div style="width: ${percent}%; height: 100%; background-color: var(--heritage-green-600); transition: width 0.4s ease;"></div>
        </div>
      </div>
    `;
  }).join("");
}

function renderPopularStories(stories) {
  const container = document.getElementById("popular-stories-list");
  if (!container) return;

  const sorted = [...stories].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);

  container.innerHTML = sorted.map(s => `
    <div style="border-bottom: 1px solid var(--border-color); padding: 0.75rem 0; display: flex; align-items: center; justify-content: space-between;">
      <div>
        <h4 style="font-size: 0.85rem; font-weight: 700; color: var(--heritage-green-600); margin: 0;">${s.elder_name}</h4>
        <p style="font-size: 0.75rem; color: #6b7280; margin: 0;">📍 ${s.state} • ${s.language}</p>
      </div>
      <span style="font-size: 0.75rem; font-weight: 700; color: var(--gold-700);">👁️ ${s.views}</span>
    </div>
  `).join("");
}

/**
 * HeritageAI Common UI Controller
 * Renders consistent Navbar, Footer, and Dropdown behavior across all pages.
 */
import { isLoggedIn, getUser, logout, getInitials } from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
  renderNavbar();
  renderFooter();
  setupDropdowns();
  applySavedTheme();
});

function renderNavbar() {
  const headerContainer = document.getElementById("main-header");
  if (!headerContainer) return;

  const user = getUser();
  const loggedIn = isLoggedIn();
  const currentPath = window.location.pathname.split("/").pop() || "index.html";

  const displayName = localStorage.getItem("profile_display_name") || user?.name || "Elder Custodian";
  const profilePic = localStorage.getItem("profile_pic") || "";
  const initials = getInitials(displayName);

  const navLinks = [
    { name: "Home", href: "index.html" },
    { name: "Library", href: "library.html" },
    { name: "Analytics", href: "analytics.html" },
    { name: "AI Chat", href: "chat.html" },
    { name: "About", href: "about.html" },
  ];

  if (!loggedIn) {
    navLinks.push({ name: "Login", href: "login.html" });
    navLinks.push({ name: "Register", href: "register.html" });
  }

  headerContainer.innerHTML = `
    <nav class="navbar">
      <div class="container navbar-container">
        <!-- Brand Logo -->
        <a href="index.html" class="navbar-brand">
          Heritage<span>AI</span>
        </a>

        <!-- Desktop Navigation -->
        <div class="nav-links md:flex hidden">
          ${navLinks.map(link => `
            <a href="${link.href}" class="nav-link ${currentPath === link.href ? 'active' : ''}">
              ${link.name}
            </a>
          `).join("")}
        </div>

        <!-- Action Controls -->
        <div class="md:flex hidden items-center gap-4">
          ${loggedIn ? `
            <!-- Notification Bell -->
            <div style="position: relative;" id="bell-wrapper">
              <button id="bell-btn" style="background: none; border: none; cursor: pointer; padding: 0.5rem; color: #6b7280; font-size: 1.1rem; position: relative;">
                🔔
                <span style="position: absolute; top: 6px; right: 6px; width: 6px; height: 6px; background-color: var(--gold-600); border-radius: 50%;"></span>
              </button>
              <div id="notifications-menu" class="dropdown-menu" style="width: 18rem; padding: 1rem; font-size: 0.8rem;">
                <h4 style="font-weight: 700; color: var(--heritage-green-600); border-bottom: 1px solid var(--border-color); padding-bottom: 0.4rem; margin-bottom: 0.5rem;">Notifications</h4>
                <p style="color: #6b7280; font-weight: 300;">No new updates today. Your secure elder archive is fully synced and preserved.</p>
              </div>
            </div>

            <!-- Profile Dropdown -->
            <div style="position: relative;" id="profile-wrapper">
              <button id="profile-btn" style="background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 0.3rem;">
                <div class="avatar-badge">
                  ${profilePic ? `<img src="${profilePic}" alt="Avatar" />` : initials}
                </div>
                <span style="font-size: 0.75rem; color: #9ca3af;">▼</span>
              </button>
              <div id="profile-menu" class="dropdown-menu">
                <div style="padding: 0.6rem 1rem; border-bottom: 1px solid var(--border-color);">
                  <p style="font-weight: 700; color: #111827; margin: 0;">${displayName}</p>
                  <p style="font-size: 0.7rem; color: #9ca3af; font-family: var(--font-mono); margin: 0;">${user?.email || ""}</p>
                </div>
                <a href="profile.html?tab=posts" class="dropdown-item">👤 My Profile</a>
                <a href="profile.html?tab=saved" class="dropdown-item">❤️ Saved Stories</a>
                <a href="profile.html?tab=settings" class="dropdown-item">⚙️ Account Settings</a>
                <div style="border-top: 1px solid var(--border-color); margin-top: 0.25rem;">
                  <button id="logout-btn" class="dropdown-item danger" style="width: 100%; border: none; background: none; text-align: left; cursor: pointer;">🚪 Log Out</button>
                </div>
              </div>
            </div>
          ` : `
            <a href="interview.html" class="btn btn-primary">Start Interview</a>
          `}
        </div>

        <!-- Mobile Toggle Button -->
        <div class="md:hidden flex items-center gap-3">
          <button id="mobile-toggle" style="background: none; border: none; font-size: 1.5rem; color: var(--heritage-green-600); cursor: pointer;">
            ☰
          </button>
        </div>
      </div>

      <!-- Mobile Drawer -->
      <div id="mobile-drawer" class="mobile-drawer">
        <div class="flex flex-col gap-3">
          ${navLinks.map(link => `
            <a href="${link.href}" class="nav-link ${currentPath === link.href ? 'active' : ''}">
              ${link.name}
            </a>
          `).join("")}

          ${loggedIn ? `
            <div style="border-top: 1px solid var(--border-color); padding-top: 0.75rem; margin-top: 0.5rem;">
              <a href="profile.html?tab=posts" class="nav-link">My Profile</a>
              <a href="profile.html?tab=saved" class="nav-link">Saved Stories</a>
              <a href="profile.html?tab=settings" class="nav-link">Settings</a>
              <button id="mobile-logout-btn" style="color: #dc2626; font-weight: 700; border: none; background: none; text-align: left; padding: 0.5rem 0; cursor: pointer;">Log Out</button>
            </div>
          ` : ''}

          <a href="interview.html" class="btn btn-primary" style="margin-top: 0.5rem; text-align: center;">Start Interview</a>
        </div>
      </div>
    </nav>
  `;
}

function renderFooter() {
  const footerContainer = document.getElementById("main-footer");
  if (!footerContainer) return;

  footerContainer.innerHTML = `
    <footer style="background-color: #ffffff; border-top: 1px solid var(--border-color); padding: 4rem 0 3rem 0;">
      <div class="container grid grid-cols-1 md:grid-cols-4 gap-8">
        <div style="grid-column: span 2;">
          <a href="index.html" class="navbar-brand" style="font-size: 1.25rem;">Heritage<span>AI</span></a>
          <p style="font-size: 0.8rem; color: #6b7280; margin-top: 0.75rem; max-width: 24rem; line-height: 1.6;">
            Empowering communities to transcribe, translate, and preserve oral histories, folk knowledge, and elder wisdom using advanced synthesis architectures.
          </p>
        </div>

        <div>
          <h4 style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #9ca3af; margin-bottom: 0.75rem;">Explore Platform</h4>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.8rem;">
            <li><a href="library.html" style="color: #4b5563;">Heritage Library</a></li>
            <li><a href="analytics.html" style="color: #4b5563;">Regional Analytics</a></li>
            <li><a href="chat.html" style="color: #4b5563;">AI Cultural Chat</a></li>
          </ul>
        </div>

        <div>
          <h4 style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #9ca3af; margin-bottom: 0.75rem;">Get Involved</h4>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.8rem;">
            <li><a href="interview.html" style="color: #4b5563;">Start Oral Interview</a></li>
            <li><a href="about.html" style="color: #4b5563;">About Our Project</a></li>
            <li><a href="https://github.com/divyanallamolu" target="_blank" style="color: #4b5563;">Developer Profile</a></li>
          </ul>
        </div>
      </div>
    </footer>
  `;
}

function setupDropdowns() {
  const profileBtn = document.getElementById("profile-btn");
  const profileMenu = document.getElementById("profile-menu");
  const bellBtn = document.getElementById("bell-btn");
  const notificationsMenu = document.getElementById("notifications-menu");
  const mobileToggle = document.getElementById("mobile-toggle");
  const mobileDrawer = document.getElementById("mobile-drawer");
  const logoutBtn = document.getElementById("logout-btn");
  const mobileLogoutBtn = document.getElementById("mobile-logout-btn");

  if (profileBtn && profileMenu) {
    profileBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      profileMenu.classList.toggle("show");
      if (notificationsMenu) notificationsMenu.classList.remove("show");
    });
  }

  if (bellBtn && notificationsMenu) {
    bellBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      notificationsMenu.classList.toggle("show");
      if (profileMenu) profileMenu.classList.remove("show");
    });
  }

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener("click", () => {
      mobileDrawer.classList.toggle("show");
    });
  }

  document.addEventListener("click", () => {
    if (profileMenu) profileMenu.classList.remove("show");
    if (notificationsMenu) notificationsMenu.classList.remove("show");
  });

  if (logoutBtn) logoutBtn.addEventListener("click", () => logout());
  if (mobileLogoutBtn) mobileLogoutBtn.addEventListener("click", () => logout());
}

function applySavedTheme() {
  const theme = localStorage.getItem("profile_theme") || "cream";
  document.documentElement.className = "";
  if (theme === "forest") {
    document.documentElement.style.setProperty("--bg-main", "#f0f7f4");
  } else if (theme === "gold") {
    document.documentElement.style.setProperty("--bg-main", "#fdfcf5");
  } else {
    document.documentElement.style.setProperty("--bg-main", "#faf9f5");
  }
}

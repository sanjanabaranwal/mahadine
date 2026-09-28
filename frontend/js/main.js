/**
 * MAHADINE — main.js
 * Renders the shared navbar auth state and wires up global UI (mobile nav,
 * user dropdown, logout) on every page. Include this AFTER api.js + utils.js.
 */

function renderNavAuthState() {
  const slot = document.getElementById("navAuthSlot");
  if (!slot) return;

  if (Auth.isLoggedIn()) {
    const user = Auth.getUser() || { name: "Guest" };
    slot.innerHTML = `
      <div class="dropdown" id="userDropdown">
        <button class="user-chip" id="userChipBtn" type="button">
          <span class="avatar">${initials(user.name)}</span>
          <span class="long-label">${escapeHtml(user.name.split(" ")[0])}</span>
        </button>
        <div class="dropdown-menu">
          <a href="/my-bookings.html">My Bookings</a>
          <a href="/profile.html">Profile</a>
          <button id="navLogoutBtn" type="button">Logout</button>
        </div>
      </div>
    `;
    document.getElementById("userChipBtn").addEventListener("click", (e) => {
      e.stopPropagation();
      document.getElementById("userDropdown").classList.toggle("open");
    });
    document.getElementById("navLogoutBtn").addEventListener("click", () => {
      Auth.logout("/index.html");
    });
  } else {
    slot.innerHTML = `
      <a href="/login.html" class="btn btn-outline btn-sm">Login</a>
      <a href="/register.html" class="btn btn-primary btn-sm">Register</a>
    `;
  }
}

function highlightActiveNavLink() {
  const path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(a => {
    const href = a.getAttribute("href").replace("/", "");
    if (href === path) a.classList.add("active");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderNavAuthState();
  highlightActiveNavLink();

  const navToggle = document.getElementById("navToggle");
  if (navToggle) navToggle.addEventListener("click", toggleMobileNav);
});

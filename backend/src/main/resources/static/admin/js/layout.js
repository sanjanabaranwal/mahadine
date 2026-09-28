/**
 * MAHADINE ADMIN — layout.js
 * Shared admin shell behavior: auth guard, sidebar toggle, active link
 * highlighting, and logout. Included on every admin page except login.
 */

(function guardAdminAccess() {
  if (!AdminAuth.isLoggedIn() || !AdminAuth.isAdmin()) {
    window.location.href = "/admin/login.html";
  }
})();

document.addEventListener("DOMContentLoaded", () => {
  const user = AdminAuth.getUser();
  const avatarEl = document.getElementById("adminAvatar");
  const nameEl = document.getElementById("adminName");
  if (user && avatarEl) avatarEl.textContent = initials(user.name);
  if (user && nameEl) nameEl.textContent = user.name;

  const path = window.location.pathname.split("/").pop();
  document.querySelectorAll(".admin-nav a").forEach(a => {
    if (a.getAttribute("href").endsWith(path)) a.classList.add("active");
  });

  const menuToggle = document.getElementById("adminMenuToggle");
  const sidebar = document.getElementById("adminSidebar");
  if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", () => sidebar.classList.toggle("open"));
  }

  const logoutBtn = document.getElementById("adminLogoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to log out?")) AdminAuth.logout();
    });
  }
});

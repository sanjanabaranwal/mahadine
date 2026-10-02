/**
 * MAHADINE ADMIN — admin-login.js
 * Handles admin authentication. Rejects non-admin accounts client-side for
 * UX, but the backend is what actually enforces the ADMIN role on every
 * /api/admin/** call regardless of what happens here.
 */

document.addEventListener("DOMContentLoaded", () => {
  if (AdminAuth.isLoggedIn() && AdminAuth.isAdmin()) {
    window.location.href = "/admin/dashboard.html";
    return;
  }

  const form = document.getElementById("adminLoginForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const email = form.email.value.trim();
    const password = form.password.value;

    btn.disabled = true;
    btn.textContent = "Signing in...";

    try {
      const result = await AdminApi.login({ email, password, portal: "ADMIN" });

      if (result.user.role !== "ADMIN") {
        showToast("Admin access required.", "error");
        btn.disabled = false;
        btn.textContent = "Sign In to Dashboard";
        return;
      }

      AdminAuth.setToken(result.token);
      AdminAuth.setUser(result.user);
      showToast("Welcome back, Admin!", "success");
      window.location.href = "/admin/dashboard.html";
    } catch (err) {
      showToast(err.message || "Login failed", "error");
      btn.disabled = false;
      btn.textContent = "Sign In to Dashboard";
    }
  });
});

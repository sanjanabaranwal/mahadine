/**
 * MAHADINE — auth.js
 * Handles the login and register forms. The correct handler wires itself up
 * automatically based on which form is present on the page.
 */

document.addEventListener("DOMContentLoaded", () => {
  // If already logged in, no reason to see the auth pages again.
  if (Auth.isLoggedIn()) {
    window.location.href = "/index.html";
    return;
  }

  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  if (loginForm) initLoginForm(loginForm);
  if (registerForm) initRegisterForm(registerForm);

  document.querySelectorAll(".password-toggle").forEach(btn => {
    btn.addEventListener("click", () => {
      const input = btn.closest(".password-field").querySelector("input");
      const isPassword = input.type === "password";
      input.type = isPassword ? "text" : "password";
      btn.textContent = isPassword ? "Hide" : "Show";
    });
  });
});

function initLoginForm(form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFieldErrors(form);

    const email = form.email.value.trim();
    const password = form.password.value;
    const submitBtn = form.querySelector('button[type="submit"]');

    if (!email || !password) {
      showToast("Please fill in both email and password", "error");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Signing in...";

    try {
      const result = await Api.login({ email, password });
      Auth.setToken(result.token);
      Auth.setUser(result.user);
      showToast("Welcome back!", "success");
      const redirect = new URLSearchParams(window.location.search).get("redirect");
      window.location.href = redirect || "/index.html";
    } catch (err) {
      if (err.errors) applyServerErrors(form, err.errors);
      showToast(err.message || "Login failed. Please try again.", "error");
      submitBtn.disabled = false;
      submitBtn.textContent = "Sign In";
    }
  });
}

function initRegisterForm(form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFieldErrors(form);

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const phone = form.phone.value.trim();
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;
    const submitBtn = form.querySelector('button[type="submit"]');

    if (password !== confirmPassword) {
      setFieldError(form.confirmPassword, "Passwords do not match");
      showToast("Passwords do not match", "error");
      return;
    }
    if (password.length < 6) {
      setFieldError(form.password, "Password must be at least 6 characters");
      showToast("Password must be at least 6 characters", "error");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Creating account...";

    try {
      const result = await Api.register({ name, email, phone, password });
      Auth.setToken(result.token);
      Auth.setUser(result.user);
      showToast("Account created! Welcome to MAHADINE.", "success");
      window.location.href = "/index.html";
    } catch (err) {
      if (err.errors) applyServerErrors(form, err.errors);
      showToast(err.message || "Registration failed. Please try again.", "error");
      submitBtn.disabled = false;
      submitBtn.textContent = "Create Account";
    }
  });
}

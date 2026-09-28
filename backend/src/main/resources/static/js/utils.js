/**
 * MAHADINE — Shared utility helpers used across pages.
 */

function showToast(message, type = "info", duration = 4200) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  const icon = type === "success" ? "✓" : type === "error" ? "⚠" : "ℹ";
  toast.innerHTML = `<span>${icon}</span><span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  const div = document.createElement("div");
  div.textContent = String(str);
  return div.innerHTML;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatTime(timeStr) {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

function todayISO() {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

function initials(name) {
  if (!name) return "?";
  return name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();
}

function debounce(fn, delay = 350) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function setFieldError(fieldEl, message) {
  const group = fieldEl.closest(".form-group");
  if (!group) return;
  group.classList.add("has-error");
  const errorEl = group.querySelector(".form-error");
  if (errorEl) errorEl.textContent = message;
}

function clearFieldErrors(formEl) {
  formEl.querySelectorAll(".form-group.has-error").forEach(g => g.classList.remove("has-error"));
}

/** Applies field-level errors returned by the backend's validation response (map of field -> message). */
function applyServerErrors(formEl, errors) {
  if (!errors || typeof errors !== "object") return;
  Object.entries(errors).forEach(([field, message]) => {
    const input = formEl.querySelector(`[name="${field}"]`);
    if (input) setFieldError(input, message);
  });
}

function starString(rating) {
  const rounded = Math.round(rating || 0);
  return "★".repeat(rounded) + "☆".repeat(Math.max(0, 5 - rounded));
}

function toggleMobileNav() {
  const nav = document.getElementById("navLinks");
  if (nav) nav.classList.toggle("open");
}

document.addEventListener("click", (e) => {
  document.querySelectorAll(".dropdown.open").forEach(dd => {
    if (!dd.contains(e.target)) dd.classList.remove("open");
  });
});

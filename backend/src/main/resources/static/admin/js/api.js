/**
 * MAHADINE ADMIN — Centralized API client (mirrors /js/api.js, kept
 * separate so the admin panel has no dependency on user-side scripts).
 */

const API_BASE_URL = "/api";
const TOKEN_KEY = "mahadine_admin_token";
const USER_KEY = "mahadine_admin_user";

const AdminAuth = {
  getToken() { return sessionStorage.getItem(TOKEN_KEY); },
  setToken(token) { sessionStorage.setItem(TOKEN_KEY, token); },
  clearToken() { sessionStorage.removeItem(TOKEN_KEY); sessionStorage.removeItem(USER_KEY); },
  getUser() { const raw = sessionStorage.getItem(USER_KEY); return raw ? JSON.parse(raw) : null; },
  setUser(user) { sessionStorage.setItem(USER_KEY, JSON.stringify(user)); },
  isLoggedIn() { return !!this.getToken(); },
  isAdmin() { const u = this.getUser(); return u && u.role === "ADMIN"; },
  logout() { this.clearToken(); window.location.href = "/admin/login.html"; }
};

async function adminApiRequest(path, { method = "GET", body = null } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = AdminAuth.getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method, headers, body: body ? JSON.stringify(body) : undefined
    });
  } catch (e) {
    throw new Error("Could not reach the server. Please check your connection.");
  }

  let payload = null;
  try { payload = await response.json(); } catch (e) { /* no body */ }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      AdminAuth.clearToken();
      if (!window.location.pathname.endsWith("/admin/login.html")) {
        window.location.href = "/admin/login.html";
      }
    }
    const message = (payload && payload.message) ? payload.message : `Request failed (${response.status})`;
    const err = new Error(message);
    err.status = response.status;
    err.errors = payload ? payload.data : null;
    throw err;
  }
  return payload ? payload.data : null;
}

const AdminApi = {
  login: (data) => adminApiRequest("/auth/login", { method: "POST", body: data }),
  me: () => adminApiRequest("/auth/me"),

  dashboard: () => adminApiRequest("/admin/dashboard"),
  users: () => adminApiRequest("/admin/users"),
  analytics: () => adminApiRequest("/admin/analytics"),

  restaurants: () => adminApiRequest("/admin/restaurants"),
  createRestaurant: (data) => adminApiRequest("/restaurants", { method: "POST", body: data }),
  updateRestaurant: (id, data) => adminApiRequest(`/restaurants/${id}`, { method: "PUT", body: data }),
  deleteRestaurant: (id) => adminApiRequest(`/restaurants/${id}`, { method: "DELETE" }),

  tablesByRestaurant: (restaurantId) => adminApiRequest(`/restaurants/${restaurantId}/tables`),
  createTable: (restaurantId, data) => adminApiRequest(`/restaurants/${restaurantId}/tables`, { method: "POST", body: data }),
  updateTable: (id, data) => adminApiRequest(`/tables/${id}`, { method: "PUT", body: data }),
  deleteTable: (id) => adminApiRequest(`/tables/${id}`, { method: "DELETE" }),

  reservations: () => adminApiRequest("/admin/reservations"),
  updateReservationStatus: (id, status) => adminApiRequest(`/admin/reservations/${id}/status`, { method: "PUT", body: { status } }),
  updateReservation: (id, data) => adminApiRequest(`/admin/reservations/${id}`, { method: "PUT", body: data }),
  deleteReservation: (id) => adminApiRequest(`/admin/reservations/${id}`, { method: "DELETE" }),

  reviewsQuestions: () => adminApiRequest("/admin/reviews-questions"),
  markReviewQuestionRead: (id) => adminApiRequest(`/admin/reviews-questions/${id}/read`, { method: "PUT" }),
  resolveReviewQuestion: (id) => adminApiRequest(`/admin/reviews-questions/${id}/resolve`, { method: "PUT" }),
  deleteReviewQuestion: (id) => adminApiRequest(`/admin/reviews-questions/${id}`, { method: "DELETE" })
};

function showToast(message, type = "info", duration = 4200) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
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

function initials(name) {
  if (!name) return "?";
  return name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();
}

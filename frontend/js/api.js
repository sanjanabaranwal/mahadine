/**
 * MAHADINE — Centralized API client
 * All frontend HTTP calls should go through this file so that:
 *  - the base URL is defined in exactly one place
 *  - the JWT token is attached automatically
 *  - errors are handled/parsed consistently
 *
 * Works both locally (frontend + backend on http://localhost:8080, since
 * Spring Boot serves these static files) and after Railway deployment
 * (same-origin, so a relative "/api" path always works).
 */

const API_BASE_URL =
    window.location.hostname === "localhost"
        ? "http://localhost:8080/api"
        : "https://mahadine.onrender.com/api";
const TOKEN_KEY = "mahadine_token";
const USER_KEY = "mahadine_user";

const Auth = {
  getToken() {
    return sessionStorage.getItem(TOKEN_KEY);
  },
  setToken(token) {
    sessionStorage.setItem(TOKEN_KEY, token);
  },
  clearToken() {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  },
  getUser() {
    const raw = sessionStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  setUser(user) {
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  isLoggedIn() {
    return !!this.getToken();
  },
  isAdmin() {
    const user = this.getUser();
    return user && user.role === "ADMIN";
  },
  logout(redirectTo = "/index.html") {
    this.clearToken();
    window.location.href = redirectTo;
  }
};

/**
 * Core request helper. Returns the parsed JSON body's `data` field on
 * success. Throws an Error with a user-friendly `.message` on failure.
 */
async function apiRequest(path, { method = "GET", body = null, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = Auth.getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
  } catch (networkErr) {
    throw new Error("Could not reach the server. Please check your connection and try again.");
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch (e) {
    // No JSON body (e.g. 204) - fine for some endpoints
  }

  if (!response.ok) {
    if (response.status === 401 && auth) {
      // Session expired / invalid token
      Auth.clearToken();
    }
    const message = (payload && payload.message) ? payload.message : `Request failed (${response.status})`;
    const err = new Error(message);
    err.status = response.status;
    err.errors = payload ? payload.data : null; // field-level validation errors
    throw err;
  }

  return payload ? payload.data : null;
}

const Api = {
  // ---- Auth ----
  register: (data) => apiRequest("/auth/register", { method: "POST", body: data, auth: false }),
  login: (data) => apiRequest("/auth/login", { method: "POST", body: data, auth: false }),
  me: () => apiRequest("/auth/me"),

  // ---- Profile ----
  getProfile: () => apiRequest("/users/profile"),
  updateProfile: (data) => apiRequest("/users/profile", { method: "PUT", body: data }),

  // ---- Restaurants ----
  getRestaurants: (params = {}) => {
    const query = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v))).toString();
    return apiRequest(`/restaurants${query ? `?${query}` : ""}`, { auth: false });
  },
  getRestaurant: (id) => apiRequest(`/restaurants/${id}`, { auth: false }),
  createRestaurant: (data) => apiRequest("/restaurants", { method: "POST", body: data }),
  updateRestaurant: (id, data) => apiRequest(`/restaurants/${id}`, { method: "PUT", body: data }),
  deleteRestaurant: (id) => apiRequest(`/restaurants/${id}`, { method: "DELETE" }),

  // ---- Tables & availability ----
  getTables: (restaurantId) => apiRequest(`/restaurants/${restaurantId}/tables`, { auth: false }),
  getAvailability: (restaurantId, { date, time, guests }) => {
    const query = new URLSearchParams(Object.fromEntries(Object.entries({ date, time, guests }).filter(([, v]) => v))).toString();
    return apiRequest(`/restaurants/${restaurantId}/availability${query ? `?${query}` : ""}`, { auth: false });
  },
  createTable: (restaurantId, data) => apiRequest(`/restaurants/${restaurantId}/tables`, { method: "POST", body: data }),
  updateTable: (id, data) => apiRequest(`/tables/${id}`, { method: "PUT", body: data }),
  deleteTable: (id) => apiRequest(`/tables/${id}`, { method: "DELETE" }),

  // ---- Reservations ----
  createReservation: (data) => apiRequest("/reservations", { method: "POST", body: data }),
  getMyReservations: () => apiRequest("/reservations/my"),
  getReservation: (id) => apiRequest(`/reservations/${id}`),
  cancelReservation: (id) => apiRequest(`/reservations/${id}/cancel`, { method: "PUT" }),

  // ---- Reviews ----
  getReviews: (restaurantId) => apiRequest(`/restaurants/${restaurantId}/reviews`, { auth: false }),
  createReview: (restaurantId, data) => apiRequest(`/restaurants/${restaurantId}/reviews`, { method: "POST", body: data }),

  // ---- Contact ----
  submitContact: (data) => apiRequest("/contact", { method: "POST", body: data, auth: false }),

  // ---- Admin ----
  adminDashboard: () => apiRequest("/admin/dashboard"),
  adminUsers: () => apiRequest("/admin/users"),
  adminRestaurants: () => apiRequest("/admin/restaurants"),
  adminReservations: () => apiRequest("/admin/reservations"),
  adminUpdateReservationStatus: (id, status) => apiRequest(`/admin/reservations/${id}/status`, { method: "PUT", body: { status } }),
  adminAnalytics: () => apiRequest("/admin/analytics")
};

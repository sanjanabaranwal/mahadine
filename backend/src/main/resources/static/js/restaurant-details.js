/**
 * MAHADINE — restaurant-details.js
 * Loads a single restaurant, its reviews, and lets the visitor pick a
 * date/time/guest count before continuing to the booking page.
 */

function getRestaurantIdFromQuery() {
  return new URLSearchParams(window.location.search).get("id");
}

async function loadRestaurantDetails() {
  const id = getRestaurantIdFromQuery();
  const wrapper = document.getElementById("detailsWrapper");
  if (!id || !wrapper) return;

  try {
    const r = await Api.getRestaurant(id);
    document.title = `${r.name} — MAHADINE`;

    document.getElementById("heroImage").src = r.imageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200";
    document.getElementById("heroName").textContent = r.name;
    document.getElementById("heroMeta").innerHTML = `
      <span>📍 ${escapeHtml(r.location)}, ${escapeHtml(r.city)}</span>
      <span>🍽️ ${escapeHtml(r.cuisine || "Multi-cuisine")}</span>
      <span>⭐ ${(r.rating || 0).toFixed(1)}</span>
      <span>🕐 ${escapeHtml(r.openingTime)} - ${escapeHtml(r.closingTime)}</span>
    `;
    document.getElementById("aboutText").textContent = r.description || "No description available yet.";
    document.getElementById("addressText").textContent = r.address || r.location;
    document.getElementById("phoneText").textContent = r.phone || "Not available";
    document.getElementById("priceRangeText").textContent = r.priceRange || "$$";

    document.getElementById("bookRestaurantName").value = r.name;
    document.getElementById("bookForm").dataset.restaurantId = r.id;
    document.getElementById("bookForm").dataset.opening = r.openingTime;
    document.getElementById("bookForm").dataset.closing = r.closingTime;

    loadReviews(id);
  } catch (err) {
    wrapper.innerHTML = `<div class="empty-state"><div class="icon">😕</div><p>${escapeHtml(err.message || "Restaurant not found.")}</p><a href="/restaurants.html" class="btn btn-primary mt-2">Back to Restaurants</a></div>`;
  }
}

async function loadReviews(restaurantId) {
  const list = document.getElementById("reviewsList");
  if (!list) return;
  try {
    const reviews = await Api.getReviews(restaurantId);
    list.innerHTML = reviews.length
      ? reviews.map(rv => `
          <div class="review-item">
            <div class="review-head">
              <strong>${escapeHtml(rv.user ? rv.user.name : "Guest")}</strong>
              <span class="review-stars">${starString(rv.rating)}</span>
            </div>
            <p class="mb-0">${escapeHtml(rv.comment || "")}</p>
          </div>
        `).join("")
      : `<p class="muted">No reviews yet. Be the first to review this restaurant after your visit!</p>`;
  } catch (err) {
    list.innerHTML = `<p class="muted">Could not load reviews.</p>`;
  }
}

function initTabs() {
  const buttons = document.querySelectorAll(".info-tabs button");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      document.querySelectorAll(".tab-panel").forEach(p => p.style.display = "none");
      document.getElementById(btn.dataset.tab).style.display = "block";
    });
  });
}

function initGuestStepper() {
  const stepper = document.getElementById("guestStepper");
  if (!stepper) return;
  const valueEl = document.getElementById("guestValue");
  const input = document.getElementById("guestsInput");
  let count = 2;
  const render = () => { valueEl.textContent = count; input.value = count; };
  document.getElementById("guestMinus").addEventListener("click", () => { if (count > 1) { count--; render(); } });
  document.getElementById("guestPlus").addEventListener("click", () => { if (count < 20) { count++; render(); } });
  render();
}

function initBookForm() {
  const form = document.getElementById("bookForm");
  if (!form) return;

  const dateInput = document.getElementById("dateInput");
  dateInput.min = todayISO();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const restaurantId = form.dataset.restaurantId;
    const date = form.dateInput.value;
    const time = form.timeInput.value;
    const guests = form.guestsInput.value;

    if (!date || !time || !guests) {
      showToast("Please select a date, time, and number of guests", "error");
      return;
    }

    if (!Auth.isLoggedIn()) {
      showToast("Please log in to continue booking", "info");
      window.location.href = `/login.html?redirect=${encodeURIComponent(`/booking.html?restaurantId=${restaurantId}&date=${date}&time=${time}&guests=${guests}`)}`;
      return;
    }

    window.location.href = `/booking.html?restaurantId=${restaurantId}&date=${date}&time=${time}&guests=${guests}`;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadRestaurantDetails();
  initTabs();
  initGuestStepper();
  initBookForm();
});

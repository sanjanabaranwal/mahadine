/**
 * MAHADINE — restaurants.js
 * Powers the restaurant listing / search page (restaurants.html) and the
 * "Popular Restaurants" section on the home page.
 */

function restaurantCardHtml(r) {
  const image = r.imageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800";
  return `
    <a href="/restaurant-details.html?id=${r.id}" class="card restaurant-card">
      <div class="card-image">
        <img src="${escapeHtml(image)}" alt="${escapeHtml(r.name)}" loading="lazy">
        <span class="badge">${escapeHtml(r.cuisine || "Multi-cuisine")}</span>
        <span class="badge-rating">★ ${(r.rating || 0).toFixed(1)}</span>
      </div>
      <div class="card-body">
        <h3>${escapeHtml(r.name)}</h3>
        <div class="card-meta">📍 ${escapeHtml(r.location)}, ${escapeHtml(r.city)}</div>
        <div class="card-tags">
          <span class="tag">${escapeHtml(r.priceRange || "$$")}</span>
          <span class="tag">${escapeHtml(r.openingTime || "")} - ${escapeHtml(r.closingTime || "")}</span>
        </div>
        <div class="card-footer">
          <span class="availability-dot">Tables available</span>
          <span class="btn btn-outline btn-sm">View Details</span>
        </div>
      </div>
    </a>
  `;
}

function skeletonCards(count = 6) {
  return Array.from({ length: count }).map(() => `
    <div class="card restaurant-card">
      <div class="skeleton" style="height:210px;"></div>
      <div class="card-body">
        <div class="skeleton" style="height:20px; width:70%; margin-bottom:10px;"></div>
        <div class="skeleton" style="height:14px; width:50%;"></div>
      </div>
    </div>
  `).join("");
}

async function loadPopularRestaurants() {
  const grid = document.getElementById("popularGrid");
  if (!grid) return;
  grid.innerHTML = skeletonCards(4);
  try {
    const restaurants = await Api.getRestaurants();
    const top = [...restaurants].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 4);
    grid.innerHTML = top.length ? top.map(restaurantCardHtml).join("") : emptyStateHtml("No restaurants found yet.");
  } catch (err) {
    grid.innerHTML = emptyStateHtml("Could not load restaurants right now.");
  }
}

function emptyStateHtml(message) {
  return `<div class="empty-state" style="grid-column: 1/-1;"><div class="icon">🍽️</div><p>${escapeHtml(message)}</p></div>`;
}

async function loadRestaurantList() {
  const grid = document.getElementById("restaurantGrid");
  if (!grid) return;

  const params = new URLSearchParams(window.location.search);
  const cityInput = document.getElementById("filterCity");
  const cuisineInput = document.getElementById("filterCuisine");
  const keywordInput = document.getElementById("filterKeyword");

  if (cityInput && params.get("city")) cityInput.value = params.get("city");
  if (keywordInput && params.get("keyword")) keywordInput.value = params.get("keyword");

  grid.innerHTML = skeletonCards(6);

  try {
    const restaurants = await Api.getRestaurants({
      city: cityInput ? cityInput.value : "",
      cuisine: cuisineInput ? cuisineInput.value : "",
      keyword: keywordInput ? keywordInput.value : ""
    });
    const countLabel = document.getElementById("resultCount");
    if (countLabel) countLabel.textContent = `${restaurants.length} restaurant${restaurants.length === 1 ? "" : "s"} found`;
    grid.innerHTML = restaurants.length ? restaurants.map(restaurantCardHtml).join("") : emptyStateHtml("No restaurants found. Try adjusting your filters.");
  } catch (err) {
    grid.innerHTML = emptyStateHtml("Something went wrong while loading restaurants.");
    showToast(err.message, "error");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadPopularRestaurants();

  const filterForm = document.getElementById("filterForm");
  if (filterForm) {
    loadRestaurantList();
    filterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      loadRestaurantList();
    });
    filterForm.querySelectorAll("input, select").forEach(el => {
      el.addEventListener("input", debounce(loadRestaurantList, 400));
    });
  }

  // Home page hero search redirects to restaurants.html with query params
  const heroSearchForm = document.getElementById("heroSearchForm");
  if (heroSearchForm) {
    heroSearchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const city = heroSearchForm.city.value.trim();
      const params = new URLSearchParams();
      if (city) params.set("city", city);
      window.location.href = `/restaurants.html?${params.toString()}`;
    });
  }
});

/**
 * MAHADINE ADMIN — restaurants.js
 * Full CRUD for restaurants: list, add, edit, delete.
 */

let editingRestaurantId = null;

async function loadRestaurants() {
  const tbody = document.getElementById("restaurantsBody");
  tbody.innerHTML = `<tr><td colspan="7"><div class="spinner"></div></td></tr>`;
  try {
    const restaurants = await AdminApi.restaurants();
    if (!restaurants.length) {
      tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="icon">🍽️</div><p>No restaurants yet. Add your first one.</p></div></td></tr>`;
      return;
    }
    tbody.innerHTML = restaurants.map(r => `
      <tr>
        <td>
          <div class="table-avatar">
            <span class="avatar-sm">${escapeHtml(r.name.slice(0,2).toUpperCase())}</span>
            <div><strong>${escapeHtml(r.name)}</strong><div class="muted" style="font-size:0.78rem;">${escapeHtml(r.cuisine || "")}</div></div>
          </div>
        </td>
        <td>${escapeHtml(r.city)}</td>
        <td>${escapeHtml(r.location)}</td>
        <td>⭐ ${(r.rating || 0).toFixed(1)}</td>
        <td>${escapeHtml(r.openingTime)} - ${escapeHtml(r.closingTime)}</td>
        <td><span class="status-badge status-${r.status}">${r.status}</span></td>
        <td>
          <div class="flex gap-1">
            <a class="btn-icon-sm" href="/admin/tables.html?restaurantId=${r.id}" title="Manage Tables">🪑</a>
            <button class="btn-icon-sm" onclick="openRestaurantModal(${r.id})" title="Edit">✏️</button>
            <button class="btn-icon-sm" onclick="deleteRestaurant(${r.id})" title="Delete">🗑️</button>
          </div>
        </td>
      </tr>
    `).join("");
    window.__restaurants = restaurants;
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><p>${escapeHtml(err.message)}</p></div></td></tr>`;
  }
}

function openRestaurantModal(id = null) {
  editingRestaurantId = id;
  const modal = document.getElementById("restaurantModal");
  const form = document.getElementById("restaurantForm");
  form.reset();
  document.querySelectorAll("#restaurantModal .form-group").forEach(g => g.classList.remove("has-error"));

  document.getElementById("restaurantModalTitle").textContent = id ? "Edit Restaurant" : "Add Restaurant";

  if (id) {
    const r = (window.__restaurants || []).find(x => x.id === id);
    if (r) {
      form.name.value = r.name;
      form.description.value = r.description || "";
      form.location.value = r.location;
      form.city.value = r.city;
      form.address.value = r.address || "";
      form.phone.value = r.phone || "";
      form.email.value = r.email || "";
      form.cuisine.value = r.cuisine || "";
      form.priceRange.value = r.priceRange || "$$";
      form.rating.value = r.rating || 4.0;
      form.openingTime.value = r.openingTime || "11:00";
      form.closingTime.value = r.closingTime || "23:00";
      form.imageUrl.value = r.imageUrl || "";
      form.status.value = r.status || "ACTIVE";
    }
  } else {
    form.openingTime.value = "11:00";
    form.closingTime.value = "23:00";
    form.rating.value = "4.0";
    form.priceRange.value = "$$";
    form.status.value = "ACTIVE";
  }

  modal.classList.add("open");
}

function closeRestaurantModal() {
  document.getElementById("restaurantModal").classList.remove("open");
}

async function submitRestaurantForm(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = "Saving...";

  const payload = {
    name: form.name.value.trim(),
    description: form.description.value.trim(),
    location: form.location.value.trim(),
    city: form.city.value.trim(),
    address: form.address.value.trim(),
    phone: form.phone.value.trim(),
    email: form.email.value.trim(),
    cuisine: form.cuisine.value.trim(),
    priceRange: form.priceRange.value,
    rating: parseFloat(form.rating.value) || 4.0,
    openingTime: form.openingTime.value,
    closingTime: form.closingTime.value,
    imageUrl: form.imageUrl.value.trim(),
    status: form.status.value
  };

  try {
    if (editingRestaurantId) {
      await AdminApi.updateRestaurant(editingRestaurantId, payload);
      showToast("Restaurant updated", "success");
    } else {
      await AdminApi.createRestaurant(payload);
      showToast("Restaurant added", "success");
    }
    closeRestaurantModal();
    loadRestaurants();
  } catch (err) {
    showToast(err.message || "Could not save restaurant", "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Save Restaurant";
  }
}

async function deleteRestaurant(id) {
  if (!confirm("Delete this restaurant? This cannot be undone.")) return;
  try {
    await AdminApi.deleteRestaurant(id);
    showToast("Restaurant deleted", "success");
    loadRestaurants();
  } catch (err) {
    showToast(err.message || "Could not delete restaurant", "error");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadRestaurants();
  document.getElementById("addRestaurantBtn").addEventListener("click", () => openRestaurantModal(null));
  document.getElementById("restaurantForm").addEventListener("submit", submitRestaurantForm);
  document.getElementById("restaurantModalClose").addEventListener("click", closeRestaurantModal);
});

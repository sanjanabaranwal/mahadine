/**
 * MAHADINE ADMIN — tables.js
 * Manage tables for a selected restaurant: list, add, edit, delete.
 */

let currentRestaurantId = null;
let editingTableId = null;
let currentTables = [];

async function initTablesPage() {
  const select = document.getElementById("restaurantSelect");
  try {
    const restaurants = await AdminApi.restaurants();
    select.innerHTML = restaurants.map(r => `<option value="${r.id}">${escapeHtml(r.name)}</option>`).join("");

    const paramId = new URLSearchParams(window.location.search).get("restaurantId");
    if (paramId && restaurants.some(r => String(r.id) === paramId)) {
      select.value = paramId;
    }
    currentRestaurantId = select.value;
    if (currentRestaurantId) loadTables();
  } catch (err) {
    showToast(err.message || "Could not load restaurants", "error");
  }

  select.addEventListener("change", () => {
    currentRestaurantId = select.value;
    loadTables();
  });
}

async function loadTables() {
  const tbody = document.getElementById("tablesBody");
  if (!currentRestaurantId) return;
  tbody.innerHTML = `<tr><td colspan="5"><div class="spinner"></div></td></tr>`;
  try {
    currentTables = await AdminApi.tablesByRestaurant(currentRestaurantId);
    if (!currentTables.length) {
      tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="icon">🪑</div><p>No tables yet for this restaurant.</p></div></td></tr>`;
      return;
    }
    tbody.innerHTML = currentTables.map(t => `
      <tr>
        <td><strong>Table ${escapeHtml(t.tableNumber)}</strong></td>
        <td>${t.capacity} seats</td>
        <td>${escapeHtml(t.tableType || "Standard")}</td>
        <td><span class="status-badge status-${t.status}">${t.status}</span></td>
        <td>
          <div class="flex gap-1">
            <button class="btn-icon-sm" onclick="openTableModal(${t.id})" title="Edit">✏️</button>
            <button class="btn-icon-sm" onclick="deleteTable(${t.id})" title="Delete">🗑️</button>
          </div>
        </td>
      </tr>
    `).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><p>${escapeHtml(err.message)}</p></div></td></tr>`;
  }
}

function openTableModal(id = null) {
  if (!currentRestaurantId) { showToast("Please select a restaurant first", "error"); return; }
  editingTableId = id;
  const modal = document.getElementById("tableModal");
  const form = document.getElementById("tableForm");
  form.reset();
  document.getElementById("tableModalTitle").textContent = id ? "Edit Table" : "Add Table";

  if (id) {
    const t = currentTables.find(x => x.id === id);
    if (t) {
      form.tableNumber.value = t.tableNumber;
      form.capacity.value = t.capacity;
      form.tableType.value = t.tableType || "Indoor";
      form.status.value = t.status;
    }
  } else {
    form.tableType.value = "Indoor";
    form.status.value = "AVAILABLE";
  }

  modal.classList.add("open");
}

function closeTableModal() {
  document.getElementById("tableModal").classList.remove("open");
}

async function submitTableForm(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = "Saving...";

  const payload = {
    tableNumber: form.tableNumber.value.trim(),
    capacity: parseInt(form.capacity.value, 10),
    tableType: form.tableType.value,
    status: form.status.value
  };

  try {
    if (editingTableId) {
      await AdminApi.updateTable(editingTableId, payload);
      showToast("Table updated", "success");
    } else {
      await AdminApi.createTable(currentRestaurantId, payload);
      showToast("Table added", "success");
    }
    closeTableModal();
    loadTables();
  } catch (err) {
    showToast(err.message || "Could not save table", "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Save Table";
  }
}

async function deleteTable(id) {
  if (!confirm("Delete this table? Existing reservations referencing it will remain in history.")) return;
  try {
    await AdminApi.deleteTable(id);
    showToast("Table deleted", "success");
    loadTables();
  } catch (err) {
    showToast(err.message || "Could not delete table", "error");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initTablesPage();
  document.getElementById("addTableBtn").addEventListener("click", () => openTableModal(null));
  document.getElementById("tableForm").addEventListener("submit", submitTableForm);
  document.getElementById("tableModalClose").addEventListener("click", closeTableModal);
});

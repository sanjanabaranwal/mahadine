/**
 * MAHADINE ADMIN — reservations.js
 * View all reservations; Confirm / Cancel / Edit / Delete each one, plus a
 * quick status dropdown for marking a reservation Completed.
 */

let allReservations = [];
let statusFilter = "ALL";
let editingReservationId = null;

async function loadReservations() {
  const tbody = document.getElementById("reservationsBody");
  tbody.innerHTML = `<tr><td colspan="9"><div class="spinner"></div></td></tr>`;
  try {
    allReservations = await AdminApi.reservations();
    renderReservations();
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="9"><div class="empty-state"><p>${escapeHtml(err.message)}</p></div></td></tr>`;
  }
}

function renderReservations() {
  const tbody = document.getElementById("reservationsBody");
  const filtered = statusFilter === "ALL" ? allReservations : allReservations.filter(r => r.status === statusFilter);

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="9"><div class="empty-state"><div class="icon">📋</div><p>No reservations found.</p></div></td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(r => `
    <tr>
      <td>#MHD-${String(r.id).padStart(5, "0")}</td>
      <td>${escapeHtml(r.userName)}</td>
      <td>${escapeHtml(r.restaurantName)}</td>
      <td>Table ${escapeHtml(r.tableNumber)}</td>
      <td>${formatDate(r.reservationDate)}</td>
      <td>${formatTime(r.reservationTime)}</td>
      <td>${r.numberOfGuests}</td>
      <td><span class="status-badge status-${r.status}">${r.status}</span></td>
      <td>
        <div class="flex gap-1" style="flex-wrap:wrap;">
          ${r.status === "PENDING" ? `<button class="btn btn-sm btn-primary" onclick="quickStatus(${r.id}, 'CONFIRMED')">Confirm</button>` : ""}
          ${(r.status === "PENDING" || r.status === "CONFIRMED") ? `<button class="btn btn-sm btn-danger-ghost" onclick="quickStatus(${r.id}, 'CANCELLED')">Cancel</button>` : ""}
          ${r.status === "CONFIRMED" ? `<button class="btn btn-sm btn-outline" onclick="quickStatus(${r.id}, 'COMPLETED')">Mark Completed</button>` : ""}
          <button class="btn-icon-sm" onclick="openEditModal(${r.id})" title="Edit">✏️</button>
          <button class="btn-icon-sm" onclick="deleteReservation(${r.id})" title="Delete">🗑️</button>
        </div>
      </td>
    </tr>
  `).join("");
}

async function quickStatus(id, status) {
  if (status === "CANCELLED" && !confirm("Cancel this reservation? The table will become available for this date/time again.")) return;
  try {
    await AdminApi.updateReservationStatus(id, status);
    showToast(`Reservation marked ${status}`, "success");
    const r = allReservations.find(x => x.id === id);
    if (r) r.status = status;
    renderReservations();
  } catch (err) {
    showToast(err.message || "Could not update status", "error");
    loadReservations();
  }
}

function openEditModal(id) {
  const r = allReservations.find(x => x.id === id);
  if (!r) return;
  editingReservationId = id;
  const form = document.getElementById("editReservationForm");
  form.reservationDate.value = r.reservationDate;
  form.reservationTime.value = r.reservationTime;
  form.numberOfGuests.value = r.numberOfGuests;
  form.specialRequest.value = r.specialRequest || "";
  document.getElementById("editModalSubtitle").textContent = `${r.restaurantName} · Table ${r.tableNumber} · ${escapeHtml(r.userName)}`;
  document.getElementById("editReservationModal").classList.add("open");
}

function closeEditModal() {
  document.getElementById("editReservationModal").classList.remove("open");
  editingReservationId = null;
}

async function submitEditForm(e) {
  e.preventDefault();
  const form = e.target;
  const r = allReservations.find(x => x.id === editingReservationId);
  if (!r) return;
  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = "Saving...";
  try {
    await AdminApi.updateReservation(editingReservationId, {
      restaurantId: r.restaurantId,
      tableId: r.tableId,
      reservationDate: form.reservationDate.value,
      reservationTime: form.reservationTime.value,
      numberOfGuests: parseInt(form.numberOfGuests.value, 10),
      specialRequest: form.specialRequest.value.trim() || null
    });
    showToast("Reservation updated", "success");
    closeEditModal();
    loadReservations();
  } catch (err) {
    showToast(err.message || "Could not update reservation", "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Save Changes";
  }
}

async function deleteReservation(id) {
  if (!confirm("Permanently delete this reservation? This cannot be undone.")) return;
  try {
    await AdminApi.deleteReservation(id);
    showToast("Reservation deleted", "success");
    loadReservations();
  } catch (err) {
    showToast(err.message || "Could not delete reservation", "error");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadReservations();
  document.getElementById("statusFilterSelect").addEventListener("change", (e) => {
    statusFilter = e.target.value;
    renderReservations();
  });
  document.getElementById("editReservationForm").addEventListener("submit", submitEditForm);
  document.getElementById("editModalClose").addEventListener("click", closeEditModal);
});

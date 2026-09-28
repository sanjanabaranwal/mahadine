/**
 * MAHADINE — my-bookings.js
 * Lists the logged-in user's reservations with filtering and cancellation.
 */

let allBookings = [];
let activeFilter = "ALL";

const STATUS_MESSAGES = {
  PENDING: "Waiting for admin confirmation",
  CONFIRMED: "Booking confirmed",
  CANCELLED: "Booking cancelled",
  COMPLETED: "Booking completed"
};

async function loadMyBookings() {
  const list = document.getElementById("bookingsList");
  if (!list) return;

  list.innerHTML = `<div class="spinner"></div>`;
  try {
    allBookings = await Api.getMyReservations();
    renderBookings();
  } catch (err) {
    list.innerHTML = `<div class="empty-state"><div class="icon">😕</div><p>${escapeHtml(err.message)}</p></div>`;
  }
}

function renderBookings() {
  const list = document.getElementById("bookingsList");
  const filtered = activeFilter === "ALL" ? allBookings : allBookings.filter(b => b.status === activeFilter);

  if (!filtered.length) {
    list.innerHTML = `<div class="empty-state"><div class="icon">📅</div><p>No reservations found${activeFilter !== "ALL" ? ` with status ${activeFilter}` : ""}.</p><a href="/restaurants.html" class="btn btn-primary mt-2">Book a Table</a></div>`;
    return;
  }

  list.innerHTML = filtered.map(b => `
    <div class="booking-card-row" data-id="${b.id}">
      <img src="${b.restaurantImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'}" alt="${escapeHtml(b.restaurantName)}">
      <div>
        <h3>${escapeHtml(b.restaurantName)}</h3>
        <div class="booking-meta">
          <span>📅 ${formatDate(b.reservationDate)}</span>
          <span>🕐 ${formatTime(b.reservationTime)}</span>
          <span>👥 ${b.numberOfGuests} guests</span>
          <span>🪑 Table ${escapeHtml(b.tableNumber)}</span>
        </div>
        ${b.specialRequest ? `<p class="muted mt-1" style="font-size:0.85rem;">Note: ${escapeHtml(b.specialRequest)}</p>` : ""}
      </div>
      <div class="booking-actions">
        <span class="muted" style="font-size:0.78rem;">#MHD-${String(b.id).padStart(5, "0")}</span>
        <span class="status-badge status-${b.status}">${b.status}</span>
        <span class="muted" style="font-size:0.8rem; text-align:right;">${STATUS_MESSAGES[b.status] || ""}</span>
        ${(b.status === "PENDING" || b.status === "CONFIRMED") ? `<button class="btn btn-outline btn-sm cancel-btn" data-id="${b.id}">Cancel</button>` : ""}
      </div>
    </div>
  `).join("");

  list.querySelectorAll(".cancel-btn").forEach(btn => {
    btn.addEventListener("click", () => cancelBooking(btn.dataset.id));
  });
}

async function cancelBooking(id) {
  if (!confirm("Are you sure you want to cancel this reservation?")) return;
  try {
    await Api.cancelReservation(id);
    showToast("Reservation cancelled", "success");
    loadMyBookings();
  } catch (err) {
    showToast(err.message || "Could not cancel this reservation", "error");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadMyBookings();
  document.querySelectorAll(".filter-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      activeFilter = chip.dataset.status;
      renderBookings();
    });
  });
});

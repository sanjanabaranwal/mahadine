/**
 * MAHADINE — booking.js
 * booking.html: shows available tables for the chosen restaurant/date/time/
 * guests, lets the user pick one, and confirms the reservation. The backend
 * is the source of truth for availability - this page just reflects it.
 */

let selectedTableId = null;
let bookingContext = null;

function getBookingParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    restaurantId: params.get("restaurantId"),
    date: params.get("date"),
    time: params.get("time"),
    guests: parseInt(params.get("guests") || "2", 10)
  };
}

async function initBookingPage() {
  const formStep = document.getElementById("bookingFormStep");
  if (!formStep) return;

  if (!Auth.isLoggedIn()) {
    window.location.href = `/login.html?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
    return;
  }

  const { restaurantId, date, time, guests } = getBookingParams();
  if (!restaurantId || !date || !time) {
    formStep.innerHTML = `<div class="empty-state"><div class="icon">⚠️</div><p>Missing booking details. Please start again from the restaurant page.</p><a href="/restaurants.html" class="btn btn-primary mt-2">Browse Restaurants</a></div>`;
    return;
  }

  try {
    const restaurant = await Api.getRestaurant(restaurantId);
    bookingContext = { restaurant, date, time, guests };

    document.getElementById("summaryRestaurantName").textContent = restaurant.name;
    document.getElementById("summaryDate").textContent = formatDate(date);
    document.getElementById("summaryTime").textContent = formatTime(time);
    document.getElementById("summaryGuests").textContent = guests;

    if (!isWithinOperatingHours(restaurant.openingTime, restaurant.closingTime, time)) {
      document.getElementById("tableOptionsGrid").innerHTML =
        `<div class="empty-state"><div class="icon">🕐</div><p>${escapeHtml(closedMessage(restaurant.openingTime, restaurant.closingTime))}</p></div>`;
      return;
    }

    await loadTableOptions();
  } catch (err) {
    formStep.innerHTML = `<div class="empty-state"><div class="icon">😕</div><p>${escapeHtml(err.message)}</p></div>`;
  }
}

async function loadTableOptions() {
  const grid = document.getElementById("tableOptionsGrid");
  const { restaurantId, date, time, guests } = getBookingParams();
  grid.innerHTML = `<div class="spinner"></div>`;

  try {
    const tables = await Api.getAvailability(restaurantId, { date, time, guests });
    if (!tables.length) {
      grid.innerHTML = `<div class="empty-state"><div class="icon">🪑</div><p>This restaurant has no tables configured yet.</p></div>`;
      return;
    }
    grid.innerHTML = tables.map(t => `
      <div class="table-option ${t.available ? "" : "unavailable"}" data-id="${t.id}" data-capacity="${t.capacity}">
        <strong>Table ${escapeHtml(t.tableNumber)}</strong>
        <span>${t.capacity} seats · ${escapeHtml(t.tableType || "Standard")}</span>
      </div>
    `).join("");

    grid.querySelectorAll(".table-option:not(.unavailable)").forEach(el => {
      el.addEventListener("click", () => {
        grid.querySelectorAll(".table-option").forEach(o => o.classList.remove("selected"));
        el.classList.add("selected");
        selectedTableId = el.dataset.id;
        document.getElementById("confirmBookingBtn").disabled = false;
      });
    });

    if (!tables.some(t => t.available)) {
      showToast("No tables are currently free for this exact time. Try a different time.", "info");
    }
  } catch (err) {
    grid.innerHTML = `<p class="muted">Could not load table availability.</p>`;
    showToast(err.message, "error");
  }
}

async function confirmBooking() {
  if (!selectedTableId) {
    showToast("Please select a table first", "error");
    return;
  }
  const { restaurantId, date, time, guests } = getBookingParams();
  const btn = document.getElementById("confirmBookingBtn");
  const specialRequest = document.getElementById("specialRequestInput").value.trim();

  btn.disabled = true;
  btn.textContent = "Confirming...";

  try {
    const reservation = await Api.createReservation({
      restaurantId: parseInt(restaurantId, 10),
      tableId: parseInt(selectedTableId, 10),
      reservationDate: date,
      reservationTime: time,
      numberOfGuests: guests,
      specialRequest: specialRequest || null
    });

    showConfirmation(reservation);
  } catch (err) {
    showToast(err.message || "Booking failed. Please try again.", "error");
    btn.disabled = false;
    btn.textContent = "Confirm Booking";
    if (err.status === 409) {
      // Table was just taken - refresh availability
      await loadTableOptions();
      selectedTableId = null;
    }
  }
}

function showConfirmation(reservation) {
  document.getElementById("bookingFormStep").style.display = "none";
  const confirmStep = document.getElementById("bookingConfirmStep");
  confirmStep.style.display = "block";

  document.getElementById("confId").textContent = `#MHD-${String(reservation.id).padStart(5, "0")}`;
  document.getElementById("confRestaurant").textContent = reservation.restaurantName;
  document.getElementById("confDate").textContent = formatDate(reservation.reservationDate);
  document.getElementById("confTime").textContent = formatTime(reservation.reservationTime);
  document.getElementById("confGuests").textContent = reservation.numberOfGuests;
  document.getElementById("confTable").textContent = reservation.tableNumber;
  document.getElementById("confStatus").innerHTML = `<span class="status-badge status-${reservation.status}">${reservation.status}</span>`;

  const noteEl = document.getElementById("confStatusNote");
  if (noteEl) {
    noteEl.textContent = reservation.status === "PENDING"
      ? "Your table request has been sent to the restaurant. You'll see it move to Confirmed in My Bookings once approved."
      : "";
  }

  showToast(
    reservation.status === "PENDING" ? "Booking submitted — waiting for admin confirmation." : "Booking confirmed successfully!",
    reservation.status === "PENDING" ? "info" : "success"
  );
}

document.addEventListener("DOMContentLoaded", () => {
  initBookingPage();
  const confirmBtn = document.getElementById("confirmBookingBtn");
  if (confirmBtn) confirmBtn.addEventListener("click", confirmBooking);
});

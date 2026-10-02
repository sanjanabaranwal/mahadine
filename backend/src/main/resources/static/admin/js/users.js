/**
 * MAHADINE ADMIN — users.js
 * Read-only view of all registered users, plus each user's booking history
 * (REQUIREMENT 8/9). Booking data is reused from the existing
 * AdminApi.reservations() endpoint - no new backend endpoint needed, just
 * filtered client-side by userId.
 */

let allUsers = [];
let allReservationsForUsers = [];

async function loadUsers() {
  const tbody = document.getElementById("usersBody");
  tbody.innerHTML = `<tr><td colspan="6"><div class="spinner"></div></td></tr>`;
  try {
    const [allUsersRaw, reservations] = await Promise.all([AdminApi.users(), AdminApi.reservations()]);
    const users = allUsersRaw.filter(u => u.role !== "ADMIN");
    allUsers = users;
    allReservationsForUsers = reservations;

    if (!users.length) {
      tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><p>No users found.</p></div></td></tr>`;
      return;
    }

    tbody.innerHTML = users.map(u => {
      const bookingCount = reservations.filter(r => r.userId === u.id).length;
      return `
        <tr>
          <td>
            <div class="table-avatar">
              <span class="avatar-sm">${escapeHtml(initials(u.name))}</span>
              <strong>${escapeHtml(u.name)}</strong>
            </div>
          </td>
          <td>${escapeHtml(u.email)}</td>
          <td>${escapeHtml(u.phone || "—")}</td>
          <td><span class="status-badge ${u.role === "ADMIN" ? "status-CONFIRMED" : "status-PENDING"}">${u.role}</span></td>
          <td>${bookingCount}</td>
          <td><button class="btn btn-outline btn-sm" onclick="openUserBookings(${u.id})" ${bookingCount === 0 ? "disabled" : ""}>View Bookings</button></td>
        </tr>
      `;
    }).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><p>${escapeHtml(err.message)}</p></div></td></tr>`;
  }
}

function openUserBookings(userId) {
  const user = allUsers.find(u => u.id === userId);
  const bookings = allReservationsForUsers.filter(r => r.userId === userId)
    .sort((a, b) => (a.reservationDate < b.reservationDate ? 1 : -1));

  document.getElementById("userBookingsModalTitle").textContent = `${user ? user.name : "User"}'s Bookings`;

  const body = document.getElementById("userBookingsModalBody");
  body.innerHTML = bookings.length ? `
    <table class="data-table">
      <thead><tr><th>Restaurant</th><th>Table</th><th>Date</th><th>Time</th><th>Guests</th><th>Status</th></tr></thead>
      <tbody>
        ${bookings.map(b => `
          <tr>
            <td>${escapeHtml(b.restaurantName)}</td>
            <td>Table ${escapeHtml(b.tableNumber)}</td>
            <td>${formatDate(b.reservationDate)}</td>
            <td>${formatTime(b.reservationTime)}</td>
            <td>${b.numberOfGuests}</td>
            <td><span class="status-badge status-${b.status}">${b.status}</span></td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  ` : `<p class="muted">No bookings yet.</p>`;

  document.getElementById("userBookingsModal").classList.add("open");
}

function closeUserBookingsModal() {
  document.getElementById("userBookingsModal").classList.remove("open");
}

document.addEventListener("DOMContentLoaded", () => {
  loadUsers();
  document.getElementById("userBookingsModalClose").addEventListener("click", closeUserBookingsModal);
});

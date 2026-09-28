/**
 * MAHADINE ADMIN — dashboard.js
 * Loads live stats and recent reservations from the backend (no hardcoded
 * numbers) for the admin dashboard home page.
 */

async function loadDashboard() {
  try {
    const stats = await AdminApi.dashboard();

    document.getElementById("statTotalUsers").textContent = stats.totalUsers;
    document.getElementById("statTotalRestaurants").textContent = stats.totalRestaurants;
    document.getElementById("statTotalTables").textContent = stats.totalTables;
    document.getElementById("statTotalReservations").textContent = stats.totalReservations;
    document.getElementById("statTodayReservations").textContent = stats.todayReservations;
    document.getElementById("statPending").textContent = stats.pendingReservations;
    document.getElementById("statConfirmed").textContent = stats.confirmedReservations;
    document.getElementById("statCancelled").textContent = stats.cancelledReservations;

    const tbody = document.getElementById("recentReservationsBody");
    if (!stats.recentReservations.length) {
      tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="icon">📋</div><p>No reservations yet.</p></div></td></tr>`;
      return;
    }

    tbody.innerHTML = stats.recentReservations.map(r => `
      <tr>
        <td>#MHD-${String(r.id).padStart(5, "0")}</td>
        <td>${escapeHtml(r.userName)}</td>
        <td>${escapeHtml(r.restaurantName)}</td>
        <td>${formatDate(r.reservationDate)}</td>
        <td>${formatTime(r.reservationTime)}</td>
        <td>${r.numberOfGuests}</td>
        <td><span class="status-badge status-${r.status}">${r.status}</span></td>
      </tr>
    `).join("");
  } catch (err) {
    showToast(err.message || "Could not load dashboard data", "error");
  }
}

document.addEventListener("DOMContentLoaded", loadDashboard);

/**
 * MAHADINE ADMIN — analytics.js
 * Basic analytics: popular restaurants and reservation status breakdown.
 */

async function loadAnalytics() {
  try {
    const data = await AdminApi.analytics();

    const popularList = document.getElementById("popularRestaurantsList");
    popularList.innerHTML = data.popularRestaurants.length
      ? data.popularRestaurants.map((p, i) => `
          <div class="flex-between" style="padding:12px 0; border-bottom:1px solid var(--cream-300);">
            <div class="flex gap-1"><strong>#${i + 1}</strong><span>${escapeHtml(p.name)}</span></div>
            <span class="status-badge status-CONFIRMED">${p.bookings} bookings</span>
          </div>
        `).join("")
      : `<p class="muted">Not enough data yet.</p>`;

    const breakdown = data.statusBreakdown;
    const total = Object.values(breakdown).reduce((a, b) => a + b, 0) || 1;
    const barsEl = document.getElementById("statusBreakdown");
    const colors = { PENDING: "var(--warning)", CONFIRMED: "var(--success)", CANCELLED: "var(--danger)", COMPLETED: "var(--info)" };
    barsEl.innerHTML = Object.entries(breakdown).map(([status, count]) => {
      const pct = Math.round((count / total) * 100);
      return `
        <div class="mt-1">
          <div class="flex-between" style="font-size:0.85rem; margin-bottom:4px;">
            <span>${status}</span><span>${count} (${pct}%)</span>
          </div>
          <div style="background: var(--cream-300); border-radius: 999px; height: 10px; overflow:hidden;">
            <div style="width:${pct}%; height:100%; background:${colors[status] || 'var(--olive-600)'};"></div>
          </div>
        </div>
      `;
    }).join("");
  } catch (err) {
    showToast(err.message || "Could not load analytics", "error");
  }
}

document.addEventListener("DOMContentLoaded", loadAnalytics);

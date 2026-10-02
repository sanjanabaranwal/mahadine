/**
 * MAHADINE ADMIN — reviews-questions.js
 * Lists submissions from the user "Get in Touch" form (real rows from the
 * database), with View / Mark as Read / Mark as Resolved / Delete.
 * Authorization is enforced by the backend (/api/admin/** requires ADMIN).
 */

let allMessages = [];
let currentFilter = "ALL";

const RQ_BADGE = { NEW: "status-PENDING", READ: "status-CONFIRMED", RESOLVED: "status-COMPLETED" };

function formatDateTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
}

function formatDay(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function truncate(text, n) {
  return text && text.length > n ? text.slice(0, n) + "…" : (text || "");
}

async function loadMessages() {
  const tbody = document.getElementById("rqBody");
  tbody.innerHTML = `<tr><td colspan="7"><div class="spinner"></div></td></tr>`;
  try {
    allMessages = await AdminApi.reviewsQuestions();
    renderMessages();
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><p>${escapeHtml(err.message)}</p></div></td></tr>`;
  }
}

function renderMessages() {
  const tbody = document.getElementById("rqBody");
  const list = allMessages.filter(m => currentFilter === "ALL" || m.status === currentFilter);

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><p>No messages found.</p></div></td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(m => `
    <tr>
      <td>
        <div class="table-avatar">
          <span class="avatar-sm">${escapeHtml(initials(m.name))}</span>
          <strong>${escapeHtml(m.name)}</strong>
        </div>
      </td>
      <td>${escapeHtml(m.email)}</td>
      <td>${escapeHtml(m.subject || "—")}</td>
      <td>${escapeHtml(truncate(m.message, 60))}</td>
      <td>${formatDay(m.createdAt)}</td>
      <td><span class="status-badge ${RQ_BADGE[m.status] || ""}">${m.status}</span></td>
      <td>
        <div class="flex gap-1">
          <button class="btn btn-outline btn-sm" onclick="viewMessage(${m.id})">View</button>
          ${m.status === "NEW" ? `<button class="btn btn-outline btn-sm" onclick="changeStatus(${m.id}, 'read')">Mark Read</button>` : ""}
          ${m.status !== "RESOLVED" ? `<button class="btn btn-outline btn-sm" onclick="changeStatus(${m.id}, 'resolve')">Resolve</button>` : ""}
          <button class="btn btn-outline btn-sm" onclick="deleteMessage(${m.id})">Delete</button>
        </div>
      </td>
    </tr>
  `).join("");
}

function replaceMessage(updated) {
  const i = allMessages.findIndex(m => m.id === updated.id);
  if (i >= 0) allMessages[i] = updated;
}

async function changeStatus(id, action) {
  try {
    const updated = action === "read"
      ? await AdminApi.markReviewQuestionRead(id)
      : await AdminApi.resolveReviewQuestion(id);
    replaceMessage(updated);
    renderMessages();
    showToast(action === "read" ? "Marked as read" : "Marked as resolved", "success");
    return updated;
  } catch (err) {
    showToast(err.message || "Could not update message", "error");
  }
}

async function viewMessage(id) {
  let m = allMessages.find(x => x.id === id);
  if (!m) return;

  // Opening a NEW message marks it as READ.
  if (m.status === "NEW") {
    try {
      m = await AdminApi.markReviewQuestionRead(id);
      replaceMessage(m);
      renderMessages();
    } catch (err) { /* still show the message */ }
  }

  document.getElementById("rqModalBody").innerHTML = `
    <div class="detail-list">
      <p><strong>User:</strong><br>${escapeHtml(m.name)}${m.userId ? ` (User ID: ${m.userId})` : " (guest)"}</p>
      <p><strong>Email:</strong><br>${escapeHtml(m.email)}</p>
      <p><strong>Subject:</strong><br>${escapeHtml(m.subject || "—")}</p>
      <p><strong>Message:</strong><br><span style="white-space:pre-wrap;">${escapeHtml(m.message)}</span></p>
      <p><strong>Submitted:</strong><br>${formatDateTime(m.createdAt)}</p>
      <p><strong>Status:</strong><br><span class="status-badge ${RQ_BADGE[m.status] || ""}">${m.status}</span></p>
    </div>
  `;
  document.getElementById("rqModal").classList.add("open");
}

async function deleteMessage(id) {
  if (!confirm("Delete this message? This cannot be undone.")) return;
  try {
    await AdminApi.deleteReviewQuestion(id);
    allMessages = allMessages.filter(m => m.id !== id);
    renderMessages();
    showToast("Message deleted", "success");
  } catch (err) {
    showToast(err.message || "Could not delete message", "error");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadMessages();
  document.getElementById("rqModalClose").addEventListener("click", () => {
    document.getElementById("rqModal").classList.remove("open");
  });
  document.querySelectorAll("#rqFilters button").forEach(btn => {
    btn.addEventListener("click", () => {
      currentFilter = btn.dataset.filter;
      document.querySelectorAll("#rqFilters button").forEach(b => {
        b.classList.toggle("btn-primary", b === btn);
        b.classList.toggle("btn-outline", b !== btn);
      });
      renderMessages();
    });
  });
});

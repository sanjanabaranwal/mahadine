/**
 * MAHADINE — profile.js
 * Loads and updates the logged-in user's profile.
 */

async function loadProfile() {
  const form = document.getElementById("profileForm");
  if (!form) return;

  try {
    const profile = await Api.getProfile();
    Auth.setUser(profile); // keep session copy fresh
    form.name.value = profile.name;
    form.email.value = profile.email;
    form.phone.value = profile.phone || "";

    document.getElementById("profileAvatar").textContent = initials(profile.name);
    document.getElementById("profileName").textContent = profile.name;
    document.getElementById("profileEmail").textContent = profile.email;

    const bookings = await Api.getMyReservations();
    document.getElementById("statTotalBookings").textContent = bookings.length;
    document.getElementById("statUpcoming").textContent = bookings.filter(b => ["PENDING", "CONFIRMED"].includes(b.status)).length;
    document.getElementById("statCancelled").textContent = bookings.filter(b => b.status === "CANCELLED").length;
  } catch (err) {
    showToast(err.message || "Could not load your profile", "error");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadProfile();

  const form = document.getElementById("profileForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFieldErrors(form);
    const btn = form.querySelector('button[type="submit"]');
    const newPassword = form.newPassword.value.trim();
    const confirmNewPassword = form.confirmNewPassword.value.trim();

    if (newPassword && newPassword !== confirmNewPassword) {
      setFieldError(form.confirmNewPassword, "Passwords do not match");
      showToast("New passwords do not match", "error");
      return;
    }

    btn.disabled = true;
    btn.textContent = "Saving...";

    try {
      const updated = await Api.updateProfile({
        name: form.name.value.trim(),
        phone: form.phone.value.trim(),
        newPassword: newPassword || null
      });
      Auth.setUser(updated);
      showToast("Profile updated successfully!", "success");
      form.newPassword.value = "";
      form.confirmNewPassword.value = "";
      renderNavAuthState();
    } catch (err) {
      if (err.errors) applyServerErrors(form, err.errors);
      showToast(err.message || "Could not update profile", "error");
    } finally {
      btn.disabled = false;
      btn.textContent = "Save Changes";
    }
  });
});

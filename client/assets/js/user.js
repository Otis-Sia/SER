// assets/js/user.js
// Loads the logged-in user from /api/auth/me and renders a per-user dashboard.

document.addEventListener("DOMContentLoaded", () => {
  const API = "http://localhost:4000/api";
  const TOKEN_KEY = "ser_auth_token";
  const ROLE_KEY = "ser_auth_role";
  const USER_KEY = "ser_auth_user";

  const msg = document.getElementById("user-msg");
  const logoutBtn = document.getElementById("logout-btn");

  function setMsg(text, ok = true) {
    if (!msg) return;
    msg.textContent = text || "";
    msg.style.color = ok ? "#0b6" : "#c22";
  }

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(USER_KEY);
  }

  async function getMe() {
    const token = getToken();
    if (!token) return null;

    const res = await fetch(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const isJson = (res.headers.get("content-type") || "").includes("application/json");
    const data = isJson ? await res.json() : await res.text();

    if (!res.ok) {
      throw new Error(data?.error || `Request failed (${res.status})`);
    }
    return data;
  }

  function render(me) {
    document.getElementById("uid").textContent = me.id ?? "—";
    document.getElementById("email").textContent = me.email ?? "—";
    document.getElementById("role").textContent = me.role ?? "—";
    document.getElementById("full_name").textContent = me.full_name ?? "(admin)";
    document.getElementById("hello").textContent =
      me.role === "admin" ? "Admin Dashboard" : `Welcome, ${me.full_name || "Scout"}`;

    const adminHint = document.getElementById("admin-hint");
    if (adminHint) adminHint.style.display = me.role === "admin" ? "block" : "none";
  }

  logoutBtn?.addEventListener("click", () => {
    clearSession();
    window.location.href = "/login/";
  });

  (async() => {
    try {
      const me = await getMe();
      if (!me) {
        window.location.href = "/login/";
        return;
      }
      render(me);
      setMsg("");
    } catch (err) {
      setMsg(err.message, false);
      clearSession();
      setTimeout(() => (window.location.href = "/login/"), 600);
    }
  })();
});

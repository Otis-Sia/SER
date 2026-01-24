// assets/js/admin.js
// Admin console for creating Products, Events, Posts, and Gallery Items.
// ✅ Uses the SAME session as assets/js/auth.js (login/register page):
//    - token: `ser_auth_token`
//    - role:  `ser_auth_role`

document.addEventListener("DOMContentLoaded", () => {
  const API = "http://localhost:4000/api";

  // Must match assets/js/auth.js
  const TOKEN_KEY = "ser_auth_token";
  const ROLE_KEY = "ser_auth_role";
  const USER_KEY = "ser_auth_user";

  // ---- DOM ----
  const authCard = document.getElementById("auth-card");
  const panel = document.getElementById("panel");
  const logoutBtn = document.getElementById("logout-btn");
  const authMsg = document.getElementById("auth-msg");
  const recheckBtn = document.getElementById("recheck-auth");

  const productForm = document.getElementById("product-form");
  const eventForm = document.getElementById("event-form");
  const postForm = document.getElementById("post-form");
  const galleryForm = document.getElementById("gallery-form");

  const productsList = document.getElementById("products-list");
  const eventsList = document.getElementById("events-list");
  const postsList = document.getElementById("posts-list");
  const galleryList = document.getElementById("gallery-list");

  // ---- Helpers ----
  const getToken = () => localStorage.getItem(TOKEN_KEY);
  const getRole = () => localStorage.getItem(ROLE_KEY);
  const clearSession = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(USER_KEY);
  };

  function setMsg(el, text, ok = true) {
    if (!el) return;
    el.textContent = text || "";
    el.style.color = ok ? "#0b6" : "#c22";
  }

  async function api(path, opts = {}) {
    const headers = {
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    };

    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API}${path}`, { ...opts, headers });

    const isJson = (res.headers.get("content-type") || "").includes("application/json");
    const body = isJson ? await res.json() : await res.text();
    if (!res.ok) {
      // If token expired/invalid, clear and kick back to auth screen
      if (res.status === 401) {
        clearSession();
      }
      const msg = (body && body.error) ? body.error : `Request failed (${res.status})`;
      throw new Error(msg);
    }
    return body;
  }

  function formToJson(form) {
    const data = new FormData(form);
    const obj = {};
    for (const [k, v] of data.entries()) obj[k] = v;

    // normalize checkboxes
    form.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
      obj[cb.name] = cb.checked;
    });

    // normalize numbers
    if (obj.price_kes !== undefined) obj.price_kes = Number(obj.price_kes);
    return obj;
  }

  function renderList(container, items, mapFn) {
    if (!container) return;
    container.innerHTML = "";
    if (!items?.length) {
      container.innerHTML = "<div class='list-item'><div class='meta'>Nothing here yet.</div></div>";
      return;
    }
    items.forEach((item) => container.appendChild(mapFn(item)));
  }

  // ---- Tabs ----
  const tabs = Array.from(document.querySelectorAll(".tab"));
  const panels = {
    products: document.getElementById("tab-products"),
    events: document.getElementById("tab-events"),
    posts: document.getElementById("tab-posts"),
    gallery: document.getElementById("tab-gallery"),
  };

  function showTab(name) {
    tabs.forEach((t) => t.classList.toggle("active", t.dataset.tab === name));
    Object.entries(panels).forEach(([k, el]) => {
      if (!el) return;
      el.style.display = k === name ? "block" : "none";
    });
  }

  tabs.forEach((t) => t.addEventListener("click", () => showTab(t.dataset.tab)));

  // ---- Load lists ----
  async function refreshAll() {
    try {
      const [products, events, posts, gallery] = await Promise.all([
        api("/products"),
        api("/events"),
        api("/posts"),
        api("/gallery"),
      ]);

      renderList(productsList, products, (p) => {
        const el = document.createElement("div");
        el.className = "list-item";
        el.innerHTML = `
          <div><strong>${p.name}</strong> ${p.featured ? "<span class='meta'>(featured)</span>" : ""}</div>
          <div class='meta'>KES ${p.price_kes} • #${p.id}</div>
          <div class='meta'>${p.image_url ? p.image_url : "(no image url)"}</div>
        `;
        return el;
      });

      renderList(eventsList, events, (e) => {
        const el = document.createElement("div");
        el.className = "list-item";
        el.innerHTML = `
          <div><strong>${e.title}</strong></div>
          <div class='meta'>${e.event_date} • ${e.location} • #${e.id}</div>
          <div class='meta'>${e.description ? e.description : ""}</div>
        `;
        return el;
      });

      renderList(postsList, posts, (p) => {
        const el = document.createElement("div");
        el.className = "list-item";
        el.innerHTML = `
          <div><strong>${p.title}</strong></div>
          <div class='meta'>/${p.slug} • ${p.published_at ? new Date(p.published_at).toLocaleString() : "draft"} • #${p.id}</div>
        `;
        return el;
      });

      renderList(galleryList, gallery, (g) => {
        const el = document.createElement("div");
        el.className = "list-item";
        el.innerHTML = `
          <div><strong>${g.title}</strong> ${g.featured ? "<span class='meta'>(featured)</span>" : ""}</div>
          <div class='meta'>${g.category ? g.category : "uncategorized"} • #${g.id}</div>
          <div class='meta'>${g.image_url}</div>
        `;
        return el;
      });
    } catch (err) {
      console.error(err);
    }
  }

  function setAuthed(isAdmin) {
    authCard.style.display = isAdmin ? "none" : "block";
    panel.style.display = isAdmin ? "block" : "none";
    logoutBtn.style.display = isAdmin ? "inline-flex" : "none";
    if (isAdmin) refreshAll();
  }

  // ---- Auth (REUSE login session from /login/) ----
  async function checkAdminAccess() {
    const token = getToken();
    const role = getRole();

    if (!token) {
      setMsg(authMsg, "Not signed in. Please sign in first.", false);
      setAuthed(false);
      return;
    }

    // Quick role gate from localStorage
    if (role !== "admin") {
      setMsg(authMsg, "Signed in, but not an admin account.", false);
      setAuthed(false);
      return;
    }

    // Stronger check: verify token still valid
    try {
      const me = await api("/auth/me", { method: "GET", headers: {} });
      if (me?.role !== "admin") {
        setMsg(authMsg, "Signed in, but not an admin account.", false);
        setAuthed(false);
        return;
      }
      setMsg(authMsg, "");
      setAuthed(true);
    } catch (err) {
      setMsg(authMsg, err.message || "Session expired. Please sign in again.", false);
      setAuthed(false);
    }
  }

  if (recheckBtn) {
    recheckBtn.addEventListener("click", checkAdminAccess);
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      clearSession();
      setAuthed(false);
      setMsg(authMsg, "Logged out.", true);
    });
  }

  // ---- Create handlers ----
  if (productForm) {
    productForm.addEventListener("submit", async(e) => {
      e.preventDefault();
      const msg = document.getElementById("product-msg");
      setMsg(msg, "Creating…");
      try {
        await api("/products", {
          method: "POST",
          body: JSON.stringify(formToJson(productForm)),
        });
        setMsg(msg, "Product created.");
        productForm.reset();
        refreshAll();
      } catch (err) {
        setMsg(msg, err.message, false);
      }
    });
  }

  if (eventForm) {
    eventForm.addEventListener("submit", async(e) => {
      e.preventDefault();
      const msg = document.getElementById("event-msg");
      setMsg(msg, "Creating…");
      try {
        await api("/events", {
          method: "POST",
          body: JSON.stringify(formToJson(eventForm)),
        });
        setMsg(msg, "Event created.");
        eventForm.reset();
        refreshAll();
      } catch (err) {
        setMsg(msg, err.message, false);
      }
    });
  }

  if (postForm) {
    postForm.addEventListener("submit", async(e) => {
      e.preventDefault();
      const msg = document.getElementById("post-msg");
      setMsg(msg, "Creating…");
      try {
        await api("/posts", {
          method: "POST",
          body: JSON.stringify(formToJson(postForm)),
        });
        setMsg(msg, "Post created.");
        postForm.reset();
        // keep published checked by default
        postForm.querySelector('input[name="published"]').checked = true;
        refreshAll();
      } catch (err) {
        setMsg(msg, err.message, false);
      }
    });
  }

  if (galleryForm) {
    galleryForm.addEventListener("submit", async(e) => {
      e.preventDefault();
      const msg = document.getElementById("gallery-msg");
      setMsg(msg, "Creating…");
      try {
        await api("/gallery", {
          method: "POST",
          body: JSON.stringify(formToJson(galleryForm)),
        });
        setMsg(msg, "Gallery item created.");
        galleryForm.reset();
        refreshAll();
      } catch (err) {
        setMsg(msg, err.message, false);
      }
    });
  }

  // Auto-auth: only allow if logged in AND role is admin
  checkAdminAccess();
});

// assets/js/auth.js
// Handles:
// - show/hide password UX
// - confirm password validation
// - REAL login + register via API
// - redirects: admin -> /admin/, user -> /user/

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("auth-form");
    if (!form) return;

    const API = "http://localhost:4000/api";
    const TOKEN_KEY = "ser_auth_token";
    const ROLE_KEY = "ser_auth_role";
    const USER_KEY = "ser_auth_user";

    const msgEl = document.getElementById("auth-msg");

    function setMsg(text, ok = true) {
        if (!msgEl) return;
        msgEl.textContent = text || "";
        msgEl.style.color = ok ? "#0b6" : "#c22";
    }

    function saveSession({ token, role, user }) {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(ROLE_KEY, role);
        localStorage.setItem(USER_KEY, JSON.stringify(user || null));
    }

    function redirectByRole(role) {
        if (role === "admin") {
            window.location.href = "/admin/";
        } else {
            window.location.href = "/user/";
        }
    }

    async function request(path, body) {
        const res = await fetch(`${API}${path}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        const isJson = (res.headers.get("content-type") || "").includes("application/json");
        const data = isJson ? await res.json() : await res.text();

        if (!res.ok) {
            throw new Error(data?.error || `Request failed (${res.status})`);
        }
        return data;
    }

    // ---- Add show/hide password toggles ----
    const passwordInputs = Array.from(form.querySelectorAll('input[type="password"]'));
    passwordInputs.forEach((input) => {
        const wrapper = document.createElement("div");
        wrapper.style.display = "grid";
        wrapper.style.gridTemplateColumns = "1fr auto";
        wrapper.style.gap = "0.5rem";
        wrapper.style.alignItems = "center";

        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);

        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "btn";
        toggle.style.padding = "8px 12px";
        toggle.style.textTransform = "none";
        toggle.textContent = "Show";

        toggle.addEventListener("click", () => {
            const isHidden = input.type === "password";
            input.type = isHidden ? "text" : "password";
            toggle.textContent = isHidden ? "Hide" : "Show";
        });

        wrapper.appendChild(toggle);
    });

    // ---- Confirm password match (register only) ----
    const password = document.getElementById("password");
    const confirm = document.getElementById("confirm-password");

    function setInlineError(el, err) {
        if (!el) return;
        el.setCustomValidity(err);
    }

    if (password && confirm) {
        const validate = () => {
            if (confirm.value && password.value !== confirm.value) {
                setInlineError(confirm, "Passwords do not match.");
            } else {
                setInlineError(confirm, "");
            }
        };

        password.addEventListener("input", validate);
        confirm.addEventListener("input", validate);
    }

    // ---- Submit handler (login or register) ----
    form.addEventListener("submit", async(e) => {
        e.preventDefault();

        // browser validation first
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const mode = form.dataset.mode; // "login" or "register"
        setMsg(mode === "register" ? "Creating account…" : "Signing in…");

        try {
            if (mode === "register") {
                const full_name = document.getElementById("full_name")?.value?.trim();
                const email = document.getElementById("email")?.value?.trim();
                const pass = document.getElementById("password")?.value;

                // 1) Create user
                await request("/auth/register", { full_name, email, password: pass });

                // 2) Auto-login user
                const out = await request("/auth/login", { email, password: pass });
                saveSession(out);
                setMsg("Account created. Redirecting…");
                redirectByRole(out.role);
            } else {
                const email = document.getElementById("email")?.value?.trim();
                const pass = document.getElementById("password")?.value;

                const out = await request("/auth/login", { email, password: pass });
                saveSession(out);
                setMsg("Signed in. Redirecting…");
                redirectByRole(out.role);
            }
        } catch (err) {
            setMsg(err.message, false);
        }
    });
});

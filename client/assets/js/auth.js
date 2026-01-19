// assets/js/auth.js
// Simple UX improvements for login/register pages.
// Safe to load anywhere.

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
    if (!form) return;

    // Add show/hide password toggles for any password fields
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

    // Confirm password match (register only)
    const password = document.getElementById("password");
    const confirm = document.getElementById("confirm-password");

    function setInlineError(el, msg) {
        if (!el) return;
        el.setCustomValidity(msg);
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

        form.addEventListener("submit", (e) => {
            validate();
            if (!form.checkValidity()) {
                // Let browser show validation UI
                e.preventDefault();
            }
        });
    }
});
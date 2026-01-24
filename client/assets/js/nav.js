// assets/js/nav.js
// - Highlights current page in navbar
// - Toggles mobile nav via body.nav-active
document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.querySelector("[data-theme-toggle]");
    const themeLabel = themeToggle?.querySelector("[data-theme-label]");
    const themeIcon = themeToggle?.querySelector("[data-theme-icon]");
    const storageKey = "ser-theme";

    const applyTheme = (theme) => {
        const isDark = theme === "dark";
        document.documentElement.classList.toggle("dark-mode", isDark);
        document.body.classList.toggle("dark-mode", isDark);
        if (themeLabel) {
            themeLabel.textContent = isDark ? "Light" : "Dark";
        }
        if (themeIcon) {
            themeIcon.textContent = isDark ? "☀️" : "🌙";
        }
        if (themeToggle) {
            themeToggle.setAttribute("aria-pressed", String(isDark));
        }
    };

    const savedTheme = localStorage.getItem(storageKey);
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        applyTheme("dark");
    }

    // Highlight current page in nav
    const navLinks = document.querySelectorAll("nav a");
    const path = window.location.pathname;
    const normalized = path.endsWith("/") ? path : `${path}/`;

    navLinks.forEach((link) => {
        const href = link.getAttribute("href");
        if (!href) return;

        // Convert relative href into comparable "endsWith" checks.
        // Examples:
        //  "../about/" or "./" or "/" etc.
        const isHome = href === "/" || href === "../" || href === "../../";
        const onHome = normalized === "/" || normalized.endsWith("/index.html/");

        // Mark active:
        if ((isHome && onHome) || (!isHome && normalized.endsWith(href))) {
            link.classList.add("active");
        }
    });

    const activeLink = document.querySelector("nav a.active");
    const activeLabel = activeLink?.textContent?.trim();
    if (activeLabel) {
        const logo = document.querySelector("nav .logo");
        if (logo) {
            let labelEl = logo.querySelector(".current-page-label");
            if (!labelEl) {
                labelEl = document.createElement("span");
                labelEl.className = "current-page-label";
                logo.appendChild(labelEl);
            }
            labelEl.textContent = activeLabel;
            labelEl.setAttribute("aria-label", `Current page: ${activeLabel}`);
        }
    }

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const nextTheme = document.documentElement.classList.contains("dark-mode") ? "light" : "dark";
            localStorage.setItem(storageKey, nextTheme);
            applyTheme(nextTheme);
        });
    }

    // Mobile menu toggle
    const menuToggle = document.getElementById("menu-toggle");
    if (menuToggle) {
        menuToggle.setAttribute("aria-expanded", "false");

        menuToggle.addEventListener("click", () => {
            const isActive = document.body.classList.toggle("nav-active");
            menuToggle.setAttribute("aria-expanded", String(isActive));
        });

        navLinks.forEach((link) => {
            link.addEventListener("click", () => {
                if (!document.body.classList.contains("nav-active")) return;
                document.body.classList.remove("nav-active");
                menuToggle.setAttribute("aria-expanded", "false");
            });
        });
    }
});

// SER - Main JavaScript File
// Consolidated: Main, Nav, Cart, Shop, Auth, User, Admin

document.addEventListener("DOMContentLoaded", () => {
    // =========================================================================
    // 1. GLOBAL HELPERS & CONFIG
    // =========================================================================

    function getApiBase() {
        const override = window.SER_API_BASE;
        if (typeof override === "string" && override.trim()) {
            return override.replace(/\/$/, "");
        }
        const origin = window.location.origin === "null" ? "" : window.location.origin;
        return `${origin}/api`;
    }

    const API = getApiBase();
    const money = (n) => `KES ${Number(n || 0).toFixed(0)}`;

    // Auth constants
    const TOKEN_KEY = "ser_auth_token";
    const ROLE_KEY = "ser_auth_role";
    const USER_KEY = "ser_auth_user";

    // =========================================================================
    // 2. NAVIGATION & THEME (nav.js)
    // =========================================================================
    (function initNav() {
        const themeToggle = document.querySelector("[data-theme-toggle]");
        const themeLabel = themeToggle?.querySelector("[data-theme-label]");
        const themeIcon = themeToggle?.querySelector("[data-theme-icon]");
        const storageKey = "ser-theme";

        const applyTheme = (theme) => {
            const isDark = theme === "dark";
            document.documentElement.classList.toggle("dark-mode", isDark);
            document.body.classList.toggle("dark-mode", isDark);
            if (themeLabel) themeLabel.textContent = isDark ? "Light" : "Dark";
            if (themeIcon) themeIcon.textContent = isDark ? "☀️" : "🌙";
            if (themeToggle) themeToggle.setAttribute("aria-pressed", String(isDark));
        };

        const savedTheme = localStorage.getItem(storageKey);
        applyTheme(savedTheme || "dark");

        if (themeToggle) {
            themeToggle.addEventListener("click", () => {
                const nextTheme = document.documentElement.classList.contains("dark-mode") ? "light" : "dark";
                localStorage.setItem(storageKey, nextTheme);
                applyTheme(nextTheme);
            });
        }

        // Active Link Highlight
        // Active Link Highlight
        const navLinks = document.querySelectorAll("nav a");
        // Normalize: remove trailing slash, remove index.html, lowercase
        const normalize = (p) => p.replace(/\/+$/, "").replace(/\/index\.html$/, "").toLowerCase();
        const currentPath = normalize(window.location.pathname);

        navLinks.forEach((link) => {
            const href = link.getAttribute("href");
            if (!href) return;
            
            try {
                // Resolve absolute path from relative href
                const url = new URL(href, window.location.href);
                const linkPath = normalize(url.pathname);
                
                if (linkPath === currentPath) {
                    link.classList.add("active");
                }
            } catch (e) { /* ignore invalid urls */ }
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
            }
        }

        // Mobile Menu
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

        // Dynamic Header Scroll
        const header = document.querySelector("header");
        if (header) {
            window.addEventListener("scroll", () => {
                if (window.pageYOffset > 50) header.classList.add("scrolled");
                else header.classList.remove("scrolled");
            });
        }
    })();

    // =========================================================================
    // 3. CART LOGIC (cart.js)
    // =========================================================================
    // Shared cart functions
    function getCart() {
        return JSON.parse(localStorage.getItem("cart")) || [];
    }

    function setCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartCount();
    }

    function updateCartCount() {
        const cart = getCart();
        const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        document.querySelectorAll(".cart-count").forEach((el) => {
            el.textContent = `(${count})`;
        });
    }

    function addToCart(item, qty = 1) {
        const cart = getCart();
        const existing = cart.find((i) => i.id === Number(item.id));
        if (existing) existing.quantity = (existing.quantity || 1) + qty;
        else cart.push({ ...item, quantity: qty, id: Number(item.id) });
        setCart(cart);
    }

    function removeFromCart(id) {
        const cart = getCart().filter((i) => i.id !== Number(id));
        setCart(cart);
    }

    function setItemQuantity(id, qty) {
        const cart = getCart();
        const item = cart.find((i) => i.id === Number(id));
        if (!item) return;
        item.quantity = Math.max(1, Number(qty || 1));
        setCart(cart);
    }

    // Initial load
    updateCartCount();

    // Cart Page Rendering
    if (document.getElementById("cart-items-container")) {
        (function renderCartPage() {
            const container = document.getElementById("cart-items-container");
            const totalEl = document.getElementById("cart-total");
            if (!container || !totalEl) return;

            const cart = getCart();
            container.innerHTML = "";

            if (cart.length === 0) {
                container.innerHTML = "<p style='text-align:center;'>Your cart is empty.</p>";
                totalEl.textContent = money(0);
                return;
            }

            let total = 0;
            cart.forEach((item) => {
                const qty = item.quantity || 1;
                const lineTotal = (item.price || 0) * qty;
                total += lineTotal;
                const row = document.createElement("div");
                row.className = "cart-item";
                row.innerHTML = `
                  <img src="${item.image || "https://via.placeholder.com/100"}" alt="${item.name}">
                  <div class="cart-item-info">
                    <h3>${item.name}</h3>
                    <p>${money(item.price)}</p>
                  </div>
                  <div class="item-price" style="text-align:center; font-weight:600;">${money(item.price)}</div>
                  <div class="cart-item-quantity">
                    <input type="number" min="1" value="${qty}" data-id="${item.id}">
                  </div>
                  <button class="remove-item-btn" aria-label="Remove item" data-id="${item.id}">&times;</button>
                `;
                container.appendChild(row);
            });

            totalEl.textContent = money(total);

            container.querySelectorAll(".cart-item-quantity input").forEach((input) => {
                input.addEventListener("change", () => {
                    setItemQuantity(input.dataset.id, input.value);
                    renderCartPage();
                });
            });
            container.querySelectorAll(".remove-item-btn").forEach((btn) => {
                btn.addEventListener("click", () => {
                    removeFromCart(btn.dataset.id);
                    renderCartPage();
                });
            });
        })();
    }

    // Checkout Summary
    if (document.getElementById("checkout-items")) {
        (function renderCheckoutSummary() {
            const itemsEl = document.getElementById("checkout-items");
            const totalEl = document.getElementById("checkout-total");
            if (!itemsEl || !totalEl) return;

            const cart = getCart();
            itemsEl.innerHTML = "";
            let total = 0;

            if (cart.length === 0) {
                itemsEl.innerHTML = "<p style='text-align:center;'>Empty cart.</p>";
                totalEl.textContent = money(0);
                return;
            }

            cart.forEach((item) => {
                const qty = item.quantity || 1;
                const lineTotal = (item.price || 0) * qty;
                total += lineTotal;
                const row = document.createElement("div");
                row.className = "cart-item";
                row.style.gridTemplateColumns = "1fr 120px 100px";
                row.innerHTML = `
                  <div class="cart-item-info">
                    <h3 style="margin:0;">${item.name}</h3>
                    <p style="margin:0.2rem 0 0 0;">${money(item.price)}</p>
                  </div>
                  <div style="text-align:center;">x${qty}</div>
                  <div style="text-align:right; font-weight:600;">${money(lineTotal)}</div>
                `;
                itemsEl.appendChild(row);
            });
            totalEl.textContent = money(total);
        })();
    }

    // =========================================================================
    // 4. SHOP & PRODUCT LOGIC (shop.js)
    // =========================================================================
    if (document.getElementById("product-grid") || document.getElementById("featured-products-grid") || document.getElementById("product-name")) {
        // Mock Products (In real app, fetch from API)
        // Since original shop.js used a global PRODUCTS variable (not shown in snippet but implied) or fetched from API? 
        // The snippet used `loadProducts` but then used `PRODUCTS` sync. 
        // I will implement a fetch-based approach or safely fallback.
        
        async function loadAndRenderProducts() {
            let products = [];
            try {
                const res = await fetch(`${API}/products`);
                if (res.ok) products = await res.json();
            } catch (e) { console.error("Failed to load products", e); }
            
            // Render Featured
            const featGrid = document.getElementById("featured-products-grid");
            if (featGrid) {
                const featured = products.filter(p => p.featured);
                featGrid.innerHTML = "";
                featured.forEach(p => {
                     const card = document.createElement("div");
                     card.className = "product-card";
                     card.innerHTML = `
                        <a href="./product/?id=${p.id}" class="no-style">
                            <img src="${p.image}" alt="${p.name}">
                            <div class="product-card-info">
                                <h3>${p.name}</h3>
                                <p class="price">${money(p.price)}</p>
                            </div>
                        </a>
                        <button class="btn add-to-cart-btn" data-id="${p.id}">Add to Cart</button>
                     `;
                     featGrid.appendChild(card);
                });
            }

            // Render All
            const allGrid = document.getElementById("product-grid");
            if (allGrid) {
                 allGrid.innerHTML = "";
                 products.forEach(p => {
                     const card = document.createElement("div");
                     card.className = "product-card";
                     card.innerHTML = `
                        <a href="../product/?id=${p.id}" class="no-style">
                            <img src="${p.image}" alt="${p.name}">
                            <div class="product-card-info">
                                <h3>${p.name}</h3>
                                <p class="price">${money(p.price)}</p>
                            </div>
                        </a>
                        <button class="btn add-to-cart-btn" data-id="${p.id}">Add to Cart</button>
                     `;
                     allGrid.appendChild(card);
                });
            }

            // Bind Add Buttons
            document.querySelectorAll(".add-to-cart-btn").forEach(btn => {
                btn.addEventListener("click", () => {
                    const pid = Number(btn.dataset.id);
                    const p = products.find(x => x.id === pid);
                    if (p) addToCart(p, 1);
                });
            });

            // Product Detail
            const nameEl = document.getElementById("product-name");
            if (nameEl) {
                const params = new URLSearchParams(window.location.search);
                const id = Number(params.get("id"));
                const p = products.find(x => x.id === id);
                
                if (p) {
                    nameEl.textContent = p.name;
                    document.getElementById("product-price").textContent = money(p.price);
                    document.getElementById("product-description").textContent = p.description;
                    document.getElementById("main-product-image").src = p.image;
                    
                     document.getElementById("add-to-cart-btn").addEventListener("click", () => {
                         addToCart(p, 1);
                     });
                     
                     // Thumbs
                     const thumbs = document.getElementById("thumbnail-images");
                     if (thumbs && p.thumbnails) {
                         thumbs.innerHTML = "";
                         p.thumbnails.forEach(src => {
                             const img = document.createElement("img");
                             img.src = src;
                             img.addEventListener("click", () => {
                                 document.getElementById("main-product-image").src = src;
                                 thumbs.querySelectorAll("img").forEach(i => i.classList.remove("active"));
                                 img.classList.add("active");
                             });
                             thumbs.appendChild(img);
                         });
                     }
                }
            }
        }
        
        loadAndRenderProducts();
    }

    // =========================================================================
    // 5. ANIMATIONS (main.js)
    // =========================================================================
    const revealElements = document.querySelectorAll("main section, .image-card, .highlight-card, .product-card, .team-card");
    if (revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("active");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });

        revealElements.forEach((el) => {
            el.classList.add("reveal");
            revealObserver.observe(el);
        });
    }

    // =========================================================================
    // 6. AUTHENTICATION (auth.js)
    // =========================================================================
    if (document.getElementById("auth-form")) {
        (function initAuth() {
            const form = document.getElementById("auth-form");
            const msgEl = document.getElementById("auth-msg");

            function setMsg(text, ok = true) {
                if (msgEl) {
                    msgEl.textContent = text;
                    msgEl.style.color = ok ? "#0b6" : "#c22";
                }
            }

            // Show/Hide Password
            form.querySelectorAll('input[type="password"]').forEach(input => {
                const wrapper = document.createElement("div");
                wrapper.style.cssText = "display:grid; grid-template-columns:1fr auto; gap:0.5rem; align-items:center;";
                input.parentNode.insertBefore(wrapper, input);
                wrapper.appendChild(input);

                const toggle = document.createElement("button");
                toggle.type = "button";
                toggle.className = "btn";
                toggle.style.cssText = "padding:8px 12px; text-transform:none;";
                toggle.textContent = "Show";
                toggle.addEventListener("click", () => {
                    const isHidden = input.type === "password";
                    input.type = isHidden ? "text" : "password";
                    toggle.textContent = isHidden ? "Hide" : "Show";
                });
                wrapper.appendChild(toggle);
            });

            // Confirm Password
            const password = document.getElementById("password");
            const confirm = document.getElementById("confirm-password");
            if (password && confirm) {
                const validate = () => {
                    if (confirm.value && password.value !== confirm.value) confirm.setCustomValidity("Passwords do not match");
                    else confirm.setCustomValidity("");
                };
                password.addEventListener("input", validate);
                confirm.addEventListener("input", validate);
            }

            // Submit
            form.addEventListener("submit", async (e) => {
                e.preventDefault();
                if (!form.checkValidity()) { form.reportValidity(); return; }

                const mode = form.dataset.mode;
                setMsg(mode === "register" ? "Creating account..." : "Signing in...");

                try {
                    const email = document.getElementById("email").value.trim();
                    const passwordVal = document.getElementById("password").value;
                    let resData;

                    if (mode === "register") {
                        const full_name = document.getElementById("full_name").value.trim();
                        await fetch(`${API}/auth/register`, {
                            method: "POST", headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ full_name, email, password: passwordVal })
                        }).then(r => { if (!r.ok) throw new Error("Registration failed"); return r.json(); });

                        const loginRes = await fetch(`${API}/auth/login`, {
                            method: "POST", headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ email, password: passwordVal })
                        });
                        if (!loginRes.ok) throw new Error("Login failed after register");
                        resData = await loginRes.json();
                    } else {
                        const loginRes = await fetch(`${API}/auth/login`, {
                            method: "POST", headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ email, password: passwordVal })
                        });
                         if (!loginRes.ok) throw new Error("Invalid credentials");
                        resData = await loginRes.json();
                    }

                    localStorage.setItem(TOKEN_KEY, resData.token);
                    localStorage.setItem(ROLE_KEY, resData.role);
                    localStorage.setItem(USER_KEY, JSON.stringify(resData.user));

                    setMsg("Success! Redirecting...");
                    window.location.href = resData.role === "admin" ? "../admin/" : "../user/";

                } catch (err) {
                    setMsg(err.message, false);
                }
            });
        })();
    }

    // =========================================================================
    // 7. USER DASHBOARD (user.js)
    // =========================================================================
    if (document.getElementById("user-msg")) {
        (async function initUser() {
             const token = localStorage.getItem(TOKEN_KEY);
             if (!token) { window.location.href = "/login/"; return; }

             try {
                const res = await fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
                if (!res.ok) throw new Error("Session expired");
                const me = await res.json();

                document.getElementById("uid").textContent = me.id || "-";
                document.getElementById("email").textContent = me.email || "-";
                document.getElementById("role").textContent = me.role || "-";
                document.getElementById("full_name").textContent = me.full_name || "-";
                document.getElementById("hello").textContent = `Welcome, ${me.full_name || "Scout"}`;
                
                const adminHint = document.getElementById("admin-hint");
                if (adminHint) adminHint.style.display = me.role === "admin" ? "block" : "none";

             } catch (e) {
                 localStorage.removeItem(TOKEN_KEY);
                 window.location.href = "/login/";
             }

             document.getElementById("logout-btn")?.addEventListener("click", () => {
                 localStorage.removeItem(TOKEN_KEY);
                 window.location.href = "/login/";
             });
        })();
    }

    // =========================================================================
    // 8. ADMIN DASHBOARD (admin.js)
    // =========================================================================
    if (document.getElementById("panel") && document.getElementById("auth-card")) {
        (async function initAdmin() {
            const authCard = document.getElementById("auth-card");
            const panel = document.getElementById("panel");
            const token = localStorage.getItem(TOKEN_KEY);
            const role = localStorage.getItem(ROLE_KEY);

            function setAuthed(is) {
                authCard.style.display = is ? "none" : "block";
                panel.style.display = is ? "block" : "none";
            }

            if (!token || role !== "admin") {
                setAuthed(false);
            } else {
                setAuthed(true);
                // Load Lists
                 try {
                     const [products, events, posts, gallery] = await Promise.all([
                        fetch(`${API}/products`).then(r => r.json()),
                        fetch(`${API}/events`).then(r => r.json()),
                        fetch(`${API}/posts`).then(r => r.json()),
                        fetch(`${API}/gallery`).then(r => r.json())
                     ]);

                     // Simple Render Helper
                     const render = (id, items, map) => {
                         const el = document.getElementById(id);
                         if (!el) return;
                         el.innerHTML = items && items.length ? "" : "<div>No items</div>";
                         items?.forEach(i => {
                             const div = document.createElement("div");
                             div.className = "list-item";
                             div.innerHTML = map(i);
                             el.appendChild(div);
                         });
                     };

                     render("products-list", products, p => `<strong>${p.name}</strong> - ${money(p.price_kes)}`);
                     render("events-list", events, e => `<strong>${e.title}</strong> - ${e.event_date}`);
                     render("posts-list", posts, p => `<strong>${p.title}</strong>`);
                     render("gallery-list", gallery, g => `<strong>${g.title}</strong>`);

                 } catch (e) { console.error(e); }
            }

            // Forms... (simplified for consolidation)
            ["product", "event", "post", "gallery"].forEach(type => {
                const form = document.getElementById(`${type}-form`);
                if (form) {
                    form.addEventListener("submit", async (e) => {
                        e.preventDefault();
                        const data = Object.fromEntries(new FormData(form));
                        try {
                             await fetch(`${API}/${type}s`, {
                                 method: "POST",
                                 headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                 body: JSON.stringify(data)
                             });
                             alert(`${type} created!`);
                             location.reload(); 
                        } catch (err) { alert(err.message); }
                    });
                }
            });
            
             document.getElementById("logout-btn")?.addEventListener("click", () => {
                 localStorage.removeItem(TOKEN_KEY);
                 window.location.href = "/login/";
             });
        })();
    }
});

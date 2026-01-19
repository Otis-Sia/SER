// assets/js/shop.js
// LocalStorage Cart + Product rendering for SER Shop

document.addEventListener("DOMContentLoaded", () => {
    // -------- Product Catalog (edit this anytime) --------
    // Use KES for consistency with Kenya context.
    const API = "http://localhost:4000/api";

    async function loadProducts() {
        const res = await fetch(`${API}/products`);
        return res.json();
    };

    // -------- Helpers --------
    const money = (n) => `KES ${Number(n || 0).toFixed(0)}`;

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

    function addToCart(productId, qty = 1) {
        const product = PRODUCTS.find((p) => p.id === Number(productId));
        if (!product) return;

        const cart = getCart();
        const existing = cart.find((i) => i.id === product.id);

        if (existing) {
            existing.quantity = (existing.quantity || 1) + qty;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: qty
            });
        }

        setCart(cart);
    }

    function removeFromCart(productId) {
        const cart = getCart().filter((i) => i.id !== Number(productId));
        setCart(cart);
    }

    function setItemQuantity(productId, qty) {
        const cart = getCart();
        const item = cart.find((i) => i.id === Number(productId));
        if (!item) return;

        const safeQty = Math.max(1, Number(qty || 1));
        item.quantity = safeQty;
        setCart(cart);
    }

    // -------- Renderers --------
    function renderFeaturedProducts() {
        const grid = document.getElementById("featured-products-grid");
        if (!grid) return;

        const featured = PRODUCTS.filter((p) => p.featured);
        grid.innerHTML = "";

        featured.forEach((product) => {
            const card = document.createElement("div");
            card.className = "product-card";

            card.innerHTML = `
        <a href="./product/?id=${product.id}">
          <img src="${product.image}" alt="${product.name}">
          <div class="product-card-info">
            <h3>${product.name}</h3>
            <p class="price">${money(product.price)}</p>
          </div>
        </a>
        <button class="btn add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
      `;

            grid.appendChild(card);
        });

        grid.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                addToCart(btn.dataset.id, 1);
            });
        });
    }

    function renderAllProducts() {
        const grid = document.getElementById("product-grid");
        if (!grid) return;

        grid.innerHTML = "";

        PRODUCTS.forEach((product) => {
            const card = document.createElement("div");
            card.className = "product-card";

            card.innerHTML = `
        <a href="../product/?id=${product.id}">
          <img src="${product.image}" alt="${product.name}">
          <div class="product-card-info">
            <h3>${product.name}</h3>
            <p class="price">${money(product.price)}</p>
          </div>
        </a>
        <button class="btn add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
      `;

            grid.appendChild(card);
        });

        grid.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                addToCart(btn.dataset.id, 1);
            });
        });
    }

    function renderProductDetail() {
        const nameEl = document.getElementById("product-name");
        const priceEl = document.getElementById("product-price");
        const descEl = document.getElementById("product-description");
        const mainImg = document.getElementById("main-product-image");
        const thumbs = document.getElementById("thumbnail-images");
        const addBtn = document.getElementById("add-to-cart-btn");

        // Only run on product page
        if (!nameEl || !priceEl || !descEl || !mainImg || !addBtn) return;

        const params = new URLSearchParams(window.location.search);
        const id = Number(params.get("id"));
        const product = PRODUCTS.find((p) => p.id === id);

        if (!product) {
            nameEl.textContent = "Product not found";
            priceEl.textContent = "";
            descEl.textContent = "This product may have been removed or the link is incorrect.";
            addBtn.disabled = true;
            return;
        }

        nameEl.textContent = product.name;
        priceEl.textContent = money(product.price);
        descEl.textContent = product.description;
        mainImg.src = product.image;
        mainImg.alt = product.name;

        if (thumbs) {
            thumbs.innerHTML = "";
            (product.thumbnails || []).forEach((src, idx) => {
                const img = document.createElement("img");
                img.src = src;
                img.alt = `${product.name} thumbnail ${idx + 1}`;
                img.addEventListener("click", () => {
                    mainImg.src = src;
                    thumbs.querySelectorAll("img").forEach((x) => x.classList.remove("active"));
                    img.classList.add("active");
                });
                thumbs.appendChild(img);
            });
        }

        addBtn.addEventListener("click", () => {
            addToCart(product.id, 1);
        });
    }

    function renderCart() {
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
            const lineTotal = (item.price || 0) * (item.quantity || 1);
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
          <input type="number" min="1" value="${item.quantity || 1}" data-id="${item.id}">
        </div>
        <button class="remove-item-btn" aria-label="Remove item" data-id="${item.id}">&times;</button>
      `;

            container.appendChild(row);
        });

        totalEl.textContent = money(total);

        // Quantity changes
        container.querySelectorAll(".cart-item-quantity input").forEach((input) => {
            input.addEventListener("change", () => {
                setItemQuantity(input.dataset.id, input.value);
                renderCart();
            });
        });

        // Remove buttons
        container.querySelectorAll(".remove-item-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                removeFromCart(btn.dataset.id);
                renderCart();
            });
        });
    }

    function renderCheckoutSummary() {
        const itemsEl = document.getElementById("checkout-items");
        const totalEl = document.getElementById("checkout-total");
        if (!itemsEl || !totalEl) return;

        const cart = getCart();
        if (cart.length === 0) {
            itemsEl.innerHTML = "<p style='text-align:center;'>Your cart is empty. Add items before checkout.</p>";
            totalEl.textContent = money(0);
            return;
        }

        let total = 0;
        itemsEl.innerHTML = "";

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
    }

    // -------- Run the right renderers for the current page --------
    updateCartCount();
    renderFeaturedProducts();
    renderAllProducts();
    renderProductDetail();
    renderCart();
    renderCheckoutSummary();
});
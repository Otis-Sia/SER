// assets/js/cart.js
// Handles cart + checkout summary using localStorage.
// Safe to load on any page (no errors if elements are missing).

document.addEventListener("DOMContentLoaded", () => {
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

    function addToCart(item, qty = 1) {
        const cart = getCart();
        const existing = cart.find((i) => i.id === item.id);

        if (existing) existing.quantity = (existing.quantity || 1) + qty;
        else cart.push({...item, quantity: qty });

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

    // Expose a minimal API for shop.js (optional)
    window.SER_CART = {
        getCart,
        addToCart,
        removeFromCart,
        setItemQuantity,
        updateCartCount,
    };

    // -------- Cart page render --------
    function renderCartPage() {
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

        // quantity change
        container.querySelectorAll(".cart-item-quantity input").forEach((input) => {
            input.addEventListener("change", () => {
                setItemQuantity(input.dataset.id, input.value);
                renderCartPage();
            });
        });

        // remove
        container.querySelectorAll(".remove-item-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                removeFromCart(btn.dataset.id);
                renderCartPage();
            });
        });
    }

    // -------- Checkout summary render --------
    function renderCheckoutSummary() {
        const itemsEl = document.getElementById("checkout-items");
        const totalEl = document.getElementById("checkout-total");
        if (!itemsEl || !totalEl) return;

        const cart = getCart();
        itemsEl.innerHTML = "";

        if (cart.length === 0) {
            itemsEl.innerHTML = "<p style='text-align:center;'>Your cart is empty. Add items before checkout.</p>";
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

    // Run
    updateCartCount();
    renderCartPage();
    renderCheckoutSummary();
});
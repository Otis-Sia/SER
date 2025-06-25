//Highlight current page in navbar
document.addEventListener("DOMContentLoaded", () => {
    const navLinks = document.querySelectorAll("nav a");
    const currentPath = window.location.pathname.split("/").pop();

    navLinks.forEach(link => {
        if (link.getAttribute("href") === currentPath) {
            link.style.backgroundColor = "#c2c2c2";
            link.style.borderRadius = "2px";
            link.style.width = "auto";
            //link.style.color = "#fff";
        }
    })
});


//Cart.js
document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotal = document.getElementById('cart-total');

    function displayCartItems() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
        } else {
            cart.forEach(item => {
                // Create and append cart item elements to cartItemsContainer
                // ...
                total += parseFloat(item.price.replace('$', ''));
            });
        }
        cartTotal.textContent = `$${total.toFixed(2)}`;
    }

    displayCartItems();
});

//app.js
document.addEventListener('DOMContentLoaded', () => {
    const featuredProductsGrid = document.getElementById('featured-products-grid');
    const cartCount = document.querySelector('.cart-count');

    // Dummy data for featured products
    const featuredProducts = [
        { id: 1, name: 'Product 1', price: '$19.99', image: 'https://via.placeholder.com/300' },
        { id: 2, name: 'Product 2', price: '$29.99', image: 'https://via.placeholder.com/300' },
        { id: 3, name: 'Product 3', price: '$39.99', image: 'https://via.placeholder.com/300' },
    ];

    function displayFeaturedProducts() {
        featuredProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');
            productCard.innerHTML = `
                <a href="product-detail.html?id=${product.id}">
                    <img src="${product.image}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <p class="price">${product.price}</p>
                </a>
                <button class="btn add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
            `;
            featuredProductsGrid.appendChild(productCard);
        });
    }

    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        cartCount.textContent = `(${cart.length})`;
    }

    displayFeaturedProducts();
    updateCartCount();

    // Add to cart functionality
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.dataset.id;
            // Add product to cart (logic to be implemented)
            console.log(`Product ${productId} added to cart`);
            // Update cart count
        });
    });
});

//product-detail.js
document.addEventListener('DOMContentLoaded', () => {
    const productName = document.getElementById('product-name');
    const productPrice = document.getElementById('product-price');
    const productDescription = document.getElementById('product-description');
    const mainProductImage = document.getElementById('main-product-image');

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    // Fetch product details based on productId (from an API or a local data source)
    // and update the DOM elements.
});

//products.js
document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.getElementById('product-grid');

    // Dummy data for all products
    const allProducts = [
        // ... (Add more product objects here)
    ];

    function displayAllProducts() {
        allProducts.forEach(product => {
            // ... (Similar logic to displayFeaturedProducts in app.js)
        });
    }

    displayAllProducts();
    // ... (Add filtering and sorting logic here)
});
async function loadProducts() {
    try {
        // Fake-API laden (später durch Amazon API ersetzen)
        const basePath = location.pathname.includes("/alle/") ||
                 location.pathname.includes("/gaming/") ||
                 location.pathname.includes("/kueche/") ||
                 location.pathname.includes("/technik/")
                 ? "../"
                 : "./";

        const response = await fetch(basePath + "data/products.json");

        const products = await response.json();

        renderProducts(products);
    } catch (error) {
        console.error("Fehler beim Laden der Produkte:", error);
    }
}

function renderProducts(products) {
    const grid = document.getElementById("product-grid");
    if (!grid) return;
    grid.innerHTML = "";

    products.forEach(product => {
        const card = document.createElement("div");
        card.className = "card bg-base-100 shadow-md hover:shadow-xl transition-all duration-300";

        card.innerHTML = `
            <figure>
                <img src="${product.image}" alt="${product.title}" class="rounded-xl" />
            </figure>
            <div class="card-body">
                <h2 class="card-title">${product.title}</h2>

                <p class="text-lg font-bold text-primary">
                    ${product.price.toFixed(2)} ${product.currency}
                </p>

                ${product.oldPrice ? `
                    <p class="line-through text-sm opacity-60">
                        ${product.oldPrice.toFixed(2)} ${product.currency}
                    </p>
                ` : ""}

                <p class="text-sm opacity-80">
                    ⭐ ${product.rating} (${product.ratingCount} Bewertungen)
                </p>

                <div class="card-actions justify-end">
                    <a href="${product.affiliateLink}" target="_blank" class="btn btn-primary">
                        Zum Angebot
                    </a>
                </div>
            </div>
        `;

        grid.appendChild(card);
    });
}

// Seite starten
loadProducts();

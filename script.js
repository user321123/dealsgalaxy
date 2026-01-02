// Kategorie anhand der URL erkennen
function getCategoryFile() {
    const path = location.pathname;

    if (path.includes("/gaming/")) return "gaming.json";
    if (path.includes("/kueche/")) return "kueche.json";
    if (path.includes("/technik/")) return "technik.json";
    if (path.includes("/alle/")) return "alle.json";

    // Startseite lädt IMMER alle Produkte
    return "alle.json";
}


async function loadProducts() {
    try {
        const isSubpage = location.pathname.split("/").length > 2;
        const basePath = isSubpage ? "../data/" : "./data/";

        const file = getCategoryFile();
        const response = await fetch(basePath + file);
        const products = await response.json();

        renderProducts(products);
    } catch (error) {
        console.error("Fehler beim Laden der Produkte:", error);
    }
}

function renderProducts(products) {
    const grid = document.getElementById("product-grid");
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

loadProducts();

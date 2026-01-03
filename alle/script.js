let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const pageSize = 20; // deine Wahl

async function loadProducts() {
    try {
        const response = await fetch("/dealsgalaxy/products.json");
        const products = await response.json();

        // Für /alle/ nehmen wir alle Produkte
        allProducts = products.slice();
        filteredProducts = allProducts.slice();

        applyAllAndRender();
        setupEventListeners();
    } catch (error) {
        console.error("Fehler beim Laden der Produkte:", error);
        const grid = document.getElementById("product-grid");
        grid.innerHTML = `<p class="text-center text-error">Fehler beim Laden der Angebote.</p>`;
    }
}

function setupEventListeners() {
    const searchInput = document.getElementById("search-input");
    const sortSelect = document.getElementById("sort-select");

    if (searchInput) {
        searchInput.addEventListener("input", () => {
            currentPage = 1;
            applyAllAndRender();
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener("change", () => {
            currentPage = 1;
            applyAllAndRender();
        });
    }
}

function applyAllAndRender() {
    const searchTerm = document.getElementById("search-input")?.value.trim().toLowerCase() || "";
    const sortMode = document.getElementById("sort-select")?.value || "empfohlen";

    // 1. Filtern
    filteredProducts = filterProducts(allProducts, searchTerm);

    // 2. Sortieren
    sortProducts(filteredProducts, sortMode);

    // 3. Pagination + Render
    renderCurrentPage();
    renderPagination();
}

function filterProducts(products, searchTerm) {
    if (!searchTerm) return products.slice();

    return products.filter(p => {
        const title = (p.title || "").toLowerCase();
        const category = (p.category || "").toLowerCase();
        const description = (p.description || "").toLowerCase();
        const brand = (p.brand || "").toLowerCase();

        return (
            title.includes(searchTerm) ||
            category.includes(searchTerm) ||
            description.includes(searchTerm) ||
            brand.includes(searchTerm)
        );
    });
}

function sortProducts(products, mode) {
    // Empfohlen = keine Sortierung → Reihenfolge aus JSON
    if (mode === "empfohlen") return;

    products.sort((a, b) => {
        const priceA = typeof a.currentPrice === "number" ? a.currentPrice : 0;
        const priceB = typeof b.currentPrice === "number" ? b.currentPrice : 0;
        const discountA = typeof a.discount === "number" ? a.discount : 0;
        const discountB = typeof b.discount === "number" ? b.discount : 0;
        const ratingA = typeof a.rating === "number" ? a.rating : 0;
        const ratingB = typeof b.rating === "number" ? b.rating : 0;

        switch (mode) {
            case "price-asc":
                return priceA - priceB;
            case "price-desc":
                return priceB - priceA;
            case "discount-desc":
                return discountB - discountA;
            case "rating-desc":
                return ratingB - ratingA;
            default:
                return 0;
        }
    });
}

function renderCurrentPage() {
    const grid = document.getElementById("product-grid");
    grid.innerHTML = "";

    if (!filteredProducts.length) {
        grid.innerHTML = `<p class="text-center text-base-content/70 col-span-full">Aktuell keine passenden Angebote.</p>`;
        return;
    }

    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const pageProducts = filteredProducts.slice(start, end);

    pageProducts.forEach(p => {
        const card = document.createElement("div");
        card.className = "card bg-base-100 shadow-md hover:shadow-xl transition-all duration-300";

        const price = typeof p.currentPrice === "number" ? p.currentPrice.toFixed(2) : "-";
        const oldPrice = typeof p.oldPrice === "number" ? p.oldPrice.toFixed(2) : "";
        const discount = typeof p.discount === "number" ? `${p.discount}%` : "";
        const rating = typeof p.rating === "number" ? p.rating.toFixed(1) : null;

        card.innerHTML = `
            <figure class="bg-base-200">
                <img src="${p.image}" alt="${p.title}" class="rounded-t-xl object-cover w-full h-48" />
            </figure>
            <div class="card-body">
                <h2 class="card-title text-sm line-clamp-2 min-h-[3rem]">
                    ${p.title}
                </h2>

                <div class="flex items-baseline gap-2">
                    <span class="text-lg font-bold text-primary">${price} €</span>
                    ${oldPrice ? `<span class="text-sm line-through opacity-60">${oldPrice} €</span>` : ""}
                </div>

                <div class="flex items-center justify-between text-xs mt-1">
                    <span class="text-green-600 font-bold">${discount ? "-" + discount : ""}</span>
                    ${rating ? `<span class="text-yellow-500">★ ${rating}</span>` : ""}
                </div>

                <div class="card-actions justify-end mt-3">
                    <a href="${p.url}" target="_blank" class="btn btn-primary btn-sm">
                        Zum Angebot
                    </a>
                </div>
            </div>
        `;

        grid.appendChild(card);
    });
}

function renderPagination() {
    const container = document.getElementById("pagination");
    container.innerHTML = "";

    if (!filteredProducts.length) return;

    const totalPages = Math.ceil(filteredProducts.length / pageSize);
    if (totalPages <= 1) return;

    const createButton = (label, page, disabled = false, active = false) => {
        const btn = document.createElement("button");
        btn.textContent = label;
        btn.className = "btn btn-sm";
        if (active) btn.classList.add("btn-primary");
        if (disabled) {
            btn.classList.add("btn-disabled");
        } else {
            btn.addEventListener("click", () => {
                currentPage = page;
                renderCurrentPage();
                renderPagination();
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        }
        return btn;
    };

    // Prev
    container.appendChild(
        createButton("«", Math.max(1, currentPage - 1), currentPage === 1)
    );

    // Seitenzahlen
    for (let p = 1; p <= totalPages; p++) {
        container.appendChild(
            createButton(String(p), p, false, p === currentPage)
        );
    }

    // Next
    container.appendChild(
        createButton("»", Math.min(totalPages, currentPage + 1), currentPage === totalPages)
    );
}

loadProducts();

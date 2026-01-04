let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const pageSize = 20;

// PRODUKTE LADEN
async function loadProducts() {
    try {
        const response = await fetch("/dealsgalaxy/products.json");
        const products = await response.json();

        allProducts = products.slice();
        filteredProducts = allProducts.slice();

        applyAllAndRender();
        setupEventListeners();
    } catch (error) {
        document.getElementById("product-grid").innerHTML =
            `<p class="text-center text-error">Fehler beim Laden der Angebote.</p>`;
    }
}

// EVENTS
function setupEventListeners() {
    document.getElementById("search-input").addEventListener("input", () => {
        currentPage = 1;
        applyAllAndRender();
    });

    document.getElementById("sort-select").addEventListener("change", () => {
        currentPage = 1;
        applyAllAndRender();
    });
}

// FILTER + SORTIERUNG + RENDER
function applyAllAndRender() {
    const searchTerm = document.getElementById("search-input").value.trim().toLowerCase();
    const sortMode = document.getElementById("sort-select").value;

    filteredProducts = filterProducts(allProducts, searchTerm);
    sortProducts(filteredProducts, sortMode);

    renderCurrentPage();
    renderPagination();
}

// FILTER
function filterProducts(products, searchTerm) {
    if (!searchTerm) return products.slice();

    return products.filter(p => {
        return (
            (p.title || "").toLowerCase().includes(searchTerm) ||
            (p.category || "").toLowerCase().includes(searchTerm) ||
            (p.description || "").toLowerCase().includes(searchTerm) ||
            (p.brand || "").toLowerCase().includes(searchTerm)
        );
    });
}

// SORTIERUNG
function sortProducts(products, mode) {
    if (mode === "empfohlen") return;

    products.sort((a, b) => {
        const priceA = a.currentPrice ?? 0;
        const priceB = b.currentPrice ?? 0;
        const discountA = a.discount ?? 0;
        const discountB = b.discount ?? 0;
        const ratingA = a.rating ?? 0;
        const ratingB = b.rating ?? 0;

        switch (mode) {
            case "price-asc": return priceA - priceB;
            case "price-desc": return priceB - priceA;
            case "discount-desc": return discountB - discountA;
            case "rating-desc": return ratingB - ratingA;
        }
    });
}

// PRODUKTGRID RENDERN (MODERNISIERT)
function renderCurrentPage() {
    const grid = document.getElementById("product-grid");
    grid.innerHTML = "";

    if (!filteredProducts.length) {
        grid.innerHTML = `<p class="text-center text-base-content/70 col-span-full">Keine passenden Angebote.</p>`;
        return;
    }

    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const pageProducts = filteredProducts.slice(start, end);

    pageProducts.forEach(p => {
        const card = document.createElement("div");
        card.className =
            "card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl";

        card.innerHTML = `
            <figure class="bg-base-200 rounded-t-xl relative">
                <img src="${p.image}" alt="${p.title}" class="rounded-t-xl object-cover w-full h-48" />

                ${
                    p.discount
                        ? `<div class="badge badge-secondary absolute top-3 right-3 text-sm py-3 px-4 rounded-full">-${p.discount}%</div>`
                        : ""
                }
            </figure>

            <div class="card-body">
                <h2 class="font-bold text-base line-clamp-2 min-h-[3rem]">${p.title}</h2>

                <div class="flex items-baseline gap-2 mt-1">
                    <span class="text-xl font-bold text-primary">${p.currentPrice.toFixed(2)} €</span>
                    ${
                        p.oldPrice
                            ? `<span class="text-sm line-through text-gray-400">${p.oldPrice.toFixed(2)} €</span>`
                            : ""
                    }
                </div>

                <div class="flex items-center gap-1 text-yellow-500 text-sm mt-1">
                    ${p.rating ? "★".repeat(Math.round(p.rating)) : ""}
                    <span class="text-gray-500 ml-1">${p.rating ? p.rating.toFixed(1) : ""}</span>
                </div>

                <div class="card-actions justify-end mt-4">
                    <a href="${p.url}" target="_blank" class="btn btn-primary btn-sm rounded-full px-4">
                        Zum Angebot
                    </a>
                </div>
            </div>
        `;

        grid.appendChild(card);
    });
}

// PAGINATION (MODERNISIERT)
function renderPagination() {
    const container = document.getElementById("pagination");
    container.innerHTML = "";

    const totalPages = Math.ceil(filteredProducts.length / pageSize);
    if (totalPages <= 1) return;

    const createBtn = (label, page, disabled = false, active = false) => {
        const btn = document.createElement("button");
        btn.textContent = label;

        btn.className =
            "btn btn-sm rounded-full px-4 " +
            (active ? "btn-primary" : "btn-outline btn-primary");

        if (disabled) btn.classList.add("btn-disabled");
        else
            btn.addEventListener("click", () => {
                currentPage = page;
                renderCurrentPage();
                renderPagination();
                window.scrollTo({ top: 0, behavior: "smooth" });
            });

        return btn;
    };

    container.appendChild(createBtn("«", Math.max(1, currentPage - 1), currentPage === 1));

    for (let p = 1; p <= totalPages; p++) {
        container.appendChild(createBtn(p, p, false, p === currentPage));
    }

    container.appendChild(createBtn("»", Math.min(totalPages, currentPage + 1), currentPage === totalPages));
}

loadProducts();

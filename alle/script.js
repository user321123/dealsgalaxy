let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const pageSize = 12;

async function loadProducts() {
    try {
        const response = await fetch("/dealsgalaxy/products.json");
        allProducts = await response.json();
    } catch (error) {
        allProducts = Array.from({ length: 40 }, (_, i) => ({
            title: `Produkt ${i + 1}`,
            currentPrice: 20 + i,
            oldPrice: 40 + i,
            image: "https://via.placeholder.com/300",
            category: "DEAL",
            url: "#"
        }));
    }

    applyAllAndRender();
    setupEventListeners();
}

function setupEventListeners() {
    let timeout;
    document.getElementById("search-input").addEventListener("input", () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            currentPage = 1;
            applyAllAndRender();
        }, 300);
    });

    document.getElementById("sort-select").addEventListener("change", () => {
        currentPage = 1;
        applyAllAndRender();
    });
}

function applyAllAndRender() {
    const search = document.getElementById("search-input").value.toLowerCase();
    const sort = document.getElementById("sort-select").value;

    filteredProducts = allProducts.filter(p =>
        p.title.toLowerCase().includes(search)
    );

    if (sort === "price-asc") filteredProducts.sort((a, b) => a.currentPrice - b.currentPrice);
    if (sort === "price-desc") filteredProducts.sort((a, b) => b.currentPrice - a.currentPrice);
    if (sort === "discount-desc") {
        filteredProducts.sort((a, b) => {
            const getD = x => x.discount || (x.oldPrice ? Math.round(100 - (x.currentPrice / x.oldPrice * 100)) : 0);
            return getD(b) - getD(a);
        });
    }

    renderGrid();
    renderPagination();
}

function renderGrid() {
    const grid = document.getElementById("product-grid");
    const start = (currentPage - 1) * pageSize;
    const items = filteredProducts.slice(start, start + pageSize);

    grid.innerHTML = items.map(p => {
        const disc = p.discount || (p.oldPrice ? Math.round(100 - (p.currentPrice / p.oldPrice * 100)) : 0);

        return `
        <article class="product-card">
            <div class="product-img">
                ${disc > 0 ? `<div class="badge">-${disc}%</div>` : ""}
                <img src="${p.image}" alt="${p.title}" style="max-width:100%; max-height:100%; object-fit:contain;">
            </div>

            <div class="product-info">
                <span class="category">${p.category || "EXKLUSIV"}</span>
                <h3 class="title">${p.title}</h3>

                <div style="margin-top:auto;">
                    <div class="price">${p.currentPrice.toFixed(2).replace(".", ",")}€</div>
                    ${p.oldPrice ? `<div class="old-price">Statt <span style="text-decoration:line-through;">${p.oldPrice.toFixed(2).replace(".", ",")}€</span></div>` : ""}
                </div>
            </div>

            <a href="${p.url}" target="_blank" class="cta">Zum Angebot</a>
        </article>`;
    }).join("");
}

function renderPagination() {
    const container = document.getElementById("pagination");
    const total = Math.ceil(filteredProducts.length / pageSize);

    if (total <= 1) {
        container.innerHTML = "";
        return;
    }

    let html = "";
    for (let i = 1; i <= total; i++) {
        html += `
            <button class="page-btn ${i === currentPage ? "active" : ""}" onclick="changePage(${i})">
                ${i}
            </button>`;
    }

    container.innerHTML = html;
}

window.changePage = p => {
    currentPage = p;
    window.scrollTo({ top: 0, behavior: "smooth" });
    renderGrid();
    renderPagination();
};

loadProducts();


let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const pageSize = 12;

async function loadProducts() {
    try {
        const response = await fetch("/dealsgalaxy/products.json");
        allProducts = await response.json();
        applyAllAndRender();
        setupEventListeners();
    } catch (error) {
        document.getElementById("product-grid").innerHTML = `<div class="col-span-full text-center py-20">Ladefehler...</div>`;
    }
}

function setupEventListeners() {
    let timeout;
    document.getElementById("search-input").addEventListener("input", () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => { currentPage = 1; applyAllAndRender(); }, 300);
    });
    document.getElementById("sort-select").addEventListener("change", () => { applyAllAndRender(); });
}

function applyAllAndRender() {
    const search = document.getElementById("search-input").value.toLowerCase();
    const sort = document.getElementById("sort-select").value;

    filteredProducts = allProducts.filter(p => p.title.toLowerCase().includes(search));

    if (sort === "price-asc") filteredProducts.sort((a,b) => a.currentPrice - b.currentPrice);
    if (sort === "price-desc") filteredProducts.sort((a,b) => b.currentPrice - a.currentPrice);
    if (sort === "discount-desc") {
        filteredProducts.sort((a,b) => {
            const getD = x => x.discount || (x.oldPrice ? Math.round(100-(x.currentPrice/x.oldPrice*100)) : 0);
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
        const disc = p.discount || (p.oldPrice ? Math.round(100-(p.currentPrice/p.oldPrice*100)) : 0);
        return `
        <article class="product-card bg-white rounded-lg overflow-hidden flex flex-col h-full shadow-sm border border-slate-100">
            <div class="relative bg-slate-100 flex justify-center items-center h-40 md:h-60 p-4">
                ${disc > 0 ? `<div class="absolute top-2 left-2 bg-orange-500 text-white font-bold text-[10px] md:text-xs px-2 py-1 rounded">-${disc}%</div>` : ''}
                <img src="${p.image}" alt="${p.title}" class="h-full w-full object-contain" loading="lazy" />
            </div>
            <div class="p-3 md:p-6 flex flex-col flex-grow bg-white">
                <h3 class="font-bold text-slate-800 text-[11px] md:text-base line-clamp-2 leading-tight mb-2 h-8 md:h-12">${p.title}</h3>
                <div class="mb-4">
                    <div class="text-lg md:text-2xl font-black text-orange-600">${p.currentPrice.toFixed(2)}€</div>
                    ${p.oldPrice ? `<div class="text-[9px] md:text-xs text-slate-400 line-through">UVP: ${p.oldPrice.toFixed(2)}€</div>` : ''}
                </div>
                <a href="${p.url}" target="_blank" class="btn bg-slate-800 hover:bg-slate-700 text-white btn-block btn-xs md:btn-md rounded font-bold border-none mt-auto">
                    Zum Angebot
                </a>
            </div>
        </article>
        `;
    }).join('');
}

function renderPagination() {
    const container = document.getElementById("pagination");
    const total = Math.ceil(filteredProducts.length / pageSize);
    if(total <= 1) { container.innerHTML = ""; return; }
    
    let html = '';
    for(let i=1; i<=total; i++) {
        html += `<button onclick="changePage(${i})" class="btn btn-xs md:btn-sm ${i===currentPage ? 'btn-primary' : 'btn-ghost text-slate-400 font-bold'} rounded">${i}</button>`;
    }
    container.innerHTML = html;
}

window.changePage = (p) => { currentPage = p; window.scrollTo({top: 0, behavior: 'smooth'}); renderGrid(); renderPagination(); };

loadProducts();

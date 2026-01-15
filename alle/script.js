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
        document.getElementById("product-grid").innerHTML = `<div class="col-span-full text-center py-20 opacity-50">Angebote konnten nicht geladen werden.</div>`;
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
        <article class="product-card bg-white shadow-sm rounded-lg overflow-hidden flex flex-col h-full border border-slate-100">
            <div class="relative p-2 md:p-4 bg-white flex justify-center items-center h-40 md:h-64">
                ${disc > 0 ? `<div class="absolute top-2 left-2 md:top-4 md:left-4 bg-orange-500 text-white font-bold text-[10px] md:text-xs px-2 py-1 rounded shadow-sm">-${disc}%</div>` : ''}
                <img src="${p.image}" alt="${p.title}" class="h-full w-full object-contain p-2" loading="lazy" />
            </div>
            <div class="p-4 md:p-6 flex flex-col flex-grow bg-white border-t border-slate-50">
                <h2 class="text-slate-500 text-[11px] md:text-sm font-medium uppercase mb-1">${p.category || 'Deal'}</h2>
                <h3 class="font-bold text-slate-800 text-sm md:text-base line-clamp-2 leading-snug mb-4 h-10 md:h-12">${p.title}</h3>
                
                <div class="mt-auto mb-4">
                    <div class="text-2xl md:text-3xl font-black text-slate-800">${p.currentPrice.toFixed(2)}€</div>
                    ${p.oldPrice ? `<div class="text-[10px] md:text-xs text-slate-400">UVP: <span class="line-through">${p.oldPrice.toFixed(2)}€</span></div>` : ''}
                </div>
                
                <a href="${p.url}" target="_blank" class="btn bg-slate-800 hover:bg-slate-700 text-white btn-block rounded font-bold border-none transition-colors">
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
        html += `<button onclick="changePage(${i})" class="btn btn-sm md:btn-md ${i===currentPage ? 'btn-primary' : 'btn-ghost text-slate-400 font-bold'} rounded">${i}</button>`;
    }
    container.innerHTML = html;
}

window.changePage = (p) => { currentPage = p; window.scrollTo({top: 0, behavior: 'smooth'}); renderGrid(); renderPagination(); };

loadProducts();

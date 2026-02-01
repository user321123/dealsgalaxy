let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const pageSize = 12;

async function loadProducts() {
    try {
        const response = await fetch("../product.json");
        allProducts = await response.json();
        applyAllAndRender();
        setupEventListeners();
    } catch (error) {
        console.warn("Lade lokale Testdaten...");
        allProducts = Array.from({ length: 40 }, (_, i) => ({
            title: `Produkt ${i + 1}`,
            currentPrice: 20 + i,
            oldPrice: 40 + i,
            image: "https://via.placeholder.com/300",
            category: "DEAL",
            url: "#"
        }));
        applyAllAndRender();
        setupEventListeners();
    }
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

/* -------------------------------------------
   SUCHFELD: Lupe → X + Clear-Funktion
------------------------------------------- */
const searchInput = document.getElementById("search-input");
const searchIcon = document.getElementById("search-icon");

searchInput.addEventListener("input", () => {
    if (searchInput.value.trim().length > 0) {
        searchIcon.textContent = "✕";
        searchIcon.classList.add("text-slate-500");
    } else {
        searchIcon.textContent = "⌕";
        searchIcon.classList.remove("text-slate-500");
    }
});

searchIcon.addEventListener("click", () => {
    if (searchInput.value.trim().length > 0) {
        searchInput.value = "";
        searchInput.dispatchEvent(new Event("input"));
        currentPage = 1;
        applyAllAndRender();
        searchInput.focus();
    }
});
/* ------------------------------------------- */

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
<article class="product-card flex flex-col bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 h-full">

    <div class="relative bg-slate-100 flex justify-center items-center h-32 md:h-64 p-4">
        ${disc > 0 ? `<div class="absolute top-3 left-3 px-2 py-1 bg-[var(--mio-secondary)] text-white font-black text-[9px] md:text-xs rounded z-10">-${disc}%</div>` : ''}
        <img src="${p.image}" alt="${p.title}" class="h-full w-full object-contain mix-blend-multiply" loading="lazy" />
    </div>

    <div class="p-3 md:p-6 flex flex-col flex-grow bg-white">
        <span class="text-[8px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">${p.category || 'EXKLUSIV'}</span>

        <h3 class="font-bold text-slate-800 text-xs md:text-base line-clamp-2 leading-tight mb-2 h-8 md:h-12">
            ${p.title}
        </h3>

        <div class="mt-auto pb-2">
            <div class="text-xl md:text-4xl font-[900] text-[var(--mio-secondary)] tracking-tighter">
                ${p.currentPrice.toFixed(2).replace('.', ',')}€
            </div>

            ${p.oldPrice ? `<div class="text-[9px] md:text-xs text-slate-400 font-medium">
                Statt <span class="line-through">${p.oldPrice.toFixed(2).replace('.', ',')}€</span>
            </div>` : ''}
        </div>
    </div>

    <a href="${p.url}" target="_blank"
       class="bg-mio-dark hover:bg-slate-700 text-white text-center py-3 md:py-4 font-bold text-xs md:text-sm uppercase tracking-widest block">
       Zum Angebot
    </a>

</article>`;
    }).join('');
}

function renderPagination() {
    const container = document.getElementById("pagination");
    const total = Math.ceil(filteredProducts.length / pageSize);
    if(total <= 1) { container.innerHTML = ""; return; }

    let html = '';
    for(let i=1; i<=total; i++) {
        const isActive = i === currentPage;
        html += `
            <button onclick="changePage(${i})"
                    class="px-3 py-1 rounded-md border text-sm font-bold tracking-widest
                           ${isActive ? 'bg-mio-dark border-mio-dark text-white' : 'bg-white border-slate-300 text-slate-500 hover:text-mio-secondary'}">
                ${i}
            </button>`;
    }
    container.innerHTML = html;
}

window.changePage = (p) => {
    currentPage = p;
    renderGrid();
    renderPagination();

    setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 10);
};

loadProducts();

let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const pageSize = 12;

async function loadProducts() {
    try {
        const response = await fetch("/dealsgalaxy/product.json");
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

// Icon wechseln
searchInput.addEventListener("input", () => {
    if (searchInput.value.trim().length > 0) {
        searchIcon.textContent = "✕";
        searchIcon.classList.add("text-slate-500");
    } else {
        searchIcon.textContent = "⌕";
        searchIcon.classList.remove("text-slate-500");
    }
});

// X klick → löschen + neu rendern
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
            <div class="relative bg-slate-100 flex justify-center items-center h-44 md:h-64 p-6">
                ${disc > 0 ? `<div class="absolute top-4 left-4 px-2.5 py-1.5 bg-[var(--mio-secondary)] text-white font-black text-[10px] md:text-xs rounded z-10">-${disc}%</div>` : ''}
                <img src="${p.image}" alt="${p.title}" class="h-full w-full object-contain mix-blend-multiply" loading="lazy" />
            </div>
            <div class="p-5 md:p-6 flex flex-col flex-grow bg-white">
                <span class="text-[9px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">${p.category || 'EXKLUSIV'}</span>
                <h3 class="font-bold text-slate-800 text-sm md:text-base line-clamp-2 leading-tight mb-4 h-10 md:h-12">${p.title}</h3>
                <div class="mt-auto pb-4">
                    <div class="text-2xl md:text-4xl font-[900] text-[var(--mio-secondary)] tracking-tighter">${p.currentPrice.toFixed(2).replace('.', ',')}€</div>
                    ${p.oldPrice ? `<div class="text-[10px] md:text-xs text-slate-400 font-medium">Statt <span class="line-through">${p.oldPrice.toFixed(2).replace('.', ',')}€</span></div>` : ''}
                </div>
            </div>
            <a href="${p.url}" target="_blank"
               class="bg-mio-dark hover:bg-slate-700 text-white text-center py-4 font-bold text-sm uppercase tracking-widest block">
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
    window.scrollTo({top: 0, behavior: 'smooth'});
    renderGrid();
    renderPagination();
};

loadProducts();

/**
 * MioDeals Logic v12
 * Features: Debounced Search, Auto-Discount, Pagination, Sorting
 */

let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const pageSize = 12;

// 1. Initiales Laden der Daten
async function loadProducts() {
    try {
        // Pfad zur JSON (Falls lokal getestet wird, Pfad anpassen)
        const response = await fetch("/dealsgalaxy/products.json");
        if (!response.ok) throw new Error("Netzwerkantwort war nicht ok");
        
        allProducts = await response.json();
        applyAllAndRender();
        setupEventListeners();
    } catch (error) {
        console.error("Fehler beim Laden:", error);
        document.getElementById("product-grid").innerHTML = `
            <div class="col-span-full text-center py-20 bg-white rounded-3xl shadow-sm">
                <p class="text-error font-bold">Ups! Die Angebote konnten nicht geladen werden.</p>
                <p class="text-sm text-gray-400">Prüfe deine Internetverbindung oder versuche es später erneut.</p>
            </div>`;
    }
}

// 2. Event Listener für Interaktionen
function setupEventListeners() {
    let searchTimeout;
    
    // Suche mit "Debouncing" (Wartet 300ms nach dem Tippen)
    document.getElementById("search-input").addEventListener("input", (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentPage = 1;
            applyAllAndRender();
        }, 300);
    });

    // Sortierung
    document.getElementById("sort-select").addEventListener("change", () => {
        currentPage = 1;
        applyAllAndRender();
    });
}

// 3. Filterung und Sortierung anwenden
function applyAllAndRender() {
    const search = document.getElementById("search-input").value.toLowerCase();
    const sort = document.getElementById("sort-select").value;

    // Filtern nach Titel oder Kategorie
    filteredProducts = allProducts.filter(p => 
        p.title.toLowerCase().includes(search) || 
        (p.category && p.category.toLowerCase().includes(search))
    );

    // Anzahl der Deals aktualisieren
    document.getElementById("deal-count").innerText = filteredProducts.length;

    // Sortieren der gefilterten Liste
    if (sort === "price-asc") {
        filteredProducts.sort((a, b) => a.currentPrice - b.currentPrice);
    } else if (sort === "price-desc") {
        filteredProducts.sort((a, b) => b.currentPrice - a.currentPrice);
    } else if (sort === "discount-desc") {
        filteredProducts.sort((a, b) => {
            const discA = a.discount || (a.oldPrice ? Math.round(100 - (a.currentPrice / a.oldPrice * 100)) : 0);
            const discB = b.discount || (b.oldPrice ? Math.round(100 - (b.currentPrice / b.oldPrice * 100)) : 0);
            return discB - discA;
        });
    }

    renderGrid();
    renderPagination();
}

// 4. Das Gitter mit Karten füllen
function renderGrid() {
    const grid = document.getElementById("product-grid");
    const start = (currentPage - 1) * pageSize;
    const items = filteredProducts.slice(start, start + pageSize);

    if (items.length === 0) {
        grid.innerHTML = `<p class="col-span-full text-center py-20 text-gray-400">Keine Angebote zu deiner Suche gefunden.</p>`;
        return;
    }

    grid.innerHTML = items.map(p => {
        // Rabatt automatisch berechnen, falls nicht in JSON vorhanden
        const disc = p.discount || (p.oldPrice ? Math.round(100 - (p.currentPrice / p.oldPrice * 100)) : 0);
        const ratingStars = p.rating ? "★".repeat(Math.round(p.rating)) + "☆".repeat(5 - Math.round(p.rating)) : "";

        return `
        <article class="card bg-white shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 group rounded-3xl overflow-hidden">
            <figure class="relative p-6 bg-white overflow-hidden">
                ${disc > 0 ? `<div class="absolute top-4 left-4 badge badge-secondary font-black border-none z-10 px-4 py-3 shadow-md">-${disc}%</div>` : ''}
                <img src="${p.image}" alt="${p.title}" class="product-img h-48 w-full object-contain" loading="lazy" />
            </figure>
            
            <div class="card-body p-6">
                <h2 class="font-bold text-sm h-10 line-clamp-2 leading-tight mb-4 group-hover:text-primary transition-colors">${p.title}</h2>
                
                <div class="flex items-center gap-2 mb-1">
                    <span class="text-2xl font-black text-primary">${p.currentPrice.toFixed(2)}€</span>
                    ${p.oldPrice ? `<span class="text-sm line-through text-gray-300 font-medium">${p.oldPrice.toFixed(2)}€</span>` : ''}
                </div>
                
                <div class="flex items-center justify-between mb-4">
                    <div class="text-yellow-400 text-xs tracking-tighter">${ratingStars}</div>
                    <span class="text-[10px] text-gray-300 font-bold uppercase tracking-widest">${new Date().toLocaleDateString('de-DE')}</span>
                </div>

                <div class="card-actions">
                    <a href="${p.url}" target="_blank" class="btn btn-primary btn-block rounded-xl text-white font-bold no-animation shadow-lg shadow-blue-100 hover:shadow-blue-300">
                        Zum Angebot
                    </a>
                </div>
            </div>
        </article>
        `;
    }).join('');
}

// 5. Pagination Buttons erstellen
function renderPagination() {
    const container = document.getElementById("pagination");
    const totalPages = Math.ceil(filteredProducts.length / pageSize);
    
    if (totalPages <= 1) {
        container.innerHTML = "";
        return;
    }

    let html = '';
    for (let i = 1; i <= totalPages; i++) {
        html += `
            <button onclick="changePage(${i})" 
                class="btn btn-sm md:btn-md rounded-xl ${i === currentPage ? 'btn-primary text-white shadow-md' : 'btn-ghost text-gray-500'}">
                ${i}
            </button>`;
    }
    container.innerHTML = html;
}

// 6. Seitenwechsel-Funktion
window.changePage = (p) => {
    currentPage = p;
    // Sanfter Scroll nach oben
    window.scrollTo({ top: 0, behavior: 'smooth' });
    renderGrid();
    renderPagination();
};

// Programm starten
loadProducts();

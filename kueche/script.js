let allProducts = [];

async function loadProducts() {
    try {
        const response = await fetch('../products.json');
        allProducts = await response.json();

        const kuecheProducts = allProducts.filter(p => p.category === 'kueche');
        renderProducts(kuecheProducts);
    } catch (error) {
        console.error("Fehler beim Laden der Küchen-Produkte:", error);
    }
}

function renderProducts(products) {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = '';

    products.forEach(p => {
        grid.innerHTML += `
            <div class="card bg-base-100 shadow-xl hover:scale-105 transition-transform">
                <figure class="px-4 pt-4 relative">
                    <span class="absolute top-6 left-6 badge badge-error font-bold text-white">-${p.discount}%</span>
                    <img src="${p.image}" alt="${p.title}" class="rounded-xl h-48 object-contain w-full" />
                </figure>
                <div class="card-body">
                    <h2 class="card-title text-sm h-12 overflow-hidden">${p.title}</h2>
                    <div class="flex items-center gap-2">
                        <span class="text-2xl font-bold text-error">${p.currentPrice.toFixed(2)}€</span>
                        <span class="text-sm line-through opacity-50">${p.oldPrice.toFixed(2)}€</span>
                    </div>
                    <div class="card-actions mt-4">
                        <a href="${p.url}" target="_blank" class="btn btn-primary w-full text-white">Zum Angebot</a>
                    </div>
                </div>
            </div>
        `;
    });
}

loadProducts();


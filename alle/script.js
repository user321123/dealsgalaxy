async function loadProducts() {
    const response = await fetch("/dealsgalaxy/products.json");
    const products = await response.json();
    renderProducts(products);
}

function renderProducts(products) {
    const grid = document.getElementById("product-grid");
    grid.innerHTML = "";

    products.forEach(p => {
        const card = document.createElement("div");
        card.className = "card bg-base-100 shadow-md hover:shadow-xl transition-all duration-300";

        card.innerHTML = `
            <figure>
                <img src="${p.image}" alt="${p.title}" class="rounded-xl" />
            </figure>
            <div class="card-body">
                <h2 class="card-title">${p.title}</h2>

                <p class="text-lg font-bold text-primary">
                    ${p.currentPrice.toFixed(2)} €
                </p>

                <p class="line-through opacity-60">
                    ${p.oldPrice.toFixed(2)} €
                </p>

                <p class="text-sm text-green-600 font-bold">
                    -${p.discount}%
                </p>

                <div class="card-actions justify-end">
                    <a href="${p.url}" target="_blank" class="btn btn-primary">
                        Zum Angebot
                    </a>
                </div>
            </div>
        `;

        grid.appendChild(card);
    });
}

loadProducts();

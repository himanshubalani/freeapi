export function render() {
    return `
        <div class="workbench">
            <main class="output-panel card" style="grid-column: 1 / -1;">
                <div class="card-header">
                    <div style="display: flex; align-items: center;">
                        <span class="sub-label">PRODUCT_INVENTORY</span>
                        <span class="api-label">GET /public/randomproducts</span>
                    </div>
                    <div class="toolbar">
                        <button class="btn-ghost" id="refresh-products" data-tooltip="Fetch new products">Refresh</button>
                    </div>
                </div>
                
                <div class="card-body">
                    <div id="products-container" class="grid-layout product-grid">
                        <div style="color: var(--text-secondary); grid-column: 1/-1; text-align:center; padding: 40px 0;">Initializing...</div>
                    </div>
                </div>

                <div class="card-header" style="justify-content: center; border-top: 1px solid var(--border); border-bottom: none;">
                    <div class="toolbar" style="display: flex; align-items: center; gap: 16px;">
                        <button class="btn-outline" id="prev-page">Previous</button>
                        <span id="page-indicator" style="font-size: 14px; color: var(--text-secondary);">Page 1</span>
                        <button class="btn-outline" id="next-page">Next</button>
                    </div>
                </div>
            </main>
        </div>
    `;
}

export function mount() {
    let currentPage = 1;
    let totalPages = 1;
    const container = document.getElementById('products-container');
    const indicator = document.getElementById('page-indicator');
    const btnPrev = document.getElementById('prev-page');
    const btnNext = document.getElementById('next-page');

    const fetchProducts = async (page) => {
        container.innerHTML = '<div style="color: var(--text-secondary); grid-column: 1/-1; text-align:center; padding: 40px 0;">Loading FreeAPI Data...</div>';
        btnPrev.disabled = true;
        btnNext.disabled = true;

        try {
            const res = await fetch(`https://api.freeapi.app/api/v1/public/randomproducts?page=${page}&limit=12`);
            const json = await res.json();
            
            if (json.success) {
                const products = json.data.data;
                currentPage = json.data.page;
                totalPages = json.data.totalPages;
                
                renderGrid(products);
                
                indicator.textContent = `Page ${currentPage} of ${totalPages}`;
                btnPrev.disabled = currentPage === 1;
                btnNext.disabled = currentPage === totalPages;
            } else {
                container.innerHTML = `<div style="color: var(--error-text); grid-column: 1/-1;">Error fetching products.</div>`;
            }
        } catch (err) {
            container.innerHTML = `<div style="color: var(--error-text); grid-column: 1/-1;">Network Error.</div>`;
        }
    };

    const renderGrid = (products) => {
        container.innerHTML = products.map(p => `
            <div class="item-card">
                <div class="item-image-wrapper product-image">
                    <img src="${p.thumbnail}" alt="${p.title}" loading="lazy">
                </div>
                <div class="item-details">
                    <div class="item-meta">${p.category.replace('-', ' ').toUpperCase()}</div>
                    <div class="item-title">${p.title}</div>
                    <div class="item-price">$${p.price.toFixed(2)}</div>
                </div>
            </div>
        `).join('');
    };

    btnPrev.addEventListener('click', () => { if (currentPage > 1) fetchProducts(currentPage - 1); });
    btnNext.addEventListener('click', () => { if (currentPage < totalPages) fetchProducts(currentPage + 1); });
    document.getElementById('refresh-products').addEventListener('click', () => fetchProducts(currentPage));

    fetchProducts(currentPage);
}

export function unmount() {}
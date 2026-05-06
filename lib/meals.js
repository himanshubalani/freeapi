export function render() {
    return `
        <div class="workbench">
            <main class="output-panel card" style="grid-column: 1 / -1;">
                <div class="card-header">
                    <div style="display: flex; align-items: center;">
                        <span class="sub-label">CULINARY_ARCHIVE</span>
                        <span class="api-label">GET /public/meals</span>
                    </div>
                    <div class="toolbar">
                        <button class="btn-ghost" id="refresh-meals" data-tooltip="Fetch archive">Refresh</button>
                    </div>
                </div>
                
                <div class="card-body">
                    <div id="meals-container" class="grid-layout meals-grid">
                        <div style="color: var(--text-secondary); grid-column: 1/-1; text-align:center; padding: 40px 0;">Initializing Archive...</div>
                    </div>
                </div>

                <div class="card-header" style="justify-content: center; border-top: 1px solid var(--border); border-bottom: none;">
                    <div class="toolbar" style="display: flex; align-items: center; gap: 16px;">
                        <button class="btn-outline" id="ml-prev">Previous</button>
                        <span id="ml-indicator" style="font-size: 14px; color: var(--text-secondary);">Page 1</span>
                        <button class="btn-outline" id="ml-next">Next</button>
                    </div>
                </div>
            </main>
        </div>
    `;
}

export function mount() {
    let currentPage = 1;
    let totalPages = 1;
    const container = document.getElementById('meals-container');
    const indicator = document.getElementById('ml-indicator');
    const btnPrev = document.getElementById('ml-prev');
    const btnNext = document.getElementById('ml-next');

    const fetchMeals = async (page) => {
        container.innerHTML = '<div style="color: var(--text-secondary); grid-column: 1/-1; text-align:center; padding: 40px 0;">Downloading Recipes...</div>';
        btnPrev.disabled = true;
        btnNext.disabled = true;

        try {
            const res = await fetch(`https://api.freeapi.app/api/v1/public/meals?page=${page}&limit=12`);
            const json = await res.json();
            
            if (json.success) {
                const meals = json.data.data;
                currentPage = json.data.page;
                totalPages = json.data.totalPages;
                
                renderGrid(meals);
                
                indicator.textContent = `Page ${currentPage} of ${totalPages}`;
                btnPrev.disabled = currentPage === 1;
                btnNext.disabled = currentPage === totalPages;
            } else {
                container.innerHTML = `<div style="color: var(--error-text); grid-column: 1/-1;">Error fetching meals.</div>`;
            }
        } catch (err) {
            container.innerHTML = `<div style="color: var(--error-text); grid-column: 1/-1;">Network Error.</div>`;
        }
    };

    const renderGrid = (meals) => {
        container.innerHTML = meals.map(m => `
            <div class="item-card">
                <div class="item-image-wrapper meal-image">
                    <img src="${m.strMealThumb}" alt="${m.strMeal}" loading="lazy">
                </div>
                <div class="item-details">
                    <div class="item-title" style="font-size: 16px;">${m.strMeal}</div>
                    <div class="joke-tags" style="margin-bottom: 12px;">
                        <span class="tag">${m.strCategory}</span>
                        <span class="tag" style="border-color: var(--accent); color: var(--accent);">${m.strArea}</span>
                    </div>
                    <div class="meal-instruction-snippet">
                        ${m.strInstructions ? m.strInstructions.substring(0, 80) + '...' : 'No instructions available.'}
                    </div>
                </div>
            </div>
        `).join('');
    };

    btnPrev.addEventListener('click', () => { if (currentPage > 1) fetchMeals(currentPage - 1); });
    btnNext.addEventListener('click', () => { if (currentPage < totalPages) fetchMeals(currentPage + 1); });
    document.getElementById('refresh-meals').addEventListener('click', () => fetchMeals(currentPage));

    fetchMeals(currentPage);
}

export function unmount() {}
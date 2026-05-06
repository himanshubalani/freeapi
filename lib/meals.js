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

        <!-- MEALS DOSSIER MODAL -->
        <div id="meal-modal" class="modal-overlay hidden">
            <div class="card modal-content" style="max-width: 800px;">
                <div class="card-header">
                    <span class="sub-label">RECIPE_DOSSIER</span>
                    <div class="toolbar">
                        <button class="btn-ghost" id="close-meal-modal" data-tooltip="Close Dossier">Close</button>
                    </div>
                </div>
                
                <div class="card-body" style="padding: 0;">
                    <div style="padding: 24px; max-height: 75vh; overflow-y: auto;">
                        
                        <!-- Top Split: Image + Ingredients -->
                        <div class="dossier-layout" style="margin-bottom: 24px; align-items: start;">
                            <div class="dossier-image-wrapper" style="aspect-ratio: 1/1;">
                                <img id="modal-meal-img" src="" alt="Meal" style="opacity: 1;">
                            </div>
                            
                            <div class="dossier-details">
                                <h2 id="modal-meal-name" style="margin: 0 0 8px 0; color: var(--accent); font-size: 24px; line-height: 1.2;"></h2>
                                <div id="modal-meal-tags" class="joke-tags" style="margin-bottom: 16px;"></div>
                                
                                <div style="display:flex; gap: 8px; margin-bottom: 16px;">
                                    <a id="modal-meal-yt" href="#" target="_blank" class="btn-outline hidden" style="text-decoration:none; justify-content: center; align-items: center;height: 28px; font-size:12px;">Watch on YouTube</a>
                                    <a id="modal-meal-src" href="#" target="_blank" class="btn-outline hidden" style="text-decoration:none; height: 28px; font-size:12px;">Original Source</a>
                                </div>
                                
                                <h3 style="font-size: 14px; margin-bottom: 8px; color: var(--text-secondary); letter-spacing: 0.1em;">INGREDIENTS</h3>
                                <div class="data-table" id="modal-ingredients-table">
                                    <!-- Injected via JS -->
                                </div>
                            </div>
                        </div>

                        <!-- Bottom: Instructions -->
                        <h3 style="font-size: 14px; margin-bottom: 8px; color: var(--text-secondary); letter-spacing: 0.1em;">INSTRUCTIONS</h3>
                        <p id="modal-meal-instructions" style="color: var(--text-primary); font-size: 14px; line-height: 1.6; border-left: 2px solid var(--border); padding-left: 12px; white-space: pre-wrap; margin: 0;"></p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export function mount() {
    let currentPage = 1;
    let totalPages = 1;
    let currentMealsData =[]; // Store the data for the modal to reference

    const container = document.getElementById('meals-container');
    const indicator = document.getElementById('ml-indicator');
    const btnPrev = document.getElementById('ml-prev');
    const btnNext = document.getElementById('ml-next');

    // Modal Elements
    const modalOverlay = document.getElementById('meal-modal');
    const btnCloseModal = document.getElementById('close-meal-modal');

    const fetchMeals = async (page) => {
        container.innerHTML = '<div style="color: var(--text-secondary); grid-column: 1/-1; text-align:center; padding: 40px 0;">Downloading Recipes...</div>';
        btnPrev.disabled = true;
        btnNext.disabled = true;

        try {
            const res = await fetch(`https://api.freeapi.app/api/v1/public/meals?page=${page}&limit=12`);
            const json = await res.json();
            
            if (json.success) {
                currentMealsData = json.data.data; // Cache data
                currentPage = json.data.page;
                totalPages = json.data.totalPages;
                
                renderGrid(currentMealsData);
                
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
        // Added 'interactive-card' and 'data-index' for clicking
        container.innerHTML = meals.map((m, index) => `
            <div class="item-card interactive-card" data-index="${index}" style="cursor: pointer;">
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
                    <div class="view-prompt" style="margin-top: 16px;">VIEW RECIPE <span>→</span></div>
                </div>
            </div>
        `).join('');
    };

    const openModal = (mealIndex) => {
        const meal = currentMealsData[mealIndex];

        // 1. Set Image & Title
        document.getElementById('modal-meal-img').src = meal.strMealThumb;
        document.getElementById('modal-meal-name').textContent = meal.strMeal.toUpperCase();

        // 2. Set Tags
        let tagsHtml = `<span class="tag">${meal.strCategory}</span><span class="tag" style="border-color: var(--accent); color: var(--accent);">${meal.strArea}</span>`;
        if (meal.strTags) {
            tagsHtml += meal.strTags.split(',').map(t => `<span class="tag" style="opacity: 0.7;">${t.trim()}</span>`).join('');
        }
        document.getElementById('modal-meal-tags').innerHTML = tagsHtml;

        // 3. Set Links
        const ytBtn = document.getElementById('modal-meal-yt');
        if (meal.strYoutube) { ytBtn.href = meal.strYoutube; ytBtn.classList.remove('hidden'); }
        else { ytBtn.classList.add('hidden'); }

        const srcBtn = document.getElementById('modal-meal-src');
        if (meal.strSource) { srcBtn.href = meal.strSource; srcBtn.classList.remove('hidden'); }
        else { srcBtn.classList.add('hidden'); }

        // 4. Set Ingredients Data Table (Loop through 1 to 20)
        let ingredientsHtml = '';
        for (let i = 1; i <= 20; i++) {
            const ingredient = meal[`strIngredient${i}`];
            const measure = meal[`strMeasure${i}`];
            
            // Only add row if ingredient exists and is not just empty spaces
            if (ingredient && ingredient.trim() !== '') {
                ingredientsHtml += `
                    <div class="data-row">
                        <div class="data-key" style="text-transform: capitalize;">${ingredient}</div>
                        <div class="data-value">${measure ? measure : ''}</div>
                    </div>
                `;
            }
        }
        document.getElementById('modal-ingredients-table').innerHTML = ingredientsHtml || '<div class="data-row"><div class="data-value" style="width:100%; text-align:center;">No ingredients listed.</div></div>';

        // 5. Set Instructions
        document.getElementById('modal-meal-instructions').textContent = meal.strInstructions || 'No instructions provided.';

        // Show Modal
        modalOverlay.classList.remove('hidden');
    };

    // Event Listeners
    btnPrev.addEventListener('click', () => { if (currentPage > 1) fetchMeals(currentPage - 1); });
    btnNext.addEventListener('click', () => { if (currentPage < totalPages) fetchMeals(currentPage + 1); });
    document.getElementById('refresh-meals').addEventListener('click', () => fetchMeals(currentPage));

    // Event Delegation for Meal Cards
    container.addEventListener('click', (e) => {
        const card = e.target.closest('.interactive-card');
        if (card) {
            const index = card.getAttribute('data-index');
            openModal(index);
        }
    });

    // Close Modal Events
    btnCloseModal.addEventListener('click', () => modalOverlay.classList.add('hidden'));
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) modalOverlay.classList.add('hidden'); 
    });

    // Initial Fetch
    fetchMeals(currentPage);
}

export function unmount() {}
export function render() {
    return `
        <div class="workbench">
            <main class="output-panel card" style="grid-column: 1 / -1;">
                <div class="card-header">
                    <div style="display: flex; align-items: center;">
                        <span class="sub-label">JOKES_DATABASE</span>
                        <span class="api-label">GET /public/randomjokes</span>
                    </div>
                    <div class="toolbar">
                        <button class="btn-ghost" id="refresh-jokes" data-tooltip="Fetch new jokes">Refresh</button>
                    </div>
                </div>
                
                <div class="card-body">
                    <div id="jokes-container" class="grid-layout jokes-grid">
                        <div style="color: var(--text-secondary); grid-column: 1/-1; text-align:center; padding: 40px 0;">Initializing Database...</div>
                    </div>
                </div>

                <div class="card-header" style="justify-content: center; border-top: 1px solid var(--border); border-bottom: none;">
                    <div class="toolbar" style="display: flex; align-items: center; gap: 16px;">
                        <button class="btn-outline" id="jk-prev">Previous</button>
                        <span id="jk-indicator" style="font-size: 14px; color: var(--text-secondary);">Page 1</span>
                        <button class="btn-outline" id="jk-next">Next</button>
                    </div>
                </div>
            </main>
        </div>
    `;
}

export function mount() {
    let currentPage = 1;
    let totalPages = 1;
    const container = document.getElementById('jokes-container');
    const indicator = document.getElementById('jk-indicator');
    const btnPrev = document.getElementById('jk-prev');
    const btnNext = document.getElementById('jk-next');

    const fetchJokes = async (page) => {
        container.innerHTML = '<div style="color: var(--text-secondary); grid-column: 1/-1; text-align:center; padding: 40px 0;">Querying Joke Nodes...</div>';
        btnPrev.disabled = true;
        btnNext.disabled = true;

        try {
            const res = await fetch(`https://api.freeapi.app/api/v1/public/randomjokes?page=${page}&limit=12`);
            const json = await res.json();
            
            if (json.success) {
                const jokes = json.data.data;
                currentPage = json.data.page;
                totalPages = json.data.totalPages;
                
                renderGrid(jokes);
                
                indicator.textContent = `Page ${currentPage} of ${totalPages}`;
                btnPrev.disabled = currentPage === 1;
                btnNext.disabled = currentPage === totalPages;
            } else {
                container.innerHTML = `<div style="color: var(--error-text); grid-column: 1/-1;">Error fetching jokes.</div>`;
            }
        } catch (err) {
            container.innerHTML = `<div style="color: var(--error-text); grid-column: 1/-1;">Network Error.</div>`;
        }
    };

    const renderGrid = (jokes) => {
        container.innerHTML = jokes.map(j => {
            const tagsHtml = j.categories.map(cat => 
                `<span class="tag ${cat === 'explicit' ? 'tag-warn' : ''}">${cat}</span>`
            ).join('');

            return `
            <div class="quote-card joke-card">
                <div class="quote-text" style="margin-bottom: 24px;">${j.content}</div>
                <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                    <div class="joke-tags">${tagsHtml}</div>
                    <div class="quote-author" style="opacity: 0.5;">ID: ${j.id.toString().padStart(4, '0')}</div>
                </div>
            </div>
            `;
        }).join('');
    };

    btnPrev.addEventListener('click', () => { if (currentPage > 1) fetchJokes(currentPage - 1); });
    btnNext.addEventListener('click', () => { if (currentPage < totalPages) fetchJokes(currentPage + 1); });
    document.getElementById('refresh-jokes').addEventListener('click', () => fetchJokes(currentPage));

    fetchJokes(currentPage);
}

export function unmount() {}
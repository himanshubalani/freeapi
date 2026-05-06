export function render() {
    return `
        <div class="workbench">
            <main class="output-panel card" style="grid-column: 1 / -1;">
                <div class="card-header">
                    <div style="display: flex; align-items: center;">
                        <span class="sub-label">QUOTES_GALLERY</span>
                        <span class="api-label">GET /public/quotes</span>
                    </div>
                    <div class="toolbar">
                        <button class="btn-ghost" id="refresh-quotes" data-tooltip="Fetch new quotes">Refresh</button>
                    </div>
                </div>
                
                <div class="card-body">
                    <div id="quotes-container" class="quotes-grid">
                        <!-- Quotes will be injected here -->
                        <div style="color: var(--text-secondary); grid-column: 1/-1; text-align:center;">Initializing...</div>
                    </div>
                </div>

                <!-- Pagination Footer -->
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
    const container = document.getElementById('quotes-container');
    const indicator = document.getElementById('page-indicator');
    const btnPrev = document.getElementById('prev-page');
    const btnNext = document.getElementById('next-page');
    const btnRefresh = document.getElementById('refresh-quotes');

    const fetchQuotes = async (page) => {
        container.innerHTML = '<div style="color: var(--text-secondary); grid-column: 1/-1; text-align:center; padding: 40px 0;">Loading FreeAPI Data...</div>';
        btnPrev.disabled = true;
        btnNext.disabled = true;

        try {
            const res = await fetch(`https://api.freeapi.app/api/v1/public/quotes?page=${page}&limit=12`);
            const json = await res.json();
            
            if (json.success) {
                const quotes = json.data.data;
                currentPage = json.data.page;
                totalPages = json.data.totalPages;
                
                renderGrid(quotes);
                
                indicator.textContent = `Page ${currentPage} of ${totalPages}`;
                btnPrev.disabled = currentPage === 1;
                btnNext.disabled = currentPage === totalPages;
            } else {
                container.innerHTML = `<div style="color: var(--error-text); grid-column: 1/-1;">Error fetching quotes.</div>`;
            }
        } catch (err) {
            container.innerHTML = `<div style="color: var(--error-text); grid-column: 1/-1;">Network Error.</div>`;
        }
    };

    const renderGrid = (quotes) => {
        container.innerHTML = quotes.map(q => `
            <div class="quote-card">
                <div class="quote-text">"${q.content}"</div>
                <div class="quote-author">— ${q.author}</div>
            </div>
        `).join('');
    };

    btnPrev.addEventListener('click', () => { if (currentPage > 1) fetchQuotes(currentPage - 1); });
    btnNext.addEventListener('click', () => { if (currentPage < totalPages) fetchQuotes(currentPage + 1); });
    btnRefresh.addEventListener('click', () => fetchQuotes(currentPage));

    // Initial Fetch
    fetchQuotes(currentPage);
}

export function unmount() {
    // Optional cleanup logic
}
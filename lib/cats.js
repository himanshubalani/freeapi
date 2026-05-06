export function render() {
    return `
        <div class="workbench">
            <main class="output-panel card" style="grid-column: 1 / -1;">
                <div class="card-header">
                    <div style="display: flex; align-items: center;">
                        <span class="sub-label">FELINE_DOSSIER</span>
                        <span class="api-label">GET /public/cats/cat/random</span>
                    </div>
                    <div class="toolbar">
                        <button class="btn-primary" id="fetch-cat" data-tooltip="Query random specimen" style="margin:0; height: 36px; padding: 0 16px; width: auto;">Next Subject</button>
                    </div>
                </div>
                
                <div class="card-body" id="cat-container">
                    <!-- Cat Data Injected Here -->
                    <div style="color: var(--text-secondary); text-align:center; padding: 60px 0;">Awaiting Subject Retrieval...</div>
                </div>
            </main>
        </div>
    `;
}

export function mount() {
    const container = document.getElementById('cat-container');
    const btnFetch = document.getElementById('fetch-cat');

    // Creates an ASCII bar like: [████░]
    const renderAsciiBar = (val) => {
        const solid = '█'.repeat(val);
        const light = '░'.repeat(5 - val);
        return `<span style="color: var(--accent); letter-spacing: 2px;">[${solid}${light}]</span>`;
    };

    const fetchCat = async () => {
        container.innerHTML = '<div style="color: var(--text-secondary); text-align:center; padding: 60px 0;">Downloading Specimen Data...</div>';
        btnFetch.disabled = true;
        btnFetch.textContent = "Processing...";

        try {
            const res = await fetch('https://api.freeapi.app/api/v1/public/cats/cat/random');
            const json = await res.json();
            
            if (json.success) {
                renderDossier(json.data);
            } else {
                container.innerHTML = `<div style="color: var(--error-text); text-align:center;">Failed to parse subject.</div>`;
            }
        } catch (err) {
            container.innerHTML = `<div style="color: var(--error-text); text-align:center;">Connection Terminated.</div>`;
        } finally {
            btnFetch.disabled = false;
            btnFetch.textContent = "Next Subject";
        }
    };

    const renderDossier = (cat) => {
        // Parse temperament into tags
        const temperaments = cat.temperament.split(', ').map(t => `<span class="tag">${t}</span>`).join('');

        container.innerHTML = `
            <div class="dossier-layout">
                <!-- Left: Image -->
                <div class="dossier-image-wrapper">
                    <img src="${cat.image}" alt="${cat.name}" loading="lazy">
                    <div class="dossier-image-overlay">ID: #${cat.id.toString().padStart(4, '0')}</div>
                </div>

                <!-- Right: Data Readout -->
                <div class="dossier-details">
                    <h2 style="margin: 0 0 8px 0; color: var(--accent); font-size: 24px;">${cat.name.toUpperCase()}</h2>
                    <div style="margin-bottom: 16px;">${temperaments}</div>
                    
                    <p style="color: var(--text-primary); font-size: 14px; line-height: 1.6; margin-bottom: 24px; border-left: 2px solid var(--border); padding-left: 12px;">
                        ${cat.description}
                    </p>

                    <!-- Tabular Metadata -->
                    <div class="data-table" style="margin-bottom: 24px;">
                        <div class="data-row">
                            <div class="data-key">Origin</div>
                            <div class="data-value">${cat.origin} (${cat.country_code})</div>
                        </div>
                        <div class="data-row">
                            <div class="data-key">Life Span</div>
                            <div class="data-value">${cat.life_span} Years</div>
                        </div>
                        <div class="data-row">
                            <div class="data-key">Weight</div>
                            <div class="data-value">${cat.weight.metric} kgs</div>
                        </div>
                    </div>

                    <!-- ASCII Stats -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 12px;">
                        <div><span style="color: var(--text-secondary);">Adaptability:</span><br>${renderAsciiBar(cat.adaptability)}</div>
                        <div><span style="color: var(--text-secondary);">Affection:</span><br>${renderAsciiBar(cat.affection_level)}</div>
                        <div><span style="color: var(--text-secondary);">Energy:</span><br>${renderAsciiBar(cat.energy_level)}</div>
                        <div><span style="color: var(--text-secondary);">Intelligence:</span><br>${renderAsciiBar(cat.intelligence)}</div>
                    </div>
                </div>
            </div>
        `;
    };

    btnFetch.addEventListener('click', fetchCat);
    
    // Initial fetch
    fetchCat();
}

export function unmount() {}
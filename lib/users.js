export function render() {
    return `
        <div class="workbench">
            <main class="output-panel card" style="grid-column: 1 / -1;">
                <div class="card-header">
                    <div style="display: flex; align-items: center;">
                        <span class="sub-label">PERSONNEL_DATABASE</span>
                        <span class="api-label">GET /public/randomusers</span>
                    </div>
                    <div class="toolbar">
                        <button class="btn-ghost" id="refresh-users" data-tooltip="Fetch personnel">Refresh</button>
                    </div>
                </div>
                
                <div class="card-body">
                    <div id="users-container" class="grid-layout users-grid">
                        <div style="color: var(--text-secondary); grid-column: 1/-1; text-align:center; padding: 40px 0;">Accessing Secure Network...</div>
                    </div>
                </div>

                <div class="card-header" style="justify-content: center; border-top: 1px solid var(--border); border-bottom: none;">
                    <div class="toolbar" style="display: flex; align-items: center; gap: 16px;">
                        <button class="btn-outline" id="us-prev">Previous</button>
                        <span id="us-indicator" style="font-size: 14px; color: var(--text-secondary);">Page 1</span>
                        <button class="btn-outline" id="us-next">Next</button>
                    </div>
                </div>
            </main>
        </div>
    `;
}

export function mount() {
    let currentPage = 1;
    let totalPages = 1;
    const container = document.getElementById('users-container');
    const indicator = document.getElementById('us-indicator');
    const btnPrev = document.getElementById('us-prev');
    const btnNext = document.getElementById('us-next');

    const fetchUsers = async (page) => {
        container.innerHTML = '<div style="color: var(--text-secondary); grid-column: 1/-1; text-align:center; padding: 40px 0;">Downloading Profiles...</div>';
        btnPrev.disabled = true;
        btnNext.disabled = true;

        try {
            const res = await fetch(`https://api.freeapi.app/api/v1/public/randomusers?page=${page}&limit=12`);
            const json = await res.json();
            
            if (json.success) {
                const users = json.data.data;
                currentPage = json.data.page;
                totalPages = json.data.totalPages;
                
                renderGrid(users);
                
                indicator.textContent = `Page ${currentPage} of ${totalPages}`;
                btnPrev.disabled = currentPage === 1;
                btnNext.disabled = currentPage === totalPages;
            } else {
                container.innerHTML = `<div style="color: var(--error-text); grid-column: 1/-1;">Error fetching users.</div>`;
            }
        } catch (err) {
            container.innerHTML = `<div style="color: var(--error-text); grid-column: 1/-1;">Network Error.</div>`;
        }
    };

    const renderGrid = (users) => {
        container.innerHTML = users.map(u => `
            <div class="id-card">
                <div class="id-avatar">
                    <img src="${u.picture.large}" alt="Avatar" loading="lazy">
                </div>
                <div class="id-info">
                    <div class="id-name">${u.name.first} ${u.name.last}</div>
                    <div class="id-username">@${u.login.username}</div>
                    <div class="id-meta">
                        <div><span style="opacity:0.5">LOC:</span> ${u.location.city}, ${u.nat}</div>
                        <div><span style="opacity:0.5">AGE:</span> ${u.dob.age}</div>
                        <div><span style="opacity:0.5">EML:</span> <span style="text-transform:none">${u.email}</span></div>
                        <div><span style="opacity:0.5">PHN:</span> ${u.phone}</div>
                    </div>
                </div>
            </div>
        `).join('');
    };

    btnPrev.addEventListener('click', () => { if (currentPage > 1) fetchUsers(currentPage - 1); });
    btnNext.addEventListener('click', () => { if (currentPage < totalPages) fetchUsers(currentPage + 1); });
    document.getElementById('refresh-users').addEventListener('click', () => fetchUsers(currentPage));

    fetchUsers(currentPage);
}

export function unmount() {}
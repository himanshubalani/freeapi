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

        <!-- MODAL OVERLAY -->
        <div id="user-modal" class="modal-overlay hidden">
            <div class="card modal-content">
                <div class="card-header">
                    <span class="sub-label">EXTENDED_DOSSIER</span>
                    <div class="toolbar">
                        <button class="btn-ghost" id="close-modal" data-tooltip="Close Dossier">Close</button>
                    </div>
                </div>
                <div class="card-body" style="padding: 0;">
                    <!-- We use padding:0 here so the table sits flush against the card edges if desired, or keep padding -->
                    <div style="padding: 24px;">
                        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px;">
                            <img id="modal-avatar" src="" alt="Avatar" style="width: 64px; height: 64px; border-radius: 8px; border: 1px solid var(--border);">
                            <div>
                                <h2 id="modal-name" style="margin: 0; color: var(--accent); font-size: 18px;"></h2>
                                <div id="modal-username" style="color: var(--text-secondary); font-size: 12px;"></div>
                            </div>
                        </div>
                        <div class="data-table" id="modal-data-table">
                            <!-- Injected via JS -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export function mount() {
    let currentPage = 1;
    let totalPages = 1;
    let currentUsersData =[]; // Store current page data for modal lookup

    const container = document.getElementById('users-container');
    const indicator = document.getElementById('us-indicator');
    const btnPrev = document.getElementById('us-prev');
    const btnNext = document.getElementById('us-next');
    
    // Modal Elements
    const modalOverlay = document.getElementById('user-modal');
    const btnCloseModal = document.getElementById('close-modal');
    const modalTable = document.getElementById('modal-data-table');

    const fetchUsers = async (page) => {
        container.innerHTML = '<div style="color: var(--text-secondary); grid-column: 1/-1; text-align:center; padding: 40px 0;">Downloading Profiles...</div>';
        btnPrev.disabled = true;
        btnNext.disabled = true;

        try {
            const res = await fetch(`https://api.freeapi.app/api/v1/public/randomusers?page=${page}&limit=12`);
            const json = await res.json();
            
            if (json.success) {
                currentUsersData = json.data.data;
                currentPage = json.data.page;
                totalPages = json.data.totalPages;
                
                renderGrid(currentUsersData);
                
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
        container.innerHTML = users.map((u, index) => `
            <div class="id-card interactive-card" data-index="${index}">
                <div class="id-avatar">
                    <img src="${u.picture.large}" alt="Avatar" loading="lazy">
                </div>
                <div class="id-info">
                    <div class="id-name">${u.name.first} ${u.name.last}</div>
                    <div class="id-username">@${u.login.username}</div>
                    <div class="id-meta">
                        <div><span style="opacity:0.5">LOC:</span> ${u.location.city}, ${u.nat}</div>
                        <div><span style="opacity:0.5">AGE:</span> ${u.dob.age}</div>
                    </div>
                    <div class="view-prompt">VIEW DOSSIER <span>→</span></div>
                </div>
            </div>
        `).join('');
    };

    const openModal = (userIndex) => {
        const user = currentUsersData[userIndex];
        
        // Set Header info
        document.getElementById('modal-avatar').src = user.picture.medium;
        document.getElementById('modal-name').textContent = `${user.name.title} ${user.name.first} ${user.name.last}`.toUpperCase();
        document.getElementById('modal-username').textContent = `UUID: ${user.login.uuid}`;

        // Build Data Table
        const rows =[
            { key: 'Gender', value: user.gender.toUpperCase() },
            { key: 'Email', value: user.email },
            { key: 'Phone', value: `${user.phone} / ${user.cell} (Cell)` },
            { key: 'Location', value: `${user.location.street.number} ${user.location.street.name}, ${user.location.city}, ${user.location.state}, ${user.location.country} - ${user.location.postcode}` },
            { key: 'Coordinates', value: `Lat: ${user.location.coordinates.latitude}, Lng: ${user.location.coordinates.longitude}` },
            { key: 'Timezone', value: `UTC ${user.location.timezone.offset} (${user.location.timezone.description})` },
            { key: 'D.O.B.', value: `${new Date(user.dob.date).toLocaleDateString()} (Age: ${user.dob.age})` },
            { key: 'Registered', value: `${new Date(user.registered.date).toLocaleDateString()}` }
        ];

        modalTable.innerHTML = rows.map(r => `
            <div class="data-row">
                <div class="data-key">${r.key}</div>
                <div class="data-value">${r.value}</div>
            </div>
        `).join('');

        modalOverlay.classList.remove('hidden');
    };

    // Event Listeners
    btnPrev.addEventListener('click', () => { if (currentPage > 1) fetchUsers(currentPage - 1); });
    btnNext.addEventListener('click', () => { if (currentPage < totalPages) fetchUsers(currentPage + 1); });
    document.getElementById('refresh-users').addEventListener('click', () => fetchUsers(currentPage));

    // Event Delegation for User Cards
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
        if (e.target === modalOverlay) modalOverlay.classList.add('hidden'); // Close if clicking background
    });

    fetchUsers(currentPage);
}

export function unmount() {}
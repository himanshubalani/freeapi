export function render() {
    return `
    <div class="workbench">
        <!-- LEFT COLUMN: Control Panel -->
        <aside class="control-panel card">
            <div class="card-header">
                <span class="sub-label">SESSION</span>
                <div class="toolbar">
                    <button class="btn-ghost" id="tab-login" data-tooltip="Switch to login form">Login</button>
                    <button class="btn-ghost" id="tab-register" data-tooltip="Switch to registration">Register</button>
                </div>
            </div>
            
            <div class="card-body">
                <form id="login-form" class="form-stack">
                    <div class="input-group">
                        <label for="login-username">Username</label>
                        <input type="text" id="login-username" required placeholder="doejohn">
                    </div>
                    <div class="input-group">
                        <label for="login-password">Password</label>
                        <input type="password" id="login-password" required placeholder="••••••••">
                    </div>
                    <button type="submit" class="btn-primary" id="btn-login" data-tooltip="POST /users/login">Authenticate</button>
                </form>

                <form id="register-form" class="form-stack hidden">
                    <div class="input-group">
                        <label for="reg-username">Username</label>
                        <input type="text" id="reg-username" required placeholder="doejohn">
                    </div>
                    <div class="input-group">
                        <label for="reg-email">Email</label>
                        <input type="email" id="reg-email" required placeholder="user@domain.com">
                    </div>
                    <div class="input-group">
                        <label for="reg-password">Password</label>
                        <input type="password" id="reg-password" required placeholder="test@123">
                    </div>
                    <div class="input-group">
                        <label for="reg-role">Role</label>
                        <select id="reg-role" required>
                            <option value="ADMIN">ADMIN</option>
                            <option value="USER">USER</option>
                        </select>
                    </div>
                    <button type="submit" class="btn-primary" id="btn-register" data-tooltip="POST /users/register">Create Account</button>
                </form>
            </div>
        </aside>

        <!-- RIGHT COLUMN: Output Area -->
        <main class="output-panel card">
            <div class="card-header">
                <div style="display: flex; align-items: center;">
                    <span class="sub-label">CURRENT_USER_OUTPUT</span>
                    <span class="api-label">GET /users/current-user</span>
                </div>
                <button class="btn-outline hidden" id="btn-logout" data-tooltip="POST /users/logout">Logout</button>
            </div>
            
            <div class="card-body" id="profile-display">
                <div class="empty-state" id="unauth-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="muted-icon">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <div class="empty-title">NO ACTIVE SESSION</div>
                    <div class="empty-subtitle">Please authenticate to view current user details.</div>
                </div>

                <div id="auth-state" class="hidden">
                    <div class="data-table" id="user-data-table"></div>
                </div>
            </div>
        </main>
    </div>
    `;
}

export function mount() {
    const BASE_URL = 'https://api.freeapi.app/api/v1/users';
    let accessToken = localStorage.getItem('accessToken') || null;

    const forms = {
        login: document.getElementById('login-form'),
        register: document.getElementById('register-form')
    };
    const tabs = {
        login: document.getElementById('tab-login'),
        register: document.getElementById('tab-register')
    };
    const views = {
        unauth: document.getElementById('unauth-state'),
        auth: document.getElementById('auth-state')
    };
    const uiElements = {
        badge: document.getElementById('status-badge'),
        logoutBtn: document.getElementById('btn-logout'),
        dataTable: document.getElementById('user-data-table')
    };

    function toggleTab(tab) {
        if (tab === 'login') {
            forms.login.classList.remove('hidden');
            forms.register.classList.add('hidden');
            tabs.login.classList.add('active');
            tabs.register.classList.remove('active');
        } else {
            forms.register.classList.remove('hidden');
            forms.login.classList.add('hidden');
            tabs.register.classList.add('active');
            tabs.login.classList.remove('active');
        }
    }

    // Add explicit event listeners for tabs
    tabs.login.addEventListener('click', () => toggleTab('login'));
    tabs.register.addEventListener('click', () => toggleTab('register'));

    function showBadge(message, type = 'success') {
        uiElements.badge.textContent = message;
        uiElements.badge.className = `badge ${type}`;
        uiElements.badge.classList.remove('hidden');
        setTimeout(() => uiElements.badge.classList.add('hidden'), 3000);
    }

    function setLoading(buttonId, isLoading, defaultText) {
        const btn = document.getElementById(buttonId);
        btn.disabled = isLoading;
        btn.textContent = isLoading ? 'Processing...' : defaultText;
    }

    async function fetchCurrentUser() {
        if (!accessToken) return;
        try {
            const res = await fetch(`${BASE_URL}/current-user`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            const data = await res.json();
            if (data.success) {
                renderProfile(data.data);
            } else {
                handleLogoutState();
                showBadge('Session Expired', 'error');
            }
        } catch (error) {
            showBadge('Failed to fetch profile', 'error');
        }
    }

    function renderProfile(user) {
        views.unauth.classList.add('hidden');
        views.auth.classList.remove('hidden');
        uiElements.logoutBtn.classList.remove('hidden');
        const fields =['_id', 'username', 'email', 'role', 'createdAt'];
        let html = '';
        fields.forEach(key => {
            if (user[key]) {
                html += `<div class="data-row">
                    <div class="data-key">${key}</div>
                    <div class="data-value">${user[key]}</div>
                </div>`;
            }
        });
        uiElements.dataTable.innerHTML = html;
    }

    function handleLogoutState() {
        accessToken = null;
        localStorage.removeItem('accessToken');
        views.auth.classList.add('hidden');
        views.unauth.classList.remove('hidden');
        uiElements.logoutBtn.classList.add('hidden');
        uiElements.dataTable.innerHTML = '';
    }

    forms.register.addEventListener('submit', async (e) => {
        e.preventDefault();
        setLoading('btn-register', true, 'Create Account');
        const payload = {
            username: document.getElementById('reg-username').value,
            email: document.getElementById('reg-email').value,
            password: document.getElementById('reg-password').value,
            role: document.getElementById('reg-role').value
        };
        try {
            const res = await fetch(`${BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                showBadge('Registration Successful', 'success');
                forms.register.reset();
                toggleTab('login');
            } else showBadge(data.message || 'Registration failed', 'error');
        } catch (err) { showBadge('Network Error', 'error'); }
        finally { setLoading('btn-register', false, 'Create Account'); }
    });

    forms.login.addEventListener('submit', async (e) => {
        e.preventDefault();
        setLoading('btn-login', true, 'Authenticate');
        const payload = {
            username: document.getElementById('login-username').value,
            password: document.getElementById('login-password').value
        };
        try {
            const res = await fetch(`${BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                accessToken = data.data.accessToken;
                localStorage.setItem('accessToken', accessToken);
                showBadge('Authentication Successful', 'success');
                forms.login.reset();
                fetchCurrentUser();
            } else showBadge(data.message || 'Invalid credentials', 'error');
        } catch (err) { showBadge('Network Error', 'error'); }
        finally { setLoading('btn-login', false, 'Authenticate'); }
    });

    uiElements.logoutBtn.addEventListener('click', async () => {
        if (!accessToken) return;
        try {
            const res = await fetch(`${BASE_URL}/logout`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            const data = await res.json();
            if (data.success) {
                showBadge('Session Terminated', 'success');
                handleLogoutState();
            }
        } catch (err) { showBadge('Logout failed', 'error'); }
    });

    // Run Initial logic
    toggleTab('login');
    if (accessToken) fetchCurrentUser();
}